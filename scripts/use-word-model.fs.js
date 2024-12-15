import { WordModel } from "../src/word-model.js";

console.log("Preparing model.")
const model = new WordModel(
    "fs", 
    "./data/glove-50d/preprocessed/", 
    50, 
    1234567890
)

console.log("Loading model.")
29 

console.log(model.cefrLevelOf("domination"))

console.log("Done.")