export interface GraphqlData {
    user: InstagramUser;
}

export interface ResponseJson {
    graphql: GraphqlData;
}

export interface InstagramUser {
    biography: string;
    full_name: string;
    username: string;
    edge_owner_to_timeline_media: TimelineMedia;
}

export interface TimelineMedia {
    count: number;
    edges: Edge[];
}

export interface Edge {
    node: Node;
}

export interface EdgeMediaToCaption {
    edges: Edge[];
}

export interface Node {
    __typename: string;
    text: string;
    edge_media_to_caption: EdgeMediaToCaption;
    display_url: string;
}