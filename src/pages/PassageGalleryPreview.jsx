import {useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import PassageGallery from '../components/PassageGallery';
import {parsePassageGalleryQuery,passageGalleryItems} from '../library/passageGalleryConfig';
import './PassageGalleryPreview.css';
export default function PassageGalleryPreview(){
 const[query]=useSearchParams(),config=parsePassageGalleryQuery(query),items=passageGalleryItems(config.scenes);
 const stage=useRef(null),[readout,setReadout]=useState({travel:0,speed:0,phase:'cruising',focus:null});
 useEffect(()=>{document.title='Passage Gallery — Live preview';},[]);
 useEffect(()=>{stage.current?.reset();},[config.scenes.join(','),config.lanes,config.seed,config.paused]);
 const reset=()=>{stage.current?.reset();setReadout({travel:0,speed:0,phase:'cruising',focus:null});};
 const speedUp=()=>stage.current?.travel(config.lanes*2);
 const backUp=()=>stage.current?.travel(-config.lanes*2);
 return <main className="pg-preview" style={{background:config.backgroundColor==='transparent'?'#120f17':config.backgroundColor}}>
  <div className="pg-preview-holder">
   <PassageGallery {...config} ref={stage} items={items} ariaLabel={config.ariaLabel} onFocusChange={(item,index)=>setReadout(current=>({...current,focus:item?{title:item.title||item.alt,index}:null}))}>
    {!query.has('embed')?<>
     <span className="pg-preview-eyebrow">Study 024 <i aria-hidden="true">/</i> Passage Gallery</span>
     <h2>Walk the corridor</h2>
     <p>Hold to speed up. Click a photo to bring it forward.</p>
    </>:null}
   </PassageGallery>
  </div>
  {!query.has('embed')&&<a className="pg-preview-back" href="/components/passage-gallery">↖ Back to component</a>}
  <div className="pg-preview-readout">
   <span aria-hidden="true" data-phase={readout.phase} data-focus={readout.focus?readout.focus.index:''}>
    {readout.focus?`${readout.focus.title} · ${readout.focus.index+1}/${items.length}`:'travelling'}
   </span>
   <button type="button" onClick={backUp} aria-label="Travel back two cells">◀</button>
   <button type="button" onClick={speedUp} aria-label="Travel forward two cells">▶</button>
   <button type="button" onClick={reset}>Reset tour</button>
  </div>
 </main>;
}
