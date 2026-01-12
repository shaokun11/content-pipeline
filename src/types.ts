export type SourceType = "reddit" | "hn" | "twitter" | "rss";

export interface NormalizedDocument {
    source: SourceType;
    source_id: string;         
    permalink: string;        
    author?: string;
    community?: string;        
    title?: string;
    content: string;       
    created_at: Date;
}
