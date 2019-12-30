import { PlatformInfo } from "./PlatformInfo";
import {UserInfo} from "./UserInfo";
import {StatsInfo} from "./Stats";

export interface StatsProfile {
    data: {
        platformInfo: PlatformInfo,
        userInfo: UserInfo,
        segments: {stats: StatsInfo}[]
    }
}