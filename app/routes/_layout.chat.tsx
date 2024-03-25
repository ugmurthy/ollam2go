import  { useState, useEffect, useRef } from 'react';
import {  type ClientLoaderFunctionArgs, useLoaderData, json, useLocation, useNavigate}from "@remix-run/react";

import { abort, chat, getCurrentModel, getFromMemory, hasMemory, saveToMemory } from "~/llmapi/llama";
import Prompt from "~/components/Prompt"
import Bubble from '~/components/Bubble';
import MarkdownIt from 'markdown-it';
import CommandCopy from '~/components/CommandCopy';
import Stop from '~/components/Stop';
import New from '~/components/New';

export async function clientLoader({request}:ClientLoaderFunctionArgs) {
  const url = new URL(request.url);
  //const model = url.searchParams.get('model') || "";
  const model = getCurrentModel();
  const prompt = url.searchParams.get('prompt') || "";
  
  if (model==='' || prompt==='') return {model,messages:{},prompt};

  if (typeof prompt !== 'string' || !prompt ) {
    throw new Error("Please enter valid prompt")
  }
  let promptStr = prompt;
  if (prompt.includes(model)) {
    promptStr = prompt.substring(prompt.indexOf(">> "));
  }
  const memory = getFromMemory();
  const messages =[ ...memory, 
                    {role:"user",content:promptStr}
                  ]

return json({model, messages, prompt});
}
  
// Note: you do not have to set this explicitly - it is implied if there is no `loader`
clientLoader.hydrate = true;

/* // @TODO AA Move this to a component
// eslint-disable-next-line react/prop-types
function CommandCopy({txt,children, btnTxt="Copy", color="black"}) {
const [datatip,setDataTip]=useState(btnTxt);
 

  function copyToClipBoard() {
    if (!navigator.clipboard){
        console.log("Clipboard API not supported")
        return;
    }
    
    navigator.clipboard.writeText(txt)
        .then(()=>{console.log("Copied to Clipboard, ",datatip);setDataTip("Copied");})
        .catch((err) => {
            console.error("Failed to copy to clipboard",err)      
  })
  }
  function handleCopy2Clipboard() {
    copyToClipBoard();
  }
  return (
    <div className='tooltip' data-tip={datatip}>
    <button className="m-2 btn btn-xs btn-ghost " onClick={handleCopy2Clipboard}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" color="white" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
         {children}
    </button>
    </div>
    )
}
// @TODO AA  */

export default function MyComponent() {
  const [data, setData] = useState([]);
  const {model,messages, prompt} = useLoaderData(); // (2) - client data
  const md = new MarkdownIt();
  const responseRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [memory,setMemory] = useState(hasMemory());

  function handleClick() {
    abort();
    navigate(location.pathname)
  }
  useEffect(() => {
    const fetchData = async () => {

      if (prompt==='') return;
      const response = await chat(model,messages,true);
      const reader = response.body.getReader();
      const readChunk = async () => {
        const { done, value } = await reader.read();
        if (done) return;
        const chunk = new TextDecoder().decode(value);
        setData(prevData => [...prevData, JSON.parse(chunk)]);
        readChunk(); // Call itself recursively to read the next chunk
      };

      readChunk();
    };

    fetchData();
  }, []);

  function handleForget() {
    saveToMemory([]);
    setMemory(hasMemory()); // update state variable
    navigate(location.pathname);
  }

  
  // return sum of first n strings from a json chunks as result, stats and if done
  function sumStr(data,content=prompt) {
    let ret_val="";
    let stats;
    const last = data.length-1
    const done = data[last]?.done ? true : false
    
    // collect content from chunks
    for (let i=0;i<last;i++) {
        ret_val = ret_val + data[i]?.message?.content
    }
    // collect stats
    if (data[last]?.done) {
      stats= data[last]
      //console.log("Last Chunk ",stats)
      // write to memory
      const memory = [{role:'user',content},{role:'assistant',content:ret_val}]
      saveToMemory(memory);
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
  //console.log(isInferencing,isEvaluating)
  return (
    <div className='pt-12  text-2xl text-wrap'> 
        {prompt.length?
        <div className='ml-4 mr-4 '>
          <Bubble className="mt-10 ml-10 bg-blue-200 rounded-lg" 
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
        {((!done || !isInferencing)&& memory)?<button className='btn btn-circle btn-neutral fixed bottom-24 right-24' onClick={handleForget}><New/></button>:""}
       
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
          <Prompt></Prompt>
    </div>
  );
}

