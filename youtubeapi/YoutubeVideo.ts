import { AdaptiveStream } from "./AdaptiveStream";

export interface YoutubeVideo {
    encrypted_id: string;
    author: string;
    title: string;
    viewCount: string;
    dateAdded: string;
    likeCount: number;
    dislikeCount: number;
    audioStreams: Array<AdaptiveStream>;
}