// OPEN AI Api for OLLAMA models
const BASE_URL='http://localhost:11434/v1/'
const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1/"
const headers = {
    "Content-Type": "application/json",
    // 'Content-Type': 'application/x-www-form-urlencoded',
  }
interface Chat {
    role: string;
    content: string;
}

type Messages=Chat[];
// chat : streaming (by default)
export async function deepchat(model:string, messages:Messages, stream?:boolean | true) {
    const system = [{ 
        role: "system",
        content: "You are an EXPERT coder proficient in coding and have deep knowledge of algorithms. You carry out all requests for code by accurate output and do not answer non coding questions"
    }]
    const total_messages = [...system, ...messages]
    const myHeaders = new Headers();
    myHeaders.append("Content-Type","application/json");
    myHeaders.append("Authorization","Bearer "+localStorage.getItem("key"));
    const URL  = DEEPSEEK_BASE_URL+'chat/completions'
    console.log(model, total_messages,stream,URL)
    const options = {method: 'POST', myHeaders, body: JSON.stringify({model,total_messages,stream})}
    const response = await fetch(URL, options);
    return response;
}

export async function chat(model:string, messages:Messages, stream?:boolean | true) {
    
    const options = {method: 'POST', headers, body: JSON.stringify({model,messages,stream})}
    const response = await fetch(BASE_URL+'chat/completions', options);
    return response;
}
