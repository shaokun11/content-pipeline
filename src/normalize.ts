
export function buildRedditContent(post: any): string {
  if (post.is_self && post.selftext) {
    return `${post.title}
           ${post.selftext}`;
  }
  return post.title;
}
