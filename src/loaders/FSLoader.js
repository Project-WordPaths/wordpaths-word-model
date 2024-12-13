import fs from "fs"
import { makeDirectory } from "wordpaths-common/src/Common_.js" 
import Encoder_ from "wordpaths-common/src/Encoder_.js"
import Array_ from "wordpaths-common/src/Array_.js"
import { FSFileReader } from "wordpaths-common/src/FileReader_.js"

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

    static async loadClosest1(model) {
        const fs = (await import("fs")).default
        const closest1File = model.files.closest1
        let closest1 = fs.readFileSync(closest1File)
        closest1 = Encoder_.decodeIntArrayFromBytes(closest1) 
        model.closest1 = closest1
    }

    static async loadClosest10(model) {
        const fs = (await import("fs")).default
        const closest10File = model.files.closest10
        let closest10 = fs.readFileSync(closest10File)
        closest10 = Encoder_.decodeIntArrayFromBytes(closest10) 
        model.closest10 = closest10
    }

    static async loadClosest100(model) {
        const fs = (await import("fs")).default
        const closest100File = model.files.closest100
        let closest100 = fs.readFileSync(closest100File)
        closest100 = Encoder_.decodeIntArrayFromBytes(closest100) 
        model.closest100 = closest100
    }

    static async loadClosest1000(model) {
        const fs = (await import("fs")).default
        const closest1000File = model.files.closest1000
        let closest1000 = fs.readFileSync(closest1000File)
        closest1000 = Encoder_.decodeIntArrayFromBytes(closest1000) 
        model.closest1000 = closest1000
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