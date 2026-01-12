import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getEmbed } from './ai.js';
import { dbService } from './db_services.js';
import { startRedditService } from "./ingest.js";
import { serve } from '@hono/node-server';
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
            query: text,
            results: results,
        });
    } catch (error: any) {
        console.error('Query error:', error);
        return c.json({
            error: 'Internal server error',
            message: error.message
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
