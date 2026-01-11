export interface RedditListing {
    after: string | null;
    befor: string | null;
    children: {
        kind: string;
        data: any;
    }[];
}

export function parseRedditListing(json: RedditListing) {
    return {
        after: json.after,
        items: json.children
            .filter(c => c.kind === "t3")
            .map(c => c.data),
    };
}
