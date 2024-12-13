import axios from "axios"
import { makeDirectory } from "wordpaths-common/src/Common_.js" 
import Encoder_ from "wordpaths-common/src/Encoder_.js"
import Array_ from "wordpaths-common/src/Array_.js"
import { HttpFileReader } from "wordpaths-common/src/FileReader_.js"

export default class FSLoader 
{
    static async loadVocabulary(model) {
       const response = await axios.get(model.files.vocabulary) 
       const data = response.data 
       model.vocabulary = data.toString().split("\n")
    }

    static async loadWordIndex(model) {
        const response = await axios.get(model.files.wordIndex) 
        const data = response.data 
        model.wordIndex = data
    }

    static async loadCefrMap(model) {
        const response = await axios.get(model.files.cefrMap) 
        const data = response.data 
        model.cefrMap = data
    }

    static async loadCefrGroups(model) {
        const response = await axios.get(model.files.cefrGroups) 
        const data = response.data 
        model.cefrGroups = data
    }

    static async loadClosest1(model) {
        const response = await axios.get(
            model.files.closest1, 
            { responseType: "arraybuffer" }
        ) 
        const data = response.data 
        const closest1 = Encoder_.decodeIntArrayFromBytes(data)
        model.closest1 = closest1
    }

    static async loadClosest10(model) {
        const response = await axios.get(
            model.files.closest10, 
            { responseType: "arraybuffer" }
        ) 
        const data = response.data 
        const closest10  = Encoder_.decodeIntArrayFromBytes(data)
        model.closest10 = closest10
    }

    static async loadClosest100(model) {
        const response = await axios.get(
            model.files.closest100, 
            { responseType: "arraybuffer" }
        ) 
        const data = response.data 
        const closest100  = Encoder_.decodeIntArrayFromBytes(data)
        model.closest100 = closest100
    }

    static async loadClosest1000(model) {
        const response = await axios.get(
            model.files.closest1000, 
            { responseType: "arraybuffer" }
        ) 
        const data = response.data 
        const closest1000  = Encoder_.decodeIntArrayFromBytes(data)
        model.closest1000 = closest1000
    }

    static async loadVectors(model, onSubProgress) {
        const vectorsFile = model.files.vectors
        const bytes = await HttpFileReader.load(vectorsFile, { 
            onProgress: onSubProgress,
            chunkSize: 50000,
            type : "arraybuffer"
        })
        const floatArray = Encoder_.decodeFloatArrayFromBytes(bytes)
        const vectors = Array_.partition(floatArray, model.dims) 
        model.vectors = vectors
    }
}