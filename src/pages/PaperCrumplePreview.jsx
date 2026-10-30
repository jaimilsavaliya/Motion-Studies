import {useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import PaperCrumple from '../components/PaperCrumple';
import {paperCrumpleSources,parsePaperCrumpleQuery} from '../library/paperCrumpleConfig';
import './PaperCrumplePreview.css';

export default function PaperCrumplePreview(){
 const [query]=useSearchParams();
 const config=parsePaperCrumpleQuery(query);
 const {src,backSrc,alt}=paperCrumpleSources(config);
 const paper=useRef(null);
 const [motion,setMotion]=useState({state:'flat',holding:false});
 useEffect(()=>{document.title='Paper Crumple — Live preview';},[]);
 const embedded=query.has('embed');
 return <main className="pc-preview">
  <PaperCrumple ref={paper} {...config} src={src} backSrc={backSrc} alt={alt} style={{height:'100%'}} onStateChange={setMotion}/>
  {!embedded&&<><a className="pc-preview-back" href="/components/paper-crumple">↖ Back to component</a><div className="pc-preview-controls"><span>{motion.holding?'Crumpling…':motion.state==='crumpled'?'Held as a fold':'Hold to crumple'}</span><button type="button" onClick={()=>paper.current?.reset()}>Reset sheet</button></div></>}
 </main>;
}
