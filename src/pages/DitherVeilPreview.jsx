import {useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import DitherVeil from '../components/DitherVeil';
import {parseDitherVeilQuery} from '../library/ditherVeilConfig';
import './DitherVeilPreview.css';
export default function DitherVeilPreview(){
 const [query]=useSearchParams(),config=parseDitherVeilQuery(query);
 const [paused,setPaused]=useState(config.paused);
 useEffect(()=>{document.title='Dither Veil — Live preview';},[]);
 useEffect(()=>{setPaused(config.paused);},[config.paused]);
 return <main className="ms-dither-veil-preview" style={{background:config.inkColor}}>
  <DitherVeil {...config} paused={paused}/>
  {!query.has('embed')&&<a className="dv-preview-back" href="/components/dither-veil">↖ Back to component</a>}
  {config.wander&&<button className="dv-preview-pause" onClick={()=>setPaused(value=>!value)} aria-pressed={paused}>{paused?'Resume wandering':'Pause wandering'}</button>}
 </main>;
}
