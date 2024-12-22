import Math_ from "wordpaths-common/src/Math_.js"

export class Puzzles 
{
	static unthemed(model, searcher, constrained, source, target, inputs) {
		const items  = [source,  ...inputs, target]
		const scores = []
		let subScores = []
		let inspectScores = []
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
			subScores     : subScores,
			keyWords	  : keyWordsAll,
			inspectScores : inspectScores,
			averageScore  : averageScore, 
			minScore      : minScore,
			finalScore    : finalScore
		}
	}


	static themed(model, searcher, constrained, source, target, themes, themeMode, inputs) {
		const items  = [source,  ...inputs, target]
		const scores = []
		let subScores = []
		let inspectScores = []
		let keyWordsAll = []

		let extras = []
		if(constrained) {
			extras = [source, target]
		}

		for(let i = 1; i < items.length - 1; i++) {
			const prevWord = items[i - 1]
			const inputWord = items[i]
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1) 
			let finalWord = []
			if(i == items.length - 2) {
				finalWord.push(target)
			}
			let keyWords = [prevWord, ...extras, ...themesConsidered, ...finalWord]
			keyWords = [...new Set(keyWords)]
			inspectScores.push(searcher.similarityScores(inputWord, keyWords))
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
			averageScore  : averageScore, 
			minScore      : minScore,
			finalScore    : finalScore
		}
	}
	
	static resolveThemes(themeMode, themes, i) {
		if(themeMode == null) {
			return []
		}
		
		if(["TWP", "TWPN", "CT", "TWN"].indexOf(themeMode) == -1) {
			throw new Error("Unknown theme : " + themeMode)
		}
		const themesFiltered = [themes[i]]
		if(
		   (themeMode == "TWP"  ||
            themeMode == "TWPN") &&
		    themes[i - 1]) {
			themesFiltered.push(themes[i - 1])
		}
		else if(
			(themeMode == "TWN" ||
			 themeMode == "TWPN") && 
			 themes[i + 1]
		) {
			themesFiltered.push(themes[i + 1])
		}
		return themesFiltered
	}
}
