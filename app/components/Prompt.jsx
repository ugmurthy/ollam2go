
import { getCurrentModel } from '../llmapi/llama'
import { useRef } from 'react';

// eslint-disable-next-line react/prop-types
function Component({method="GET",className="bg-gray-100"}) {
  const formRef = useRef()
  const currentModel = getCurrentModel();
  const modelStr = currentModel.includes(":latest")? currentModel.substring(0,currentModel.indexOf(":")):currentModel;
  function handleKeyPress(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      formRef.current.submit();
    }
  }
  return (
    <div className="bg-slate-200 ">
      <form method={method} ref={formRef} >
      <input name="model" type="text" hidden defaultValue={currentModel} />
      <textarea 
         name="prompt" 
         placeholder={"Ask "+modelStr+"..."} 
         className="p-2 shadow-2xl flex-grow fixed bottom-0 left-1/2 m-0 -translate-x-1/2 transform rounded-lg bg-slate-100 w-11/12 "
         onKeyUp={handleKeyPress}>
         </textarea>
      
      </form>
  
    </div>

  )
}

export default Component
// removed FORM button
// <button type="submit" className=" fixed bottom-5 right-24 w-10 h-10 shadow-lg text-2xl rounded-full bg-slate-300 drop-shadow-lg" >Go</button>