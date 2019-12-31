import { Service } from "../../framework/Service";
import { DefaultBot } from "../../framework/DiscordBot";
import { Message, RichEmbed } from "discord.js";
import { isStringNullOrWhitespace } from "../../Utils";
import * as request from 'request-promise-native';
import { StatsProfile } from "./StatsProfile";

export default class ApexTrackerService implements Service {
    initialize(bot: DefaultBot): void {
        bot.registerCommand(/apex\s+(\S+)\s+(.*)/g, async (msg: Message, args: RegExpExecArray) => {
            /*if (isStringNullOrWhitespace(args)) {
                msg.channel.send('Invalid username');
                return;
            }*/

            /*const splitArgs = args[1].split(' ');
            if (splitArgs.length < 2) {
                msg.channel.send(`Proper syntax: ${bot.configFile.commandPrefix}apex <origin/xbl/psn> <player name>`);
                return;
            }*/

            const platform = args[1];
            const username = args[2];
            const headers = {
                'TRN-Api-Key': bot.configFile.trackerggApiKey,
                'Accept': 'application/json'
            }

            await request.get(`https://public-api.tracker.gg/v2/apex/standard/profile/${platform}/${username}`, { headers: headers }, (err, res, body) => {
                if (err) {
                    console.log(`apex tracker: ${err}`);
                    return;
                }

                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                    console.log(`apex tracker: unsuccessful response (${res.statusCode})`);
                    return;
                }

                const result: StatsProfile = JSON.parse(body);
                const overallStats = result.data.segments[0].stats;
                const embed = new RichEmbed()
                    .setColor('0099ff')
                    .setAuthor('Apex Legends Stats', 'https://i.imgur.com/4UB9Cunh.jpg')
                    .setTitle(`@${result.data.platformInfo.platformUserHandle}`)
                    .setDescription(`Platform: ${result.data.platformInfo.platformSlug.toUpperCase()}`)
                    .setThumbnail(result.data.platformInfo.avatarUrl)
                    .addField('Total kills:', overallStats.kills.value, true)
                    .addField('Season 2 wins:', `${overallStats.season2Wins.value} (${overallStats.season2Wins.percentile})`, true)
                    .addField('Level:', overallStats.level.value, true)
                    .setFooter('BUFF YOAD', 'https://vignette.wikia.nocookie.net/old-people-facebook/images/1/1e/W0r1w6813td01.jpg/revision/latest?cb=20190821173248')
                    .setTimestamp();
                msg.channel.send(embed);
            }).catch(reason => {
                const errorMessage = JSON.parse(reason.error).errors[0].message;
                msg.channel.send(`API Error: ${errorMessage}`);
            });
        });
    }
}