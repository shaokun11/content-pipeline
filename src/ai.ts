import "dotenv/config.js"
import { GoogleGenAI } from "@google/genai";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!!;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });



export async function getEmbed(data: string[]) {
    return embedWithGemini(data)
}

async function embedWithGemini(data: string[]) {
    const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: data,
        config: {
            outputDimensionality: 768
        },
    });
    const content = response.embeddings
    if (!content || !content.values) {
        throw "Can't get the embed vector from google " + response.embeddings
    }

    return content
}
