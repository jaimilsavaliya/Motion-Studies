import {useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import TechText from '../components/TechText';
import {parseTechTextQuery} from '../library/techTextConfig';
import './TechTextPreview.css';
export default function TechTextPreview(){
 const[query]=useSearchParams(),config=parseTechTextQuery(query),[paused,setPaused]=useState(config.paused);
 useEffect(()=>{document.title='Tech Text — Live preview';},[]);
 useEffect(()=>{setPaused(config.paused);},[config.paused]);
 return <main className="ms-tech-text-preview">
  <TechText {...config} paused={paused}/>
  {!query.has('embed')&&<a className="tt-preview-back" href="/components/tech-text">↖ Back to component</a>}
  <button className="tt-preview-pause" aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?'Resume motion':'Pause motion'}</button>
 </main>;
}
