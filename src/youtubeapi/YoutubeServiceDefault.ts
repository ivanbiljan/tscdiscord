import { Service } from '../framework/Service';
import { DefaultBot } from '../framework/DiscordBot';
import { Message, MessageEmbedField, RichEmbed, VoiceConnection } from 'discord.js';
import * as request from 'request-promise-native';
import { YoutubeVideo } from './YoutubeVideo';
import * as Streams from 'stream';
import { AdaptiveStream } from './AdaptiveStream';
const parser = require('partial-json-parser');
const BeautifulDom = require('beautiful-dom');
const ytdlcore = require('ytdl-core');

// TODO: Figure out what's wrong with deciphering and get rid of the ytdl-core dependency

class MusicQueue {
    songs: YoutubeVideo[] = [];
    connection: VoiceConnection | undefined = undefined;
}

export default class YoutubeServiceDefault implements Service {
    private readonly videoLinkRegex = new RegExp('(?:https?:\/\/)?(?:www\.)?youtu(?:(\.be\/(?<videoId>.*))|(be\.com\/(?:(watch\?v=|v\/)(?<videoId2>.*))))');
    private readonly musicQueue = new MusicQueue();

    initialize(bot: DefaultBot) {
        bot.registerCommand(/play (.*)/, async (msg: Message, args: RegExpExecArray) => {
            if (!bot.configFile.canPlayMusic) {
                msg.channel.send('Music has been disabled');
                return;
            }

            if (!msg.member.voiceChannel) {
                msg.channel.send('You are not in a voice channel');
                return;
            }

            if (msg.member.voiceChannelID != bot.configFile.musicVoiceChannel) {
                msg.channel.send(`Cannot play music in '${msg.member.voiceChannel.name}' voice channel`);
                return;
            }

            if (!args) {
                msg.channel.send('No arguments provided');
                return;
            }

            const video = await this.getVideoByName(args[1]);
            if (video == undefined) {
                msg.channel.send(`No results found for query '${args}'`);
                return;
            }

            if (!this.musicQueue.connection) {
                const voiceConnection = await msg.member.voiceChannel.join();
                this.musicQueue.connection = voiceConnection;
                this.musicQueue.songs.push(video);
                this.playNextSong(msg);
            } else {
                this.musicQueue.songs.push(video);
                msg.channel.send(`'${video.title}' has been added to the song queue`);
            }
        }, 'play <name or link> - Adds the specified song the music queue');

        bot.registerCommand('skip', (msg: Message) => {
            if (!this.musicQueue.connection) {
                msg.channel.send('I\'m not playing music');
                return;
            }

            msg.channel.send('Skipping current song...');
            this.playNextSong(msg);
        }, 'skip - Skips the current song');

        bot.registerCommand('pause', (msg: Message) => {
            if (!this.musicQueue.connection) {
                msg.channel.send('I\'m not playing music');
                return;
            }

            this.musicQueue.connection.dispatcher.pause();
            msg.channel.send('Paused ongoing stream');
        }, 'pause - Pauses music');

        bot.registerCommand(/(?:start|resume)/, (msg: Message) => {
            if (!this.musicQueue.connection) {
                msg.channel.send('I\'m not playing music');
                return;
            }

            this.musicQueue.connection.dispatcher.resume();
            msg.channel.send('Resumed paused stream');
        }, 'resume - Resumes music');

        bot.registerCommand(/musicchannel (\d+)/, (msg: Message, args: RegExpExecArray) => {
            bot.configFile.musicVoiceChannel = args[1];
            msg.channel.send(`Voice channel set to #${args[1]}`);
        }, 'musicchannel <channel id> - Sets the music channel');
    }

    private playNextSong(msg: Message): void {
        if (!this.musicQueue.connection) { // This should probably never happen
            return;
        }

        if (this.musicQueue.songs.length == 0) {
            this.musicQueue.connection.disconnect();
            this.musicQueue.connection = undefined;
            return;
        }

        const song = this.musicQueue.songs.shift()!;
        this.musicQueue.connection.playStream(ytdlcore(`https://youtube.com/watch?v=${song.encrypted_id}`)).on('end', () => {
            this.playNextSong(msg);
        });

        const embed = new RichEmbed()
            .setColor('0099ff')
            .setAuthor('Now Playing', 'https://i.imgur.com/FpwHmmL.png')
            .setTitle(song.title)
            .setDescription(unescape(song.description))
            .setThumbnail('https://github.com/remojansen/logo.ts/raw/master/ts.png')
            .addBlankField()
            .addField('Uploaded by:', song.author, true)
            .addField('Views:', song.views, true)
            .setImage(song.thumbnail)
            .setFooter('BUFF YOAD', 'https://vignette.wikia.nocookie.net/old-people-facebook/images/1/1e/W0r1w6813td01.jpg/revision/latest?cb=20190821173248')
            .setTimestamp();
        msg.channel.send(embed);
    }

    async getVideoById(value: string): Promise<YoutubeVideo> {
        const data = await this.getVideoInfoAsync(value);
        const playerResponse = parser(data['player_response']);
        const videoDetails: YoutubeVideo = parser(JSON.stringify(playerResponse['videoDetails']));
        videoDetails.audioStreams = [];

        let adaptiveFormats: AdaptiveStream[] = playerResponse['streamingData']['adaptiveFormats'];
        if (adaptiveFormats) { // check for audio streams
            await this.forEachAsync(adaptiveFormats, async (streamInfo: AdaptiveStream) => {
                if (!this.isAudioStream(streamInfo.mimeType)) {
                    return;
                }

                let cipherData = await this.mapQueryParameters(streamInfo.cipher);
                let signature = cipherData['s'];

                streamInfo.url = unescape(cipherData['url']);
                if (!streamInfo.url || signature) {
                    let splitSig = signature.split('');
                    const deciphererFuntions = await this.getDecipherOperations(this.parseVideoId(value));
                    await this.forEachAsync(deciphererFuntions, decipherer => {
                        switch (decipherer[0]) {
                            case 'r':
                                splitSig = splitSig.reverse();
                                break;
                            case 'w':
                                const index = ~~decipherer[1];
                                const first = splitSig[0];
                                splitSig[0] = splitSig[index % splitSig.length];
                                splitSig[index] = first;
                                break;
                            case 's':
                                splitSig = slice(splitSig, ~~decipherer[1]);
                                break;
                        }
                    });

                    const signatureParameter = !cipherData['sp'] ? "signature" : cipherData['sp'];
                    streamInfo.url += `&${cipherData['sp']}=${signature}`;
                }

                videoDetails.audioStreams.push(streamInfo);
            });
        }

        return videoDetails;
    }

    async forEachAsync<T>(array: Array<T>, callback: (element: T, index: number) => any) {
        for (let i = 0; i < array.length; ++i) {
            await callback(array[i], i);
        }
    }

    async getVideoByName(value: string): Promise<YoutubeVideo> {
        /*if (!value) {
            return undefined;
        }*/

        // If the provided input string is a link we fall back to the getVideoById function, 
        // otherwise we query youtube for the search string and return one of the results
        if (this.videoLinkRegex.test(value)) {
            return this.getVideoById(value);
        }

        let result = {} as YoutubeVideo;
        const uri = `https://www.youtube.com/search_ajax?style=json&embeddable=1&search_query=${encodeURI(value)}`;
        await request.get(uri, (err, res, body) => {
            if (err) {
                console.error(`yt get video by name: ${err}`);
            }

            if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                console.error(`yt: unsuccessful response (${res.statusCode})`);
            }

            const responseJson: YoutubeVideo[] = JSON.parse(body)['video'];
            //result = responseJson[Math.floor(Math.random() * Math.min(3, responseJson.length - 2)) + 1];
            result = responseJson[0];
        });

        return result;
    }

    private async getDecipherOperations(input: string): Promise<string[]> {
        let sourceLink = '';
        //let functions: { index: number, func: (signature: string[], index?: number) => string[] }[] = [];
        let functions: string[] = [];

        const sourceLinkRegex = new RegExp('\"js\":\"(?<sourcelink>\\S[^,]+)\"');
        const uri = `https://youtube.com/embed/${input}`;
        await request.get(uri, (err, res, embedPageHtml) => {
            if (err) {
                console.error(`yt get decipher operations: ${err}`);
            }

            if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                console.error(`yt: unsuccessful response (${res.statusCode})`);
            }

            const dom = new BeautifulDom(embedPageHtml);
            const scriptTagElements = dom.getElementsByTagName('script');
            for (let i = 0; i < scriptTagElements.length; ++i) {
                const scriptElement = scriptTagElements[i];
                let match = sourceLinkRegex.exec(scriptElement.innerHTML);
                if (match && match.groups) {
                    sourceLink = match.groups['sourcelink'].replace('\\', '');
                    break;
                }
            }
        });

        if (!sourceLink) {
            throw 'Failed to obtain player source link';
        }

        await request.get(`https://youtube.com${sourceLink}`, { resolveWithFullResponse: true }, (err: any, res: { statusCode: number; }, body: string) => {
            if (err) {
                console.error(`yt get decipher operations: ${err}`);
            }

            if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                console.error(`yt: unsuccessful response (${res.statusCode})`);
            }

            // Thanks https://tyrrrz.me/Blog/Reverse-engineering-YouTube
            const deciphererFuncName = /(\w+)=function\(\w+\){(\w+)=\2.split\(\x22{2}\);.*?return\s+\2.join\(\x22{2}\)}/g.exec(body)![1];
            //const deciphererFuncBody = /(?!h\.)/ + escapeRegExp(deciphererFuncName) + /=function\(\w+\)\{([\s\S]*?)\}/g.exec(body)![1];
            const deciphererFuncBody = new RegExp(`(?!h\\.)${escapeRegExp(deciphererFuncName)}=function\\(\\w+\\)\\{(.*?)\\}`).exec(body)![1];
            const deciphererFuncStatements = deciphererFuncBody.split(';');
            const deciphererDefinitionName = new RegExp('(\\w+).\\w+\\(\\w+,\\d+\\);').exec(deciphererFuncBody)![1];
            const deciphererDefinitionBody = new RegExp(`var\\s+${escapeRegExp(deciphererDefinitionName)}=\\{(\\w+:function\\(\\w+(,\\w+)?\\)\\{([\\s\\S]*?)\\}),?\\};`).exec(body)![0];
            deciphererFuncStatements.forEach(statement => {
                const calledFuncName = /(?:\w+\=\w+)?\.(\w+)\(\S*\)/.exec(statement)![1];
                if (!calledFuncName) {
                    return;
                }

                console.log('called func: ' + calledFuncName);
                if (new RegExp(`${escapeRegExp(calledFuncName)}:function\\(\\w?\\)\\{\\w+\\.reverse\\(\\)\\}`).test(deciphererDefinitionBody)) {
                    //functions.push({ index: 0, func: reverse });
                    functions.push('r');
                }

                if (new RegExp(`${escapeRegExp(calledFuncName)}:function\\(\\S+\\)\\{\\w+\\.splice\\(\\S*\\)\\}`).test(deciphererDefinitionBody)) {
                    //functions.push({ index: +new RegExp('\\(\\w+,(\\d+)\\)').exec(statement)![1], func: slice });
                    functions.push('s' + +new RegExp('\\(\\w+,(\\d+)\\)').exec(statement)![1]);
                }

                if (new RegExp(`${escapeRegExp(calledFuncName)}:function\\(\\S+\\)\\{var\\s\\S*\\}`).test(deciphererDefinitionBody)) {
                    //functions.push({ index: +new RegExp('\\(\\w+,(\\d+)\\)').exec(statement)![1], func: swap });
                    functions.push('w' + +new RegExp('\\(\\w+,(\\d+)\\)').exec(statement)![1]);
                }
            });
        });

        function escapeRegExp(string: string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        console.log(functions.length);
        return functions;
    }

    private async getVideoInfoAsync(input: string): Promise<{ [key: string]: string; }> {
        const videoId = this.parseVideoId(input);
        let responseData: { [key: string]: string } = {};
        const uri = `https://youtube.com/get_video_info?video_id=${videoId}&el=detailpage&hl=en`;
        await request.get({ uri: uri }, (err, res, body: string) => {
            if (err) {
                console.error(`yt get video info: ${err}`);
            }

            if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                console.error(`yt: unsuccessful response (${res.statusCode})`);
            }

            body.split('&').forEach(element => {
                const indexOfAssignment = element.indexOf('=');
                if (indexOfAssignment <= 0) {
                    return;
                }

                const key = element.substring(0, indexOfAssignment);
                const value = element.substring(indexOfAssignment + 1, element.length - key.length);
                responseData[key] = unescape(value);
            });
        });

        return responseData;
    }

    private isAudioStream(input: string): boolean {
        if (!input) {
            return false;
        }

        const index = input.indexOf('/');
        const containerString = input.substring(0, index);
        return containerString == 'audio';
    }

    private parseVideoId(input: string): string {
        const videoId = this.videoLinkRegex.exec(input);
        if (videoId && videoId.groups) {
            if (videoId.groups['videoId']) {
                return videoId.groups['videoId'];
            }

            return videoId.groups['videoId2'];
        }

        return input;
    }

    private async getStreamForAudioUrl(url: string) {
        let contentLength: string | undefined;
        await request.head(url, { resolveWithFullResponse: true }, (err, res, body) => {
            contentLength = res.headers["content-length"];
        });

        if (!contentLength) {
            throw 'unable to obtain content length for provided stream';
        }

        let totalBytesRead = 0;
        let writable = new Streams.PassThrough();
        while (totalBytesRead < +contentLength) {
            await request.get(url, {
                resolveWithFullResponse: true,
                headers: {
                    Range: `bytes=${totalBytesRead}-${totalBytesRead - 1 + 10 * 1024 * 1024}`
                }
            }, (_err, res) => {
                writable.push(res);
                totalBytesRead += res.readableLength;
            });
        }

        return writable;
    }

    private async mapQueryParameters(url: string): Promise<{ [key: string]: string; }> {
        let map: { [key: string]: string } = {};
        await this.forEachAsync(url.split('&'), (element: string) => {
            const indexOfAssignment = element.indexOf('=');
            if (indexOfAssignment <= 0) {
                return;
            }

            const key = element.substring(0, indexOfAssignment);
            const value = element.substring(indexOfAssignment + 1, element.length - key.length);
            map[key] = unescape(value);
        });

        return map;
    }
}

// The functions that handle deciphering internally
function reverse(src: string[], index?: number): string[] {
    return src.reverse();
}

function swap(src: string[], index?: number): string[] {
    if (!index) {
        return src;
    }

    const first = src[0];
    src[0] = src[index % src.length];
    src[index % src.length] = first;
    return src;
}

function slice(src: string[], index?: number): string[] {
    return src.join('').substring(index!).split('');
}
