import { dbService } from "./db_services.js";
import { getEmbed } from "./ai.js";
import { localStore } from "./local_kv.js";
import { setTimeout } from "node:timers/promises";
import { writeFile } from "node:fs/promises";
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

const SEEN_KEY = "reddit_seen_ids"
const MAX_SEEN = 5000

let seenIds = new Set()

async function loadSeenIds() {
    const stored = await localStore.get(SEEN_KEY)
    if (Array.isArray(stored)) {
        for (const id of stored) {
            seenIds.add(id)
        }
    }
    console.log("loaded seen ids:", seenIds.size)
}

async function ingest() {
    const url = "https://www.reddit.com/r/all/new.json?limit=100"

    const res = await fetch(url, {
        headers: header,
        method: "GET"
    }).then(res => res.json())

    const { items } = parseRedditListing(res.data)
    if (items.length === 0) {
        await setTimeout(5 * 1000)
        return
    }

    const freshItems = items.filter(it => !seenIds.has(it.id))

    if (freshItems.length === 0) {
        await setTimeout(5 * 1000)
        return
    }

    freshItems.reverse()

    const contents = freshItems.map(it => buildRedditContent(it))
    const vectors = await getEmbed(contents)

    const data = freshItems.map((it, i) => ({
        vector: vectors[i]!!.values!!,
        data: it,
        source: "reddit"
    }))
    for (let item of data) {
        try {
            await dbService.insert([item])
        } catch (e: any) {
            // Maybe there data too big for save to database, now we only skip it
            console.warn("insert data failed ", e.message)
        }
    }
    for (const it of freshItems) {
        seenIds.add(it.id)
    }
    if (seenIds.size > MAX_SEEN) {
        const trimmed = Array.from(seenIds).slice(-MAX_SEEN)
        seenIds = new Set(trimmed)
    }

    await localStore.set(SEEN_KEY, Array.from(seenIds))
    console.log(
        "insert reddit count:",
        freshItems.length,
        "latest id:",
        freshItems[freshItems.length - 1].id
    )
}



export async function startRedditService() {
    let isRunning = false;
    await loadSeenIds()
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





