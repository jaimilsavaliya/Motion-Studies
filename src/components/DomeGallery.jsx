'use client';

import React,{forwardRef,useCallback,useEffect,useId,useImperativeHandle,useMemo,useRef,useState} from 'react';
import './DomeGallery.css';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const number=(value,min,max,fallback)=>{
 const parsed=Number(value);
 return Number.isFinite(parsed)?clamp(parsed,min,max):fallback;
};
const cssSize=(value,fallback)=>{
 if(typeof value==='number'&&Number.isFinite(value))return `${Math.max(1,value)}px`;
 if(typeof value==='string'&&value.trim())return value.trim().slice(0,80);
 return fallback;
};
const fallbackPalettes=[['#2d1727','#e06d78','#ffddb2'],['#10213b','#4c84b8','#c5edf1'],['#30204a','#9f72c8','#f5ca83'],['#12342c','#5a957a','#e2e6a3'],['#2d1721','#a9584d','#fac095'],['#142431','#357d91','#bfebdf'],['#2c183a','#ba5f8e','#ffc5a9']];
const fallbackImages=fallbackPalettes.map((palette,index)=>{
 const [ink,mid,light]=palette;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${ink}"/><stop offset="1" stop-color="${mid}"/></linearGradient></defs><rect width="640" height="640" fill="url(#g)"/><circle cx="${150+index*38}" cy="${150+index*29}" r="110" fill="${light}" opacity=".8"/><path d="M0 540L260 ${220+index*10} 420 510 640 ${160+index*12}V640H0Z" fill="${ink}" opacity=".75"/><rect x="90" y="92" width="430" height="430" rx="48" fill="none" stroke="${light}" stroke-width="22" opacity=".7"/></svg>`;
 return {src:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,alt:`Abstract gallery study ${index+1}`};
});

export const domeGalleryDefaults={
 images:null,
 fit:.5,
 fitBasis:'auto',
 minRadius:600,
 maxRadius:Infinity,
 padFactor:.25,
 overlayBlurColor:'#120F17',
 maxVerticalRotationDeg:5,
 dragSensitivity:20,
 enlargeTransitionMs:300,
 segments:35,
 dragDampening:2,
 openedImageWidth:'400px',
 openedImageHeight:'400px',
 imageBorderRadius:'30px',
 openedImageBorderRadius:'30px',
 grayscale:true
};

function normaliseImages(value){
 const input=Array.isArray(value)?value:[];
 const images=input.map((item,index)=>{
  if(typeof item==='string')return{src:item.slice(0,2000),alt:`Gallery image ${index+1}`};
  if(item&&typeof item.src==='string')return{src:item.src.slice(0,2000),alt:typeof item.alt==='string'&&item.alt.trim()?item.alt.trim().slice(0,240):`Gallery image ${index+1}`};
  return null;
 }).filter(Boolean);
 return images.length?images.slice(0,64):fallbackImages;
}

function normalise(input){
 const source={...domeGalleryDefaults,...input};
 const basis=['auto','min','max','width','height'].includes(source.fitBasis)?source.fitBasis:'auto';
 const minRadius=number(source.minRadius,80,4000,domeGalleryDefaults.minRadius);
 const rawMax=Number(source.maxRadius);
 const maxRadius=Number.isFinite(rawMax)?clamp(rawMax,minRadius,8000):Infinity;
 return {
  images:normaliseImages(source.images),
  fit:number(source.fit,.1,2,domeGalleryDefaults.fit),
  fitBasis:basis,
  minRadius,
  maxRadius,
  padFactor:number(source.padFactor,0,.48,domeGalleryDefaults.padFactor),
  overlayBlurColor:typeof source.overlayBlurColor==='string'&&source.overlayBlurColor.trim()?source.overlayBlurColor.trim().slice(0,80):domeGalleryDefaults.overlayBlurColor,
  maxVerticalRotationDeg:number(source.maxVerticalRotationDeg,0,30,domeGalleryDefaults.maxVerticalRotationDeg),
  dragSensitivity:number(source.dragSensitivity,2,100,domeGalleryDefaults.dragSensitivity),
  enlargeTransitionMs:Math.round(number(source.enlargeTransitionMs,0,1600,domeGalleryDefaults.enlargeTransitionMs)),
  segments:Math.round(number(source.segments,12,64,domeGalleryDefaults.segments)),
  dragDampening:number(source.dragDampening,0,5,domeGalleryDefaults.dragDampening),
  openedImageWidth:cssSize(source.openedImageWidth,domeGalleryDefaults.openedImageWidth),
  openedImageHeight:cssSize(source.openedImageHeight,domeGalleryDefaults.openedImageHeight),
  imageBorderRadius:cssSize(source.imageBorderRadius,domeGalleryDefaults.imageBorderRadius),
  openedImageBorderRadius:cssSize(source.openedImageBorderRadius,domeGalleryDefaults.openedImageBorderRadius),
  grayscale:source.grayscale!==false
 };
}

function useSize(ref){
 const [size,setSize]=useState({width:0,height:0});
 useEffect(()=>{
  const node=ref.current;
  if(!node)return undefined;
  const measure=()=>{const box=node.getBoundingClientRect();setSize({width:Math.round(box.width),height:Math.round(box.height)});};
  measure();
  if(typeof ResizeObserver==='undefined')return undefined;
  const observer=new ResizeObserver(measure);observer.observe(node);
  return()=>observer.disconnect();
 },[ref]);
 return size;
}

function DomeGalleryBase({images,fit,fitBasis,minRadius,maxRadius,padFactor,overlayBlurColor,maxVerticalRotationDeg,dragSensitivity,enlargeTransitionMs,segments,dragDampening,openedImageWidth,openedImageHeight,imageBorderRadius,openedImageBorderRadius,grayscale,className='',style,ariaLabel='Dome image gallery'},ref){
 const rootRef=useRef(null),stageRef=useRef(null),tileRefs=useRef(new Map()),visualCacheRef=useRef(new Map()),inertiaRef=useRef(0),projectionFrameRef=useRef(0),rotationRef=useRef({x:0,y:0}),dragRef=useRef(null),suppressClickRef=useRef(0);
 const [dragging,setDragging]=useState(false);
 const [openIndex,setOpenIndex]=useState(null);
 const id=useId();
 const c=useMemo(()=>normalise({images,fit,fitBasis,minRadius,maxRadius,padFactor,overlayBlurColor,maxVerticalRotationDeg,dragSensitivity,enlargeTransitionMs,segments,dragDampening,openedImageWidth,openedImageHeight,imageBorderRadius,openedImageBorderRadius,grayscale}),[images,fit,fitBasis,minRadius,maxRadius,padFactor,overlayBlurColor,maxVerticalRotationDeg,dragSensitivity,enlargeTransitionMs,segments,dragDampening,openedImageWidth,openedImageHeight,imageBorderRadius,openedImageBorderRadius,grayscale]);
 const size=useSize(stageRef);

 // Keep the React tree still while the dome moves. The first version calculated a new
 // 196-card JSX layout on every pointer event, including a depth sort and DOM reorder.
 // Geometry now lives in stable descriptors; animation only writes the few visual
 // properties that change on a scheduled animation frame.
 const geometry=useMemo(()=>{
  const width=size.width,height=size.height;
  if(!width||!height)return null;
  const basis=c.fitBasis==='width'?width:c.fitBasis==='height'?height:c.fitBasis==='max'?Math.max(width,height):Math.min(width,height);
  const radius=clamp(basis*c.fit/Math.max(.52,1-c.padFactor),c.minRadius,c.maxRadius);
  const rows=7;
  const columns=clamp(Math.round(c.segments*.82),16,52);
  const xRadius=clamp(radius*.70,width*.44,width*1.05);
  const yRadius=clamp(radius*.58,height*.62,height*.86);
  const baseTile=clamp(height/(rows-.7),64,110);
  const tiles=[];
  for(let row=0;row<rows;row++){
   const rowNorm=rows===1?0:row/(rows-1)-.5;
   for(let column=0;column<columns;column++)tiles.push({key:`${row}-${column}`,rowNorm,column,columns,imageIndex:(column+row*3)%c.images.length});
  }
  return{width,height,radius,xRadius,yRadius,baseTile,tiles};
 },[c,size]);
 const projectTile=useCallback((tile,rotation=rotationRef.current)=>{
  if(!geometry)return null;
  const {width,height,xRadius,yRadius,baseTile}=geometry;
  const latitude=tile.rowNorm*2.06+rotation.y;
  const equator=Math.max(.06,Math.cos(latitude));
  const theta=(tile.column/tile.columns)*Math.PI*2+rotation.x+tile.rowNorm*.16;
  const depth=equator*Math.cos(theta);
  const front=clamp(depth,0,1);
  const scale=.42+.58*front;
  const narrowing=.12+.78*front;
  const x=width/2+Math.sin(theta)*xRadius*equator;
  const y=height/2+Math.sin(latitude)*yRadius*(.53+.47*front)+Math.sin(theta)*tile.rowNorm*10;
  const opacity=depth<-.03?0:.12+front*.88;
  const tilt=Math.sin(theta)*-12+tile.rowNorm*Math.sin(theta)*5;
  return{
   opacity,zIndex:Math.round((depth+1)*1000),interactive:front>.13&&Math.abs(y-height/2)<height*.68,
   transform:`translate3d(${(x-baseTile/2).toFixed(2)}px,${(y-baseTile/2).toFixed(2)}px,0) rotate(${tilt.toFixed(2)}deg) scale(${narrowing.toFixed(4)},${scale.toFixed(4)})`
  };
 },[geometry]);
 const formatRotation=useCallback(rotation=>`${(rotation.x*180/Math.PI).toFixed(1)} ${(rotation.y*180/Math.PI).toFixed(1)}` ,[]);
 const applyProjection=useCallback((settled=false)=>{
  if(!geometry||!rootRef.current)return;
  const rotation=rotationRef.current;
  rootRef.current.dataset.rotation=formatRotation(rotation);
  for(const tile of geometry.tiles){
   const node=tileRefs.current.get(tile.key),projection=projectTile(tile,rotation);
   if(!node||!projection)continue;
   const cached=visualCacheRef.current.get(tile.key)||{};
   // Transform is the only per-frame write. Opacity and paint order are quantised while
   // travelling; input state is restored once the dome settles. This keeps a dense field
   // from forcing a full style/accessibility update for every pointer sample.
   node.style.transform=projection.transform;
   if(settled||!Number.isFinite(cached.opacity)||Math.abs(cached.opacity-projection.opacity)>.035){
    node.style.opacity=String(projection.opacity);cached.opacity=projection.opacity;
   }
   if(settled||!Number.isFinite(cached.zIndex)||Math.abs(cached.zIndex-projection.zIndex)>55){
    node.style.zIndex=String(projection.zIndex);cached.zIndex=projection.zIndex;
   }
   if(settled){
    node.style.pointerEvents=projection.interactive?'auto':'none';
    node.tabIndex=projection.interactive?0:-1;
    cached.interactive=projection.interactive;
   }
   visualCacheRef.current.set(tile.key,cached);
  }
 },[formatRotation,geometry,projectTile]);
 const lockTiles=useCallback(()=>{
  for(const node of tileRefs.current.values()){node.style.pointerEvents='none';node.tabIndex=-1;}
 },[]);
 const cancelProjection=useCallback(()=>{
  if(projectionFrameRef.current){cancelAnimationFrame(projectionFrameRef.current);projectionFrameRef.current=0;}
 },[]);
 const queueProjection=useCallback(()=>{
  if(projectionFrameRef.current)return;
  if(typeof requestAnimationFrame==='undefined'){applyProjection();return;}
  projectionFrameRef.current=requestAnimationFrame(()=>{projectionFrameRef.current=0;applyProjection();});
 },[applyProjection]);
 const stopInertia=useCallback(()=>{if(inertiaRef.current){cancelAnimationFrame(inertiaRef.current);inertiaRef.current=0;}},[]);
 useEffect(()=>{applyProjection(true);},[applyProjection]);
 useEffect(()=>{
  const cap=c.maxVerticalRotationDeg*Math.PI/180;
  rotationRef.current.y=clamp(rotationRef.current.y,-cap,cap);
  applyProjection(true);
 },[applyProjection,c.maxVerticalRotationDeg]);
 useEffect(()=>()=>{stopInertia();cancelProjection();},[cancelProjection,stopInertia]);

 const close=useCallback(()=>setOpenIndex(null),[]);
 const reset=useCallback(()=>{
  stopInertia();cancelProjection();rotationRef.current={x:0,y:0};applyProjection(true);setOpenIndex(null);
 },[applyProjection,cancelProjection,stopInertia]);
 const rotate=useCallback((x=0,y=0)=>{
  stopInertia();cancelProjection();
  const cap=c.maxVerticalRotationDeg*Math.PI/180;
  rotationRef.current={x:Number(x)||0,y:clamp(Number(y)||0,-cap,cap)};
  applyProjection(true);
 },[applyProjection,c.maxVerticalRotationDeg,cancelProjection,stopInertia]);
 useImperativeHandle(ref,()=>({close,reset,rotate}),[close,reset,rotate]);
 const turnBy=useCallback((x=0,y=0)=>{
  stopInertia();
  const cap=c.maxVerticalRotationDeg*Math.PI/180;
  rotationRef.current={x:rotationRef.current.x+x,y:clamp(rotationRef.current.y+y,-cap,cap)};
  applyProjection(true);
 },[applyProjection,c.maxVerticalRotationDeg,stopInertia]);
 const startInertia=useCallback((velocity)=>{
  stopInertia();cancelProjection();lockTiles();
  let current={...velocity},previous=performance.now();
  const cap=c.maxVerticalRotationDeg*Math.PI/180;
  const tick=now=>{
   const dt=Math.min(.05,Math.max(.001,(now-previous)/1000));previous=now;
   const decay=Math.exp(-(1.8+c.dragDampening*2.7)*dt);
   current={x:current.x*decay,y:current.y*decay};
   if(Math.abs(current.x)<.0006&&Math.abs(current.y)<.0006){inertiaRef.current=0;applyProjection(true);return;}
   rotationRef.current={x:rotationRef.current.x+current.x*dt,y:clamp(rotationRef.current.y+current.y*dt,-cap,cap)};
   applyProjection();
   inertiaRef.current=requestAnimationFrame(tick);
  };
  inertiaRef.current=requestAnimationFrame(tick);
 },[applyProjection,c.dragDampening,c.maxVerticalRotationDeg,cancelProjection,lockTiles,stopInertia]);
 const onPointerDown=event=>{
  if(openIndex!==null)return;
  stopInertia();
  const target=event.target?.setPointerCapture?event.target:event.currentTarget;
  target.setPointerCapture?.(event.pointerId);
  dragRef.current={id:event.pointerId,capture:target,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,time:event.timeStamp||performance.now(),vx:0,vy:0,moved:false};
  setDragging(true);
 };
 const onPointerMove=event=>{
  const drag=dragRef.current;
  if(!drag||drag.id!==event.pointerId)return;
  const now=event.timeStamp||performance.now(),dt=Math.max(8,now-drag.time);
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(Math.abs(event.clientX-(drag.startX??drag.x))+Math.abs(event.clientY-(drag.startY??drag.y))>5)drag.moved=true;
  const unit=Math.PI/180/c.dragSensitivity,cap=c.maxVerticalRotationDeg*Math.PI/180;
  const deltaX=dx*unit,deltaY=dy*unit;
  rotationRef.current={x:rotationRef.current.x+deltaX,y:clamp(rotationRef.current.y+deltaY,-cap,cap)};
  queueProjection();
  drag.vx=deltaX/(dt/1000);drag.vy=deltaY/(dt/1000);drag.x=event.clientX;drag.y=event.clientY;drag.time=now;
 };
 const finishPointer=event=>{
  const drag=dragRef.current;
  if(!drag||drag.id!==event.pointerId)return;
  drag.capture?.releasePointerCapture?.(event.pointerId);
  dragRef.current=null;setDragging(false);
  cancelProjection();applyProjection();
  if(drag.moved){suppressClickRef.current=performance.now()+100;startInertia({x:drag.vx,y:drag.vy});}
  else applyProjection(true);
 };
 const onClickCapture=event=>{
  if(performance.now()<suppressClickRef.current){event.preventDefault();event.stopPropagation();}
 };
 const openImage=index=>{if(performance.now()>=suppressClickRef.current)setOpenIndex(index);};
 const active=openIndex===null?null:c.images[openIndex%c.images.length];
 const initialTiles=useMemo(()=>geometry?geometry.tiles.map(tile=>({tile,projection:projectTile(tile)})):[],[geometry,projectTile]);
 const radiusData=geometry?String(Math.round(geometry.radius)):'';
 const rotationString=formatRotation(rotationRef.current);
 return <div ref={rootRef} className={['dome-gallery',className,c.grayscale?'dome-gallery--grayscale':'',openIndex!==null?'dome-gallery--open':'',dragging?'dome-gallery--dragging':''].filter(Boolean).join(' ')} style={{...style,'--dome-overlay':c.overlayBlurColor,'--dome-transition':`${c.enlargeTransitionMs}ms`}} data-status={size.width?'ready':'loading'} data-open={openIndex===null?'':String(openIndex)} data-rotation={rotationString} data-radius={radiusData} data-segments={c.segments} data-grayscale={String(c.grayscale)} data-dragging={String(dragging)}>
  <div ref={stageRef} className="dome-gallery__stage" role="region" aria-roledescription="image gallery" aria-label={ariaLabel} aria-describedby={`${id}-hint`} tabIndex={0} onKeyDown={event=>{if(event.key==='Escape')close();if(event.key==='ArrowLeft'){event.preventDefault();turnBy(-.16,0);}if(event.key==='ArrowRight'){event.preventDefault();turnBy(.16,0);}}} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={finishPointer} onPointerCancel={finishPointer} onClickCapture={onClickCapture}>
   <div className="dome-gallery__surface" aria-hidden="true">
    {initialTiles.map(({tile,projection})=>{const image=c.images[tile.imageIndex];return <button ref={node=>{if(node)tileRefs.current.set(tile.key,node);else tileRefs.current.delete(tile.key);}} key={tile.key} type="button" className="dome-gallery__tile" tabIndex={projection.interactive?0:-1} aria-label={`Open ${image.alt}`} onClick={()=>openImage(tile.imageIndex)} style={{width:geometry.baseTile,height:geometry.baseTile,opacity:projection.opacity,zIndex:projection.zIndex,transform:projection.transform,pointerEvents:projection.interactive?'auto':'none',borderRadius:c.imageBorderRadius}}><img src={image.src} alt="" draggable="false"/></button>;})}
   </div>
   {active&&<div className="dome-gallery__lightbox" role="dialog" aria-modal="true" aria-label={active.alt} onPointerDown={event=>{if(event.target===event.currentTarget)close();}}><div className="dome-gallery__opened" style={{width:c.openedImageWidth,height:c.openedImageHeight,borderRadius:c.openedImageBorderRadius}}><img src={active.src} alt={active.alt} style={{filter:c.grayscale?'grayscale(1)':'none'}}/></div></div>}
  </div>
  <p id={`${id}-hint`} className="dome-gallery__hint">Drag to rotate. Click an image to expand. Press Escape to close.</p>
 </div>;
}

const DomeGallery=forwardRef(DomeGalleryBase);
export default DomeGallery;
