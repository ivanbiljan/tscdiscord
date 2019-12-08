import * as Discord from 'discord.js';
import * as Bot from './framework/DiscordBot';
import { ConfigurationFile } from './config/ConfigurationFile';


/*const Client = new Discord.Client();
Client.login('NjUwNzE5NjM4ODQ1NjUzMDEy.XePfrg.MIQv-oWN8wsAI_sb_TyIpH_OFQg');

Client.on('ready', (): void => {
    console.log('CHeeRs FRoM CROaTia');
});

Client.on('message', (msg: Discord.Message): void => {
    if (msg.content == 'ping') {
        msg.channel.send('ponGG');
    }
});

Client.on('guildMemberAdd', (): void => {
    let defaultChannel = Client.channels.find("client", "general") as Discord.TextChannel;
    defaultChannel.send('CHeeRs FRoM CROaTia');
});*/

let config: ConfigurationFile = require('./config/config.json');
let bot: Bot.DefaultBot = new Bot.DefaultBot(config);
bot.connect();