import { getEmbed } from "./ai.js";
import { dbService } from "./db_services.js";
import { startRedditService } from "./ingest.js";

startRedditService()


const text = "Ps3hen pirated games"
const v = await getEmbed([text])

dbService.query(v).then(res => {
    console.log(res)
})
