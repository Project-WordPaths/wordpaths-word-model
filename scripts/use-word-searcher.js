import { WordModel } from "../src/word-model.js";
import { WordSearcher } from "../src/word-searcher.js";
import Math_ from "wordpaths-common/src/Math_.js";
import Array_ from "wordpaths-common/src/Array_.js";

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

console.log("Preparing word searcher.")
const wordSearcher = new WordSearcher(model) 

const words = "airplane,guns,soldiers,commander,tanks,ranks".split(",")

const closestCentroid = wordSearcher.relevantTo(
    words, 
    10, 
    { method: "approx", minProbes: 64 }
)


function displayResults(results) {
    const items = results.items 
    let i = 0
    for(let item of items) {
        console.log(
            `${i}. ${item.word} - `  +
            `${item.relevance ? item.relevance : item.distance} - ` +
            `${item.distances?.join(',')}`
        )
        i += 1
    }
}

console.log("Closest to Centroid")
console.log("--- Time :", closestCentroid.time)
displayResults(closestCentroid)

console.log(wordSearcher.relevanceScore("technology", ["computer", "airport"]))


console.log("Done.")