import { Service } from "../framework/Service";
import { Message } from "discord.js";
import * as request from 'request-promise-native';
import { random } from "../Utils";
import BeautifulDom from "beautiful-dom";
import { writeFileSync } from "fs";

// TODO: Google Search
//       Timezones
//       Weather -- Done
//       Images

// I'll have to scrape Google manually

export default class GoogleService implements Service {
    initialize(bot: import("../framework/DiscordBot").DefaultBot): void {
        bot.registerCommand('weather', async (msg: Message, args: string) => {
            const validOptions = ["zip", "id"];
            if (!args || !/\S/g.test(args)) {
                msg.channel.send('Invalid arguments');
                return;
            }

            const splitArgs = args.split(' ');
            let param = splitArgs.find(arg => validOptions.includes(arg));
            let endpoint = 'https://api.openweathermap.org/data/2.5/weather?';
            switch (param) {
                case 'zip':
                    splitArgs.splice(splitArgs.indexOf(param), 1).join('')
                    endpoint += `zip=${splitArgs.join(' ')}&units=metric&APPID=${bot.configFile.openWeatherMapApiKey}`;
                    break;
                case 'id':
                    splitArgs.splice(splitArgs.indexOf(param), 1).join('')
                    endpoint += `id=${splitArgs.join(' ')}&units=metric&APPID=${bot.configFile.openWeatherMapApiKey}`;
                    break;
                default:
                    endpoint += `q=${args}&units=metric&APPID=${bot.configFile.openWeatherMapApiKey}`;
                    break;
            }

            await request.get(endpoint, (err, res) => {
                if (err) {
                    console.log(`open weather map error: ${err}`);
                    return;
                }

                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                    console.log(`open weather map: unsuccessful response (${res.statusCode})`);
                    return;
                }

                const response = JSON.parse(res.toJSON().body);
                msg.channel.send(`**${response.name}, ${response.sys.country}** :flag_${response.sys.country.toLowerCase()}: (${response.coord.lon}, ${response.coord.lat}) - _${response.weather[0].description}_\n` +
                    `**Temperature**: ${response.main.temp_min} - ${response.main.temp_max} °C, feels like ${response.main.temp} °C **Wind**: ${response.wind.speed} m/s ` + 
                    `**Clouds**: ${response.clouds.all} %`);
            }).catch(reason => {
                const errorMessage = JSON.parse(reason.error).message;
                msg.channel.send(`API Error: ${errorMessage}`);
            });
        });
    }
}