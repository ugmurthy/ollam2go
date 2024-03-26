/*
@TODO : Incorporate context

*/

import { json, useLoaderData, useLocation, useNavigate}from "@remix-run/react";

import {   abort, generate, getCurrentModel, getFromMemory, hasMemory, saveToMemory,  } from "~/llmapi/llama";
import { useEffect, useRef, useState } from "react";
import Prompt from "~/components/Prompt";
import CommandCopy from "~/components/CommandCopy";
import Bubble from '~/components/Bubble';
import New from '~/components/New'
import Stop from '~/components/Stop'
export async function clientLoader({request}) {
  
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt') || "";
  const model = getCurrentModel();
  const context = getFromMemory("context");
 
return json({model, prompt, context});
}
  

clientLoader.hydrate = true;

 export default  function Component() {
  const responseRef = useRef();
  const {model,prompt,context } = useLoaderData();
  const [data, setData] = useState([]);
  //const [context,setContext]=useState([])
  const [hasContext,sethasContext]=useState(hasMemory("context"))
  const location = useLocation();
  const navigate = useNavigate();
  function handleClick() {
    abort();
    navigate(location.pathname)
  }

  function handleForget() {
    saveToMemory([],"context");
    sethasContext(hasMemory("context")); // update state variable
    navigate(location.pathname);
  }
  useEffect(() => {
    
    const fetchData = async () => {
      console.log("fetchData");
      if (prompt==='') return;
      const response =  await generate(model,prompt,context,true) ;
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
          //Saving CONTEXT when finished
          saveToMemory(chunk_json.context,"context")
          sethasContext(hasMemory('context'))
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
        //console.log("Done ", done);
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
  
  return (
    
      <div className='pt-12  text-2xl text-wrap'> 
        {prompt.length?
        <div className='ml-4 mr-4 '>
          <Bubble className="mt-10 ml-10 bg-blue-100 rounded-lg" 
                  promptClass="text-2xl font-normal"
                  pendingStatus={isEvaluating} 
                  progress_type={'progress-info'}
                  tooltip="You"
                  ref = {null}
          >
            {prompt.substring(prompt.indexOf(">> "))}
          </Bubble>
          <Bubble 
              className=" bg-gray-50 text-2xl rounded-t-lg scroll-smooth" 
              promptClass="text-2xl font-normal"
              pendingStatus={isInferencing} 
              progress_type={'progress-success'} 
              me={false} 
              tooltip={getCurrentModel()}
              ref={responseRef}> 
            {result}
          </Bubble>
          {isInferencing?<button className='btn btn-circle btn-neutral fixed bottom-24 right-10' onClick={handleClick}><Stop/></button>:""}
        </div>:""}
        {((!done || !isInferencing)&& hasContext)?<button className='btn btn-circle btn-neutral fixed bottom-24 right-24' onClick={handleForget}><New/></button>:""}
       
        {done?<div className=' p-0  mb-24  ml-4 mr-4  bg-black rounded-b-lg'>
        <div className="flex flex-row items-center  text-sm font-thin text-white"> 
            <CommandCopy txt={result} btnTxt="Copy Response" color="white">R</CommandCopy> 
            <CommandCopy txt={prompt} color="white" btnTxt="Copy Prompt">P</CommandCopy> 
            <CommandCopy txt={prompt+"\n\n"+result} btnTxt="Copy Both" color="white">B</CommandCopy> 
              <span className='hidden lg:block'>
              <pre> {statStr} {"    |  NOTE: "}{ getCurrentModel()+" can make mistakes. Check before using it" }</pre> 
             </span>
              <span className='pl-8 lg:hidden flex flex-row  space-x-8'>
                  <div className='tooltip tooltip-bottom tooltip-success' data-tip={statStr}><img className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-white" src="/stats.png" alt=""/> </div>
                  <div className='tooltip tooltip-bottom tooltip-warning' data-tip={getCurrentModel()+" can make mistakes. Check before using it"}><img className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-white" src="/warning.png" alt=""/> </div>
              </span>
             </div>
            </div>:""}
          <Prompt location={location}></Prompt>
    </div>
  )
}


