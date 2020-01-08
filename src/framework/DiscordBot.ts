import * as Discord from 'discord.js';
import { Service } from '../framework/Service';
import { ConfigurationFile } from '../config/ConfigurationFile';
import YoutubeServiceDefault from '../youtubeapi/YoutubeServiceDefault';
import InstagramService from '../instagram/InstagramService';
import GoogleService from '../google/GoogleService';
import redis = require('redis');
import QuoteService from '../quotes/QuoteService';
import ApexTrackerService from '../gametrackers/apex/ApexTrackerService';
import { Command } from './Command';
import ReminderService from '../reminders/ReminderService';
import { traverseDirectory } from '../Utils';
import { load } from 'dotenv/types';

// TODO: Come up with a proper service detection mechanism
//       Regex matching for commands

export interface DiscordBot {
    client: Discord.Client;
    configFile: ConfigurationFile;
    loadedServices: Service[];
}

export class DefaultBot implements DiscordBot {
    private redisOptions: redis.ClientOpts = {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: +(process.env.REDIS_PORT || 6379),
        auth_pass: process.env.REDIS_PASS || ''
    };
    
    private redisclient: redis.RedisClient | undefined;
    private commands: Command[] = [];

    client: Discord.Client = new Discord.Client();
    configFile: ConfigurationFile;
    loadedServices: Service[] = [];

    constructor(configFile: ConfigurationFile, services?: Service[]) {
        this.configFile = configFile;
        if (services) {
            this.loadedServices = services;
        } else {
            const files = traverseDirectory('./dist').filter(file => file.endsWith('.js'));
            for (const file of files) {
                const module = require(file);
                if (!module || !module.default) { // No export
                    continue;
                }

                if ('initialize' in module.default.prototype) { // Should've opted for an abstract class instead?
                    console.log(`Loading file '${file}'`);
                    this.loadedServices.push(new module.default());
                }
            }
        }
    }

    connect(): void {
        this.client.login(process.env.DISCORD_TOKEN);
        this.client.on('ready', () => {
            console.log("> CHeeRs FRoM CROatTia");
        });

        this.client.on('message', msg => {
            if (msg.member.user?.id == this.client.user.id) {
                return;
            }

            let message = ''; // This will be the section that we match against
            if (msg.content.startsWith(this.configFile.commandPrefix)) {
                message = msg.content.slice(1);
            } else {
                const commandRegex = /(\S+)\s*(.*)/g.exec(msg.content);
                if (!commandRegex) {
                    return;
                }

                if (!this.configFile.aliases.includes(commandRegex[1])) {
                    return;
                }

                message = commandRegex[2];
            }

            for (let i = 0; i < this.commands.length; ++i) {
                const match = this.commands[i].matchRegex.exec(message);
                if (match) {
                    this.commands[i].callback(msg, match);
                }
            }
        });

        this.redisclient = redis.createClient(this.redisOptions).on('connect', () => {
            this.loadedServices.forEach(service => {
                service.initialize(this);
            });
        });

        this.registerCommand('ping', (msg: Discord.Message) => msg.channel.send('ponGG'), 'ping - Pings the bot');
        this.registerCommand(/purge (\d+)/, (msg: Discord.Message, args: RegExpExecArray) => msg.channel.bulkDelete(+args[1] + 1), 'purge <number> - Removes a specified number of messages');
        this.registerCommand(/(?:nick|setnick|changenick)\s+?(\w+)/, (msg: Discord.Message, args: RegExpExecArray) => {
            msg.guild.members.get(this.client.user.id)!.setNickname(args[1]);
            msg.channel.send(`Nickname changed to '${args[1]}'`);
        }, 'nick <nickname> - Sets the bot\'s nickname');
        this.registerCommand('help', (msg: Discord.Message) => {
            let outputString = '**Available commands**:\n';
            for (let i = 0; i < this.commands.length; ++i) {
                const command = this.commands[i];
                if (command.helpText) {
                    outputString += command.helpText + '\n';
                }
            }

            msg.channel.send(outputString);
        }, 'help - Lists available commands');
    }

    registerCommand(regex: string | RegExp, callback: (msg: Discord.Message, match: RegExpExecArray) => void, helpText?: string): void {
        const commandRegex = typeof regex === 'string' ? new RegExp(regex) : regex;
        this.commands.push({matchRegex: commandRegex, callback: callback, helpText: helpText});
    }

    redisSave(key: string, value: any): void {
        if (!this.redisclient) {
            return;
        }

        this.redisclient.set(key, JSON.stringify(value));
        //this.redisclient.save(); --> Uncomment to persist data to disk
    }

    redisLoad<T>(key: string, callback: (err: Error | null, val: T) => any): void {
        if (!this.redisclient || !this.redisclient.connected) {
            return undefined;
        }

        this.redisclient.get(key, (err, val) => {
            if (err) {
                console.log(`redis: ${err}`);
                return;
            }

            return callback(err, JSON.parse(val));
        });
    }
}