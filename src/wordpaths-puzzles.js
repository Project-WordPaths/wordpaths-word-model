import Math_ from "wordpaths-common/src/Math_.js"

export class Puzzles 
{
	static unthemed({
		model = null, 
		searcher = null, 
		constrained = null, 
		source = null, 
		target = null, 
		inputs = null
	} = {}) {
		const items  = [source,  ...inputs, target]
		const scores = []
		let subScores = []
		let inspectScores = []
		let normalizedScores = []
		let keyWordsAll = []

		let extras = []
		if(constrained) {
			extras = [source, target]
		}

		for(let i = 1; i < items.length; i++) {
			const previousWord = items[i - 1]
			const inputWord = items[i]
			let keyWords = [previousWord, ...extras]
			keyWords = [...new Set(keyWords)]
			inspectScores.push(searcher.similarityScores(inputWord, keyWords))
			normalizedScores.push(
				keyWords.map((keyWord) => model.normalizedSimilarityScore(
					inputWord, keyWord
				))
			)			
			keyWordsAll.push(keyWords)
			const score = searcher.normalizedRelevanceScore(inputWord, keyWords) 
			subScores.push(score)
		}

		const minScore = Math.min(...subScores) 
		const averageScore = Math_.average(subScores) 
		const finalScore = Math_.geometricMean([averageScore, minScore])

		return {
			gameMode      : "unthemed",	
			constrained   : constrained, 	
			source	      : source,
			target	      : target,
			inputs        : inputs,
			subScores     : subScores,
			keyWords	  : keyWordsAll,
			inspectScores : inspectScores,
			averageScore  : averageScore, 
			minScore      : minScore,
			finalScore    : finalScore
		}
	}


	static themed({
		model = null, 
		searcher = null, 
		constrained = null, 
		source = null,
		target = null,
		themes = null,
		inputs = null
	} = {}) {
		const items  = [source,  ...inputs, target]
		const scores = []
		let subScores = []
		let inspectScores = []
		let normalizedScores = []
		let keyWordsAll = []

		let extras = []
		if(constrained) {
			extras = [source, target]
		}

		for(let i = 1; i < items.length - 1; i++) {
			const prevWord = items[i - 1]
			const inputWord = items[i]
			const currentTheme = themes[i - 1]
			
			// --- add last word if needed 
			let finalWord = []
			if(i == items.length - 2) {
				finalWord.push(target)
			}

			let keyWords = [prevWord, ...extras, currentTheme, ...finalWord]
			keyWords = [...new Set(keyWords)]
			inspectScores.push(searcher.similarityScores(inputWord, keyWords))
			normalizedScores.push(
				keyWords.map((keyWord) => model.normalizedSimilarityScore(
					inputWord, keyWord
				))
			)
			keyWordsAll.push(keyWords)
			const score = searcher.normalizedRelevanceScore(inputWord, keyWords) 
			subScores.push(score)
		}

		const minScore = Math.min(...subScores) 
		const averageScore = Math_.average(subScores) 
		const finalScore = Math_.geometricMean([averageScore, minScore])

		return {
			gameMode      : "themed",	
			constrained   : constrained, 	
			source	      : source,
			target	      : target,
			inputs        : inputs,
			themes        : themes,
			subScores     : subScores,
			keyWords 	  : keyWordsAll,
			inspectScores : inspectScores,
			normalizedScores : normalizedScores,
			averageScore  : averageScore, 
			minScore      : minScore,
			finalScore    : finalScore
		}
	}
}
