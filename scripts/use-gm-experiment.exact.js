import { WordModel } from "../src/word-model.js";
import { WordSearcher } from "../src/word-searcher.js";
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

console.log("Preparing word searcher.")
const wordSearcher = new WordSearcher(model) 

// --- MAIN EXPERIMENT --- //
const ATTEMPT_COUNT = 100 
const WORD_COUNT = 10
const WORD_SET = "all-with-cefr"
const CENTROID_K = 1000

console.log("Generating sample word sets.")
const samples = model.sampleWords(WORD_COUNT, ATTEMPT_COUNT, WORD_SET) 

let successfulAttempts = 0
let unsuccessfulAttempts = 0

console.log("Benchmarking.")
for(let i = 0; i < ATTEMPT_COUNT; i++) {
    const keyWords = samples[i] 
    
    console.log("--- Processing " + i + " of " + samples.length)

    // --- brute force maximum index (geometric mean) 
    let bruteForceResults = []
    for(let i = 0; i < model.vectors.length; i++) {
        const vector = model.vectors[i] 
        const word   = model.word(i) 
        const scores = []
        for(let keyWord of keyWords) {
            scores.push(model.similarityScore(word, keyWord))
        }
        const score = Math_.geometricMean(scores)
        bruteForceResults.push({
            index: i, 
            word: word, 
            score: score,
            scores: scores
        })
    }
    bruteForceResults.sort((a, b) => b.score - a.score) 

    // --- get nearest to centroid 
    const centroidResults = wordSearcher.similarTo(
        model.centroidOfWords(keyWords),
        CENTROID_K,
        {
            method: "exact"
        }
    )

    const targetResultIndex = bruteForceResults[0].index

    console.log("Brute Force :", bruteForceResults.map(x => x.index).slice(0, 10))
    console.log("From Centroid :", centroidResults.items.map(x => x.index).slice(0, 10))

    const centroidResultIds = centroidResults.items.map(x => x.index)
    if(centroidResultIds.includes(targetResultIndex)) {
        console.log(
            "----> OK: Found at index " + centroidResultIds.indexOf(targetResultIndex)
        )
        successfulAttempts += 1
    }
    else if(centroidResultIds.includes(targetResultIndex)) {
        console.log(
            "----> NOT OK: Not found."
        )
        unsuccessfulAttempts += 1
    }
    
    console.log(":: Successful Attempts :", successfulAttempts + "/" + ATTEMPT_COUNT)
    console.log(":: Unsuccessful Attempts :", unsuccessfulAttempts + "/" + ATTEMPT_COUNT)
    console.log()
}


