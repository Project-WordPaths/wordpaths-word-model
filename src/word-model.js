import Chance from "chance"
import ProgressItems_ from "wordpaths-common/src/ProgressItems_.js"
import FSLoader from "./loaders/FSLoader.js"
import HttpLoader from "./loaders/HttpLoader.js"
import Math_ from "wordpaths-common/src/Math_.js"

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
            cefrMap       : this.source + "/cefr-map.json", 
            cefrGroups    : this.source + "/cefr-groups.json",
            closest1      : this.source + "/closest-1.bin",
            closest10     : this.source + "/closest-10.bin",
            closest100    : this.source + "/closest-100.bin",
            closest1000   : this.source + "/closest-100.bin",
        }
        

        // --- model variables 
        this.vocabulary  = null 
        this.wordIndex   = null
        this.vectors     = null
        this.closest1    = null 
        this.closest10   = null 
        this.closest100  = null 
        this.closest1000 = null
        this.cefrMap     = null 
        this.cefrGroups  = null
    }

    async load({ onProgress = null, onSubProgress = null } = {}) {
        const self = this 

        // --- set up loader 
        await this.setupLoader()

        // --- set up tasks 
        const tasks = new ProgressItems_()
        
        tasks.add("load.vocabulary", async () => {
            await this.loader.loadVocabulary(self)
        })

        tasks.add("load.word-index", async () => {
            await this.loader.loadWordIndex(self)
        })

        tasks.add("load.cefr-map", async () => {
            await this.loader.loadCefrMap(self)
        })

        tasks.add("load.cefr-groups", async () => {
            await this.loader.loadCefrGroups(self)
        })

    
        tasks.add("load.closest-1", async () => {
            await this.loader.loadClosest1(self)
        })

        tasks.add("load.closest-10", async () => {
            await this.loader.loadClosest10(self)
        })

        tasks.add("load.closest-100", async () => {
            await this.loader.loadClosest100(self)
        })

        tasks.add("load.closest-1000", async () => {
            await this.loader.loadClosest1000(self)
        })

        tasks.add("load.vectors", async () => {
            await this.loader.loadVectors(self, onSubProgress)
        })

        // --- run tasks 
        await tasks.run({ onProgress, onSubProgress })
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

    distance(wordA, wordB) {
        return Math_.adjustedCosineDistance(
            this.vectorOfWord(wordA), 
            this.vectorOfWord(wordB)
        )
    }

    normalizedDistance(wordA, wordB) {
        const closestIndex = this.closest1[this.indexOfWord(wordA)]
        const min          = this.distance(wordA, this.word(closestIndex)) 
        const max          = 1 
        const distance     = this.distance(wordA, wordB) 
        const normalized   = (distance - min) / (max - min)
        console.log(distance, min, max)
        return Math.min(1, Math.max(normalized, 0))
    }
}