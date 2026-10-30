import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, Code2, Copy, Maximize2, Minimize2, Pause, Play, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import ScrollZoomReveal from '../components/ScrollZoomReveal';
import componentSource from '../components/ScrollZoomReveal.jsx?raw';
import componentCSS from '../components/ScrollZoomReveal.css?raw';
import '../styles.css';

const usage = `import ScrollZoomReveal from './ScrollZoomReveal';\n\nexport default function Hero() {\n  return (\n    <ScrollZoomReveal\n      leading="Above"\n      trailing="the shoreline"\n      radius={24}\n      scrollDistance={200}\n    >\n      <video\n        src="/coast.mp4"\n        autoPlay\n        muted\n        loop\n        playsInline\n      />\n    </ScrollZoomReveal>\n  );\n}`;
export default function OriginalDemo() {
  const [progress,setProgress] = useState(0);
  const [focus,setFocus] = useState(false);
  const [paused,setPaused] = useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [settings,setSettings] = useState(false);
  const [radius,setRadius] = useState(24);
  const [distance,setDistance] = useState(200);
  const [code,setCode] = useState(false);
  const [tab,setTab] = useState('Usage');
  const [copied,setCopied] = useState(false);
  const video = useRef(null), dialog = useRef(null), codeButton = useRef(null);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollTo = (top) => window.scrollTo({top,behavior: reduced ? 'instant' : 'smooth'});
  const replay = () => scrollTo(0);
  const togglePlay = () => { if (video.current.paused) { video.current.play().then(()=>setPaused(false)).catch(()=>{}); } else {video.current.pause();setPaused(true);} };
  useEffect(()=>{ const key = (e)=>{if(e.key==='Escape'){setFocus(false);setSettings(false);}}; window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key); },[]);
  useEffect(()=>{ if(code) {dialog.current.showModal();document.body.style.overflow='hidden';} else {dialog.current.close();document.body.style.overflow='';} return()=>{document.body.style.overflow='';}; },[code]);
  const closeCode = ()=>{setCode(false);codeButton.current?.focus();};
  const text = tab === 'Usage' ? usage : tab === 'Component' ? componentSource : componentCSS;
  const copy = async()=>{try {await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000);} catch {setCopied(false);} };
  const step = progress < 0.12 ? '01' : progress < 0.92 ? '02' : '03';
  return <>
    <header className={`site-header ${focus?'is-hidden':''}`}>
      <a href="#" onClick={(e)=>{e.preventDefault();replay();}} className="brand" aria-label="Motion Studies, back to start"><span className="brand-mark"><i/><i/><i/></span><span>Motion studies<span className="brand-period">®</span></span></a>
      <div className="header-center"><span className="live-dot"/>INTERACTION NO. 001</div>
      <button ref={codeButton} className="code-button" onClick={()=>setCode(true)}><Code2 size={15}/><span>View code</span><ArrowUpRight size={14}/></button>
    </header>
    <main>
      <ScrollZoomReveal radius={radius} scrollDistance={distance} onProgress={setProgress}>
        <video ref={video} src="/coast.mp4" poster="/coast-poster.jpg" autoPlay={!paused} muted loop playsInline preload="auto" aria-label="Aerial film of waves breaking on a rocky shoreline"/>
      </ScrollZoomReveal>
      <div className={`intro-label ${focus?'is-hidden':''}`} style={{opacity:Math.max(0,1-progress*5)}}><span>SCROLL ZOOM REVEAL</span><div className="label-line"/><span className="subtle">A study in perspective.</span></div>
    </main>
    <aside className={`side-index ${focus?'is-hidden':''}`} aria-label="Reveal stages">
      {['Inline','Expand','Immerse'].map((s,i)=><button key={s} className={Number(step)===i+1?'active':''} onClick={()=>scrollTo((distance/100)*window.innerHeight*[0,.44,.9][i])} aria-label={`Go to ${s.toLowerCase()} stage`} title={s}><span>{s}</span><i/></button>)}
    </aside>
    <footer className={`site-footer ${focus?'is-hidden':''}`}>
      <div className="footer-top">
        <div className="experiment-label"><span className="eyebrow">THE INTERACTION</span><span>Small moment. Full perspective.</span></div>
        <button className="scroll-prompt" onClick={()=>progress>.94?replay():scrollTo(window.scrollY+window.innerHeight*.65)}><span className="arrow-shell">{progress>.94?<ArrowUp size={17}/>:<ArrowDown size={17}/>}</span><span>{progress>.94?'Scroll back to begin again':'Scroll to see the bigger picture'}</span></button>
        <div className="controls">
          <button className="icon-button" onClick={togglePlay} aria-label={paused?'Play video':'Pause video'} title={paused?'Play video':'Pause video'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>
          <button className="icon-button" onClick={replay} aria-label="Reset scroll" title="Replay"><RotateCcw size={15}/></button>
          <div className="settings-anchor"><button className={`icon-button ${settings?'selected':''}`} onClick={()=>setSettings(!settings)} aria-label="Adjust reveal" aria-expanded={settings} title="Adjust reveal"><SlidersHorizontal size={15}/></button>
            {settings&&<div className="settings-panel"><div className="panel-title">Make it yours<button className="icon-button" onClick={()=>setSettings(false)} aria-label="Close settings"><X size={14}/></button></div><label htmlFor="radius">Corner radius <span>{radius}px</span></label><input id="radius" type="range" min="0" max="48" value={radius} onChange={e=>setRadius(Number(e.target.value))}/><label htmlFor="distance">Scroll distance <span>{distance}vh</span></label><input id="distance" type="range" min="100" max="400" step="25" value={distance} onChange={e=>setDistance(Number(e.target.value))}/><button className="reset-settings" onClick={()=>{setRadius(24);setDistance(200);}}>Reset to defaults <RotateCcw size={12}/></button></div>}
          </div>
          <span className="control-divider"/><button className="icon-button" onClick={()=>setFocus(true)} aria-label="Enter focus mode" title="Focus mode"><Maximize2 size={15}/></button>
        </div>
      </div>
      <div className="progress-track"><div style={{transform:`scaleX(${progress})`}}/></div>
      <div className="footer-bottom"><span>EXPLORATIONS IN MOTION</span><span className="stage-label">{step}<span className="slash"> / </span>03 <span className="stage-name">{step==='01'?'INLINE':step==='02'?'EXPAND':'IMMERSE'}</span></span><span className="progress-number">{String(Math.round(progress*100)).padStart(3,'0')}<span> %</span></span></div>
    </footer>
    {focus&&<button className="exit-focus icon-button" onClick={()=>setFocus(false)} aria-label="Exit focus mode" title="Exit focus mode (Esc)"><Minimize2 size={18}/></button>}
    <dialog ref={dialog} className="code-dialog" onCancel={closeCode} onClick={e=>{if(e.target===dialog.current)closeCode();}}>
      <div className="dialog-content"><div className="dialog-heading"><div><span className="eyebrow">THE COMPONENT</span><h2>Scroll Zoom Reveal</h2></div><button className="icon-button" onClick={closeCode} aria-label="Close code"><X size={20}/></button></div><p className="dialog-description">From a small detail to the whole picture.<br/>Built with React. No animation dependencies.</p><div className="code-tabs" role="tablist">{['Usage','Component','CSS'].map(t=><button key={t} role="tab" aria-selected={tab===t} onClick={()=>{setTab(t);setCopied(false);}} className={tab===t?'active':''}>{t}</button>)}<button className="copy-button" onClick={copy}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?'Copied':'Copy'}</button></div><pre tabIndex="0"><code>{text}</code></pre><div className="code-note"><span className="live-dot"/> Responsive · Reversible · Reduced-motion aware</div></div>
    </dialog>
  </>;
}

