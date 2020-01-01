import { Service } from "../framework/Service";
import { Message } from "discord.js";
import { Reminder } from "./Reminder";
import { RedisClient } from "redis";
import { DefaultBot } from "../framework/DiscordBot";

export default class ReminderService implements Service {
    private reminders: Reminder[] = [];

    initialize(bot: import("../framework/DiscordBot").DefaultBot): void {
        bot.redisLoad<Reminder[]>('reminders', (err, res) => {
            this.reminders = res;
            if (!this.reminders) {
                this.reminders = [];
                bot.redisSave('reminders', this.reminders);
            }
        });

        setTimeout(() => this.remind(bot), 1 * 60 * 1000);

        bot.registerCommand(/remind\s+?(?:me)?\s+?to\s*(.*?)\s+?in\s+?(\d+)\s*?(m|h)/g, (msg: Message, args: RegExpExecArray) => {
            const reminder = args[1];
            const time = +args[2];
            const hourOrMinutes = args[3];

            const date = new Date();
            switch (hourOrMinutes) {
                case 'm':
                    date.setMinutes(date.getMinutes() + time);
                    break;
                case 'h':
                    date.setHours(date.getHours() + time);
                    break;
            }

            this.reminders.push({userId: msg.member.user.id, reminder: reminder, timeOfNotice: date});
            bot.redisSave('reminders', this.reminders);
            msg.channel.send(`Reminder set for '${date.toUTCString()}'`);
        });
    }

    private async remind(bot: DefaultBot): Promise<void> {
        const usedReminders = [];
        const time = new Date();
        for (let i = 0; i < this.reminders.length; ++i) {
            const reminder = this.reminders[i];
            if (time <= reminder.timeOfNotice) {
                continue;
            }

            usedReminders.push(i);
            const user = await bot.client.fetchUser(reminder.userId);
            user.send(`I am reminding you to '${reminder.reminder}'`);
        }

        for (let i = 0; i < usedReminders.length; ++i) {
            this.reminders.splice(usedReminders[i], 1);
        }

        bot.redisSave('reminders', this.reminders);
        setTimeout(() => this.remind(bot), 30000);
    }
}