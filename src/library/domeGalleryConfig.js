import {domeGalleryDefaults as coreDefaults} from '../components/DomeGallery';

export const domeGalleryScenes=[
 ['amber-portal','Amber portal','/dome-gallery/scenes/amber-portal.webp','An amber portal cut into a dark red plane'],
 ['blue-alcove','Blue alcove','/dome-gallery/scenes/blue-alcove.webp','A cool blue alcove with layered geometric forms'],
 ['coral-window','Coral window','/dome-gallery/scenes/coral-window.webp','A coral window with a round glowing centre'],
 ['night-bloom','Night bloom','/dome-gallery/scenes/night-bloom.webp','A pale bloom hovering over nocturnal water'],
 ['olive-ridge','Olive ridge','/dome-gallery/scenes/olive-ridge.webp','An olive mountain ridge beneath a high sun'],
 ['orchid-figure','Orchid figure','/dome-gallery/scenes/orchid-figure.webp','An orchid-toned abstract figure'],
 ['plum-archive','Plum archive','/dome-gallery/scenes/plum-archive.webp','A stack of plum arches and gold light']
];

export function domeGalleryItems(selected){
 const keys=Array.isArray(selected)&&selected.length?selected:domeGalleryScenes.map(([key])=>key);
 return keys.map(key=>domeGalleryScenes.find(([name])=>name===key)).filter(Boolean).map(([,title,src,alt])=>({src,alt,title}));
}

export const domeGalleryDefaults={
 scenes:domeGalleryScenes.map(([key])=>key),
 fit:.8,
 fitBasis:'auto',
 minRadius:600,
 maxRadius:1200,
 padFactor:.25,
 overlayBlurColor:'#120F17',
 maxVerticalRotationDeg:0,
 dragSensitivity:20,
 enlargeTransitionMs:300,
 segments:34,
 dragDampening:2,
 openedImageWidth:'400px',
 openedImageHeight:'400px',
 imageBorderRadius:'30px',
 openedImageBorderRadius:'30px',
 grayscale:true
};

export const domeGalleryRanges=[
 ['fit','Fit',.5,1,.05,''],
 ['minRadius','Min radius',300,1000,25,'px'],
 ['maxVerticalRotationDeg','Max vertical rotation',0,20,1,'°'],
 ['segments','Segments',20,34,1,''],
 ['dragDampening','Drag dampening',0,5,.1,''],
 ['dragSensitivity','Drag sensitivity',4,50,1,''],
 ['padFactor','Pad factor',0,.45,.01,''],
 ['enlargeTransitionMs','Enlarge transition',0,1000,25,'ms']
];

const validBasis=['auto','min','max','width','height'];
const stringKeys=['overlayBlurColor','openedImageWidth','openedImageHeight','imageBorderRadius','openedImageBorderRadius'];
export function parseDomeGalleryQuery(query){
 const c={...domeGalleryDefaults};
 for(const [key,,min,max] of domeGalleryRanges)if(query.has(key)&&query.get(key).trim()!==''){
  const value=Number(query.get(key));if(Number.isFinite(value))c[key]=Math.max(min,Math.min(max,value));
 }
 if(validBasis.includes(query.get('fitBasis')))c.fitBasis=query.get('fitBasis');
 for(const key of stringKeys)if(query.has(key)&&query.get(key).trim())c[key]=query.get(key).trim().slice(0,80);
 if(query.has('grayscale'))c.grayscale=query.get('grayscale')!=='false';
 if(query.has('scenes')){
  const values=[...new Set(query.get('scenes').split(',').map(value=>value.trim()).filter(value=>domeGalleryScenes.some(([key])=>key===value)))];
  if(values.length)c.scenes=values;
 }
 return c;
}

export function domeGalleryUsage(config){
 const items=domeGalleryItems(config.scenes).slice(0,3).map(({src,alt})=>`  { src: '${src}', alt: '${alt}' }`).join(',\n');
 return `'use client';

import DomeGallery from './components/DomeGallery';

const images = [
${items},
];

export default function Gallery() {
  return (
    <div style={{ height: 520 }}>
      <DomeGallery
        images={images}
        fit={${config.fit}}
        minRadius={${config.minRadius}}
        maxVerticalRotationDeg={${config.maxVerticalRotationDeg}}
        segments={${config.segments}}
        dragDampening={${config.dragDampening}}
        grayscale={${config.grayscale}}
      />
    </div>
  );
}`;
}

export {coreDefaults};
