import {scrollExpandPresets} from '../components/ScrollExpand';

// Demo media is generated in-house for this study; the reusable core ships without assets.
export const scrollExpandMedia=[
 ['sunrise','Sunrise ridge','/scroll-expand/sunrise-ridge.webp','image','A layered mountain range under a bright sun'],
 ['dusk','Dusk skyline','/scroll-expand/dusk-skyline.webp','image','A skyline of lit towers against a dusk sky'],
 ['drift','Sunrise drift (video)','/scroll-expand/sunrise-drift.webm','video','A slow drift across a layered mountain range'],
 ['custom','Custom URL','','image','']
];
export const scrollExpandDefaults={preset:'frame',media:'sunrise',src:'',mediaType:'image',alt:'A layered mountain range under a bright sun',title:'Built to scale',scrollHint:'Scroll inside the frame',focusPoint:'50% 50%',overlayTitle:'Every pixel, everywhere',overlayText:'The frame opens up as you scroll and hands the whole stage to your media.',background:'#120f17',height:520,enabled:true,stageHeight:520,...scrollExpandPresets.frame};
// Demo stage heights keep each preset's proportions when it is selected in the playground.
export const scrollExpandPresetHeights={frame:520,cinematic:560,window:720,paper:480};
export const scrollExpandRanges=[['height','Stage height',320,900,10,'px'],['startWidth','Start width',10,100,1,'%'],['startHeight','Start height',10,100,1,'%'],['startRadius','Start radius',0,48,1,'px'],['endRadius','End radius',0,48,1,'px'],['mediaZoom','Media zoom',1,2.5,.05,'×'],['scrollDistance','Scroll distance',.4,3,.05,'×'],['holdDistance','Hold distance',0,1.5,.05,'×'],['smoothing','Smoothing',0,.4,.01,'s'],['overlayScrim','Overlay scrim',0,1,.05,'']];
export const scrollExpandSwitches=[['enabled','Enabled'],['useWindowScroll','Page scroll']];
export const scrollExpandTargets=[['scroller','Frame scroller'],['window','Page scroll'],['custom','Custom URL']];
export function resolveScrollExpandMedia(config){
 const entry=scrollExpandMedia.find(([key])=>key===config.media);
 if(!entry||config.media==='custom')return{src:config.src,mediaType:config.mediaType,alt:config.alt};
 const[,label,src,mediaType,alt]=entry;
 return{src,mediaType,alt:config.alt||alt};
}
export function parseScrollExpandQuery(query){
 const preset=Object.hasOwn(scrollExpandPresets,query.get('preset'))?query.get('preset'):'frame';
 const c={...scrollExpandDefaults,...scrollExpandPresets[preset],preset,height:scrollExpandPresetHeights[preset]??scrollExpandDefaults.height};
 for(const[key,,min,max]of scrollExpandRanges)if(query.has(key)&&query.get(key).trim()!==''){const n=Number(query.get(key));if(Number.isFinite(n))c[key]=Math.max(min,Math.min(max,n));}
 for(const[key]of scrollExpandSwitches)if(query.has(key))c[key]=query.get(key)==='true';
 if(scrollExpandMedia.some(([key])=>key===query.get('media')))c.media=query.get('media');
 if(['image','video'].includes(query.get('mediaType')))c.mediaType=query.get('mediaType');
 for(const key of['title','scrollHint','alt','overlayTitle','overlayText','src'])if(query.has(key))c[key]=query.get(key).slice(0,320);
 if(query.has('focusPoint')&&/^[\w.%#(), -]{1,60}$/.test(query.get('focusPoint')))c.focusPoint=query.get('focusPoint');
 if(/^#[0-9a-f]{6}$/i.test(query.get('background')||''))c.background=query.get('background');
 if(c.media==='custom'){c.src=typeof c.src==='string'?c.src:'';if(query.has('mediaType'))c.mediaType=query.get('mediaType');}
 return c;
}
export function scrollExpandUsage(config){
 const media=resolveScrollExpandMedia(config);
 const values={title:config.title,scrollHint:config.scrollHint,startWidth:config.startWidth,startHeight:config.startHeight,startRadius:config.startRadius,endRadius:config.endRadius,mediaZoom:config.mediaZoom,scrollDistance:config.scrollDistance,holdDistance:config.holdDistance,smoothing:config.smoothing,overlayScrim:config.overlayScrim,useWindowScroll:config.useWindowScroll,focusPoint:config.focusPoint};
 const lines=Object.entries(values).map(([key,value])=>`        ${key}={${JSON.stringify(value)}}`).join('\n');
 const mediaProps=media.mediaType==='video'?`        mediaType="video"\n        src="${media.src}"\n        poster="${config.poster||''}"`:`        src="${media.src}"\n        alt="${media.alt}"`;
 return `'use client';

import ScrollExpand from './components/ScrollExpand';

export default function MediaStage() {
  return (
    <section style={{height:'100vh'}}>
      <ScrollExpand
${mediaProps}
${lines}
        onProgress={({phase}) => console.log(phase)}
      >
        <h2>${config.overlayTitle}</h2>
        <p>${config.overlayText}</p>
      </ScrollExpand>
    </section>
  );
}`;
}
