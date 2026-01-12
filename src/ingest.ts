import { dbService } from "./db_services.js";
import { normalizeRedditPost } from "./normalize.js";
import { parseRedditListing } from "./sources/reddit.js";
import { getEmbed } from "./ai.js";
import { localStore } from "./local_kv.js";
import { maxNumber } from "./math.js";
const header: Record<string, any> = {
}
if (process.env.REDDIT_COOKIE) {
    header["cookie"] = process.env.REDDIT_COOKIE
}

async function ingestReddit() {
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
    const contents = items.map(it => normalizeRedditPost(it).content)
    const vectors = await getEmbed(contents)
    const data = items.map((it, i) => {
        return {
            vector: vectors[i]!!.values!!,
            data: it
        }
    })
    const ids = await dbService.insert(data)
    if (after) {
        await localStore.set("reddit_after", after)
    }
    const maxId = maxNumber(ids)
    await localStore.set("reddit_max_id", maxId)
    console.log("insert reddit count is ", + items.length)

}

export function startRedditService() {
    let isRunnier = false;
    setInterval(() => {
        if (isRunnier) return
        isRunnier = true
        ingestReddit().then(() => {
        }).catch(err => {
            console.warn("ingest reddit failed ", err)
        }).finally(() => {
            isRunnier = false
        })
    }, 1000 * 10);
}





