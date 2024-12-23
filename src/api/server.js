/** 
 * Serves word model over HTTP. 
 */
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { Puzzles } from "../wordpaths-puzzles.js"
import { Solvers } from "../wordpaths-solvers.js"

export class WordModelServer 
{
    constructor(model, searcher) {
        this.app = express()
        this.app.use(cors())
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: false }))

        this.model = model
        this.searcher = searcher
        this.buildRoutes()
    }


    buildRoutes() {
        const self = this
        const app = this.app 

        app.get("/", (req, res) => {
            res.send("Hello, from wm-server!")
        })

        app.use("/model",    this.buildModelRouter())
        app.use("/searcher", this.buildModelSearcher())
        app.use("/puzzles",  this.buildPuzzles())
        app.use("/solvers",  this.buildSolvers())

    }

    buildModelRouter() {
        const app = this.app 
        const self = this;

        const modelRouter = express.Router() 

        modelRouter.get("/prop/:name", (req, res) => {
            const prop = self.model[req.params.name].toString()
            res.send(prop)
        })

        modelRouter.get("/pca-vector/:word", (req, res) => {
            const vector = self.model.pcaVector(req.params.word)
            res.send(vector)
        })

        modelRouter.get("/vector/:index", (req, res) => {
            const vector = self.model.vector(parseInt(req.params.index))
            res.send(vector)
        })

        modelRouter.get("/word/:index", (req, res) => {
            const word = self.model.word(parseInt(req.params.index))
            res.send(word)
        })

        modelRouter.get("/index-of-word/:word", (req, res) => {
            const index = self.model.indexOfWord(req.params.word)
            res.send(index.toString())
        })

        modelRouter.get("/vector-of-word/:word", (req, res) => {
            const vector = self.model.vectorOfWord(req.params.word)
            res.send(vector)
        })

        modelRouter.get("/word-distance/:wordA/:wordB", (req, res) => {
            const distance = self.model.wordDistance(
                req.params.wordA,
                req.params.wordB
            )
            res.send(distance.toString())
        })

        modelRouter.get("/normalized-distance/:wordA/:wordB", (req, res) => {
            const distance = self.model.normalizedDistance(
                req.params.wordA,
                req.params.wordB
            )
            res.send(distance.toString())
        })

        modelRouter.get("/similarity-score/:wordA/:wordB", (req, res) => {
            const score = self.model.similarityScore(
                req.params.wordA,
                req.params.wordB
            )
            res.send(score.toString())
        })


        modelRouter.get("/normalized-similarity-score/:wordA/:wordB", (req, res) => {
            const score = self.model.normalizedSimilarityScore(
                req.params.wordA,
                req.params.wordB
            )
            res.send(score.toString())
        })

        modelRouter.get("/centroid-of-words/:words", (req, res) => {
            const centroid = self.model.centroidOfWords(
                req.params.words.split(",")
            )
            res.send(centroid)
        })

        modelRouter.post("/vector-distance", (req, res) => {
            const distance = self.model.vectorDistance(
                req.body.vectorA, 
                req.body.vectorB
            )
            res.send(distance.toString())
        })

        modelRouter.get("/random-word/:group", (req, res) => {
            const word = self.model.randomWord(req.params.group)
            res.send(word)
        })

        modelRouter.get("/random-words/:count/:group", (req, res) => {
            const word = self.model.randomWords(
                req.params.count, 
                req.params.group
            )
            res.send(word)
        })

        modelRouter.get("/sample-words/:wordCount/:sampleCount/:group", (req, res) => {
            const words = self.model.sampleWords(
                req.params.wordCount, 
                req.params.sampleCount, 
                req.params.group
            )
            res.send(words)
        })

        modelRouter.get("/cefr-level-of/:word", (req, res) => {
            const level = self.model.cefrLevelOf(
                req.params.word
            )
            res.send(level)
        })

        modelRouter.get("/cefr-level-no-of/:word", (req, res) => {
            const level = self.model.cefrLevelNoOf(
                req.params.word
            )
            res.send(level.toString())
        })


        modelRouter.get("/has-word/:word", (req, res) => {
            const hasWord = self.model.hasWord(
                req.params.word
            )
            res.send(hasWord.toString())
        })

        return modelRouter
    }

    buildModelSearcher() {
        const searcher = this.searcher 
        const self = this;

        const searcherRouter = express.Router() 
     
        searcherRouter.post("/similar-to", (req, res) => {
            const wordVector = req.body.wordVector 
            const k = req.body.k 
            const method = req.body.method 
            const minProbes = req.body.minProbes
            const result = searcher.similarTo(
                wordVector, 
                k, 
                {
                    method, 
                    minProbes
                }
            )
            res.send(result)
        })


        searcherRouter.post("/relevant-to", (req, res) => {
            const words = req.body.words 
            const k = req.body.k 
            const method = req.body.method 
            const minProbes = req.body.minProbes
            const result = searcher.similarTo(
                words, 
                k, 
                {
                    method, 
                    minProbes
                }
            )
            res.send(result)
        })

        searcherRouter.post("/relevance-score", (req, res) => {
            const word = req.body.word
            const keyWords = req.body.keyWords
            const result = searcher.relevanceScore(word, keyWords)
            res.send(result.toString())
        })

        searcherRouter.post("/normalized-relevance-score", (req, res) => {
            const word = req.body.word
            const keyWords = req.body.keyWords
            const result = searcher.normalizedRelevanceScore(word, keyWords)
            res.send(result.toString())
        })


        searcherRouter.post("/similarity-scores", (req, res) => {
            const word = req.body.word
            const keyWords = req.body.keyWords
            const result = searcher.similarityScores(word, keyWords)
            res.send(result)
        })

        searcherRouter.post("/max-relevance-score", (req, res) => {
            const keyWords = req.body.keyWords
            const minProbes = req.body.minProbes ?? 128 
            const method = req.body.method ?? "approx"
            const result = searcher.maxRelevanceScore(keyWords, {
                method: method, 
                minProbes: minProbes
            })
            res.send(result.toString())
        })

        searcherRouter.post("/most-relevant-word", (req, res) => {
            const keyWords = req.body.keyWords
            const minProbes = req.body.minProbes ?? 128 
            const method = req.body.method ?? "approx"
            const result = searcher.mostRelevantWord(keyWords, {
                method: method, 
                minProbes: minProbes
            })
            res.send(result)
        })


        searcherRouter.post("/most-relevant-words", (req, res) => {
            const keyWords = req.body.keyWords
            const k = req.body.k
            const minProbes = req.body.minProbes ?? 128 
            const method = req.body.method ?? "approx"
            const result = searcher.mostRelevantWords(keyWords, k, {
                method: method, 
                minProbes: minProbes
            })
            res.send(result)
        })
      
        return searcherRouter
    }

    buildPuzzles() {
        const self = this;
        const puzzlesRouter = express.Router()
        
        puzzlesRouter.post("/unthemed", (req, res) => {
            const model = self.model 
            const searcher = self.searcher 
            const constrained = req.body.constrained
            const source = req.body.source 
            const target = req.body.target 
            const inputs = req.body.inputs
            const results = Puzzles.unthemed({
                model: self.model, 
                searcher: self.searcher,
                constrained: constrained, 
                source: source,
                target: target,
                inputs: inputs
            }) 
            res.send(results)
        })

        puzzlesRouter.post("/themed", (req, res) => {
            const model = self.model 
            const searcher = self.searcher 
            const constrained = req.body.constrained
            const source = req.body.source 
            const target = req.body.target 
            const inputs = req.body.inputs
            const themes = req.body.themes
            const results = Puzzles.themed({
                model: self.model, 
                searcher: self.searcher,
                constrained: constrained, 
                source: source,
                target: target,
                themes: themes, 
                inputs: inputs
            }) 
            res.send(results)
        })

        return puzzlesRouter
    }

    buildSolvers() {
        const self = this 
        const solversRouter = express.Router() 

        solversRouter.post("/solve", (req, res) => {
            const model = self.model 
            const searcher = self.searcher 
            const constrained = req.body.constrained
            const source = req.body.source 
            const target = req.body.target 
            const themes = req.body.themes
            const themeMode = req.body.themeMode
            const seed = req.body.seed
            const solver = req.body.solver
            const walkCount = req.body.walkCount
            const results = Solvers[solver]({
                model: self.model, 
                searcher: self.searcher,
                constrained: constrained, 
                source: source,
                target: target,
                themes: themes, 
                themeMode: themeMode,
                seed: seed,
                walkCount: walkCount
            }) 
            res.send(results)
        })

        return solversRouter
    }

    run(callback) {
        callback(this.app)
    }
}