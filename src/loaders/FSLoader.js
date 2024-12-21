import fs from "fs"
import { makeDirectory } from "wordpaths-common/src/Common_.js" 
import Encoder_ from "wordpaths-common/src/Encoder_.js"
import Array_ from "wordpaths-common/src/Array_.js"
import { FSFileReader } from "wordpaths-common/src/FileReader_.js"
import crypto from "crypto"

export default class FSLoader 
{
    static async loadVocabulary(model) {
        const fs = (await import("fs")).default
        const vocabularyFile = model.files.vocabulary
        const vocabulary = fs.readFileSync(vocabularyFile).toString().split("\n")
        model.vocabulary = vocabulary
    }

    static async loadWordIndex(model) {
        const fs = (await import("fs")).default
        const wordIndexFile= model.files.wordIndex
        const wordIndex = JSON.parse(fs.readFileSync(wordIndexFile))
        model.wordIndex = wordIndex
    }

    static async loadCefrMap(model) {
        const fs = (await import("fs")).default
        const cefrMapFile = model.files.cefrMap
        const cefrMap = JSON.parse(fs.readFileSync(cefrMapFile))
        model.cefrMap = cefrMap
    }

    static async loadCefrGroups(model) {
        const fs = (await import("fs")).default
        const cefrGroupsFile = model.files.cefrGroups
        const cefrGroups = JSON.parse(fs.readFileSync(cefrGroupsFile))
        model.cefrGroups = cefrGroups
    }

    static async loadClosest(model) {
        const fs = (await import("fs")).default
        const closestFile = model.files.closest
        let closest = fs.readFileSync(closestFile)
        closest = Encoder_.decodeUIntArrayFromBytes(closest) 
        model.closest = closest
    }

    static async loadVectors(model, onSubProgress) {
        const fs = (await import("fs")).default
        const vectorsFile = model.files.vectors

        
        const bytes = await FSFileReader.load(vectorsFile, { 
            onProgress: onSubProgress,
            chunkSize: 50000
        })


        const floatArray = Encoder_.decodeFloatArrayFromBytes(bytes)
        const vectors = Array_.partition(floatArray, model.dims) 

        model.vectors = vectors
    }

}