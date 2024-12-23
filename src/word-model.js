import Chance from "chance"
import ProgressItems_ from "wordpaths-common/src/ProgressItems_.js"
import FSLoader from "./loaders/FSLoader.js"
import HttpLoader from "./loaders/HttpLoader.js"
import Math_ from "wordpaths-common/src/Math_.js"
import Random_ from "wordpaths-common/src/Random_.js"

export class WordModel 
{
    constructor(
        mode = "file",            // "file" or "http"
        source = "",                // source path for the word model 
        dims   = 50,                // dimensions of the word model
        randomState = 1234567890    // seed used for the random generator used by the model
    ) {
        this.mode = mode 
        this.source = source 
        this.dims = dims 
        this.randomState = randomState
        this.random = new Chance(this.randomState)

        // --- files 
        this.files = {
            vocabulary    : this.source + "/vocabulary.txt",
            wordIndex     : this.source + "/word-index.json", 
            vectors       : this.source + "/vectors.bin",
            vectorsPCA    : this.source + "/vectors.pca2d.bin",
            cefrMap       : this.source + "/cefr-map.json", 
            cefrGroups    : this.source + "/cefr-groups.json",
            closest       : this.source + "/closest.bin",
            index         : this.source + "/index.json"
        }
        
        // --- cefr level no 
        this.cefrLevelNo = {
            "A1" : 1, 
            "A2" : 2,
            "B1" : 3, 
            "B2" : 4, 
            "C1" : 5, 
            "C2" : 6
        }

        // --- model variables 
        this.vocabulary  = null 
        this.wordIndex   = null
        this.vectors     = null
        this.closest     = null
        this.cefrMap     = null 
        this.cefrGroups  = null
        this.vectorsPCA  = null

        // --- set up tasks 
        this.tasks = new ProgressItems_()
        const tasks = this.tasks
        const self = this
        
        tasks.add("load.vocabulary", async () => {
            await this.loader.loadVocabulary(self)
        })

        tasks.add("load.word-index", async () => {
            await this.loader.loadWordIndex(self)
        })

        tasks.add("load.cefr-map", async () => {
            await this.loader.loadCefrMap(self)
            this.wordsWithCEFR = Object.keys(this.cefrMap)
        })

        tasks.add("load.cefr-groups", async () => {
            await this.loader.loadCefrGroups(self)
        })

        tasks.add("load.closest", async () => {
            await this.loader.loadClosest(self)
        })

        tasks.add("load.vectors", async (i, n, onSubProgress) => {
            await this.loader.loadVectors(self, onSubProgress)
        })

        tasks.add("load.vectors-pca", async (i, n, onSubProgress) => {
            await this.loader.loadVectorsPCA(self, onSubProgress)
        })
  
    }

    async load({ onProgress = null, onSubProgress = null } = {}) {
        const self = this 

        // --- set up loader 
        await this.setupLoader()

        // --- run tasks 
        await this.tasks.run({ onProgress, onSubProgress })
    }

    async setupLoader() {
        if(this.mode == "fs") {
            this.loader = FSLoader
        }
        else if(this.mode == "http") {
            this.loader = HttpLoader
        }
    }

    /** === CORE FUNCTIONS === */
    
    pcaVector(word) {
        return this.vectorsPCA[this.indexOfWord(word)]
    }
    
    vector(index) {
        return this.vectors[index]
    }

    word(index) {
        return this.vocabulary[index]
    }

    indexOfWord(word) {
        return this.wordIndex[word]
    }

    vectorOfWord(word) {
        return this.vector(this.indexOfWord(word))
    }

    wordDistance(wordA, wordB) {
        return this.vectorDistance(
            this.vectorOfWord(wordA), 
            this.vectorOfWord(wordB)
        )
    }

    normalizedDistance(wordA, wordB) {
        const closestIndex  = this.closest[this.indexOfWord(wordA)]
        const min          = this.wordDistance(wordA, this.word(closestIndex)) 
        const max          = 1
        const distance     = this.wordDistance(wordA, wordB) 
        const normalized   = (distance - min) / (max - min)
        return Math.min(1, Math.max(normalized, 0))
    }

    similarityScore(wordA, wordB) {
        return Math_.similarityScore(
            this.vectorOfWord(wordA), 
            this.vectorOfWord(wordB),
            true
        )
    }

    normalizedSimilarityScore(wordA, wordB) {
        const closestIndex  = this.closest[this.indexOfWord(wordA)]
        const min           = 1 - this.similarityScore(wordA, this.word(closestIndex)) 
        const max           = 1
        const score         = 1 - this.similarityScore(wordA, wordB) 
        const normalized    = ((score - min) / (max - min))
        const clipped       = Math.min(1, Math.max(normalized, 0))
        return 1 - clipped
    }

    centroidOfWords(words) {
        return Math_.centroid(words.map(word => this.vectorOfWord(word)))
    }

    vectorDistance(vectorA, vectorB) {
        return Math_.adjustedCosineDistance(vectorA, vectorB, true)
    }

    randomWord(group = "all-with-cefr") {
        if(group == "all") {
            return this.random.pickone(this.vocabulary)
        }
        else if(group == "all-with-cefr") {
            return this.random.pickone(Object.keys(this.cefrMap))
        }
        else {
            const groupWords = Object.keys(this.cefrGroups[group])
            return this.random.pickone(groupWords)
        }
    }

    randomWords(count, group = "all") {
        if(group == "all") {
            return this.random.pickset(this.vocabulary, count)
        }
        else if(group == "all-with-cefr") {
            return this.random.pickset(Object.keys(this.cefrMap), count)
        }
        else {
            const groupWords = Object.keys(this.cefrGroups[group])
            return this.random.pickset(groupWords, count)
        }
    }

    sampleWords(wordCount, sampleCount, group = "all") {
        const samples = []
        for(let i = 0; i < sampleCount; i++) {
            samples.push(this.randomWords(wordCount, group))
        }
        return samples
    }

    cefrLevelOf(word) {
        return this.cefrMap[word]
    }

    cefrLevelNoOf(word) {
        return this.cefrLevelNo[this.cefrLevelOf(word)]
    }

    hasWord(word) {
        return word in this.wordIndex
    }
}