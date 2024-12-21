import { WordModel } from "../src/word-model.js";
import Random_ from "wordpaths-common/src/Random_.js";
import Encoder_ from "wordpaths-common/src/Encoder_.js";
import Array_ from "wordpaths-common/src/Array_.js";
import fs from "fs"

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

console.log("Find rearranged order.") 
const random = new Random_(1234567890) 
const indices = new Array(model.vectors.length).fill(null).map((x, i) => i)
const order = random.sample(indices, Infinity)

const reorderVocabulary = new Array(model.vectors.length).fill(null)
const reorderVectors    = new Array(model.vectors.length).fill(null)
const wordIndex         = {}

for(let i = 0; i < indices.length; i++) {
    reorderVocabulary[i] = model.vocabulary[order[i]]
    reorderVectors[i] = model.vectors[order[i]]
    wordIndex[reorderVocabulary[i]] = i
}

let reorderVectorsFlat = Array_.flatten(reorderVectors)
let reorderVectorsBytes = Encoder_.encodeFloatArrayToBytes(reorderVectorsFlat)

fs.writeFileSync("./data/glove-50d/preprocessed/vocabulary.txt", reorderVocabulary.join("\n"))
fs.writeFileSync("./data/glove-50d/preprocessed/vectors.bin", reorderVectorsBytes)
fs.writeFileSync("./data/glove-50d/preprocessed/word-index.json", JSON.stringify(wordIndex))


console.log("Done.")