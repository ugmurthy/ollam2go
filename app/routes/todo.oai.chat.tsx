/*
OPENAI route to OLLAMA

*/

import { json, useLoaderData}from "@remix-run/react";
import {   chat,  } from "~/llmapi/oai";
import { getCurrentModel } from "~/llmapi/llama";
import { useEffect, useState } from "react";
import Prompt from "~/components/Prompt";
import _ from 'lodash';

export async function clientLoader({request}) { 
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt') || "Hello!";
  const model = getCurrentModel();
  
  const messages = [
    { 
        role: "system",
        content: "You are a helpful assistance and world's best coach"
    },
    {
        role:"user",
        content:prompt,
    }
  ]
  
return json({model, messages, prompt});
}
  

clientLoader.hydrate = true;

 export default   function Component() {
  const {model,messages,prompt, } = useLoaderData();
  const [data, setData] = useState([]);
  
  

  useEffect(() => {
    
    const fetchData = async () => {
      console.log("fetchData");
        if (prompt==="") return;
        const response =  await chat(model,messages,true) ;
        const reader = response.body.getReader();
      const readChunk = async () => {
        const { done, value } = await reader.read();
        
        if (done) {
          return;
        }
        const chunk = new TextDecoder().decode(value);
        const start= _.indexOf(chunk,"{")
        const end = _.lastIndexOf(chunk,"}");
        const chunk_json = JSON.parse(chunk.substring(start,end+1))
        //console.log(`done=${done} ,JSON: ${JSON.stringify(chunk_json)}`)
        
        if (chunk_json.choices[0].finish_reason) {
            console.log("Done! ",chunk_json.choices[0].finish_reason)
        }
        setData(prevData => [...prevData, chunk_json]);
        readChunk(); // Call itself recursively to read the next chunk
      };

      readChunk();
    };

    fetchData();
  },[]);
  
  // return sum of first n strings from a json chunks as result, stats and if done
  function contentFromChunks(data) {
    let result='';
    for (const chunk of data) {
        result = result + chunk.choices[0].delta.content
    }
    return result
    }

  const dlen = data.length
  const isInferencing = !data[dlen-1]?.choices[0].finish_reason
  const isEvaluating  = dlen === 0;
  
  return (
    <div className=" text-2xl p-40"> 
      {model} {" -- "}{prompt} {isInferencing?<span className="loading loading-spinner"></span>:""}
      <div className=" text-blue-700">{contentFromChunks(data)} </div>
      
      <div>{"end"}</div>
      <pre>{(!isInferencing)?JSON.stringify(data[data.length-1],null,2):""}</pre>
      <Prompt></Prompt>
    </div>
  )
}