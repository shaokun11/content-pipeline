import { dbService } from "./db_services.js";
import { getEmbed } from "./ai.js";
import { localStore } from "./local_kv.js";
const header: Record<string, any> = {
}
if (process.env.REDDIT_COOKIE) {
    header["cookie"] = process.env.REDDIT_COOKIE
}
interface RedditListing {
    after: string | null;
    befor: string | null;
    children: {
        kind: string;
        data: any;
    }[];
}
function parseRedditListing(json: RedditListing) {
    return {
        after: json.after,
        items: json.children
            .map(c => c.data),
    };
}
function buildRedditContent(post: any): string {
    if (post.is_self && post.selftext) {
        return `${post.title}
           ${post.selftext}`;
    }
    return post.title;
}

async function ingest() {
    const k = "reddit_after"
    let url = "https://www.reddit.com/r/all/new.json?limit=100"
    const localAfter = await localStore.get(k)
    if (localAfter) {
        url = url + "&after=" + localAfter.slice(3)
    }
    const res = await fetch(url, {
        "headers": header,
        "method": "GET"
    }).then(res => res.json());

    const { items, after } = parseRedditListing(res.data);
    if (items.length === 0) return
    // make sure save database id and create time is the same
    items.reverse()
    const contents = items.map(it => buildRedditContent(it))
    const vectors = await getEmbed(contents)
    const data = items.map((it, i) => {
        return {
            vector: vectors[i]!!.values!!,
            data: it,
            source: "reddit"
        }
    })
    await dbService.insert(data)
    if (after) {
        await localStore.set("reddit_after", after)
    }
    console.log("insert reddit count is ", + items.length, "id is " + after)

}


export function startRedditService() {
    let isRunning = false;
    setInterval(() => {
        if (isRunning) return
        isRunning = true
        ingest().then(() => {
        }).catch(err => {
            console.warn("ingest reddit failed ", err)
        }).finally(() => {
            isRunning = false
        })
    }, 1000 * 10);
}





