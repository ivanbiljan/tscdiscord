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
var request = require("request-promise-native");
var YoutubeServiceDefault = /** @class */ (function () {
    function YoutubeServiceDefault() {
        this.videoLinkRegex = new RegExp('a');
    }
    YoutubeServiceDefault.prototype.initialize = function (bot) {
        bot.registerCommand('play', function (msg) {
        });
        bot.registerCommand('matich', function (msg) {
            msg.channel.send('lmao stupid albanian');
        });
    };
    YoutubeServiceDefault.prototype.getVideoById = function (value) {
        throw new Error("Method not implemented.");
    };
    YoutubeServiceDefault.prototype.getVideoByName = function (value) {
        var possibleId = +value;
        if (this.videoLinkRegex.test(value) || possibleId != NaN) {
            this.getVideoById(value);
            return;
        }
        // TODO
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
                        return [4 /*yield*/, request.get(uri, function (err, res, body) {
                                if (err) {
                                    console.error("yt: " + err);
                                }
                                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                                    console.error("yt: unsuccessful response (" + res.statusCode + ")");
                                }
                                body.split('&').forEach(function (element) {
                                    var indexOfAssignment = element.indexOf('=');
                                    if (indexOfAssignment) {
                                        var key = element.substring(0, indexOfAssignment);
                                        var value = element.substring(indexOfAssignment + 1, element.length - key.length - 1);
                                        responseData[key] = value;
                                    }
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
        var containerString = input.substring(index, input.length - index - 1);
        return containerString == 'audio';
    };
    YoutubeServiceDefault.prototype.parseVideoId = function (input) {
        if (!input) {
            return "";
        }
        var videoId = this.videoLinkRegex.exec(input);
        if (videoId && videoId.groups) {
            return videoId.groups.videoId;
        }
        return "";
    };
    return YoutubeServiceDefault;
}());
exports["default"] = YoutubeServiceDefault;
