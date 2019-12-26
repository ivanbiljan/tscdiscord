import { Service } from "../framework/Service";
import { Message } from "discord.js";
import * as request from 'request-promise-native';
import { random } from "../Utils";
const GSR = require('google-search-results-nodejs')

// TODO: Google Search
//       Timezones
//       Weather
//       Images

// I'll have to scrape Google manually

export default class GoogleService implements Service {
    private client = {} as any;

    initialize(bot: import("../framework/DiscordBot").DefaultBot): void {
        this.client = new GSR.GoogleSearchResults(bot.configFile.serpApiKey);

        bot.registerCommand('image', async (msg: Message, args: string) => {
            if (!args || !/\S/g.test(args)) {
                msg.channel.send('Invalid arguments');
                return;
            }

            const query = {
                q: args,
                hl: 'en',
                tbm: 'isch'
            };

            const result = this.client.json(query, (data: any) => {
                const images: any[] = data.images_results;
                msg.channel.send(images[random(0, images.length - 1)].original);
            });
        });
    }
}