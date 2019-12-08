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
            _a);
        this.client = new Discord.Client();
        this.loadedServices = [];
        this.configFile = configFile;
        if (services == undefined) {
            this.loadedServices = this.services;
        }
        else {
            this.loadedServices = services;
        }
        console.log(this.loadedServices.length);
    }
    DefaultBot.prototype.connect = function () {
        var _this = this;
        this.client.login(this.configFile.token);
        this.loadedServices.forEach(function (service) {
            service.initialize(_this);
        });
        this.client.on('ready', function () {
            console.log("CHeeRs FRoM CROatTia");
        });
        this.client.on('message', function (msg) {
            if (msg.content.startsWith(_this.configFile.commandPrefix)) {
                var indexOfSpace = msg.content.indexOf(' ');
                if (indexOfSpace == -1) {
                    indexOfSpace = msg.content.length; // The command does not take any arguments
                }
                var commandName = msg.content.substring(1, indexOfSpace);
                var callback = _this.commands[commandName];
                if (callback) {
                    callback(msg);
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
