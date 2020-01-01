import { Message } from "discord.js";

export interface Command {
    matchRegex: RegExp;
    helpText?: string;
    callback: (msg: Message, match: RegExpExecArray) => any;
}