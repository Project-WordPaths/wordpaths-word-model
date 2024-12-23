import axios from "axios"
import { Puzzles } from "../wordpaths-puzzles.js" 
import { Solvers } from "../wordpaths-solvers.js"

export class NativeAPI 
{
    constructor(client) {
        this.client = client
        this.model = new ModelSubAPI(this)
        this.searcher = new SearcherSubAPI(this)
        this.puzzles = new PuzzlesSubAPI(this)
        this.solvers = new SolversSubAPI(this)
    }
}

class ModelSubAPI 
{   
    constructor(api) {
        this.api = api
    }

    async prop(name) {
        return this.api.client.model[name]
    }
   
    async pcaVector(word) {
        return this.api.client.model.pcaVector(word)
    }

    async vector(index) {
        return this.api.client.model.vector(index)
    }

    async word(index) {
        return this.api.client.model.word(index)
    }

    async indexOfWord(word) {
        return this.api.client.model.indexOfWord(word)
    }

    async vectorOfWord(word) {
        return this.api.client.model.vectorOfWord(word)
    }

    async wordDistance(wordA, wordB) {
        return this.api.client.model.wordDistance(wordA, wordB)
    }

    async normalizedDistance(wordA, wordB) {
        return this.api.client.model.normalizedDistance(wordA, wordB)
    }

    async similarityScore(wordA, wordB) {
        return this.api.client.model.similarityScore(wordA, wordB)
    }

    async normalizedSimilarityScore(wordA, wordB) {
        return this.api.client.model.normalizedSimilarityScore(wordA, wordB)
    }

    async centroidOfWords(words) {
        return this.api.client.model.centroidOfWords(words)
    }

    async vectorDistance(vectorA, vectorB) {
        return this.api.client.model.vectorDistance(vectorA, vectorB)
    }

    async randomWord(group) {
        return this.api.client.model.randomWord(group)
    }

    async randomWords(count, group) {
        return this.api.client.model.randomWords(count, group)
    }

    async sampleWords(wordCount, sampleCount, group) {
        return this.api.client.model.sampleWords(wordCount, sampleCount, group)
    }

    async cefrLevelOf(word) {
        return this.api.client.model.cefrLevelOf(word)
    }

    async cefrLevelNoOf(word) {
        return this.api.client.model.cefrLevelNoOf(word)
    }

    async hasWord(word) {
        return this.api.client.model.hasWord(word)
    }       
}

class SearcherSubAPI
{
    constructor(api) {
        this.api = api
    }

    async similarTo(vector, k, options) {
        return this.api.client.searcher.similarTo(vector, k, options)   
    }

    async relevantTo(words, k, options) {
        return this.api.client.searcher.relevantTo(words, k, options)   
    }

    async similarityScores(word, keyWords) {
        return this.api.client.searcher.similarityScores(word, keyWords)   
    }

    async maxRelevanceScore(keyWords, options) {
        return this.api.client.searcher.maxRelevanceScore(keyWords, options)   
    }

    async mostRelevantWord(keyWords, options) {
        return this.api.client.searcher.mostRelevantWord(keyWords, options)   
    }

    async mostRelevantWords(keyWords, k, options) {
        return this.api.client.searcher.mostRelevantWords(keyWords, k, options)   
    }
}

class PuzzlesSubAPI 
{
    constructor(api) {
        this.api = api
    }

    async unthemed({
        constrained = false,
        source = null, 
        target = null, 
        inputs = null
    } = {}) {
        return Puzzles.unthemed({
            model: this.api.client.model, 
            searcher: this.api.client.searcher, 
            constrained,
            source,
            target,
            inputs
        })
    }

    async themed({
        constrained = false,
        source = null, 
        target = null, 
        inputs = null,
        themes = null
    } = {}) {
        return Puzzles.themed({
            model: this.api.client.model, 
            searcher: this.api.client.searcher, 
            constrained,
            source,
            target,
            inputs,
            themes
        })
    }   
}

class SolversSubAPI 
{
    constructor(api) {
        this.api = api
    }

    async solve({
        constrained = null, 
        source = null, 
        target = null, 
        themes = [],
        themeMode = false,
        solver = null,
        seed = null,
        walkCount = null
    } = {}) {
        return Solvers[solver]({
            model: this.api.client.model, 
            searcher: this.api.client.searcher, 
            constrained,
            source,
            target,
            themes,
            themeMode,
            seed,
            walkCount
        })
    }
}