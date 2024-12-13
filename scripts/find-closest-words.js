import fs from "fs"
import { makeDirectory } from "wordpaths-common/src/Common_.js" 
import Encoder_ from "wordpaths-common/src/Encoder_.js"
import Array_ from "wordpaths-common/src/Array_.js"
import Annoy from "annoy"

function normalize(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
}

console.log("CLOSEST WORDS FINDER")
console.log("========================================================")

const MODEL_FOLDER    = "./data/glove-50d/preprocessed"
const OUTPUT_FOLDER   = "./data/glove-50d/preprocessed"

const VOCABULARY_FILE       = MODEL_FOLDER + "/vocabulary.txt"
const VECTORS_FILE          = MODEL_FOLDER + "/vectors.bin"
const CEFR_DATA_FILE        = "./data/cefr/cefr-data.json"
const STOP_WORDS_FILE       = "./data/stopwords/stopwords.txt"

// --- load vectors 
console.log("Loading vectors.")
let vectorBytes      = fs.readFileSync(VECTORS_FILE)
let vectors          = Encoder_.decodeFloatArrayFromBytes(vectorBytes)
vectors              = Array_.partition(vectors, 50)
console.log(`\tVectors: (${vectors.length}, ${vectors[0].length})`) 

// --- prepare indexer 
console.log("Preparing indexer.")
const indexer = new Annoy(500, 'Euclidean')
for(let i = 0; i < vectors.length; i++) {
    console.log(`---- Adding item ${i} of ${vectors.length}.`)
    const vector = vectors[i]
    indexer.addItem(i, normalize(vector))
}

// --- build indexer 
console.log("Building indexer.")
indexer.build()

// --- query indexer
console.log("Finding closest top 1, 10, 100, and 1000 words for all items.")
const top1    = []
const top10   = []
const top100  = []
const top1000 = []

for(let i = 0; i < vectors.length; i++) {
    console.log(`---- Finding closest items ${i + 1} of ${vectors.length}`)
    let results 

    results = indexer.getNNsByVector(vectors[i], 1001).slice(1)

    let closest = null
    let j = 0
    
    while(results[j] == i) {
        console.log("--- INCR")
        j += 1
    }

    closest = results[j]

    top1.push(closest)
    top10.push(results[9])
    top100.push(results[99])
    top1000.push(results[999])
}

// --- saving data files
console.log("Saving to files.")
let names = [1, 10, 100, 1000]
let i = 0
for(let items of [top1, top10, top100, top1000]) { 
    console.log("---- Processing for top " + names[i])
    const bytes = Encoder_.encodeIntArrayToBytes(items)
    fs.writeFileSync(OUTPUT_FOLDER + "/closest-" + names[i] + ".bin", bytes)
    i += 1
}
