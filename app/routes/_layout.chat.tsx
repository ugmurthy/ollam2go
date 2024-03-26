import  { useState, useEffect, useRef } from 'react';
import {  type ClientLoaderFunctionArgs, useLoaderData, json, useLocation, useNavigate}from "@remix-run/react";

import { abort, chat, getCurrentModel, getFromMemory, hasMemory, saveToMemory } from "~/llmapi/llama";
import Prompt from "~/components/Prompt"
import Bubble from '~/components/Bubble';
import MarkdownIt from 'markdown-it';
import CommandCopy from '~/components/CommandCopy';
import Stop from '~/components/Stop';
import New from '~/components/New';
import {COMMANDS} from '~/llmapi/llama';

export async function clientLoader({request}:ClientLoaderFunctionArgs) {
  const url = new URL(request.url);
  //const model = url.searchParams.get('model') || "";
  const model = getCurrentModel();
  const prompt = url.searchParams.get('prompt') || "";
  const SET_SYSTEM = COMMANDS.SET_SYSTEM
  if (model==='' || prompt==='') return {model,messages:[],prompt};

  if (typeof prompt !== 'string' || !prompt ) {
    throw new Error("Please enter valid prompt")
  }
  let promptStr = prompt;
  if (prompt.includes(model)) {
    promptStr = prompt.substring(prompt.indexOf(">> "));
  }

  if (prompt.startsWith(SET_SYSTEM)) {
    // set System
    const _sys = prompt.substring(SET_SYSTEM.length)
    //console.log("System" ,_sys.length)
    if (_sys.length>2) {
      saveToMemory([{role:"system",content:_sys}],"system")
    } else
      saveToMemory([],"system")
    return {model:'',messages:[],prompt:''};
  }
  const system = getFromMemory("system");
  const memory = getFromMemory();
  const messages =[ ...system, ...memory, 
                    {role:"user",content:promptStr}
                  ]

return json({model, messages, prompt});
}
  
// Note: you do not have to set this explicitly - it is implied if there is no `loader`
clientLoader.hydrate = true;


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
        if (done) {
          setMemory(true) // in appropriate but for now useful
          return; //@TODO : do assemblign stuff here like what (sumStr) does 
        }
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

