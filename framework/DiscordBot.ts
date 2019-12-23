import * as Discord from 'discord.js';
import { Service } from '../framework/Service';
import { ConfigurationFile } from '../config/ConfigurationFile';
import * as fs from 'fs';
import * as path from 'path';
import YoutubeServiceDefault from '../youtubeapi/YoutubeServiceDefault';

export interface DiscordBot {
    client: Discord.Client;
    configFile: ConfigurationFile;
    loadedServices: Service[];
}

export class DefaultBot implements DiscordBot {
    private services: Service[] = [
        new YoutubeServiceDefault()
    ];

    private commands: { [cmd: string]: (msg: Discord.Message, args: string) => any } = {
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
    };

    client: Discord.Client = new Discord.Client();
    configFile: ConfigurationFile;
    loadedServices: Service[] = [];

    constructor(configFile: ConfigurationFile, services?: Service[]) {
        this.configFile = configFile;
        this.loadedServices = services || this.services;
        /*if (services == undefined) {
            this.loadedServices = this.services;
        } else {
            this.loadedServices = services;
        }*/
    }

    connect(): void {
        this.client.login(this.configFile.token);
        this.loadedServices.forEach(service => {
            service.initialize(this);
        });

        this.client.on('ready', () => {
            console.log("> CHeeRs FRoM CROatTia");
        });

        this.client.on('message', msg => {
            if (msg.content.startsWith(this.configFile.commandPrefix)) {
                let indexOfSpace = msg.content.indexOf(' ');
                if (indexOfSpace == -1) {
                    indexOfSpace = msg.content.length; // The command does not take any arguments
                }

                const commandName = msg.content.substring(1, indexOfSpace);
                const callback = this.commands[commandName];
                if (callback) {
                    callback(msg, msg.content.slice(indexOfSpace + 1));
                }
            }
        });
    }

    registerCommand(commandName: string, callback: (msg: Discord.Message, args: string) => void) {
        this.commands[commandName] = callback;
    }
}