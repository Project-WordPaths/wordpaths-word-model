import { WordModel } from "../src/word-model.js";
import { WordSearcher } from "../src/word-searcher.js";
import Math_ from "wordpaths-common/src/Math_.js";
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

console.log("Preparing word searcher.")
const wordSearcher = new WordSearcher(model) 

// --- MAIN EXPERIMENT --- //
const ATTEMPT_COUNT = 1000
const WORD_COUNT = 10
const WORD_SET = "all"
const CENTROID_K = 1000

console.log("Generating sample word sets.")
const samples = model.sampleWords(WORD_COUNT, ATTEMPT_COUNT, WORD_SET) 

let successfulAttempts = 0
let unsuccessfulAttempts = 0
let errors = []

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
            method    : "approx", 
            minProbes : 128
        }
    )

    const targetResultIndex = bruteForceResults[0].index
    const targetResultWord = model.word(targetResultIndex)
    const centroidResultIds = centroidResults.items.map(x => x.index)

    // --- compute error
    let maxIndex = 0
    let approxScore = 0
    for(let i = 0; i < centroidResults.items.length; i++) {
        const word = model.word(centroidResults.items[i].index) 
        const scores = wordSearcher.similarityScores(word, keyWords)
        const score = Math_.geometricMean(scores)
        if(score > approxScore) {
            approxScore = score
            maxIndex = maxIndex
        }
    }
    let actualScore = bruteForceResults[0].score
    let error = Math.abs(actualScore - approxScore)
    if(error > 0) {
        errors.push(error)
    }

    console.log("Brute Force :", bruteForceResults.map(x => x.index).slice(0, 10))
    console.log("From Centroid :", centroidResults.items.map(x => x.index).slice(0, 10))

    if(centroidResultIds.includes(targetResultIndex)) {
        console.log(
            "----> OK: Found at index " + centroidResultIds.indexOf(targetResultIndex)
        )
        successfulAttempts += 1
    }
    else if(!centroidResultIds.includes(targetResultIndex)) {
        console.log(
            "----> NOT OK: Not found."
        )
        unsuccessfulAttempts += 1
    }
    console.log(":: Approx. Time :", centroidResults.time)
    console.log(":: Actual Score :", actualScore)
    console.log(":: Approx. Score :", approxScore)
    console.log(":: Error :", error)
    console.log(":: Average Error :", Math_.average(errors))
    console.log(":: Successful Attempts :", successfulAttempts + "/" + ATTEMPT_COUNT)
    console.log(":: Unsuccessful Attempts :", unsuccessfulAttempts + "/" + ATTEMPT_COUNT)
    console.log()
}

fs.writeFileSync("./reports/errors.json", JSON.stringify(errors))

