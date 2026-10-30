import {useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import ScrollExpand from '../components/ScrollExpand';
import {parseScrollExpandQuery,resolveScrollExpandMedia} from '../library/scrollExpandConfig';
import './ScrollExpandPreview.css';
export default function ScrollExpandPreview(){
 const[query]=useSearchParams(),config=parseScrollExpandQuery(query),media=resolveScrollExpandMedia(config);
 const stage=useRef(null),[progress,setProgress]=useState(0),[phase,setPhase]=useState('rest');
 useEffect(()=>{document.title='Scroll Expand — Live preview';},[]);
 useEffect(()=>{setProgress(0);setPhase('rest');},[config.media,config.src,config.useWindowScroll,config.scrollDistance,config.holdDistance]);
 const reset=()=>{
  if(config.useWindowScroll)window.scrollTo({top:0,behavior:'auto'});
  stage.current?.reset();
  setProgress(0);
  setPhase('rest');
 };
 return <main className={`ms-scroll-expand-preview ${config.useWindowScroll?'is-window':'is-scroller'}`} style={{background:config.background,'--se-stage':`${config.height}px`}}>
  <div className="se-preview-holder" style={config.useWindowScroll?undefined:{height:config.height}}>
   <ScrollExpand {...config} ref={stage} src={media.src} alt={media.alt} mediaType={media.mediaType} stageHeight={config.useWindowScroll?0:config.height} onProgress={({progress:value,phase:next})=>{setProgress(value);setPhase(next);}}>
    <h2>{config.overlayTitle}</h2>
    <p>{config.overlayText}</p>
   </ScrollExpand>
  </div>
  {!query.has('embed')&&<a className="se-preview-back" href="/components/scroll-expand">↖ Back to component</a>}
  <div className="se-preview-readout"><span aria-hidden="true" data-progress={progress.toFixed(3)} data-phase={phase}>{phase} · {Math.round(progress*100)}%</span><button type="button" onClick={reset}>Reset scroll</button></div>
 </main>;
}
