import { setTimeout } from "node:timers/promises";
import { dbService } from "./db_services.js";
import { normalizeRedditPost } from "./normalize.js";
import { parseRedditListing } from "./sources/reddit.js";
import { getEmbed } from "./ai.js";
import { localStore } from "./local_kv.js";
const header: Record<string, any> = {
}
if (process.env.REDDIT_COOKIE) {
    header["cookie"] = process.env.REDDIT_COOKIE
}

async function ingestReddit() {
    const k = "reddit_after"
    let url = "https://www.reddit.com/r/all/new.json?limit=10"
    const localAfter = await localStore.get(k)
    if (localAfter) {
        url = url + "&after=" + localAfter.slice(3)
    }
    const res = await fetch(url, {
        "headers": header,
        "method": "GET"
    }).then(res => res.json());

    const { items, after } = parseRedditListing(res.data);
    let all = []
    for (const post of items) {
        const doc = normalizeRedditPost(post);
        const vector = await getEmbed([doc.content])
        all.push({
            data: doc,
            vector
        })
        await setTimeout(10)
    }
    await dbService.insert(all)
    if (after) {
        await localStore.set("reddit_after", after)
    }
    console.log("insert reddit count is ", + all.length)

}

export function startRedditService() {
    let isRunnier = false;
    // setInterval(() => {
    if (isRunnier) return
    isRunnier = true
    ingestReddit().then(() => {
    }).catch(err => {
        console.warn("ingest reddit failed ", err)
    }).finally(() => {
        isRunnier = false
    })
    // }, 1000 * 10);
}





