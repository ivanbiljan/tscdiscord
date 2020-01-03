import { Service } from "../framework/Service";
import { DefaultBot } from '../framework/DiscordBot';
import * as request from 'request-promise-native';
import * as ResponseData from './InstagramResponseData';
import { Message, RichEmbed } from "discord.js";
import { random } from "../Utils";

export default class InstagramService implements Service {
    initialize(bot: DefaultBot): void {
        bot.registerCommand('gomazbomb', async (msg: Message) => {
            const timelineMedia = (await this.fetchData('croatiart')).graphql.user.edge_owner_to_timeline_media;
            msg.channel.send(timelineMedia.edges[random(0, timelineMedia.edges.length - 1)].node.display_url);
        }, 'gomazbomb');

        bot.registerCommand(/insta\s+(.*)/, async (msg: Message, args: RegExpExecArray) => {
            /*if (!args || !/\S/g.test(args)) {
                msg.channel.send('Invalid arguments');
                return;
            }*/

            const data = await this.fetchData(args[1]);
            const embed = new RichEmbed()
                .setColor('0099ff')
                .setAuthor('Overview', 'https://i.imgur.com/M6yBwxS.png?1')
                .setTitle(`@${data.graphql.user.username}`)
                .setURL(`https://instagram.com/${data.graphql.user.username}`)
                .setDescription(data.graphql.user.full_name)
                .setThumbnail('https://github.com/remojansen/logo.ts/raw/master/ts.png')
                .addField('Posts:', data.graphql.user.edge_owner_to_timeline_media.count, true)
                .addField('Followers:', data.graphql.user.edge_followed_by.count, true)
                .addField('Following:', data.graphql.user.edge_follow.count, true)
                .setImage(data.graphql.user.profile_pic_url_hd)
                .setFooter('BUFF YOAD', 'https://vignette.wikia.nocookie.net/old-people-facebook/images/1/1e/W0r1w6813td01.jpg/revision/latest?cb=20190821173248')
                .setTimestamp();
            msg.channel.send(embed);
        }, 'insta <username> - Returns Instagram overview for the specified user');
    }

    public async fetchData(profile: string): Promise<ResponseData.ResponseJson> {
        let response = {} as ResponseData.ResponseJson;
        await request.get(`https://instagram.com/${profile}/?__a=1`, (err, res, body) => {
            if (err) {
                console.log(`An error has occured while fetching timeline data: ${err}`);
            }

            if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                console.log(`ig: unsuccessful response (${res.statusCode})`);
            }

            response = JSON.parse(body);
        });

        return response;
    }
}