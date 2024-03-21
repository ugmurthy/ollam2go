/* eslint-disable react/display-name */

import clsx from 'clsx';
import MarkdownIt from 'markdown-it';
import parse from 'html-react-parser'
import { forwardRef, useEffect } from 'react';

//function Component({children ,className, imgurl,tooltip,status, progress_type="",me=true}) {
const Component = forwardRef(({children ,className, promptClass, imgurl,tooltip,pendingStatus, progress_type, me=true},ref) => {
  
  const classes = clsx("z-0 mt-4  bg-slate-100 text-pretty p-2 shadow-lg",className);
  //const copyRef = useRef();
  const pClass = clsx("m-2 leading-relaxed text-xl font-thin overflow-hidden",promptClass);
  const iurl= imgurl ? imgurl : me ? "/human.png":"/llmBot.png"
  const progress = clsx("progress w-full fixed top-0 z-10",progress_type)
  const md = new MarkdownIt()
  const parsedHTML = parse(md.render(children))
  //console.log("pending status ",pendingStatus, progress_type)
  useEffect(()=>{ // scrolls down on every render.
    if (ref!=null && ref.current) {
      //console.log("Scroll Dn",ref.current)
      //ref.current.scrollTop = ref.current.scrollHeight;
      ref.current.scrollIntoView(false);

    }
  });

  //<span className="fixed  top-0 left-80 z-20  loading loading-bars loading-lg"></span>
  //<span className="loading loading-bars loading-lg"></span>
  //
  return (
    
    <div className={classes}>
      <div>{pendingStatus ?<progress className={progress}></progress>:""}</div>
  <div className="flex flex-row">
      <div className="flex-none text-center rounded tooltip" data-tip={tooltip}><img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={iurl} alt=""/>
      </div>
      <div className={pClass} ref={ref} >
      {parsedHTML}
      </div>
      
  </div>
  
</div>
  )
})

export default Component