import { WordModel } from "../src/word-model.js";

console.log("Preparing model.")
const model = new WordModel(
    "fs", 
    "./data/glove-50d/preprocessed/", 
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

console.log(model.normalizedDistance("picnic", "barbecues"))

console.log("Done.")