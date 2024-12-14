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
            vectorsPCA    : this.source + "/vectors.pca2d.bin",
            cefrMap       : this.source + "/cefr-map.json", 
            cefrGroups    : this.source + "/cefr-groups.json",
            closest       : this.source + "/closest.bin"
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

        tasks.add("load.closest", async () => {
            await this.loader.loadClosest(self)
        })

        tasks.add("load.vectors", async () => {
            await this.loader.loadVectors(self, onSubProgress)
        })

        tasks.add("load.vectors-pca", async () => {
            await this.loader.loadVectorsPCA(self, onSubProgress)
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

    wordDistance(wordA, wordB) {
        return this.vectorDistance(
            this.vectorOfWord(wordA), 
            this.vectorOfWord(wordB)
        )
    }

    normalizedDistance(wordA, wordB) {
        const closestIndex  = this.closest[this.indexOfWord(wordA)]
        const farthestIndex = this.farthest[this.indexOfWord(wordA)]
        const min          = this.wordDistance(wordA, this.word(closestIndex)) 
        const max          = this.wordDistance(wordA, this.word(farthestIndex))
        const distance     = this.wordDistance(wordA, wordB) 
        const normalized   = (distance - min) / (max - min)
        return Math.min(1, Math.max(normalized, 0))
    }

    centroidOfWords(words) {
        return Math_.centroid(words.map(word => this.vectorOfWord(word)))
    }

    vectorDistance(vectorA, vectorB) {
        return Math_.adjustedCosineDistance(vectorA, vectorB)
    }

    randomWord(group = "all") {
        if(group == "all") {
            return this.random.pickone(this.vocabulary)
        }
        else {
            const groupWords = Object.keys(this.cefrGroups[group])
            return this.random.pickone(groupWords)
        }
    }

    cefrLevelOf(word) {
        return this.cefrMap[word]
    }

    cefrLevelNoOf(word) {
        return this.cefrLevelNo[this.cefrLevelOf(word)]
    }
}