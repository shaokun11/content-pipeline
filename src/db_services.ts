import { DataType } from "@zilliz/milvus2-sdk-node";
import { client } from "./db/milvus.js";
import { milvus_indexs } from "./config.js";

class DbServices {
    private collection: string
    constructor(collection: string) {
        this.collection = collection
    }

    async insert(data: any) {
        const res = await client.insert({
            collection_name: this.collection,
            fields_data: data
        });
        if (res.status.code !== 0) {
            throw new Error("insert database error " + res.status.error_code)
        }
    }
    async query(vector: number[]) {
        const searchRes = await client.search({
            collection_name: this.collection,
            vectors: vector,
            vector_type: DataType.FloatVector,
            search_params: {
                anns_field: "vector",
                metric_type: "COSINE",
                params: JSON.stringify({
                    nprobe: 10
                }),
                topk: 3,
            },
            output_fields: ["data"],
        });
        return searchRes.results.map((r, i) => {
            //@ts-ignore
            return r
        });
    }
}


export const dbService = new DbServices(milvus_indexs.reddit)


