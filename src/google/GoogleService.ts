import { Service } from "../framework/Service";
import { Message } from "discord.js";
import * as request from 'request-promise-native';
import { random, isStringNullOrWhitespace } from "../Utils";
import BeautifulDom from "beautiful-dom";
import { writeFileSync } from "fs";

// TODO: Google Search
//       Timezones
//       Weather -- Done
//       Images

// I'll have to scrape Google manually

export default class GoogleService implements Service {
    initialize(bot: import("../framework/DiscordBot").DefaultBot): void {
        bot.registerCommand(/weather\s+?(.*)/g, async (msg: Message, args: RegExpExecArray) => {
            const validOptions = ["zip", "id"];
            /*if (isStringNullOrWhitespace(args)) {
                msg.channel.send('Invalid arguments');
                return;
            }*/

            // Do I really have to do this?
            // OpenWeatherMap seems to handle zip codes regardless of query parameters, although such responses are not 100% accurate (e.g 10370,HR returns 'Zagreb')
            const splitArgs = args[1].split(' ');
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

        bot.registerCommand(/forecast\s+?(.*)/g, async (msg: Message, args: RegExpExecArray) => {
            /*if (isStringNullOrWhitespace(args)) {
                msg.channel.send('Invalid arguments');
                return;
            }*/

            const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${args[1]}&units=metric&APPID=${bot.configFile.openWeatherMapApiKey}`;
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

                let previousDay = 0;
                let outputString = `**${response.city.name}, ${response.city.country}** :flag_${response.city.country.toLowerCase()}: 5 day forecast\n`;
                for (const weatherInfo of response.list) {
                    const dateStamp = new Date(0); // 'list.dt' represents the UTC epoch
                    dateStamp.setUTCSeconds(weatherInfo.dt);
                    if (dateStamp.getDate() == previousDay) { // OpenWeatherMap provides reports every 3 hours and we don't want all of them
                        continue;
                    }

                    if (dateStamp.getUTCHours() != 12) {
                        continue;
                    }

                    outputString += `> _${dateStamp.toDateString()}_: **Temperature**: ${weatherInfo.main.temp_min} - ${weatherInfo.main.temp_max} °C, feels like ${weatherInfo.main.feels_like} °C **Wind**: ${weatherInfo.wind.speed} m/s ` +
                        `**Clouds**: ${weatherInfo.clouds.all} % (${weatherInfo.weather[0].description})\n`;
                    previousDay = dateStamp.getDate();
                }

                msg.channel.send(outputString);
            }).catch(reason => {
                const errorMessage = JSON.parse(reason.error).message;
                msg.channel.send(`API Error: ${errorMessage}`);
            });
        });
    }
}