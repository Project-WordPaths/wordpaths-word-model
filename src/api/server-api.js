import axios from "axios"

export class ServerAPI 
{
    constructor(client) {
        this.client = client
        this.httpClient = axios.create({
            baseURL: this.client.serverBaseURL
        })

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
        return (await this.api.httpClient.get(
            "/model/prop/" + name
        )).data
    }

    async vector(index) {
        return (await this.api.httpClient.get(
            "/model/vector/" + index
        )).data
    }

    async pcaVector(word) {
        return (await this.api.httpClient.get(
            "/model/pca-vector/" + word
        )).data
    }

    async word(index) {
        return (await this.api.httpClient.get(
            "/model/word/" + index
        )).data
    }

    async indexOfWord(word) {
        return (await this.api.httpClient.get(
            "/model/index-of-word/" + word
        )).data
    }

    async vectorOfWord(word) {
        return (await this.api.httpClient.get(
            "/model/vector-of-word/" + word
        )).data
    }

    async wordDistance(wordA, wordB) {
        return (await this.api.httpClient.get(
            "/model/word-distance/" + wordA + "/" + wordB
        )).data
    }

    async normalizedDistance(wordA, wordB) {
        return (await this.api.httpClient.get(
            "/model/normalized-distance/" + wordA + "/" + wordB
        )).data
    }

    async similarityScore(wordA, wordB) {
        return (await this.api.httpClient.get(
            "/model/similarity-score/" + wordA + "/" + wordB)
        ).data
    }

    async normalizedSimilarityScore(wordA, wordB) {
        return (await this.api.httpClient.get(
            "/model/normalized-similarity-score/" + wordA + "/" + wordB)
        ).data
    }

    async centroidOfWords(words) {
        return (await this.api.httpClient.get(
            "/model/centroid-of-words/" + words.join(","))
        ).data
    }

    async vectorDistance(vectorA, vectorB) {
        return (await this.api.httpClient.post(
            "/model/vector-distance/", {
                vectorA,
                vectorB
            }
        )
        ).data
    }

    async randomWord(group) {
        return (await this.api.httpClient.get(
            "/model/random-word/" + group
        )).data
    }

    async randomWords(count, group) {
        return (await this.api.httpClient.get(
            "/model/random-words/" + count + "/" + group
        )).data
    }

    async sampleWords(wordCount, sampleCount, group) {
        return (await this.api.httpClient.get(
            "/model/sample-words/" + wordCount + "/" + sampleCount + "/" + group
        )).data
    }

    async cefrLevelOf(word) {
        return (await this.api.httpClient.get(
            "/model/cefr-level-of/" + word
        )).data
    }

    async cefrLevelNoOf(word) {
        return (await this.api.httpClient.get(
            "/model/cefr-level-no-of/" + word
        )).data
    }

    async hasWord(word) {
        return (await this.api.httpClient.get(
            "/model/has-word/" + word
        )).data
    }
}

class SearcherSubAPI
{
    constructor(api) {
        this.api = api
    }

    async similarTo(vector, k, options) {
        return (await this.api.httpClient.post(
            "/searcher/similar-to", {
                wordVector: vector, 
                k: k,  
                method: options.method, 
                minProbes: options.minProbes
            }   
        )).data
    }

    async relevantTo(words, k, options) {
        return (await this.api.httpClient.post(
            "/searcher/relevant-to", {
                words: words, 
                k: k,  
                method: options.method, 
                minProbes: options.minProbes
            }   
        )).data
    }

    async similarityScores(word, keyWords) {
        return (await this.api.httpClient.post(
            "/searcher/similarity-scores", {
                word: word,
                keyWords: keyWords
            }   
        )).data
    }

    async maxRelevanceScore(keyWords, options) {
        return (await this.api.httpClient.post(
            "/searcher/max-relevance-score", {
                keyWords: keyWords,
                minProbes: options.minProbes, 
                method: options.method
            }   
        )).data
    }

    async mostRelevantWord(keyWords, options) {
        return (await this.api.httpClient.post(
            "/searcher/most-relevant-word", {
                keyWords: keyWords,
                minProbes: options.minProbes, 
                method: options.method
            }   
        )).data
    }

    async mostRelevantWords(keyWords, k, options) {
        return (await this.api.httpClient.post(
            "/searcher/most-relevant-words", {
                keyWords: keyWords,
                k : k,
                minProbes: options.minProbes, 
                method: options.method
            }   
        )).data
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
        return (await this.api.httpClient.post(
            "/puzzles/unthemed", {
                constrained, 
                source,
                target,
                inputs
            }
        )).data
    }

    async themed({
        constrained = false,
        source = null, 
        target = null, 
        inputs = null,
        themes = null
    } = {}) {
        return (await this.api.httpClient.post(
            "/puzzles/themed", {
                constrained, 
                source,
                target,
                inputs,
                themes
            }
        )).data
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
        const data = {
            constrained, 
            source,
            target,
            themes,
            themeMode,
            solver,
            seed,
            walkCount
        }
        return (await this.api.httpClient.post(
            "/solvers/solve", data
        )).data
    }
}