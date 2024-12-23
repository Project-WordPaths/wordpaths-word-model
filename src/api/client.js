import { WordSearcher } from "wordpaths-word-model/src/word-searcher.js"
import { ServerAPI } from "./server-api.js"
import { NativeAPI } from "./native-api.js"
import { WordModel } from "wordpaths-word-model/src/word-model.js"

export class WordModelClient 
{
    constructor(serverMode, serverBaseURL, baseOpts) {
        this.serverBaseURL = serverBaseURL 
        this.baseOpts = baseOpts
        this.model = null
        this.searcher = null
        this.serverMode = serverMode
    }

    async prepare({
        onProgress = () => {},
        onSubProgress = () => {}
    } = {}) {
        if(this.serverMode) {
            this.api = new ServerAPI(this)
        }
        else {
            await this.loadBaseModel({ onProgress, onSubProgress })
            this.api = new NativeAPI(this)
        }
    }

    async loadBaseModel({
        onProgress = () => {},
        onSubProgress = () => {}
    } = {}) {
        const model = new WordModel(
            "fs", 
            "/home/lvjhn/Projects/wordpaths/wordpaths-word-model/data/glove-50d/preprocessed/", 
            50, 
            1234567890
        )
        const self = this 

        model.tasks.add("load.searcher", async () => {
            self.searcher = new WordSearcher(model)
        })
        
        await model.load({
            onProgress: onProgress,
            onSubProgress: onSubProgress
        })

        this.model = model 
        
    }


}
