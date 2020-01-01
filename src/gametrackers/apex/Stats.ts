export interface StatsInfo {
    level: StatsEntry;
    kills: StatsEntry;
    season2Wins: StatsEntry;
}

export interface StatsEntry {
    rank: string;
    percentile: string;
    displayName: string;
    value: number;
}