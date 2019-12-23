"use strict";
exports.__esModule = true;
var Discord = require("discord.js");
var YoutubeServiceDefault_1 = require("../youtubeapi/YoutubeServiceDefault");
var DefaultBot = /** @class */ (function () {
    function DefaultBot(configFile, services) {
        var _a;
        var _this = this;
        this.services = [
            new YoutubeServiceDefault_1["default"]()
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
        /*if (services == undefined) {
            this.loadedServices = this.services;
        } else {
            this.loadedServices = services;
        }*/
    }
    DefaultBot.prototype.connect = function () {
        var _this = this;
        this.client.login(this.configFile.token);
        this.loadedServices.forEach(function (service) {
            service.initialize(_this);
        });
        this.client.on('ready', function () {
            console.log("> CHeeRs FRoM CROatTia");
        });
        this.client.on('message', function (msg) {
            var indexOfSpace = msg.content.indexOf(' ');
            if (msg.content.startsWith(_this.configFile.commandPrefix)) {
                if (indexOfSpace == -1) {
                    indexOfSpace = msg.content.length; // The command does not take any arguments
                }
                var commandName = msg.content.substring(1, indexOfSpace);
                var callback = _this.commands[commandName];
                if (callback) {
                    callback(msg, msg.content.slice(indexOfSpace).trim());
                }
            }
            else if (_this.configFile.aliases.includes(msg.content.substring(0, indexOfSpace))) {
                console.log('true');
                var input = msg.content.slice(indexOfSpace).trim();
                var commandName = input.substring(0, input.indexOf(' ') == -1 ? input.length : input.indexOf(' '));
                console.log(input);
                console.log(commandName);
                var callback = _this.commands[commandName];
                if (callback) {
                    callback(msg, msg.content.slice(indexOfSpace).trim());
                }
            }
        });
    };
    DefaultBot.prototype.registerCommand = function (commandName, callback) {
        this.commands[commandName] = callback;
    };
    return DefaultBot;
}());
exports.DefaultBot = DefaultBot;
