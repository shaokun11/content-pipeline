export type SourceType = "reddit" | "hn" | "twitter" | "rss";

export interface NormalizedDocument {
    source: SourceType;

    source_id: string;         // 原始平台 ID
    permalink: string;        // 原始链接

    author?: string;
    community?: string;        // subreddit / topic / channel

    title?: string;
    content: string;           // 用来 embedding 的核心文本

    created_at: Date;
}
