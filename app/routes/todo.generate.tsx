/*
@TODO : Incorporate context

*/

import { json, useLoaderData}from "@remix-run/react";

import {   generate, getCurrentModel,  } from "~/llmapi/llama";
import { useEffect, useState } from "react";
import Prompt from "~/components/Prompt";

export async function clientLoader({request}) {
  
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt') || "You are a coach who motivates runners. Response with a short welcome and a question";
  const model = getCurrentModel();
  
 
return json({model, prompt});
}
  

clientLoader.hydrate = true;

 export default  function Component() {
  const {model,prompt } = useLoaderData();
  const [data, setData] = useState([]);
  const [context,setContext] = useState([]);
  
  //console.log("Context ",context)
  useEffect(() => {
    
    const fetchData = async () => {
      console.log("fetchData");
      if (prompt==='') return;
      const response =  await generate(model,prompt,true) ;
      const reader = response.body.getReader();
      const readChunk = async () => {
        const { done, value } = await reader.read();
        if (done) {
          return;
        }
        const chunk = new TextDecoder().decode(value);
        const chunk_json = JSON.parse(chunk);
        //console.log(chunk)
        
        if (chunk_json.done) {
          //console.log("Last chunk ",chunk);
          setContext(chunk_json.context);
        }
        setData(prevData => [...prevData, chunk_json]);
        readChunk(); // Call itself recursively to read the next chunk
      };

      readChunk();
    };

    fetchData();
  },[]);
  
  // return sum of first n strings from a json chunks as result, stats and if done
  function sumStr(data) {
    let ret_val="";
    let stats;
    const last = data.length-1
    const done = data[last]?.done ? true : false
    // collect stats
    if (data[last]?.done) {
        stats= data[last]
        //console.log("Last Chunk ",stats)
    }
    // collect content from chunks
    for (let i=0;i<last;i++) {
        ret_val = ret_val + data[i]?.response
    }
    // return sum of string (result), statistics if done
    return {result: ret_val , stats,done}
  }
  function computeStats(stats) {
    // compute stats
    if (!stats.done) 
      {return null}
    const duration = (stats.total_duration / 10**9).toFixed(2);
    const tokPerSec = (stats.eval_count  / duration).toFixed(1)
    const footer = isNaN(duration)?'':`took ${duration}s , ${tokPerSec} tokens/s`
    const header = stats.model+" say's "
    return header+footer
  }

  const {result, stats, done} = sumStr(data);
  //console.log(`Stream phases datalen : ${data.length}, done : ${done} promptlen : ${prompt.length} ` )
  const statStr = done? computeStats(stats): (typeof done === 'undefined')?"Evaluating Prompt...":"Inference Processing..."
  
  const isInferencing = !done && data.length;
  const isEvaluating  = !done && data.length === 0;
  //console.log("Pending Status ",isInferencing,isEvaluating)
  /* if (done) {
    console.log("context ",stats.context)
  }
   *///console.log(JSON.stringify(data))
  return (
    <div className="p-40 text-2xl"> 
      {model} {" -- "}{prompt} 
      <div className="p-10 text-blue-700">{result}</div>
      <div>{statStr}</div>
      <Prompt></Prompt>
    </div>
  )
}