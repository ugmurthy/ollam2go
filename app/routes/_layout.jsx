

import { Outlet } from '@remix-run/react';
//import Header from '../components/Header'
import {APPBASE,getCurrentModel} from '../llmapi/llama';

export default function Component() {
    //const [model, setModel] = useState('Model 1');
const version = 'Version 0.11 19/Mar/24'
function Menu() {
  
  const links = [ 
    [APPBASE,"Models"],
    [APPBASE+"chat","Chat"],
    //[APPBASE+"Generate","Generate"],
    //[APPBASE+"oai/chat","OAI Chat"]
]

  return (
    
    <> {links.map((link,i)=>(
      <li key={i} ><a href={link[0]}>{link[1]}</a></li>
    ))}
    </>
  )
}    

/*
</>
      <li><a href={links[0][0]}>{links[0][1]}</a></li>
      <li><a href={links[1][0]}>{links[1][1]}</a></li>
      <li><a href={links[2][0]}>{links[2][1]}</a></li>
      <li><a href={links[3][0]}>{links[3][1]}</a></li> 
    </>
*/

  return (<>
    <div className="fixed top-0 drawer z-10 ">
    <input id="my-drawer-3" type="checkbox" className="drawer-toggle" /> 
    <div className="drawer-content flex flex-col">
      {/* Navbar */}
      <div className="w-full navbar bg-yellow-50">
        <div className="flex-none lg:hidden">
          <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </label>
        </div> 
        <div className="flex-1 px-2 mx-2">
            <div className='text-4xl font-extrabold w-100'>
                <span className="text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-900  to-violet-900">Ollama2Go</span>
            </div>
        </div>
        <div className="flex-none hidden lg:block">
          <ul className="menu menu-horizontal text-xl">
            <Menu/>
          </ul>
        </div>
      </div>
      {/*non scrollable content if needed */}
    </div> 
    <div className="drawer-side">
      <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label> 
      <ul className="menu text-xl p-4 w-80 min-h-full bg-yellow-50">
        {/* Sidebar content here */}
        
        <Menu/>
        <li className="fixed bottom-0 left-6 text-sm font-thin text-blue-800">{version}</li>
      </ul>
    </div>
  </div>
  <Outlet/>
  <div className='fixed bottom-0'>
  </div>
  </>
  );
}


