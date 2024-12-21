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
        const nextWord    = items[i + 1] 
        const themeWord   = themes[i - 1]
        const score       = wordSearcher.normalizedRelevanceScore(currentWord, [
            themeWord,
            prevWord,
            nextWord
        ])
        scores.push(score)
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

function walk(sourceWord, targetWord, themes, seed) {
    const items = [sourceWord, ...new Array(themes.length).fill(null), targetWord]

  
    items[1] = seed

    // --- make middle  words
    for(let i = 2; i < items.length - 2; i++) {
        const prevWord  = items[i - 1]
        const themeWord = themes[i - 2] 
         
        // --- predict current word
        const keyWords = [themeWord, prevWord, items[i - 2]] 
        const currentWord = wordSearcher.mostRelevantWord(
            keyWords, 
            {
                method: "approx",
                minProbes: 128
            }
        )

        items[i] = currentWord
    }

    // --- make last word 
    const lastWord = wordSearcher.mostRelevantWord(
        [targetWord, themes.at(-1), items.at(-3)], {
            method: "approx",
            minProbes: 128
        }
    )
    items[items.length - 2] = lastWord

    // --- fixt second to last word 
    const secondToLastWord = wordSearcher.mostRelevantWord(
        [items.at(-2), themes.at(-2), items.at(-4)], {
            method: "approx",
            minProbes: 128
        }
    )
    items[items.length - 2] = lastWord
    return items.slice(1, -1)
}

const sourceWord = "picnic" 
const targetWord = "aircraft" 
const themes = new Array(20).fill("water")

const inputs = walk(sourceWord, targetWord, themes)
// const inputs = ["picnics", "picnicking", "barbecue", "barbecues", "burger"]

const results = puzzle(sourceWord, targetWord, inputs, themes) 

console.log(inputs) 
console.log(results)

console.log("Done.")