import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getEmbed } from './ai.js';
import { dbService } from './db_services.js';
import { startRedditService } from "./ingest.js";
import { serve } from '@hono/node-server';
import { isNumberStr } from './math.js';
import { localStore } from './local_kv.js';
startRedditService()
const app = new Hono();

app.use('*', cors());

app.get('/health', (c) => {
    return c.json({ status: 'ok', message: 'Content Pipeline API is running' });
});

app.post('/query', async (c) => {
    try {
        const { text, } = await c.req.json();
        if (!text) {
            return c.json({ error: 'Missing required parameter: text' }, 400);
        }
        const vectors = await getEmbed([text]);
        const vec = vectors[0]?.values!!
        const results = await dbService.query(vec);
        return c.json({
            data: results,
            message: "success",
        });
    } catch (error: any) {
        console.error('dbService.query:', error);
        return c.json({
            message: "Internal server error",
            data: null
        }, 500);
    }
});

app.get('/query', async (c) => {
    try {
        let id = "0"
        let { cursor } = await c.req.queries();
        if (!cursor || !isNumberStr(cursor[0])) {
            let maxId = await localStore.get("reddit_max_id")
            if (maxId) id = (BigInt(maxId) - 10n).toString()
        } else {
            id = cursor[0]!!
        }
        const results = await dbService.getById(id);
        return c.json({
            message: "success",
            data: results,
        });
    } catch (error: any) {
        console.error('dbService.getById:', error);
        return c.json({
            message: 'Internal server error',
            data: null
        }, 500);
    }
});


const port = parseInt(process.env.PORT || '3000');
console.log(`Starting server on port ${port}`);

const server = serve(
    {
        fetch: app.fetch,
        port: 3000,
    },
    info => {
        console.log(`🚀 Server running at http://localhost:${info.port}`);
    },
);
