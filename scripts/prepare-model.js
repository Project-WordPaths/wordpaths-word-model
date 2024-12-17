import fs from "fs"
import { makeDirectory } from "wordpaths-common/src/Common_.js" 
import Encoder_ from "wordpaths-common/src/Encoder_.js"
import Array_ from "wordpaths-common/src/Array_.js"
import Math_ from "wordpaths-common/src/Math_.js"

console.log("MODEL PREPARATION SCRIPT")
console.log("========================================================")

const MODEL_FOLDER    = "./data/glove-50d/raw"
const OUTPUT_FOLDER   = "./data/glove-50d/preprocessed"

const VOCABULARY_FILE       = MODEL_FOLDER + "/vocabulary.txt"
const VECTORS_FILE          = MODEL_FOLDER + "/vectors.bin"
const CEFR_DATA_FILE        = "./data/cefr/cefr-data.json"
const STOP_WORDS_FILE       = "./data/stopwords/stopwords.txt"

// --- make sure directory exists
console.log("Making sure directories exists.")
await makeDirectory(MODEL_FOLDER, false)
await makeDirectory(OUTPUT_FOLDER, true)

// --- loading vocabulary 
console.log("Loading vocabulary.")
const vocabulary = fs.readFileSync(VOCABULARY_FILE).toString().split("\n")
console.log(`\tDetected ${vocabulary.length} words.`)

// --- construct word index
console.log("Constructing word index.")
let originalWordIndex      = {} 
for(let i = 0; i < vocabulary.length; i++) {
    originalWordIndex[vocabulary[i]] = i
}

// --- loading stopwords 
console.log("Loading stopwords.")
const stopWords = new Set(fs.readFileSync(STOP_WORDS_FILE).toString().split("\n"))
console.log(`\tDetected ${stopWords.size} stopwords.`)

// --- load cefr data
console.log("Loading CEFR data.")
const cefrData = JSON.parse(fs.readFileSync(CEFR_DATA_FILE))

// --- filtering vocabulary 
console.log("Filtering vocabulary.") 
let punctuations = "~!@#$%^&*()_+`=[]{};':\",./<>?".split("")
let filteredVocabulary = 
    vocabulary.filter((word) => {
        for(let i of ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]) {
            if(word.includes(i)) return false
        }
        for(let i of punctuations) {
            if(word.includes(i)) return false
        }
        if(stopWords.has(word)) {
            return false
        }
        if(word.length <= 2) {
            return false
        }
        return true
    })

console.log(`\tFiltered ${filteredVocabulary.size} words.`)



// --- save filtered vocabulary 
console.log("Saving filtered vocabulary.")
fs.writeFileSync(
    OUTPUT_FOLDER + "/vocabulary.txt", 
    filteredVocabulary.join("\n")
)

// --- group words based on cefr vectors 
const cefrMap    = {} 
const cefrGroups = { 
    "A1" : {}, 
    "A2" : {}, 
    "B1" : {}, 
    "B2" : {}, 
    "C1" : {}, 
    "C2" : {}
}

let i = 0
let gathered = 0
let n = Object.keys(cefrData["map"]).length
let filteredVocabularySet = new Set([...filteredVocabulary])
for(let word in cefrData["map"]) {
    console.log(`---- Gathering CEFR data ${i} of ${n} (Gathered: ${gathered})`)
    if(filteredVocabularySet.has(word)) {
        const level = cefrData["map"][word][0]
        cefrMap[word] = level
        cefrGroups[level][word] = true
        gathered += 1
    }
    i += 1
}

// --- creonstruct word index
console.log("Reconstructing word index.")
const reconstructedWordIndex      = {} 
for(let i = 0; i < filteredVocabulary.length; i++) {
    reconstructedWordIndex[filteredVocabulary[i]] = i
}

// --- save cefr data 
console.log("Saving CEFR data.") 
console.log("---- Saving CEFR map.")
fs.writeFileSync(
    OUTPUT_FOLDER + "/cefr-map.json", 
    JSON.stringify(cefrMap, null, 4)
)
console.log('---- Saving CEFR groups.')
fs.writeFileSync(
    OUTPUT_FOLDER + "/cefr-groups.json", 
    JSON.stringify(cefrGroups, null, 4)
)

// --- load vectors 
console.log("Loading vectors.")
let vectorBytes    = fs.readFileSync(VECTORS_FILE)
let vectors          = Encoder_.decodeFloatArrayFromBytes(vectorBytes)
vectors              = Array_.partition(vectors, 50)
console.log(`\tVectors: (${vectors.length}, ${vectors[0].length})`)



// --- construct word index
console.log("Saving word index.")
fs.writeFileSync(
    OUTPUT_FOLDER + "/word-index.json", 
    JSON.stringify(reconstructedWordIndex, null, 4)
)

// --- filtering vectors
console.log("Filtering word vectors.")
const filteredVectors = []
i = 0
n = filteredVocabulary.length
for(let word of filteredVocabulary) {
    console.log(`---- Filtering vector ${i} of ${n}`)
    const normalizedVector = Math_.normalize(vectors[originalWordIndex[word]])
    filteredVectors.push(normalizedVector)
    i += 1
}

// --- saving vectors 
console.log("Saving vectors.")
const flattened = Array_.flatten(filteredVectors) 
vectorBytes = Encoder_.encodeFloatArrayToBytes(flattened) 
fs.writeFileSync(OUTPUT_FOLDER + "/vectors.bin", vectorBytes)




console.log("Done.")