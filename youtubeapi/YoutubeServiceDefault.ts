import {Service} from '../framework/Service';
import { DefaultBot } from '../framework/DiscordBot';
import { Message } from 'discord.js';
import { stringify } from 'querystring';
import * as request from 'request-promise-native';

export default class YoutubeServiceDefault implements Service {
    private videoLinkRegex = new RegExp('(?:https?:\/\/)?(?:www\.)?youtu(?:(\.be\/(?<videoId>.*))|(be\.com\/(?:(watch\?v=|v\/)(?<videoId2>.*))))');

    initialize(bot: DefaultBot) {
        bot.registerCommand('play', (msg: Message) => {
        });
    }

    async getVideoById(value: string): Promise<YoutubeVideo | undefined> {
        const videoId: number = +value;
        if (videoId == NaN) {
            return undefined;
        }

        const data = await this.getVideoInfoAsync(value);
        const playerResponse = JSON.parse(data['player_response']);
        const videoDetails: YoutubeVideo = playerResponse['videoDetails'];
        return videoDetails;
    }

    getVideoByName(value: string): void {
        // If the provided input string is either a link or an actual video ID we fall back to the getVideoById function, 
        // otherwise we query youtube for the search string and return one of the results
        let possibleId: number = +value;
        if (this.videoLinkRegex.test(value) || possibleId != NaN) {
            this.getVideoById(value);
            return;
        }

        
    }

    private async getVideoInfoAsync(input: string): Promise<{[key: string]: string;}> {
        const videoId = this.parseVideoId(input);
        let responseData: {[key: string]: string} = {};
        const  uri = `https://youtube.com/get_video_info?video_id=${videoId}&el=detailpage&hl=en`;
        await request.get(uri, (err, res, body: string) => {
            if (err) {
                console.error(`yt: ${err}`);
            }

            if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                console.error(`yt: unsuccessful response (${res.statusCode})`);
            }

            body.split('&').forEach(element => {
                const indexOfAssignment = element.indexOf('=');
                if (indexOfAssignment) {
                    const key = element.substring(0, indexOfAssignment);
                    const value = element.substring(indexOfAssignment + 1, element.length - key.length - 1);
                    responseData[key] = decodeURI(value);
                }
            });
        });

        return responseData;
    }

    private isAudioStream(input: string): boolean {
        if (!input) {
            return false;
        }

        const index = input.indexOf('/');
        const containerString = input.substring(index, input.length - index - 1);
        return containerString == 'audio';
    }

    private parseVideoId(input: string): string {
        if (!input) {
            return "";
        }

        if (+input != NaN) {
            return input;
        }

        const videoId = this.videoLinkRegex.exec(input);
        if (videoId && videoId.groups) {
            if (videoId.groups.videoId) {
                return videoId.groups.videoId;
            }

            return videoId.groups.videoId2;
        }

        return "";
    }
}
