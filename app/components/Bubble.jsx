/* eslint-disable react/display-name */

import clsx from 'clsx';
import MarkdownIt from 'markdown-it';
import parse from 'html-react-parser'
import { forwardRef, useEffect } from 'react';
import hljs from 'highlight.js'

import { getFromMemory, hasMemory } from '../llmapi/llama'

const Component = forwardRef(({children ,className, promptClass, imgurl,tooltip,pendingStatus, progress_type, me=true},ref) => {
  
  const classes = clsx("z-0 mt-4  bg-slate-100 text-pretty p-2 shadow-lg",className);
  //const copyRef = useRef();
  const pClass = clsx("m-2 leading-relaxed text-xl font-thin overflow-hidden",promptClass);
  const iurl= imgurl ? imgurl : me ? "/human.png":"/llmBot.png"
  const progress = clsx("progress w-full fixed top-0 z-10",progress_type)
  const system = hasMemory("system") && !me;
  const systmeStr = system? getFromMemory('system')[0].content :""
  const md = new MarkdownIt({
    highlight: function (str) {
      let lang='javascript'
      //console.log(`Lang (${lang}) `,str);
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre><code class="hljs">' +
                 hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                 '</code></pre>';
        } catch (__) {/*empty*/}
      }
  
      return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    },
    html: true,
    linkify: true,
    typographer: true,
  })
  const parsedHTML = parse(md.render(children,"javascript"))
  //console.log("pending status ",pendingStatus, progress_type)
  useEffect(()=>{ // scrolls down on every render.
    if (ref!=null && ref.current) {
      //console.log("Scroll Dn",ref.current)
      //ref.current.scrollTop = ref.current.scrollHeight;
      ref.current.scrollIntoView({block:"end",behavior:"auto"});

    }
  });

  return (
    
    <div className={classes}>
      <div>{pendingStatus ?<progress className={progress}></progress>:""}</div>
  <div className="flex flex-row">
      <div className="flex flex-col text-center rounded">
          <div className='tooltip tooltip-right' data-tip={tooltip}><img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={iurl} alt=""/> </div>
          {system?<div className='badge badge-primary badge-xs tooltip tooltip-right tooltip-primary' data-tip={systmeStr}>system</div>:""}
      </div>
      <div className={pClass} ref={ref} >
      {parsedHTML}
      </div>

  </div>
  
</div>
  )
})

export default Component