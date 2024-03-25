
import type { MetaFunction } from "@remix-run/node";
import { json, useFetcher, useLoaderData, useNavigate,  } from "@remix-run/react";
import { getCurrentModel, getModelNames, getModels,removeMemory,saveToMemory,setCurrentModel  } from "~/llmapi/llama";
import clsx from "clsx";

export const meta: MetaFunction = () => {
  return [
    { title: "Ollama2Go" },
    { name: "description", content: "Welcome to Ollama2Go - a local LLM App" },
  ];
};

export  async function clientLoader() {
  // STEP 1 : Check if ollama is running
  let response
  try {
       response = await fetch("http://localhost:11434/");
  }
  catch(e) {
    console.log("Ollama not running")
    //clear localStorage to ensure fresh data
    localStorage.clear();
    return json({result:null,models:null,currentModel:null,error:"Ollama not Running locally"})
  }
  // STEP 2: Get models
  const result = await response.text()//"Ollama is Running"
  const models =  await getModels();
  const currentModel = getCurrentModel();

  if (models) {
    return json({result,models,currentModel,error:null});
  } else {
    return json({result:null,models:null,currentModel:null,error:"Cannot find Models"})
  }

}


// Create a table of model
// @TODO expand to get details by hot linking rows which when clicked provides details
function Models({modelnames, currentModel}) {
 const navigate = useNavigate();
  function onClick(e) {
    console.log("onClick ",e.target.innerHTML);
    setCurrentModel(e.target.innerHTML);
    // clear all context and memory
    removeMemory("context")
    removeMemory("memory")
    navigate("/chat");
  }
    return (
      <div className="flex flex-col items-center z-10">
        <table className="m-10 text-2xl text-gray-800 text-left no-underline ">
          <thead>
            <tr>
              
              <th className="pl-4">Select your Model</th>
            </tr>
          </thead>
          <tbody>
            {modelnames?.map((model, index) => (
              <tr key={index}>
                <td className={clsx("pl-4 pr-4 rounded-lg", model.includes(currentModel)? " text-white bg-black ":"hover:bg-gray-200")}  onClick={onClick}>{model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

export default function Index() {
    const {result,models,currentModel,error} = useLoaderData();





return (<div className="p-10 text-2xl  text-center">
            <ul>
            <li>
                {result?
                  <div className="toast toast-center toast-bottom">
                    <div className="alert alert-success">
                      <span className="">{result}</span>
                    </div>
                  </div>
                :
                <div className="toast toast-center toast-bottom">
                  <div className="alert alert-error">
                  <span className="">{error}</span>
                  </div>
                </div>}
            </li>
            <li className="text-center">
            {models
                ?<Models modelnames={getModelNames()}  currentModel={currentModel}></Models>
                :""}
            </li>
            </ul>
        </div>
        )
}