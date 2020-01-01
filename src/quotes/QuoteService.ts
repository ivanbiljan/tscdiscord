import { Service } from "../framework/Service";
import { Message } from "discord.js";
import { Quote } from "./Quote";
import { isStringNullOrWhitespace, random } from "../Utils";

export default class QuoteService implements Service {
    private quotes: Quote[] = [];

    initialize(bot: import("../framework/DiscordBot").DefaultBot): void {
        bot.redisLoad<Quote[]>('quotes', (err, res) => {
            this.quotes = res;
        });

        if (!this.quotes) {
            this.quotes = [];
            bot.redisSave('quotes', this.quotes);
        }

        bot.registerCommand(/quote add (.*)/g, (msg: Message, args: RegExpExecArray) => {
            /*if (isStringNullOrWhitespace(args)) {
                msg.channel.send('Invalid quote');
                return;
            }*/

            const quote: Quote = {id: this.quotes.length + 1, content: args[1], author: msg.member.user.username};
            this.quotes.push(quote);
            bot.redisSave('quotes', this.quotes);
            msg.channel.send(`Saved quote #${this.quotes.length}`);
        });

        bot.registerCommand(/quote read (\d+)/g, (msg: Message, args: RegExpExecArray) => {
            const quote = this.quotes[(+args[1] - 1) % this.quotes.length];
            msg.channel.send(`Quote #${quote.id}: ${quote.content} - Added by ${quote.author}`);
        });

        bot.registerCommand(/quote (?:del|delete) (\d+)/g, (msg: Message, args: RegExpExecArray) => {
            const quote = this.quotes[(+args[1] - 1) % this.quotes.length];
            this.quotes.splice(this.quotes.indexOf(quote), 1);
            msg.channel.send(`Deleted quote #${+args}`);
        });

        bot.registerCommand(/quote random/g, (msg: Message) => {
            const quote = this.quotes[random(0, this.quotes.length - 1)];
            msg.channel.send(`Quote #${quote.id}: ${quote.content} - Added by ${quote.author}`);
        });
    }
}