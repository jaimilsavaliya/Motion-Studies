import {useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Pause,Play,RotateCcw} from 'lucide-react';
import GradientASCII from '../components/GradientASCII';
import {parseGradientAsciiQuery} from '../library/gradientAsciiConfig';
import './GradientASCIIPreview.css';

export default function GradientASCIIPreview(){
 const [query]=useSearchParams();const config=parseGradientAsciiQuery(query);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>setReduced(media.matches);media.addEventListener('change',changed);return()=>media.removeEventListener('change',changed);},[]);
 const [paused,setPaused]=useState(config.paused),[version,setVersion]=useState(0);
 useEffect(()=>{document.title='Gradient ASCII — Live preview';},[]);
 useEffect(()=>{setPaused(config.paused);},[config.paused]);
 return <main className="ms-ascii-preview" data-light={config.lightMode}>
  <GradientASCII key={version} {...config} paused={paused} style={{position:'absolute',inset:0}}/>
  {!query.has('embed')&&<a className="ga-preview-back" href="/components/gradient-ascii">↖ Back to component</a>}
  {config.showContent&&<div className="ga-demo-content"><span>CHARACTER IN EVERY DETAIL</span><h1>A little light.<br/>A lot of character.</h1><p>A living texture for your next idea.</p><a href="/components" target="_top">Explore the collection <span aria-hidden="true">↗</span></a></div>}
  <div className="ga-preview-footer"><div className="ga-preview-controls"><button type="button" onClick={()=>setPaused(value=>!value)} aria-label={paused?'Resume animation':'Pause animation'}>{paused?<Play size={13} aria-hidden="true"/>:<Pause size={13} aria-hidden="true"/>}{paused?'Resume':'Pause'}</button><button type="button" onClick={()=>{setVersion(v=>v+1);setPaused(config.paused);}} aria-label="Restart animation"><RotateCcw size={13} aria-hidden="true"/></button></div><span>{reduced?'REDUCED MOTION · STATIC FIELD':<>MOVE TO SCRAMBLE · CLICK TO {config.clickEffect==='burst'?'BURST':config.clickEffect==='none'?'EXPLORE':'RIPPLE'}</>}</span></div>
 </main>;
}
