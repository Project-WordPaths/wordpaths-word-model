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

function puzzle(source, target, inputs, themes) {
    const items  = [source, ...inputs, target] 
    const scores = [] 
    const results = {}

    for(let i = 1; i < items.length - 1; i++) {
        const currentWord = items[i] 
        const prevWord    = items[i - 1]
        const themeWord   = themes[i - 1] 
        let subScore
        subScore    = wordSearcher.normalizedRelevanceScore(
            currentWord, [prevWord, themeWord, sourceWord, targetWord]
        )
        scores.push(subScore)
    }

    results.scores = scores
    results.averageScore = Math_.average(scores)
    results.minScore = Math.min(...scores)
    results.finalScore = Math_.geometricMean([
        results.averageScore, 
        results.minScore
    ])

    return results 
}

function walk(sourceWord, targetWord, themes) {
    const items = [sourceWord, ...new Array(themes.length).fill(null), targetWord]
    const visited = new Set([sourceWord, targetWord, ...themes])
    for(let i = 1; i < items.length - 1; i++) {
        const prevWord = items[i - 1]
        const themeWord = themes[i - 1] 
        let keyWords
        if(i < items.length - 1) {
            keyWords = [prevWord, themeWord, sourceWord, targetWord]
        }
        else {
            keyWords = [prevWord, themeWord, targetWord, sourceWord]
        }

        const mostRelevantWord = wordSearcher.mostRelevantWordSkip(
            keyWords,
            { method: "approx", minProbes: 128 },
            visited
        )

        visited.add(mostRelevantWord)
        items[i] = mostRelevantWord

    }
    return items.slice(1, -1)
}

const sourceWord = "fuel" 
const targetWord = "softdrink" 
const themes = ["computer", "notebook", "guitar", "notebook", "water"]

const inputs = walk(sourceWord, targetWord, themes)
// const inputs = ["picnics", "picnicking", "barbecue", "barbecues", "burger"]

const results = puzzle(sourceWord, targetWord, inputs, themes) 

console.log(inputs) 
console.log(results)

console.log("Done.")