"use strict";
exports.__esModule = true;
var Bot = require("./framework/DiscordBot");
var config = require('./config/config.json');
var bot = new Bot.DefaultBot(config);
bot.connect();
