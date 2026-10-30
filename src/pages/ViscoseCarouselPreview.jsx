import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import ViscoseCarousel from '../components/ViscoseCarousel';
import './ViscoseCarouselPreview.css';

export default function ViscoseCarouselPreview(){
 const [query]=useSearchParams();
 const embedded=query.has('embed');
 useEffect(()=>{document.title='Viscose Carousel — Live preview';},[]);
 return <main className="viscose-preview">
  <ViscoseCarousel />
  {!embedded&&<><a className="viscose-preview__back" href="/components/viscose-carousel">↖ Back to component</a><div className="viscose-preview__actions"><span>Original Viscose runtime</span><button type="button" onClick={()=>window.location.reload()}>Restart entry</button></div></>}
 </main>;
}
