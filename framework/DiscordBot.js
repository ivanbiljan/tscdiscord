"use strict";
exports.__esModule = true;
var Discord = require("discord.js");
var YoutubeServiceDefault_1 = require("../youtubeapi/YoutubeServiceDefault");
var InstagramService_1 = require("../instagram/InstagramService");
var GoogleService_1 = require("../google/GoogleService");
var redis = require("redis");
var QuoteService_1 = require("../quotes/QuoteService");
var DefaultBot = /** @class */ (function () {
    function DefaultBot(configFile, services) {
        var _a;
        var _this = this;
        this.redisOptions = {
            host: '127.0.0.1',
            port: 6379
        };
        this.services = [
            new YoutubeServiceDefault_1["default"](),
            new InstagramService_1["default"](),
            new GoogleService_1["default"](),
            new QuoteService_1["default"]()
        ];
        this.commands = (_a = {},
            _a['ping'] = function (msg) { return msg.channel.send('ponGG'); },
            _a['nick'] = function (msg) {
                var nick = msg.content.substring(msg.content.indexOf(' ') + 1);
                msg.guild.members.get(_this.client.user.id).setNickname(nick);
            },
            _a['purge'] = function (msg, args) {
                var numberOfMessages = +args;
                if (!numberOfMessages) {
                    msg.channel.send('Invalid number specified');
                    return;
                }
                msg.channel.bulkDelete(numberOfMessages + 1);
            },
            _a);
        this.client = new Discord.Client();
        this.loadedServices = [];
        this.configFile = configFile;
        this.loadedServices = services || this.services;
    }
    DefaultBot.prototype.connect = function () {
        var _this = this;
        this.client.login(this.configFile.token);
        this.client.on('ready', function () {
            console.log("> CHeeRs FRoM CROatTia");
        });
        this.client.on('message', function (msg) {
            var commandName = '';
            var indexOfSpace = msg.content.indexOf(' ');
            if (msg.content.startsWith(_this.configFile.commandPrefix)) {
                if (indexOfSpace == -1) {
                    indexOfSpace = msg.content.length; // The command does not take any arguments
                }
                commandName = msg.content.substring(1, indexOfSpace);
            }
            else if (_this.configFile.aliases.includes(msg.content.substring(0, indexOfSpace))) {
                var input = msg.content.slice(indexOfSpace).trim();
                indexOfSpace = input.indexOf(' ');
                commandName = input.substring(0, indexOfSpace == -1 ? input.length : indexOfSpace);
            }
            else {
                // Handle regex matching
            }
            if (!commandName) {
                return;
            }
            var callback = _this.commands[commandName];
            if (callback) {
                callback(msg, msg.content.slice(indexOfSpace).trim());
            }
        });
        this.redisclient = redis.createClient(this.redisOptions).on('connect', function () {
            _this.loadedServices.forEach(function (service) {
                service.initialize(_this);
            });
        });
    };
    DefaultBot.prototype.registerCommand = function (commandName, callback) {
        this.commands[commandName] = callback;
    };
    DefaultBot.prototype.redisSave = function (key, value) {
        if (!this.redisclient) {
            return;
        }
        this.redisclient.set(key, JSON.stringify(value));
        this.redisclient.save();
    };
    DefaultBot.prototype.redisLoad = function (key, callback) {
        if (this.redisclient == undefined || !this.redisclient.connected) {
            return undefined;
        }
        this.redisclient.get(key, function (err, val) {
            if (err) {
                console.log("redis: " + err);
            }
            return callback(err, JSON.parse(val));
        });
    };
    return DefaultBot;
}());
exports.DefaultBot = DefaultBot;
