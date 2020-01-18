import { Service } from "../framework/Service";
import { Message } from "discord.js";
import * as request from 'request-promise-native';
import * as cheerio from 'cheerio';
import { writeFileSync } from "fs";
import { random } from "../Utils";

export default class GoogleService implements Service {
    initialize(bot: import("../framework/DiscordBot").DefaultBot): void {
        bot.registerCommand(/weather\s+?(.*)/, async (msg: Message, args: RegExpExecArray) => {
            const validOptions = ["zip", "id"];
            
            // Do I really have to do this?
            // OpenWeatherMap seems to handle zip codes regardless of query parameters, although such responses are not 100% accurate (e.g 10370,HR returns 'Zagreb')
            const splitArgs = args[1].split(' ');
            let param = splitArgs.find(arg => validOptions.includes(arg));
            let endpoint = 'https://api.openweathermap.org/data/2.5/weather?';
            switch (param) {
                case 'zip':
                    splitArgs.splice(splitArgs.indexOf(param), 1).join('')
                    endpoint += `zip=${splitArgs.join(' ')}&units=metric&APPID=${process.env.OPENWEATHERMAP_KEY}`;
                    break;
                case 'id':
                    splitArgs.splice(splitArgs.indexOf(param), 1).join('')
                    endpoint += `id=${splitArgs.join(' ')}&units=metric&APPID=${process.env.OPENWEATHERMAP_KEY}`;
                    break;
                default:
                    endpoint += `q=${args[1]}&units=metric&APPID=${process.env.OPENWEATHERMAP_KEY}`;
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

        bot.registerCommand(/forecast\s+?(.*)/, async (msg: Message, args: RegExpExecArray) => {
            const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${args[1]}&units=metric&APPID=${process.env.OPENWEATHERMAP_KEY}`;
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

        bot.registerCommand(/(?:image|img)\s+(?:me)?\s+(.+)/, async (msg, args) => {
            const url = `https://www.google.co.in/search?q=${args[1]}&source=lnms&tbm=isch`;
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
            };

            await request.get(url, {headers: headers, resolveWithFullResponse: true}, (err, res) => {
                if (err) {
                    console.log(`open weather map error: ${err}`);
                    return;
                }

                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                    console.log(`open weather map: unsuccessful response (${res.statusCode})`);
                    return;
                }

                const $ = cheerio.load(res.body);
                const rgMeta = $('.rg_meta')[random(1, 10)];
                const child = rgMeta.children[0];
                if (child && child.data) {
                    msg.channel.send(JSON.parse(child.data).ou);
                } else {
                    msg.channel.send(`No results found for '${args[1]}'`);
                }
            }).catch(() => console.log('Google Image: unhandled exception'));
        }, 'image me <query> - Returns a random image for the given search query');

        bot.registerCommand(/google\s+(?:me)?\s+(.+)/, async (msg, args) => {
            const url = `https://www.google.co.in/search?q=${args[1]}`;
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
            };

            await request.get(url, {headers: headers, resolveWithFullResponse: true}, (err, res) => {
                if (err) {
                    console.log(`open weather map error: ${err}`);
                    return;
                }

                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                    console.log(`open weather map: unsuccessful response (${res.statusCode})`);
                    return;
                }

                const $ = cheerio.load(res.body);
                const result = $('.r > a').attr('href');
                msg.channel.send(result);
            }).catch(() => console.log('Google Search: unhandled exception'));
        }, 'google me <query> - Returns a the first result for the given search query');

        bot.registerCommand(/(?:fml|fmylife)/, async (msg) => {
            const url = 'https://www.fmylife.com/'
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
            };

            await request.get(url, {headers: headers}, (err, res) => {
                if (err) {
                    console.log(`open weather map error: ${err}`);
                    return;
                }

                if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
                    console.log(`open weather map: unsuccessful response (${res.statusCode})`);
                    return;
                }

                const $ = cheerio.load(res.body);
                const post = $('.article-link').toArray()[random(1, 20)];
                if (post) {
                    msg.channel.send(`**__${post.children[1].children[0].data}__**${post.children[2].data}`);
                }
            }).catch(() => console.log('fml: unhandled exception'));
        }, 'fml - Returns a random post from fmylife.com');

        bot.registerCommand(/(?:fact|random\s*fact)/, async (msg) => {
            await request.get('https://uselessfacts.jsph.pl/random.json?language=en', (err, res) => {
                const response = JSON.parse(res.body);
                msg.channel.send(response.text);
            }).catch(() => console.log('useslessfacts: unhandled exception'));
        }, 'fact - Returns a random fact');
    }
}