'use client';

import React,{forwardRef,useEffect,useId,useImperativeHandle,useRef,useState} from 'react';
import './ScrollExpand.css';

// Independent scroll-driven media expansion. The frame opens from a resting size to
// full bleed while the media eases back to its natural scale; no reference source was used.
export const scrollExpandPresets={
  frame:{startWidth:42,startHeight:58,startRadius:24,endRadius:0,mediaZoom:1.35,scrollDistance:1.2,holdDistance:.35,smoothing:.1,overlayScrim:.45,useWindowScroll:false,stageHeight:520},
  cinematic:{startWidth:34,startHeight:44,startRadius:18,endRadius:14,mediaZoom:1.5,scrollDistance:1.7,holdDistance:.6,smoothing:.14,overlayScrim:.62,useWindowScroll:false,stageHeight:560},
  window:{startWidth:50,startHeight:64,startRadius:20,endRadius:0,mediaZoom:1.28,scrollDistance:.9,holdDistance:.35,smoothing:.08,overlayScrim:.45,useWindowScroll:true,stageHeight:0},
  paper:{startWidth:58,startHeight:78,startRadius:6,endRadius:6,mediaZoom:1.12,scrollDistance:1,holdDistance:.25,smoothing:.06,overlayScrim:.32,useWindowScroll:false,stageHeight:480}
};
const defaults={src:'',mediaType:'image',poster:'',alt:'',title:'',scrollHint:'',startWidth:42,startHeight:58,startRadius:24,endRadius:0,mediaZoom:1.35,scrollDistance:1.2,holdDistance:.35,smoothing:.1,overlayScrim:.45,useWindowScroll:false,enabled:true,focusPoint:'50% 50%',stageHeight:0,onProgress:null};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const numeric=(v,a,b,f)=>Number.isFinite(Number(v))?clamp(Number(v),a,b):f;
function smoothstep(t,a=0,b=1){const x=clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);}
function normalize(input){
 const c={...defaults,...input};
 for(const[key,a,b]of[['startWidth',10,100],['startHeight',10,100],['startRadius',0,48],['endRadius',0,48],['mediaZoom',1,2.5],['scrollDistance',.4,3],['holdDistance',0,1.5],['smoothing',0,.4],['overlayScrim',0,1],['stageHeight',0,1400]])c[key]=numeric(c[key],a,b,defaults[key]);
 if(!['image','video'].includes(c.mediaType))c.mediaType=defaults.mediaType;
 for(const key of['src','poster'])c[key]=typeof c[key]==='string'?c[key].slice(0,2000):'';
 for(const key of['alt','title','scrollHint'])c[key]=typeof c[key]==='string'?c[key].slice(0,220):'';
 c.focusPoint=typeof c.focusPoint==='string'&&/^[\w.%#(), -]{1,60}$/.test(c.focusPoint)?c.focusPoint:defaults.focusPoint;
 c.enabled=!!c.enabled;c.useWindowScroll=!!c.useWindowScroll;
 return c;
}

function createEngine(parts,report,initial){
 const{root,track,stage,frame,scrim,overlay,mediaOf,titleOf,hintOf}=parts;
 let c=normalize(initial),dead=false,raf=0,last=0,current=0,raw=0,scroll=0,lastNotify=-1,lastPhase='',reported='';
 let stageH=0,length=1,hold=0,travel=0,visible=true;
 const base=[],mode=[],wakeQueue=[];
 const mediaQuery=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
 let reduced=!!mediaQuery?.matches;
 const listen=(bucket,target,event,fn,options)=>{target.addEventListener(event,fn,options);bucket.push(()=>target.removeEventListener(event,fn,options));};
 const setData=(key,value)=>{value=String(value);if(root.dataset[key]!==value)root.dataset[key]=value;};
 function phase(){
  if(!c.enabled)return 'static';
  if(!c.src)return 'placeholder';
  if(scroll<=0)return 'rest';
  if(raw<1)return 'expanding';
  // travel is the rounded scrolled distance, so the clamp boundary cannot flip the phase.
  return scroll<travel-.5?'open':'complete';
 }
 function readScroll(){
  // The sticky stage never moves, so page-scroll progress comes from the section itself.
  if(c.useWindowScroll){const box=root.getBoundingClientRect();return Math.max(0,-box.top);}
  return Math.max(0,root.scrollTop);
 }
 function measure(){
  if(c.stageHeight>0)stage.style.height=`${c.stageHeight}px`;
  else if(!c.useWindowScroll)stage.style.height=`${Math.max(1,root.clientHeight)}px`;
  else stage.style.height='';
  stageH=Math.round(stage.getBoundingClientRect().height);
  length=Math.max(24,c.scrollDistance*stageH);
  hold=Math.max(0,c.holdDistance*stageH);
  travel=Math.round(length+hold);
  // Page-scroll pinning needs a viewport-tall stage, so the track keeps room for the travel.
  const pinBase=c.useWindowScroll?Math.max(stageH,window.innerHeight||stageH):stageH;
  track.style.height=`${pinBase+travel}px`;
  setData('stage',`${Math.round(stage.clientWidth)}x${stageH}`);
  setData('length',Math.round(length+hold));
  setData('expand',Math.round(length));
 }
 function publish(){
  const value=Number(current.toFixed(4)),nextPhase=phase(),changed=nextPhase!==lastPhase;
  // Always report a phase change and the settled value so consumers never miss the end state.
  const settled=Math.abs(raw-current)<.0005;
  lastPhase=nextPhase;
  setData('phase',nextPhase);
  if(changed||settled||Math.abs(value-lastNotify)>=.002){
   lastNotify=value;
   c.onProgress?.({progress:value,target:Number(raw.toFixed(4)),phase:nextPhase});
  }
 }
 function apply(){
  const scaled=1-smoothstep(raw);
  const insetX=c.startWidth/2*scaled,insetY=c.startHeight/2*scaled;
  const radius=c.endRadius+(c.startRadius-c.endRadius)*scaled;
  const zoom=1+(c.mediaZoom-1)*scaled;
  frame.style.clipPath=`inset(${insetY.toFixed(3)}% ${insetX.toFixed(3)}% round ${radius.toFixed(2)}px)`;
  const media=mediaOf(),title=titleOf(),hint=hintOf();
  if(media)media.style.transform=`scale(${zoom.toFixed(4)})`;
  // Handover windows measured from the public reference: the hint leaves almost at once,
  // the title lifts through the middle of the expansion, the overlay arrives near the end.
  const overlayIn=smoothstep(raw,.7,.94),titleOut=smoothstep(raw,.45,.88),hintOut=smoothstep(raw,0,.13);
  scrim.style.opacity=(c.overlayScrim*smoothstep(raw,0,.95)).toFixed(3);
  overlay.style.opacity=overlayIn.toFixed(3);
  overlay.style.transform=`translate3d(0,${(18*(1-overlayIn)).toFixed(2)}px,0)`;
  overlay.style.pointerEvents=overlayIn>.5?'auto':'none';
  if(title){title.style.opacity=(1-titleOut).toFixed(3);title.style.transform=`translate3d(0,${(-28*titleOut).toFixed(2)}px,0) scale(${(1+.06*titleOut).toFixed(3)})`;}
  if(hint)hint.style.opacity=(1-hintOut).toFixed(3);
  setData('frame',`${insetX.toFixed(3)},${insetY.toFixed(3)},${radius.toFixed(2)}`);
  setData('zoom',zoom.toFixed(4));
  setData('progress',current.toFixed(4));
  setData('target',raw.toFixed(4));
  setData('scroll',scroll.toFixed(1));
 }
 function status(){return !c.src?'placeholder':c.enabled?'ready':'static';}
 function sync(){
  const next=status();
  if(next!==reported){reported=next;report(next);setData('status',next);}
 }
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;setData('animating',false);}
 function wake(){
  if(dead||raf||document.hidden||!visible||!c.enabled||!c.src)return;
  setData('animating',true);
  raf=requestAnimationFrame(step);
 }
 function step(now){
  raf=0;
  if(dead)return;
  if(document.hidden||!visible){stop();return;}
  const delta=last?Math.min(.05,(now-last)/1000):1/60;
  last=now;
  scroll=readScroll();
  raw=clamp(scroll/length,0,1);
  const factor=reduced||c.smoothing<=0?1:1-Math.exp(-delta/c.smoothing);
  current=raw+(current-raw)*(1-factor);
  if(factor>=1||Math.abs(raw-current)<.0004)current=raw;
  apply();
  publish();
  if(Math.abs(raw-current)>.0002)wake();
  else{stop();wakeQueue.splice(0).forEach(resolve=>resolve());}
 }
 function onResize(){measure();wake();}
 function attach(){
  if(c.useWindowScroll)listen(mode,window,'scroll',wake,{passive:true});
  else listen(mode,root,'scroll',wake,{passive:true});
 }
 function detach(){mode.splice(0).forEach(remove=>remove());}
 function syncMedia(){
  const media=mediaOf();
  if(!(media instanceof HTMLVideoElement))return;
  const shouldPlay=visible&&!document.hidden&&!reduced&&c.enabled;
  if(shouldPlay){if(media.paused)media.play?.().catch(()=>{});}
  else if(!media.paused)media.pause?.();
 }
 const resize=new ResizeObserver(()=>onResize());
 resize.observe(root);
 const intersection=new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  if(!visible)stop();
  syncMedia();
  if(visible)wake();
 });
 intersection.observe(root);
 listen(base,window,'resize',onResize);
 listen(base,document,'visibilitychange',()=>{if(document.hidden)stop();syncMedia();if(!document.hidden)wake();});
 if(mediaQuery)listen(base,mediaQuery,'change',()=>{reduced=mediaQuery.matches;setData('reducedMotion',reduced);last=0;syncMedia();wake();});
 setData('reducedMotion',reduced);
 setData('mode',c.useWindowScroll?'window':'scroller');
 measure();
 attach();
 scroll=readScroll();
 raw=clamp(scroll/length,0,1);
 current=raw;
 apply();
 sync();
 syncMedia();
 return{
  update(input){
   const previous=c;
   c=normalize(input);
   if(previous.useWindowScroll!==c.useWindowScroll){detach();attach();setData('mode',c.useWindowScroll?'window':'scroller');}
   if(previous.enabled&&!c.enabled)detach();
   if(!previous.enabled&&c.enabled)attach();
   measure();
   if(previous.enabled!==c.enabled)last=0;
   sync();
   scroll=readScroll();
   if(!c.enabled){
    if(root.scrollTop)root.scrollTop=0;
    current=0;raw=0;apply();
    lastPhase='';publish();stop();
    syncMedia();   // a disabled section stops its video too
    return;
   }
   raw=clamp(scroll/length,0,1);
   apply();
   publish();
   wake();
   syncMedia();
  },
  waitReady(){return new Promise(resolve=>{if(!raf)resolve();else wakeQueue.push(resolve);});},
  destroy(){
   dead=true;
   stop();
   resize.disconnect();
   intersection.disconnect();
   detach();
   base.splice(0).forEach(remove=>remove());
   const media=mediaOf();
   if(media instanceof HTMLVideoElement)media.pause?.();
   track.style.height='';
   stage.style.height='';
  }
 };
}

function ScrollExpandBase({ref,src='',mediaType='image',poster='',alt='',title='',scrollHint='',startWidth=42,startHeight=58,startRadius=24,endRadius=0,mediaZoom=1.35,scrollDistance=1.2,holdDistance=.35,smoothing=.1,overlayScrim=.45,useWindowScroll=false,enabled=true,focusPoint='50% 50%',stageHeight=0,onProgress,children,className='',style}){
 const root=useRef(null),track=useRef(null),stage=useRef(null),frame=useRef(null),media=useRef(null),scrim=useRef(null),overlay=useRef(null),titleRef=useRef(null),hint=useRef(null),engine=useRef(null),hintId=useId();
 const[status,setStatus]=useState('loading');
 const config={src,mediaType,poster,alt,title,scrollHint,startWidth,startHeight,startRadius,endRadius,mediaZoom,scrollDistance,holdDistance,smoothing,overlayScrim,useWindowScroll,enabled,focusPoint,stageHeight,onProgress};
 useImperativeHandle(ref,()=>({waitReady:()=>engine.current?.waitReady?.()??Promise.resolve(),reset:()=>{const node=root.current;if(node&&!useWindowScroll)node.scrollTop=0;},get progress(){return Number(root.current?.dataset.progress??0);}}),[]);
 const latest=useRef(config);latest.current=config;
 useEffect(()=>{
  engine.current=createEngine({
   root:root.current,track:track.current,stage:stage.current,frame:frame.current,scrim:scrim.current,overlay:overlay.current,
   mediaOf:()=>media.current,titleOf:()=>titleRef.current,hintOf:()=>hint.current
  },setStatus,latest.current);
  return()=>{engine.current?.destroy();engine.current=null;};
 },[]);
 useEffect(()=>{engine.current?.update(latest.current);},[src,mediaType,poster,alt,title,scrollHint,startWidth,startHeight,startRadius,endRadius,mediaZoom,scrollDistance,holdDistance,smoothing,overlayScrim,useWindowScroll,enabled,focusPoint,stageHeight,onProgress]);
 const label=alt||title||'Expandable media';
 const scrollable=!!src&&enabled&&!useWindowScroll;
 const fixedStage=numeric(stageHeight,0,1400,0);
 const restStyle={'--se-inset-x':`${numeric(startWidth,10,100,42)/2}%`,'--se-inset-y':`${numeric(startHeight,10,100,58)/2}%`,'--se-radius':`${numeric(startRadius,0,48,24)}px`,'--se-zoom':`${numeric(mediaZoom,1,2.5,1.35)}`,'--se-focus':typeof focusPoint==='string'&&/^[\w.%#(), -]{1,60}$/.test(focusPoint)?focusPoint:defaults.focusPoint,
  // A fixed stage height also fixes the scroller viewport so the whole travel stays reachable.
  ...(fixedStage>0&&!useWindowScroll?{height:`${fixedStage}px`}:{})};
 return <section ref={root} className={['scroll-expand',useWindowScroll?'scroll-expand--window':'scroll-expand--scroller',enabled?'':'scroll-expand--static',className].filter(Boolean).join(' ')} style={{...restStyle,...style}} role="region" aria-label={label} aria-describedby={scrollHint?hintId:undefined} tabIndex={scrollable?0:undefined} data-status={status} data-mode={useWindowScroll?'window':'scroller'}>
  <div ref={track} className="scroll-expand__track">
   <div ref={stage} className="scroll-expand__stage">
    <div ref={frame} className="scroll-expand__frame">
     {mediaType==='video'
      ? (src?<video ref={media} className="scroll-expand__media" src={src} poster={poster||undefined} muted loop playsInline preload="metadata" aria-label={label} tabIndex={-1}/>:null)
      : (src?<img ref={media} className="scroll-expand__media" src={src} alt={alt} draggable={false}/>:null)}
     <div ref={scrim} className="scroll-expand__scrim" aria-hidden="true"/>
     {title?<div ref={titleRef} className="scroll-expand__title"><span>{title}</span></div>:null}
     <div ref={overlay} className="scroll-expand__overlay">{children}</div>
     {!src&&<div className="scroll-expand__placeholder" role="img" aria-label={alt||'Media placeholder'}><span>Add an image or video</span></div>}
    </div>
    {scrollHint?<p ref={hint} className="scroll-expand__hint" id={hintId}><span className="se-hint-arrow" aria-hidden="true">↓</span>{scrollHint}</p>:null}
   </div>
  </div>
 </section>;
}
const ScrollExpand=forwardRef((props,ref)=>React.createElement(ScrollExpandBase,{...props,ref}));
export default ScrollExpand;