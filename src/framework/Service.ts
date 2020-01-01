import {DefaultBot} from '../framework/DiscordBot';

export interface Service {
    initialize(bot: DefaultBot): void;
}