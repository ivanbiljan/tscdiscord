import { AdaptiveStream } from "./AdaptiveStream";

export interface YoutubeVideo {
    thumbnail: string;
    encrypted_id: string;
    author: string;
    title: string;
    description: string;
    views: string;
    dateAdded: string;
    likeCount: number;
    dislikeCount: number;
    audioStreams: Array<AdaptiveStream>;
}