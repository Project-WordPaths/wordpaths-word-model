import { WordModel } from "../src/word-model.js";
import Random_ from "wordpaths-common/src/Random_.js";
import Encoder_ from "wordpaths-common/src/Encoder_.js";
import Array_ from "wordpaths-common/src/Array_.js";
import fs from "fs"
import Math_ from "wordpaths-common/src/Math_.js";

console.log("Preparing model.")
const model = new WordModel(
    "fs", 
    "/home/lvjhn/Projects/wordpaths/wordpaths-word-model/data/glove-50d/preprocessed/", 
    50, 
    1234567890
)

console.log("Loading model.")
await model.load({
    onProgress(perc, message) {
        console.log(`---- Loading (${perc .toFixed(2)}) ${message}`)
    },
    onSubProgress(i, n) {
        console.log(`\t---- Loading ${i} of ${n}`)
    }
})

console.log("Normalizing vectors.") 
const random = new Random_(1234567890) 
let vectors = model.vectors 
vectors = vectors.map((x) => Math_.normalize(x))

vectors = Array_.flatten(vectors)
vectors = Encoder_.encodeFloatArrayToBytes(vectors)
 
fs.writeFileSync("./data/glove-50d/preprocessed/vectors.bin", vectors)

console.log("Done.")