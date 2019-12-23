"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var discord_js_1 = require("discord.js");
var request = require("request-promise-native");
var Streams = require("stream");
var parser = require('partial-json-parser');
var BeautifulDom = require('beautiful-dom');
var ytdlcore = require('ytdl-core');
// TODO: Figure out what's wrong with deciphering and get rid of the ytdl-core dependency
var MusicQueue = /** @class */ (function () {
    function MusicQueue() {
        this.songs = [];
        this.connection = undefined;
    }
    return MusicQueue;
}());
var YoutubeServiceDefault = /** @class */ (function () {
    function YoutubeServiceDefault() {
        this.videoLinkRegex = new RegExp('(?:https?:\/\/)?(?:www\.)?youtu(?:(\.be\/(?<videoId>.*))|(be\.com\/(?:(watch\?v=|v\/)(?<videoId2>.*))))');
        this.musicQueue = new MusicQueue();
    }
    YoutubeServiceDefault.prototype.initialize = function (bot) {
        var _this = this;
        bot.registerCommand('play', function (msg, args) { return __awaiter(_this, void 0, void 0, function () {
            var video, voiceConnection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!bot.configFile.canPlayMusic) {
                            msg.channel.send('Music has been disabled');
                            return [2 /*return*/];
                        }
                        if (!msg.member.voiceChannel) {
                            msg.channel.send('You are not in a voice channel');
                            return [2 /*return*/];
                        }
                        if (msg.member.voiceChannelID != bot.configFile.musicVoiceChannel) {
                            msg.channel.send("Cannot play music in '" + msg.member.voiceChannel.name + "' voice channel");
                            return [2 /*return*/];
                        }
                        if (!args) {
                            msg.channel.send('No arguments provided');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getVideoByName(args)];
                    case 1:
                        video = _a.sent();
                        if (video == undefined) {
                            msg.channel.send("No results found for query '" + args + "'");
                            return [2 /*return*/];
                        }
                        if (!!this.musicQueue.connection) return [3 /*break*/, 3];
                        return [4 /*yield*/, msg.member.voiceChannel.join()];
                    case 2:
                        voiceConnection = _a.sent();
                        this.musicQueue.connection = voiceConnection;
                        this.musicQueue.songs.push(video);
                        this.playNextSong(msg);
                        return [3 /*break*/, 4];
                    case 3:
                        this.musicQueue.songs.push(video);
                        msg.channel.send("'" + video.title + "' has been added to the song queue");
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        bot.registerCommand('skip', function (msg) {
            msg.channel.send('Skipping current song...');
            _this.playNextSong(msg);
        });
        bot.registerCommand('musicchannel', function (msg, args) {
            if (!+args) {
                msg.channel.send('Invalid arguments');
                return;
            }
            bot.configFile.musicVoiceChannel = args;
            msg.channel.send("Voice channel set to #" + args);
        });
    };
    YoutubeServiceDefault.prototype.playNextSong = function (msg) {
        var _this = this;
        if (!this.musicQueue.connection) { // This should probably never happen
            return;
        }
        if (this.musicQueue.songs.length == 0) {
            this.musicQueue.connection.disconnect();
            this.musicQueue.connection = undefined;
            return;
        }
        var song = this.musicQueue.songs.shift();
        this.musicQueue.connection.playStream(ytdlcore("https://youtube.com/watch?v=" + song.encrypted_id)).on('end', function () {
            _this.playNextSong(msg);
        });
        var embed = new discord_js_1.RichEmbed()
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
    };
    YoutubeServiceDefault.prototype.getVideoById = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var data, playerResponse, videoDetails, adaptiveFormats;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getVideoInfoAsync(value)];
                    case 1:
                        data = _a.sent();
                        playerResponse = parser(data['player_response']);
                        videoDetails = parser(JSON.stringify(playerResponse['videoDetails']));
                        videoDetails.audioStreams = [];
                        adaptiveFormats = playerResponse['streamingData']['adaptiveFormats'];
                        if (!adaptiveFormats) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.forEachAsync(adaptiveFormats, function (streamInfo) { return __awaiter(_this, void 0, void 0, function () {
                                var cipherData, signature, splitSig_1, deciphererFuntions, signatureParameter;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!this.isAudioStream(streamInfo.mimeType)) {
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, this.mapQueryParameters(streamInfo.cipher)];
                                        case 1:
                                            cipherData = _a.sent();
                                            signature = cipherData['s'];
                                            streamInfo.url = unescape(cipherData['url']);
                                            if (!(!streamInfo.url || signature)) return [3 /*break*/, 4];
                                            splitSig_1 = signature.split('');
                                            return [4 /*yield*/, this.getDecipherOperations(this.parseVideoId(value))];
                                        case 2:
                                            deciphererFuntions = _a.sent();
                                            return [4 /*yield*/, this.forEachAsync(deciphererFuntions, function (decipherer) {
                                                    switch (decipherer[0]) {
                                                        case 'r':
                                                            splitSig_1 = splitSig_1.reverse();
                                                            break;
                                                        case 'w':
                                                            var index = ~~decipherer[1];
                                                            var first = splitSig_1[0];
                                                            splitSig_1[0] = splitSig_1[index % splitSig_1.length];
                                                            splitSig_1[index] = first;
                                                            break;
                                                        case 's':
                                                            splitSig_1 = slice(splitSig_1, ~~decipherer[1]);
                                                            break;
                                                    }
                                                })];
                                        case 3:
                                            _a.sent();
                                            signatureParameter = !cipherData['sp'] ? "signature" : cipherData['sp'];
                                            streamInfo.url += "&" + cipherData['sp'] + "=" + signature;
                                            _a.label = 4;
                                        case 4:
                                            videoDetails.audioStreams.push(streamInfo);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, videoDetails];
                }
            });
        });
    };
    YoutubeServiceDefault.prototype.forEachAsync = function (array, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < array.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, callback(array[i], i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    YoutubeServiceDefault.prototype.getVideoByName = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var result, uri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /*if (!value) {
                            return undefined;
                        }*/
                        // If the provided input string is a link we fall back to the getVideoById function, 
                        // otherwise we query youtube for the search string and return one of the results
                        if (this.videoLinkRegex.test(value)) {
                            return [2 /*return*/, this.getVideoById(value)];
                        }
                        result = {};
                        uri = "https://www.youtube.com/search_ajax?style=json&embeddable=1&search_query=" + encodeURI(value);
                        return [4 /*yield*/, request.get(uri, function (err, res, body) {
                                if (err) {
                                    console.error("yt get video by name: " + err);
                                }
                                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                                    console.error("yt: unsuccessful response (" + res.statusCode + ")");
                                }
                                var responseJson = JSON.parse(body)['video'];
                                result = responseJson[Math.floor(Math.random() * Math.min(3, responseJson.length - 2)) + 1];
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    YoutubeServiceDefault.prototype.getDecipherOperations = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            function escapeRegExp(string) {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
            }
            var sourceLink, functions, sourceLinkRegex, uri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sourceLink = '';
                        functions = [];
                        sourceLinkRegex = new RegExp('\"js\":\"(?<sourcelink>\\S[^,]+)\"');
                        uri = "https://youtube.com/embed/" + input;
                        return [4 /*yield*/, request.get(uri, function (err, res, embedPageHtml) {
                                if (err) {
                                    console.error("yt get decipher operations: " + err);
                                }
                                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                                    console.error("yt: unsuccessful response (" + res.statusCode + ")");
                                }
                                var dom = new BeautifulDom(embedPageHtml);
                                var scriptTagElements = dom.getElementsByTagName('script');
                                for (var i = 0; i < scriptTagElements.length; ++i) {
                                    var scriptElement = scriptTagElements[i];
                                    var match = sourceLinkRegex.exec(scriptElement.innerHTML);
                                    if (match && match.groups) {
                                        sourceLink = match.groups['sourcelink'].replace('\\', '');
                                        break;
                                    }
                                }
                            })];
                    case 1:
                        _a.sent();
                        if (!sourceLink) {
                            throw 'Failed to obtain player source link';
                        }
                        return [4 /*yield*/, request.get("https://youtube.com" + sourceLink, { resolveWithFullResponse: true }, function (err, res, body) {
                                if (err) {
                                    console.error("yt get decipher operations: " + err);
                                }
                                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                                    console.error("yt: unsuccessful response (" + res.statusCode + ")");
                                }
                                // Thanks https://tyrrrz.me/Blog/Reverse-engineering-YouTube
                                var deciphererFuncName = /(\w+)=function\(\w+\){(\w+)=\2.split\(\x22{2}\);.*?return\s+\2.join\(\x22{2}\)}/g.exec(body)[1];
                                //const deciphererFuncBody = /(?!h\.)/ + escapeRegExp(deciphererFuncName) + /=function\(\w+\)\{([\s\S]*?)\}/g.exec(body)![1];
                                var deciphererFuncBody = new RegExp("(?!h\\.)" + escapeRegExp(deciphererFuncName) + "=function\\(\\w+\\)\\{(.*?)\\}").exec(body)[1];
                                var deciphererFuncStatements = deciphererFuncBody.split(';');
                                var deciphererDefinitionName = new RegExp('(\\w+).\\w+\\(\\w+,\\d+\\);').exec(deciphererFuncBody)[1];
                                var deciphererDefinitionBody = new RegExp("var\\s+" + escapeRegExp(deciphererDefinitionName) + "=\\{(\\w+:function\\(\\w+(,\\w+)?\\)\\{([\\s\\S]*?)\\}),?\\};").exec(body)[0];
                                deciphererFuncStatements.forEach(function (statement) {
                                    var calledFuncName = /(?:\w+\=\w+)?\.(\w+)\(\S*\)/.exec(statement)[1];
                                    if (!calledFuncName) {
                                        return;
                                    }
                                    console.log('called func: ' + calledFuncName);
                                    if (new RegExp(escapeRegExp(calledFuncName) + ":function\\(\\w?\\)\\{\\w+\\.reverse\\(\\)\\}").test(deciphererDefinitionBody)) {
                                        //functions.push({ index: 0, func: reverse });
                                        functions.push('r');
                                    }
                                    if (new RegExp(escapeRegExp(calledFuncName) + ":function\\(\\S+\\)\\{\\w+\\.splice\\(\\S*\\)\\}").test(deciphererDefinitionBody)) {
                                        //functions.push({ index: +new RegExp('\\(\\w+,(\\d+)\\)').exec(statement)![1], func: slice });
                                        functions.push('s' + +new RegExp('\\(\\w+,(\\d+)\\)').exec(statement)[1]);
                                    }
                                    if (new RegExp(escapeRegExp(calledFuncName) + ":function\\(\\S+\\)\\{var\\s\\S*\\}").test(deciphererDefinitionBody)) {
                                        //functions.push({ index: +new RegExp('\\(\\w+,(\\d+)\\)').exec(statement)![1], func: swap });
                                        functions.push('w' + +new RegExp('\\(\\w+,(\\d+)\\)').exec(statement)[1]);
                                    }
                                });
                            })];
                    case 2:
                        _a.sent();
                        console.log(functions.length);
                        return [2 /*return*/, functions];
                }
            });
        });
    };
    YoutubeServiceDefault.prototype.getVideoInfoAsync = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var videoId, responseData, uri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        videoId = this.parseVideoId(input);
                        responseData = {};
                        uri = "https://youtube.com/get_video_info?video_id=" + videoId + "&el=detailpage&hl=en";
                        return [4 /*yield*/, request.get({ uri: uri }, function (err, res, body) {
                                if (err) {
                                    console.error("yt get video info: " + err);
                                }
                                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                                    console.error("yt: unsuccessful response (" + res.statusCode + ")");
                                }
                                body.split('&').forEach(function (element) {
                                    var indexOfAssignment = element.indexOf('=');
                                    if (indexOfAssignment <= 0) {
                                        return;
                                    }
                                    var key = element.substring(0, indexOfAssignment);
                                    var value = element.substring(indexOfAssignment + 1, element.length - key.length);
                                    responseData[key] = unescape(value);
                                });
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, responseData];
                }
            });
        });
    };
    YoutubeServiceDefault.prototype.isAudioStream = function (input) {
        if (!input) {
            return false;
        }
        var index = input.indexOf('/');
        var containerString = input.substring(0, index);
        return containerString == 'audio';
    };
    YoutubeServiceDefault.prototype.parseVideoId = function (input) {
        var videoId = this.videoLinkRegex.exec(input);
        if (videoId && videoId.groups) {
            if (videoId.groups['videoId']) {
                return videoId.groups['videoId'];
            }
            return videoId.groups['videoId2'];
        }
        return input;
    };
    YoutubeServiceDefault.prototype.getStreamForAudioUrl = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var contentLength, totalBytesRead, writable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request.head(url, { resolveWithFullResponse: true }, function (err, res, body) {
                            contentLength = res.headers["content-length"];
                        })];
                    case 1:
                        _a.sent();
                        if (!contentLength) {
                            throw 'unable to obtain content length for provided stream';
                        }
                        totalBytesRead = 0;
                        writable = new Streams.PassThrough();
                        _a.label = 2;
                    case 2:
                        if (!(totalBytesRead < +contentLength)) return [3 /*break*/, 4];
                        return [4 /*yield*/, request.get(url, {
                                resolveWithFullResponse: true,
                                headers: {
                                    Range: "bytes=" + totalBytesRead + "-" + (totalBytesRead - 1 + 10 * 1024 * 1024)
                                }
                            }, function (_err, res) {
                                writable.push(res);
                                totalBytesRead += res.readableLength;
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/, writable];
                }
            });
        });
    };
    YoutubeServiceDefault.prototype.mapQueryParameters = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var map;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        map = {};
                        return [4 /*yield*/, this.forEachAsync(url.split('&'), function (element) {
                                var indexOfAssignment = element.indexOf('=');
                                if (indexOfAssignment <= 0) {
                                    return;
                                }
                                var key = element.substring(0, indexOfAssignment);
                                var value = element.substring(indexOfAssignment + 1, element.length - key.length);
                                map[key] = unescape(value);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, map];
                }
            });
        });
    };
    return YoutubeServiceDefault;
}());
exports["default"] = YoutubeServiceDefault;
// The functions that handle deciphering internally
function reverse(src, index) {
    return src.reverse();
}
function swap(src, index) {
    if (!index) {
        return src;
    }
    var first = src[0];
    src[0] = src[index % src.length];
    src[index % src.length] = first;
    return src;
}
function slice(src, index) {
    return src.join('').substring(index).split('');
}
