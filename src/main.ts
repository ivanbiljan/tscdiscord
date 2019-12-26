import * as Bot from './framework/DiscordBot';
import { ConfigurationFile } from './config/ConfigurationFile';

const config: ConfigurationFile = require('../config.json');
const bot: Bot.DefaultBot = new Bot.DefaultBot(config);
bot.connect();