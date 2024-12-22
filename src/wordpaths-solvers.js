import { Puzzles } from "wordpaths-word-model/src//wordpaths-puzzles.js"

export class Solvers
{

	static walkToLast(model, searcher, constrained, source, target, themes, themeMode) {
		const items = [source, ...new Array(themes.length).fill(null), target]
		const visited = new Set([source, target, ...themes])

		let extras = []
		if(constrained) {
			extras = [source, target]
		}

		for(let i = 1; i < items.length - 1; i++) {
			const previousWord = items[i - 1]
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1)
			const solvedWord   = searcher.mostRelevantWordSkip(
				[previousWord, ...extras, ...themesConsidered], {
					method: "approx", 
					minProbes: 128
				},
				new Set([])
			) 
			visited.add(solvedWord)
			items[i] = solvedWord
		}

		return items.slice(1, -1)
	}

	static walkToLastRechained(model, searcher, constrained, source, target, themes, themeMode) {
		const items = [source, ...new Array(themes.length).fill(null), target]
		const visited = new Set([source, target, ...themes])

		let extras = []
		if(constrained) {
			extras = [source, target]
		}

		// handle non last words
		for(let i = 1; i < items.length - 2; i++) {
			const previousWord = items[i - 1]
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1)
			const solvedWord   = searcher.mostRelevantWordSkip(
				[previousWord, ...extras, ...themesConsidered], {
					method: "approx", 
					minProbes: 128
				},
				visited
			) 
			visited.add(solvedWord)
			items[i] = solvedWord
		}

		// --- handle last word 	
		const themesConsidered = Puzzles.resolveThemes(themeMode, themes, themes.length - 1)
		const secondToLastWord = items.at(-3) 
		items[items.length - 2] = searcher.mostRelevantWordSkip(
			[secondToLastWord, target, ...extras, ...themesConsidered], {
				method: "approx", 
				minProbes: 128
			},
			visited
		)

		return items.slice(1, -1)
	}


	static walkToFirst(model, searcher, constrained, source, target, themes, themeMode) {
		const items = [source, ...new Array(themes.length).fill(null), target]
		const visited = new Set([source, target, ...themes])


		let extras = []
		if(constrained) {
			extras = [source, target]
		}

		for(let i = items.length - 2; i > 0; i--) {
			const nextWord = items[i + 1]
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1)
			const solvedWord   = searcher.mostRelevantWordSkip(
				[nextWord, ...extras, ...themesConsidered], {
					method: "approx", 
					minProbes: 128
				},
				visited
			) 
			visited.add(solvedWord)
			items[i] = solvedWord
		}

		return items.slice(1, -1)
	}

	static walkToFirstRechained(model, searcher, constrained, source, target, themes, themeMode) {
		const items = [source, ...new Array(themes.length).fill(null), target]
		const visited = new Set([source, target, ...themes])


		let extras = []
		if(constrained) {
			extras = [source, target]
		}
		
		for(let i = items.length - 2; i > 0; i--) {
			const nextWord = items[i + 1]
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1)
			const solvedWord   = searcher.mostRelevantWordSkip(
				[nextWord, ...extras, ...themesConsidered], {
					method: "approx", 
					minProbes: 128
				},
				visited
			) 
			visited.add(solvedWord)
			items[i] = solvedWord
		}

		
		// --- handle first word 	
		const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1)
		const secondToFirstWord = items.at(-3) 
		items[1] = searcher.mostRelevantWordSkip(
			[source, items[2], ...extras, ...themesConsidered], {
				method: "approx", 
				minProbes: 128
			},
			visited
		)

		return items.slice(1, -1)
	}

	static walkToMiddle(model, searcher, constrained, source, target, themes, themeMode) {
		const items = [source, ...new Array(themes.length).fill(null), target]
		const visited = new Set([source, target, ...themes])

		let extras = []
		if(constrained) {
			extras = [source, target]
		}

		const mid = Math.floor(items.length / 2)
	
		// --- walk from last to middle
		for(let i = items.length - 2; i >= mid + 1; i--) {
			const nextWord = items[i + 1]
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1)
			const solvedWord   = searcher.mostRelevantWordSkip(
				[nextWord, ...extras, ...themesConsidered], {
					method: "approx", 
					minProbes: 128
				},
				visited
			) 
			visited.add(solvedWord)
			items[i] = solvedWord
		}

		// --- walk from first to middle
		for(let i = 1; i <= mid - 1; i++) {
			const prevWord = items[i - 1]
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1)
			const solvedWord   = searcher.mostRelevantWordSkip(
				[prevWord, ...extras, ...themesConsidered], {
					method: "approx", 
					minProbes: 128
				},
				visited
			) 
			visited.add(solvedWord)
			items[i] = solvedWord
		}

		// --- rechain middle word
		const themesConsidered = Puzzles.resolveThemes(themeMode, themes, mid - 1)
		items[mid] = searcher.mostRelevantWordSkip(
			[items[mid - 1], items[mid + 1], ...extras, ...themesConsidered], {
				method: "approx",
				minProbes: 128
			}, 
			visited
		)
		
		return items.slice(1, -1)
	}

	static walkFromMiddle(model, searcher, constrained, source, target, themes, themeMode, seed) {
		const items = [source, ...new Array(themes.length).fill(null), target]
		const visited = new Set([source, target, ...themes])

		let extras = []
		if(constrained) {
			extras = [source, target]
		}

		const mid = Math.floor(items.length / 2)

		// --- find middle word
		if(!seed) {
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, mid)		
			items[mid] = searcher.mostRelevantWordSkip(
				[source, target, ...themesConsidered], {
					method: "approx",
					minProbes: 128
				}, 
				visited
			)
		} else {
			items[mid] = seed
		}

			
		
		// --- walk from last to middle
		for(let i = items.length - 2; i >= mid + 1; i--) {
			const nextWord = items[i + 1]
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1)
			let keyWords = [nextWord, ...extras, ...themesConsidered]
			if(i == mid + 1) {
				keyWords.push(items[mid])
			}
			const solvedWord   = searcher.mostRelevantWordSkip(
				keyWords, {
					method: "approx", 
					minProbes: 128
				},
				visited
			) 
			visited.add(solvedWord)
			items[i] = solvedWord
		}

		// --- walk from first to middle
		for(let i = 1; i <= mid - 1; i++) {
			const prevWord = items[i - 1]
			const themesConsidered = Puzzles.resolveThemes(themeMode, themes, i - 1)
			let keyWords = 	[prevWord, ...extras, ...themesConsidered]
			if(i == mid -  1) {
				extras.push(items[mid])
			}
			const solvedWord   = searcher.mostRelevantWordSkip(
				keyWords, {
					method: "approx", 
					minProbes: 128
				},
				visited
			) 
			visited.add(solvedWord)
			items[i] = solvedWord
			extras = [source, target]
		}
		
		
		return items.slice(1, -1)
	}
}
