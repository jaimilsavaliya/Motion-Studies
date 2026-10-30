'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './ImageWheel.css';

const EMPTY = [];
const limit = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;

function Photo({ image }) {
  const [failed, setFailed] = useState(false);
  return image.src && !failed ? <img src={image.src} alt="" draggable="false" onError={() => setFailed(true)} /> : <span className="image-wheel__fallback">{image.alt || 'Image unavailable'}</span>;
}

/** Independent shallow-arc image browser. No autoplay, wrapping, or lightbox. */
export default function ImageWheel({ images=EMPTY, cardSize=190, radius=420, height=520, angle=24, blur=9, tilt=1, initialIndex=0, showControls=false, onIndexChange, onSelect, className='' }) {
  const entries=Array.isArray(images)?images.filter(Boolean):EMPTY, count=entries.length;
  const imageKey=entries.map(image=>image.src).join('|');
  const initial=Math.round(limit(initialIndex,0,Math.max(0,count-1),0));
  const [active,setActive]=useState(initial),[width,setWidth]=useState(0),[reduced,setReduced]=useState(false),[visible,setVisible]=useState(true);
  const root=useRef(null),cards=useRef([]),gesture=useRef(null),suppress=useRef(false),timer=useRef(0),api=useRef({wake:()=>{}});
  const focusWanted=useRef(null);
  const motion=useRef({position:initial,target:initial,velocity:0,active:initial});
  const callbacks=useRef({onIndexChange,onSelect,entries});callbacks.current={onIndexChange,onSelect,entries};
  const size=limit(cardSize,60,360,190),r=limit(radius,120,800,420),baseH=limit(height,200,800,520),degrees=limit(angle,12,60,24);
  const depthBlur=limit(blur,0,18,9),lean=limit(tilt,0,2,1);
  // Fit the arc and the overhanging card edges as one composition, including its height.
  const fit=width?Math.min(1,width/(2*r+size*.9752)):1;
  const scaledSize=size*fit, stageH=baseH*fit, dragStep=Math.max(24,size*.79*fit);

  useLayoutEffect(()=>{
    setWidth(root.current.clientWidth);
    const resize=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));resize.observe(root.current);
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));observer.observe(root.current);
    const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(media.matches);change();media.addEventListener('change',change);
    return()=>{resize.disconnect();observer.disconnect();media.removeEventListener('change',change);clearTimeout(timer.current);};
  },[]);

  useEffect(()=>{
    const m=motion.current;let frame=0,last=0;
    m.target=limit(m.target,0,Math.max(0,count-1),0);m.position=limit(m.position,0,Math.max(0,count-1),0);
    const draw=()=>{
      const nearest=Math.max(0,Math.min(count-1,Math.round(m.position)));
      cards.current.forEach((element,index)=>{
        if(!element||index>=count)return;
        const degreesFromFront=(index-m.position)*degrees,theta=degreesFromFront*Math.PI/180;
        const depth=Math.cos(theta),front=Math.abs(degreesFromFront)<90;
        const scale=Math.max(.5,(1+depth)/2);
        const x=Math.sin(theta)*r*fit;
        const y=((depth-1)*r*(90/430)+(index%9-4)*size*.05*depth)*fit;
        const rotation=(((index*4)%7-3)*1.6+degreesFromFront*.12)*lean;
        const softness=Math.min(1.4,1-depth)*depthBlur;
        Object.assign(element.style,{
          transform:`translate(${x}px,${y}px) scale(${scale}) rotate(${rotation}deg)`,
          opacity:front?String(1-(1-depth)*3/17):'0',zIndex:String(Math.round(depth*100)),
          filter:softness<.005?'none':`blur(${softness.toFixed(2)}px)`,pointerEvents:front?'auto':'none',visibility:front?'visible':'hidden',
        });
        element.setAttribute('aria-hidden',String(!front));
      });
      if(focusWanted.current===nearest){cards.current[nearest]?.focus({preventScroll:true});focusWanted.current=null;}
      if(nearest!==m.active){m.active=nearest;setActive(nearest);if(count)callbacks.current.onIndexChange?.(nearest,callbacks.current.entries[nearest]);}
    };
    const tick=time=>{
      frame=0;if(!visible||document.hidden)return;
      const dt=last?Math.min((time-last)/1000,.064):1/60;last=time;
      if(reduced){m.position=m.target;m.velocity=0;}
      else {
        // Stable, near-critically damped spring, integrated in small steps.
        const steps=Math.ceil(dt*120),slice=dt/steps;
        for(let i=0;i<steps;i++){m.velocity+=((m.target-m.position)*260-m.velocity*32)*slice;m.position+=m.velocity*slice;}
        if(Math.abs(m.target-m.position)<.0001&&Math.abs(m.velocity)<.002){m.position=m.target;m.velocity=0;}
      }
      draw();if(m.position!==m.target||m.velocity)frame=requestAnimationFrame(tick);
    };
    const wake=()=>{if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}};
    api.current={wake};
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
    document.addEventListener('visibilitychange',visibility);draw();wake();
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);};
  },[count,imageKey,fit,r,size,degrees,depthBlur,lean,reduced,visible]);

  const go=index=>{motion.current.target=Math.round(limit(index,0,Math.max(0,count-1),0));api.current.wake();};
  const keyDown=event=>{
    let target;
    if(event.key==='ArrowRight')target=motion.current.target+1;
    else if(event.key==='ArrowLeft')target=motion.current.target-1;
    else if(event.key==='Home')target=0;
    else if(event.key==='End')target=count-1;
    else return;
    event.preventDefault();target=Math.round(limit(target,0,Math.max(0,count-1),0));focusWanted.current=target;go(target);cards.current[target]?.focus({preventScroll:true});
  };
  const finish=event=>{
    const g=gesture.current;if(!g||g.id!==event.pointerId)return;gesture.current=null;
    root.current.dataset.dragging='false';if(root.current.hasPointerCapture(event.pointerId))root.current.releasePointerCapture(event.pointerId);
    if(g.moved){go(motion.current.target);suppress.current=true;clearTimeout(timer.current);timer.current=setTimeout(()=>{suppress.current=false;},0);}
  };
  return <section ref={root} className={`image-wheel ${className}`} role="region" aria-roledescription="carousel" aria-label="Image wheel" tabIndex={-1} data-index={active} style={{height:stageH,'--wheel-size':`${scaledSize}px`}} onKeyDown={keyDown}
    onPointerDown={event=>{focusWanted.current=null;if(count<2||event.button!==0||!event.isPrimary||event.target.closest('.image-wheel__controls'))return;gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,start:motion.current.position,moved:false};}}
    onPointerMove={event=>{const g=gesture.current;if(!g||g.id!==event.pointerId)return;const dx=event.clientX-g.x,dy=event.clientY-g.y;if(!g.moved&&Math.abs(dy)>Math.abs(dx)+3){gesture.current=null;return;}if(Math.abs(dx)>5){g.moved=true;root.current.setPointerCapture(event.pointerId);root.current.dataset.dragging='true';motion.current.target=limit(g.start-dx/dragStep,0,count-1,0);api.current.wake();}}}
    onPointerUp={finish} onPointerCancel={finish} onClickCapture={event=>{if(suppress.current){event.preventDefault();event.stopPropagation();}}}>
    {entries.map((image,index)=><button key={`${image.src}-${index}`} ref={element=>{cards.current[index]=element;}} className="image-wheel__card" type="button" data-card-index={index} aria-label={image.alt||`Image ${index+1}`} aria-current={index===active?'true':'false'} tabIndex={index===active?0:-1} onClick={()=>{if(Math.abs(motion.current.position-index)<.02)callbacks.current.onSelect?.(index,image);else go(index);}}><Photo key={image.src} image={image}/></button>)}
    {count===0?<p className="image-wheel__empty">Add images to start your wheel.</p>:<span className="image-wheel__status" aria-live="polite">Image {Math.min(active+1,count)} of {count}: {entries[active]?.alt}</span>}
    {showControls&&count>0&&<div className="image-wheel__controls"><button type="button" aria-label="Previous image" disabled={active===0} onClick={()=>go(motion.current.target-1)}>←</button><span>{Math.min(active+1,count)} / {count}</span><button type="button" aria-label="Next image" disabled={active===count-1} onClick={()=>go(motion.current.target+1)}>→</button></div>}
  </section>;
}
