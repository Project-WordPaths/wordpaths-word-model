import { WordModelServer } from "../src/api/server.js"
import { WordModel } from "wordpaths-word-model/src/word-model.js"
import { WordSearcher } from "wordpaths-word-model/src/word-searcher.js"


// --- server setup
const MODEL_FOLDER = "./data/glove-50d/preprocessed" 
const PORT = 8080

// --- load model
console.log("--- Loading model.")
const wordModel = new WordModel(
    "fs",
    MODEL_FOLDER, 
    50, 
    (new Date().getTime())
)

await wordModel.load({
    onProgress(perc, message) {
        console.log(`---- Loading (${perc .toFixed(2)}) ${message}`)
    },
    onSubProgress(i, n) {
        console.log(`\t---- Loading ${i} of ${n}`)
    }
})

// --- loading word searcher
console.log("--- Loading word searcher")
const wordSearcher = new WordSearcher(wordModel)

// --- create server 
console.log("--- Creating server.")
const server = new WordModelServer(wordModel, wordSearcher)

// --- running server 
console.log("--- Running server.")
server.run((app) => {
    app.listen(PORT, () => {
        console.log(":: Server listening on port " + PORT)
    })
})