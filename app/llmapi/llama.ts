
export const BASE = "http://localhost:11434/"
export const BASE_URL= BASE+"api/";

//export const APPBASE = "http://localhost:5173/"
export const APPBASE = "/";

const controller = new AbortController();
const signal = controller.signal;

export function abort() {
    controller.abort();
}
// Get list of models including details
export async function getModels() {
    // create / destroy localStorage items models, modelnames depending on server live status
    // if live create localstorage items else destroy to ensure fresh data
    try {
        const response = await fetch(BASE_URL+"tags");
        const data = await response.json();
        localStorage.setItem("models",JSON.stringify(data.models))
        const c=[]
        for (const model of data.models) {
            c.push(model.name);
        }
        localStorage.setItem("modelnames",JSON.stringify(c))
        return data.models;
    } catch (err) {
        console.log("getModels : Error",err)
        localStorage.clear();
        return null
    }
}
/* // Get available  model names as an array from localStorage
// deprecated. 7/Mar/24
export function listModels(){
    return JSON.parse(localStorage.getItem("modelnames"));
}
 */
export  function modelExists(model:string) {
    const modelnames =  getModelNames();
    //console.log('modelnames' ,modelnames)
    if (modelnames) {
        if (modelnames.indexOf(model) !== -1) {return true} else {return false}
    }
    console.log("modelExists ",false)
    return false;
}

// Get available  model names as an array from localStorage
export  function getModelNames(){
    const modelnames = localStorage.getItem("modelnames")
    if (modelnames!==null) {
        return JSON.parse(modelnames);
    } else {
        return null;
    }
}


//Get current model name and default to llama2 in case null
export function getCurrentModel() {
    if (localStorage.getItem('modelnames')) { // if olaama is running then this will be true
        if (localStorage.getItem("currentModel")===null) { 
            const modelnames = getModelNames();
            // get first model with name llama2
            const defaultModel = modelnames.find((m) => m.includes('llama2'));
            localStorage.setItem("currentModel",defaultModel) // default model
        } 
        return localStorage.getItem("currentModel")
    }
    return false; // ollama is not running
}

//Get details of current model
export function getCurrentModelDetails(model:string) {

}

//set current models - return true if success else false.
export function setCurrentModel(model:string) {
    
    if (modelExists(model)) {
        localStorage.setItem("currentModel",model)
        return true
    }
    console.log("setCurrentModel : unable to set : returning false")
    return false
}

// save prompt, result, stats for future use
export function saveToMemory(c_obj,key="memory") {
    localStorage.setItem(key,JSON.stringify(c_obj));
}

export function removeMemory(key="memory") {
    localStorage.removeItem(key);
}

export function hasMemory(key="memory") {
    // if we have anything else other than '[]'
    const m = localStorage[key]?.length > 2;
    console.log(`${key} status ${m}`)
    return m;
}
export function getFromMemory(key="memory") {
    try {
    const memory = JSON.parse(localStorage.getItem(key))
    if (memory === null) {
        return []
    } else {
        return memory;
    }
    } catch {
        console.log("Error : getFromMemory could not parse")
        return []
    }
}


// Generate a completion :  streaming (by default)
export async function generate(model:string, prompt:string, stream?:boolean | true) {
    const options = {method: 'POST', body: JSON.stringify({model,prompt,stream}),signal}
    const response = await fetch(BASE_URL+'generate', options);
    return response;
    }

interface Chat {
    role: string;
    content: string;
}
type Messages=Chat[];
// chat : streaming (by default)
export async function chat(model:string, messages:Messages, stream?:boolean | true) {
    const options = {method: 'POST', body: JSON.stringify({model,messages,stream}),signal}
    const response = await fetch(BASE_URL+'chat', options,);
    return response;
}
