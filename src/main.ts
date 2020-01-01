import * as Bot from './framework/DiscordBot';
import { ConfigurationFile } from './config/ConfigurationFile';
require('dotenv').config({path: '.env'});

const config: ConfigurationFile = require('../config.json');
const bot: Bot.DefaultBot = new Bot.DefaultBot(config);
bot.connect();