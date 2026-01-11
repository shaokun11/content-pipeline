import type { NormalizedDocument } from "./types.js";

export function normalizeRedditPost(post: any): NormalizedDocument {
  const id = post.id
  return {
    source: "reddit",
    source_id: id,
    permalink: post.permalink,
    author: post.author,
    community: post.subreddit,
    title: post.title,
    content: buildRedditContent(post),
    created_at: new Date(post.created_utc * 1000),
  };
}

function buildRedditContent(post: any): string {
  if (post.is_self && post.selftext) {
    return `${post.title}\n${post.selftext}`;
  }
  return post.title;
}
