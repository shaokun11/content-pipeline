import Keyv from "keyv";
import { KeyvFile } from "keyv-file";

export const localStore = new Keyv({
    store: new KeyvFile({
        filename: "./.kv_store.json"
    })
})