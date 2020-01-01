export interface AdaptiveStream { 
    itag: number,
    mimeType: string,
    url: string,
    bitrate: number,
    contentLength: number,
    cipher: string,
    audioSampleRate: number,
    audioChannels: number
}