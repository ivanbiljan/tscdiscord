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

// TODO: Come up with a proper service detection mechanism
//       Regex matching for commands

export interface DiscordBot {
    client: Discord.Client;
    configFile: ConfigurationFile;
    loadedServices: Service[];
}

export class DefaultBot implements DiscordBot {
    private redisOptions: redis.ClientOpts = {
        host: '127.0.0.1',
        port: 6379
    };
    
    private redisclient: redis.RedisClient | undefined;

    private services: Service[] = [
        new YoutubeServiceDefault(),
        new InstagramService(),
        new GoogleService(),
        new QuoteService(),
        new ApexTrackerService()
    ];

    /*private commands: { [cmd: string]: (msg: Discord.Message, args: string) => any } = {
        ['ping']: (msg: Discord.Message) => msg.channel.send('ponGG'),
        ['nick']: (msg: Discord.Message) => {
            let nick = msg.content.substring(msg.content.indexOf(' ') + 1);
            msg.guild.members.get(this.client.user.id)!.setNickname(nick);
        },
        ['purge']: (msg: Discord.Message, args: string) => {
            let numberOfMessages = +args
            if (!numberOfMessages) {
                msg.channel.send('Invalid number specified');
                return;
            }

            msg.channel.bulkDelete(numberOfMessages + 1);
        }
        [/\S/g.toString()]: 
    };*/
    private commands: Command[] = [];

    client: Discord.Client = new Discord.Client();
    configFile: ConfigurationFile;
    loadedServices: Service[] = [];

    constructor(configFile: ConfigurationFile, services?: Service[]) {
        this.configFile = configFile;
        this.loadedServices = services || this.services;
    }

    connect(): void {
        this.client.login(this.configFile.token);
        this.client.on('ready', () => {
            console.log("> CHeeRs FRoM CROatTia");
        });

        this.client.on('message', msg => {
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
            /*let commandName = '';
            let indexOfSpace = msg.content.indexOf(' ');
            if (msg.content.startsWith(this.configFile.commandPrefix)) {
                if (indexOfSpace == -1) {
                    indexOfSpace = msg.content.length; // The command does not take any arguments
                }

                commandName = msg.content.substring(1, indexOfSpace);
            } else if (this.configFile.aliases.includes(msg.content.substring(0, indexOfSpace))) {
                const input = msg.content.slice(indexOfSpace).trim();
                indexOfSpace = input.indexOf(' ');
                commandName = input.substring(0, indexOfSpace == -1 ? input.length : indexOfSpace);
            } else {
                // Handle regex matching
            }

            if (!commandName) {
                return;
            }

            const callback = this.commands[commandName];
            if (callback) {
                callback(msg, msg.content.slice(indexOfSpace).trim());
            }*/
        });

        this.redisclient = redis.createClient(this.redisOptions).on('connect', () => {
            this.loadedServices.forEach(service => {
                service.initialize(this);
            });
        });

        this.registerCommand('ping', (msg: Discord.Message) => msg.channel.send('ponGG'));
        this.registerCommand(/(?:nick|setnick|changenick)\s+?(\w+)/g, (msg: Discord.Message, args: RegExpExecArray) => {
            msg.guild.members.get(this.client.user.id)!.setNickname(args[1]);
            msg.channel.send(`Nickname changed to '${args[1]}'`);
        });
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
        this.redisclient.save();
    }

    redisLoad<T>(key: string, callback: (err: Error | null, val: T) => any): void {
        if (this.redisclient == undefined || !this.redisclient.connected) {
            return undefined;
        }

        this.redisclient.get(key, (err, val) => {
            if (err) {
                console.log(`redis: ${err}`);
            }

            return callback(err, JSON.parse(val));
        });
    }
}