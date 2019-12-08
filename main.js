"use strict";
exports.__esModule = true;
var Bot = require("./framework/DiscordBot");
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
var config = require('./config/config.json');
var bot = new Bot.DefaultBot(config);
bot.connect();
