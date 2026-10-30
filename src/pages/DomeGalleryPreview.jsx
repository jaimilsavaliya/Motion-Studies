import {useEffect,useRef} from 'react';
import {useSearchParams} from 'react-router-dom';
import DomeGallery from '../components/DomeGallery';
import {domeGalleryItems,parseDomeGalleryQuery} from '../library/domeGalleryConfig';
import './DomeGalleryPreview.css';

export default function DomeGalleryPreview(){
 const [query]=useSearchParams();
 const config=parseDomeGalleryQuery(query);
 const gallery=useRef(null);
 useEffect(()=>{document.title='Dome Gallery — Live preview';},[]);
 return <main className="dg-preview" style={{background:config.overlayBlurColor}}>
  <DomeGallery ref={gallery} {...config} images={domeGalleryItems(config.scenes)} ariaLabel="Dome Gallery. Drag the image dome and select a scene to enlarge it."/>
  {!query.has('embed')&&<><a className="dg-preview-back" href="/components/dome-gallery">↖ Back to component</a><div className="dg-preview-controls"><span>Drag to rotate</span><button type="button" onClick={()=>gallery.current?.reset()}>Reset view</button></div></>}
 </main>;
}
