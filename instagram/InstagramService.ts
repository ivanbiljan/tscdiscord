import { Service } from "../framework/Service";
import { DefaultBot } from '../framework/DiscordBot';
import * as request from 'request-promise-native';
import * as ResponseData from './InstagramResponseData';
import { Message } from "discord.js";
import { random } from "../Utils";

export default class InstagramService implements Service {
    initialize(bot: DefaultBot): void {
        bot.registerCommand('gomazbomb', async (msg: Message, args: string) => {
            const timelineMedia = (await this.fetchData('croatiart')).graphql.user.edge_owner_to_timeline_media;
            msg.channel.send(timelineMedia.edges[random(0, timelineMedia.edges.length - 1)].node.display_url);
        });

        bot.registerCommand('overview', async (msg: Message, args: string) => {
        });
    }

    private async fetchData(profile: string): Promise<ResponseData.ResponseJson> {
        let response = {} as ResponseData.ResponseJson;
        await request.get(`https://instagram.com/croatiart/?__a=1`, (err, res, body) => {
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