import { WordModelClient } from "../src/api/client.js"
import Random_ from "wordpaths-common/src/Random_.js" 
import fs from "fs"

const random = new Random_(1234)

console.log("Load client.")
const client = new WordModelClient(
    true,
    "http://localhost:8080/", 
    {
        mode: "fs", 
        source: "./data/glove-50d/preprocessed",
        dims: 50, 
        seed: 1234567890
    }
)

await client.prepare({
    onProgress(perc, message) {
        console.log(`---- Loading (${perc .toFixed(2)}) ${message}`)
    },
    onSubProgress(i, n) {
        console.log(`\t---- Loading ${i} of ${n}`)
    }
})

// --- use walk to last solver 
const source = "picnic" 
const target = "aircraft"
const walkCount = 5

{

    const path = await client.api.solvers.solve({
        solver: "walkToLast", 
        source: source,
        target: target, 
        walkCount: walkCount,
        themeMode: false
    })

    const fullPath = [source, ...path, target] 
    const locations = await Promise.all(
        fullPath.map(async (word) => await client.api.model.pcaVector(word))
    )

    fs.writeFileSync("./data/wtl.json", JSON.stringify({
        fullPath,
        locations
    }))
}


{
    // --- use walk from middle solver 
    const path = await client.api.solvers.solve({
        solver: "walkFromMiddle", 
        source: source,
        target: target, 
        walkCount: walkCount,
        themeMode: false
    })

    const fullPath = [source, ...path, target] 
    const locations = await Promise.all(
        fullPath.map(async (word) => await client.api.model.pcaVector(word))
    )

    fs.writeFileSync("./data/wfm.json", JSON.stringify({
        fullPath,
        locations
    }))
}


{
    // --- use walk from middle solver 
    const path = await client.api.solvers.solve({
        solver: "walkToMiddle", 
        source: source,
        target: target, 
        walkCount: walkCount,
        themeMode: false
    })

    const fullPath = [source, ...path, target] 
    const locations = await Promise.all(
        fullPath.map(async (word) => await client.api.model.pcaVector(word))
    )

    fs.writeFileSync("./data/wtm.json", JSON.stringify({
        fullPath,
        locations
    }))
}


{
    // --- use walk from middle solver 
    const path = await client.api.solvers.solve({
        solver: "walkToMiddle", 
        source: source,
        target: target, 
        walkCount: walkCount,
        themeMode: false
    })

    const fullPath = [
        "picnics", 
        "picnicking",
        "barbecue",
        "barbecues",
        "burger",
        "restaurant",
        "room",
        "house",
        "city",
        "airport"
    ]
    const locations = await Promise.all(
        fullPath.map(async (word) => await client.api.model.pcaVector(word))
    )

    fs.writeFileSync("./data/manual.json", JSON.stringify({
        fullPath,
        locations
    }))
}