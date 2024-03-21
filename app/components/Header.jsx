import  { useState, useRef } from 'react';
import {getCurrentModel, getModelNames, setCurrentModel} from '../llmapi/llama'
import { Form, useLocation } from '@remix-run/react';



const Component = () => {
    const formRef = useRef(null);
    const [model, setModel] = useState(getCurrentModel());
    if (!setCurrentModel(model)) console.log("Error : Cannot set current model (Header.jsx), model : ",model)
    //localStorage.setItem("currentModel",model);
    let models =  getModelNames();
    const location = useLocation();
    //console.log("Location ",location.pathname)
    if (!models) models = ['Models Missing'];
    //console.log("models ",models)
    function handleChange(e) {
        setModel(e.target.value);
        formRef.current.submit();
    }

  return (
    <div className="fixed left-1/2 top-0 m-0 h-20 w-11/12 -translate-x-1/2 transform rounded-lg bg-slate-100">
        <div className='pt-2 flex flex-row  justify-between items-center'>
        <Form ref={formRef} action={location.pathname} >
            <select 
                className=" text-2xl pt-1 pb-1 px-6 select select-bordered select-lg w-80 max-w-xs" 
                value={model} 
                onChange={handleChange}
            >
                {models?.map((m,index) => (
                    <option key={index} value={m}>
                    {m}
                    </option>
                ))}
            </select>
        </Form>
        <div className='text-6xl font-extrabold w-80'>
            <span className="text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-700  to-violet-700 ">Ollama2Go</span>
        </div>
        <div className='p-4 text-xl w-80 text-right font-thin'>v0.1 7Mar2024</div>
      </div>
      </div>
  );
};

export default Component;
