import { WordModelClient } from "../src/api/client.js"
import Random_ from "wordpaths-common/src/Random_.js" 

const random = new Random_(1234)

console.log("Load client.")
const client = new WordModelClient(
    true,
    "http://localhost:8080/", 
    {
        mode: "fs", 
        source: "./data/glove-50d/preprocessed",
        dims: 50, 
        seed: 1234567890
    }
)

await client.prepare({
    onProgress(perc, message) {
        console.log(`---- Loading (${perc .toFixed(2)}) ${message}`)
    },
    onSubProgress(i, n) {
        console.log(`\t---- Loading ${i} of ${n}`)
    }
})

console.log(
    await client.api.model.pcaVector("air")
)