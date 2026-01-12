import { DataType, MilvusClient } from "@zilliz/milvus2-sdk-node";
import { milvus_indexs } from "../config.js";
export const client = new MilvusClient({
    address: "localhost:19530",
});

async function initCollection(collection: string, dim = 768) {
    const has = await client.hasCollection({ collection_name: collection });
    if (!has.value) {
        const createRes = await client.createCollection({
            collection_name: collection,
            fields: [
                {
                    name: "id",
                    data_type: DataType.Int64,
                    is_primary_key: true,
                    autoID: true,
                },
                {
                    name: "vector",
                    data_type: DataType.FloatVector,
                    type_params: { dim: dim.toString() },
                },
                {
                    name: "data",
                    data_type: DataType.JSON,
                },
            ],
        });
        if (createRes.code !== 0) {
            throw "create milvus db error " + createRes.error_code
        }
        console.log('create %s collection success', collection)
        await client.createIndex({
            collection_name: collection,
            field_name: "vector",
        });
        await client.loadCollectionAsync({
            collection_name: collection
        })
    }

}

initCollection(milvus_indexs.reddit)


