import BruteForceNNS from "wordpaths-ivfflat/src/brute-force.js"
import IVFFlat from "wordpaths-ivfflat/src/ivf-flat.js"
import Math_ from "wordpaths-common/src/Math_.js"
import Benchmark_ from "wordpaths-common/src/Benchmark_.js"
import fetch from "sync-fetch"

export class WordSearcher 
{
    constructor(wordModel) {
        this.wordModel = wordModel
        this.searchers = {}
        this.prepareSearchers() 
     
    }
    
    prepareSearchers() {
        // --- brute force searcher
        this.searchers.exact = new BruteForceNNS({
            measureFn: Math_.adjustedCosineDistance
        })
        this.searchers.exact.setPoints(this.wordModel.vectors)

        // --- approximate searcher 
        this.searchers.approx = new IVFFlat({
            clusterCount : 5000,
            measureFn    : Math_.adjustedCosineDistance,
            randomState  : 1234567890
        })
        this.searchers.approx.setPoints(this.wordModel.vectors) 
        try {
            this.searchers.approx.load(this.wordModel.files.index)
        }
        catch (e) {
            this.searchers.approx.loadJSON(
                fetch(this.wordModel.files.index).json()
            )
        }
    }

    similarTo(wordVector, k, { method = "exact", minProbes = 128 } = {}) {
        const benchmarker = new Benchmark_()
        benchmarker.start("-")
        const index = this.searchers[method]
        const nearest = index.nearest(wordVector, k, minProbes)
        for(let i = 0; i < nearest.items.length; i++) {
            const item = nearest.items[i] 
            const index = item[0]
            const distance = item[1] 
            const word = this.wordModel.vocabulary[index]
            nearest.items[i] = {
                word  : word, 
                index : index, 
                similarity : 1 - distance
            }
        }
        benchmarker.end("-")
        nearest.time = benchmarker.duration("-")
        return nearest
    }

    relevantTo(words, k, options) {
        if(options.method == "exact") {
            return this.findExactMultiRelevant(words, k)
        }
        else if(options.method == "approx") {
            return this.findApproxMultiRelevant(words, k, options)
        }
        else {
            throw new Error("Unknown method :" + method)
        }
    }
    
    findExactMultiRelevant(keyWords, k) {
        const benchmarker = new Benchmark_()
        benchmarker.start("-")
        const similarTo = this.similarTo(
            this.wordModel.centroidOfWords(keyWords),
            k + keyWords.length, 
            { method: "exact" }
        )
        const keyWordSet = new Set([...keyWords])
        
        similarTo.items = similarTo.items.filter((item) => !keyWordSet.has(item.word))
        similarTo.items = similarTo.items.slice(0, k)

        const results =  {
            items: similarTo.items,
            time: benchmarker.duration("-")
        }

        return results
    }

    findApproxMultiRelevant(
        keyWords, 
        k, 
        { 
            minProbes = 16 
        } = {}
    ) {
        const benchmarker = new Benchmark_()
        benchmarker.start("-")
        const similarTo = this.similarTo(
            this.wordModel.centroidOfWords(keyWords),
            k + keyWords.length, 
            { method: "approx", minProbes: minProbes }
        )
        const keyWordSet = new Set([...keyWords])
        
        similarTo.items = similarTo.items.filter((item) => !keyWordSet.has(item.word))
        similarTo.items = similarTo.items.slice(0, k)
     
        similarTo.items.forEach((x) => {
            x.relevance = x.similarity 
            delete x.similarity
        })
     

        benchmarker.end("-")

        const results =  {
            items: similarTo.items,
            time: benchmarker.duration("-")
        }

        return results
    }

    relevanceScore(word, keyWords) {
        const relevance = 1 - Math_.adjustedCosineDistance(
            this.wordModel.centroidOfWords(keyWords),
            this.wordModel.vectorOfWord(word)
        )
        return relevance
    }

    normalizedRelevanceScore(word, keyWords) {
        const relevance = this.relevanceScore(word, keyWords) 
        const maxRS = this.maxRelevanceScore(keyWords, {
            method : "approx",
            minProbes : 128
        })
        return Math.min(1, relevance / maxRS)
    }

    similarityScores(word, keyWords) {
        const scores = []
        for(let keyWord of keyWords) {
            const score = this.wordModel.similarityScore(word, keyWord)
            scores.push(score)
        }
        return scores
    }

    maxRelevanceScore(keyWords, options) {
        const relevant = this.relevantTo(keyWords, 10, options) 
        return relevant.items[0].relevance
    }

    mostRelevantWord(keyWords, options) {
        const relevant = this.relevantTo(keyWords, 10, options) 
        return relevant.items[0].word
    }


    mostRelevantWordSkip(keyWords, options, skip) {
        const relevant = this.relevantTo(keyWords, 1000, options) 
        return relevant.items.find(x => !skip.has(x.word)).word
    }


    mostRelevantWords(keyWords, k, options) {
        const relevant = this.relevantTo(keyWords, k, options) 
        return relevant.items.map(x => x.word)
    }
 
}