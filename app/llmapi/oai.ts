// OPEN AI Api for OLLAMA models
const BASE_URL='http://localhost:11434/v1/'

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
export async function chat(model:string, messages:Messages, stream?:boolean | true) {
    const options = {method: 'POST', headers, body: JSON.stringify({model,messages,stream})}
    const response = await fetch(BASE_URL+'chat/completions', options);
    return response;
}
