'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './ElasticCarousel.css';

const EMPTY = [];
const clamp = (v, min, max, fallback = min) => Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : fallback;
const mod = (v, n) => ((v % n) + n) % n;
const mix = (a, b, t) => a + (b - a) * t;

// Original shader: a subdivided image plane bends and stretches with track velocity.
const VERTEX = `
precision mediump float;
attribute vec2 a_uv;
uniform vec2 u_view, u_center, u_size;
uniform float u_motion, u_stretch;
varying vec2 v_uv;
void main() {
  v_uv = a_uv;
  vec2 p = (a_uv - .5) * u_size;
  float wave = sin(a_uv.y * 3.14159265);
  p.x += wave * u_motion * u_stretch * u_size.x * .07;
  p.x *= 1. + abs(u_motion) * u_stretch * .08;
  p.y *= 1. + abs(u_motion) * u_stretch * .025 * pow(abs(a_uv.x-.5)*2., 2.);
  vec2 point = u_center + p;
  gl_Position = vec4(point.x/u_view.x*2.-1., 1.-point.y/u_view.y*2., 0., 1.);
}`;
const FRAGMENT = `
precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_crop;
uniform float u_motion, u_blur, u_opacity, u_entranceBlur;
varying vec2 v_uv;
void main() {
  vec2 uv = (v_uv-.5)*u_crop+.5;
  float spread = (abs(u_motion)*.055 + u_entranceBlur*.08)*u_blur;
  vec4 color = vec4(0.);
  float total = 0.;
  for(int i=-4; i<=4; i++) {
    float f = float(i)/4.;
    float weight = exp(-f*f*2.);
    color += texture2D(u_texture, clamp(uv+vec2(f*spread,0.), .001, .999))*weight;
    total += weight;
  }
  gl_FragColor = vec4((color/total).rgb, u_opacity);
}`;

function createRenderer(canvas, items, wake, failed, ready) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) return null;
  const shaders = [];
  const compile = (type, source) => {
    const shader = gl.createShader(type); shaders.push(shader);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT)); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  const vertices = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 32; x++) {
    const a=x/32, b=(x+1)/32, c=y/8, d=(y+1)/8;
    vertices.push(a,c,b,c,a,d,a,d,b,c,b,d);
  }
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.useProgram(program);
  const attribute=gl.getAttribLocation(program,'a_uv'); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
  const uniforms = Object.fromEntries(['view','center','size','motion','stretch','crop','blur','opacity','texture','entranceBlur'].map(n=>[n,gl.getUniformLocation(program,'u_'+n)]));
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  let disposed = false, remaining = items.length;
  const loaded = () => { if (!disposed && --remaining === 0) ready(); };
  if (!remaining) ready();
  const assets = items.map(item => {
    const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([32,32,38,255]));
    const image=new Image(), asset={texture,aspect:2/3,image}; image.crossOrigin='anonymous';
    image.onload=()=>{ if(disposed||gl.isContextLost())return; try { gl.bindTexture(gl.TEXTURE_2D,texture); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image); asset.aspect=image.naturalWidth/image.naturalHeight; } catch { failed(); } loaded(); wake(); };
    image.onerror=()=>{failed();loaded();wake();}; if(item.src)image.src=item.src;else loaded();
    return asset;
  });
  return {
    draw(cards,width,height,motion,stretch,blur,ratio) {
      if(gl.isContextLost())return;
      const rw=Math.round(width*ratio),rh=Math.round(height*ratio);
      if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;}
      gl.viewport(0,0,rw,rh);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
      gl.uniform2f(uniforms.view,width,height);gl.uniform1f(uniforms.motion,motion);gl.uniform1f(uniforms.stretch,stretch);gl.uniform1f(uniforms.blur,blur);
      gl.activeTexture(gl.TEXTURE0);gl.uniform1i(uniforms.texture,0);
      cards.forEach(card=>{
        if(card.opacity<.005||card.x+card.w/2<0||card.x-card.w/2>width)return;
        const asset=assets[card.index];if(!asset)return;
        const aspect=card.w/card.h;
        gl.bindTexture(gl.TEXTURE_2D,asset.texture);gl.uniform2f(uniforms.crop,Math.min(1,aspect/asset.aspect),Math.min(1,asset.aspect/aspect));
        gl.uniform2f(uniforms.center,card.x,card.y);gl.uniform2f(uniforms.size,card.w,card.h);gl.uniform1f(uniforms.opacity,card.opacity);gl.uniform1f(uniforms.entranceBlur,card.entranceBlur||0);
        gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);
      });
    },
    dispose(){disposed=true;assets.forEach(a=>{a.image.onload=null;a.image.onerror=null;gl.deleteTexture(a.texture);});gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));},
  };
}

function Photo({ item, hidden }) {
  const [failed,setFailed]=useState(false);
  return item.src&&!failed?<img src={item.src} alt={hidden?'':item.alt||item.title||'Gallery image'} draggable="false" onError={()=>setFailed(true)} />:<span className="elastic-carousel__fallback">{item.title||'Image unavailable'}</span>;
}

/** Thumbnail entrance, elastic image reel, and a click-to-isolate detail state. */
export default function ElasticCarousel({ items=EMPTY, height=560, stretch=1, blur=1, gap=16, intro=true, initialIndex, pixelRatio=1.5, showControls=true, onIndexChange, onOpenChange, className='' }) {
  const entries=Array.isArray(items)?items.filter(Boolean):EMPTY, count=entries.length;
  const initial=Math.floor(clamp(initialIndex??Math.floor((count-1)/2),0,Math.max(0,count-1),0));
  const [active,setActive]=useState(initial),[anchor,setAnchor]=useState(initial),[opened,setOpened]=useState(false),[width,setWidth]=useState(0),[reduced,setReduced]=useState(false),[visible,setVisible]=useState(true),[mode,setMode]=useState('fallback'),[epoch,setEpoch]=useState(0),[ready,setReady]=useState(false);
  const root=useRef(null),canvas=useRef(null),nodes=useRef(new Map()),renderer=useRef(null),api=useRef({wake:()=>{},draw:()=>{}}),drag=useRef(null),ignore=useRef(false),clickTimer=useRef(0);
  const callbacks=useRef({onIndexChange,onOpenChange}); callbacks.current={onIndexChange,onOpenChange};
  const motion=useRef({position:initial,target:initial,reveal:intro?0:1,revealTarget:intro?0:1,introTime:0,entering:intro,revealVelocity:0,detail:0,detailTarget:0,velocity:0,active:initial,anchor:initial});
  const imageKey=entries.map(item=>item.src).join('|');
  const small=width>0&&width<640, h=Math.round(clamp(height,280,800,560)*(small?.6:1));
  const cardH=Math.round(h*.6),cardW=Math.max(small?152:160,Math.round(h*.4));
  const spacing=Math.round(clamp(gap,4,40,16)*(small?.6:1)),step=cardW+spacing;
  const extent=count>1?Math.ceil(width/step/2)+2:0;
  const logicals=count?[...new Set([...Array.from({length:extent*2+1},(_,i)=>anchor+i-extent),...entries.map((_,i)=>i)])]:[];
  const selected=count?mod(active,count):0;
  // Measured public sequence: staggered arrivals, a held strip, then expansion.
  const expandAt=1280+Math.max(0,count-1)*110;

  useEffect(()=>{
    const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));observer.observe(root.current);
    const intersection=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));intersection.observe(root.current);
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(media.matches);change();media.addEventListener('change',change);
    return()=>{observer.disconnect();intersection.disconnect();media.removeEventListener('change',change);clearTimeout(clickTimer.current);};
  },[]);
  useEffect(()=>{
    if(reduced||!intro){const m=motion.current;m.entering=false;m.reveal=1;m.revealTarget=1;m.revealVelocity=0;api.current.wake();}
  },[intro,reduced]);
  useEffect(()=>{
    let instance;
    const element=canvas.current;
    const lost=event=>{event.preventDefault();setMode('fallback');setReady(true);renderer.current=null;};
    const restored=()=>setEpoch(value=>value+1);
    element.addEventListener('webglcontextlost',lost);element.addEventListener('webglcontextrestored',restored);
    try{instance=createRenderer(element,entries,()=>api.current.wake(),()=>{renderer.current=null;setMode('fallback');setReady(true);},()=>setReady(true));renderer.current=instance;setMode(instance?'webgl':'fallback');if(!instance)setReady(true);}catch{setMode('fallback');setReady(true);}
    api.current.wake();
    return()=>{element.removeEventListener('webglcontextlost',lost);element.removeEventListener('webglcontextrestored',restored);instance?.dispose();renderer.current=null;};
  },[imageKey,epoch]);

  useEffect(()=>{
    if(!width||!count)return;
    let frame=0,last=0;
    const m=motion.current;
    const draw=()=>{
      const fit=Math.min(small?.6:1,Math.max(1,width-24)/Math.max(1,count*(64*2/3+8)-8));
      const thumbH=64*fit,thumbW=thumbH*2/3,thumbGap=8*fit;
      const poses=[];
      nodes.current.forEach((element,logical)=>{
        const original=logical>=0&&logical<count;
        const x=mix(width/2+(logical-(count-1)/2)*(thumbW+thumbGap),width/2+(logical-m.position)*step,m.reveal);
        const distance=Math.abs(logical-m.position);
        const arrivalTime=Math.max(0,(m.introTime-250-logical*110)/1000);
        const arrival=m.entering?(original?1-Math.exp(-8*arrivalTime):m.reveal):1;
        const scale=m.entering&&original?1-.4*Math.exp(-18*arrivalTime):1;
        const opacity=(original?arrival:m.reveal)*(1-m.detail*Math.min(1,distance));
        const entranceBlur=reduced?0:Math.min(2,m.revealVelocity*.4)*(.35+Math.min(1,distance/2));
        const pose={x,y:h/2,w:mix(thumbW*scale,cardW,m.reveal),h:mix(thumbH*scale,cardH,m.reveal),opacity,index:mod(logical,count),entranceBlur};
        poses.push(pose);
        Object.assign(element.style,{width:`${pose.w}px`,height:`${pose.h}px`,left:`${x-pose.w/2}px`,top:`${pose.y-pose.h/2}px`,opacity:String(opacity),pointerEvents:opacity>.1?'auto':'none'});
        element.style.setProperty('--elastic-skew',`${reduced?0:m.velocity*clamp(stretch,0,2,1)*3}deg`);
        element.style.setProperty('--elastic-smear',`${reduced?0:(Math.abs(m.velocity)*4+entranceBlur*pose.w*.08)*clamp(blur,0,2,1)}px`);
      });
      root.current.style.setProperty('--elastic-reveal',String(m.revealTarget));
      root.current.style.setProperty('--elastic-caption-offset',`${(1-m.reveal)*6}px`);
      renderer.current?.draw(poses,width,h,reduced?0:m.velocity,clamp(stretch,0,2,1),clamp(blur,0,2,1),Math.min(window.devicePixelRatio||1,clamp(pixelRatio,.5,2,1.5)));
    };
    const wake=()=>{if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}};
    const tick=time=>{
      frame=0;if(!visible||document.hidden)return;
      const elapsed=last?(time-last)/1000:1/60,dt=Math.min(elapsed,.04);last=time;
      if(m.entering&&ready){m.introTime+=elapsed*1000;if(m.introTime>=expandAt)m.revealTarget=1;}
      const before=m.position;
      m.position=reduced?m.target:mix(m.position,m.target,1-Math.exp(-12*dt));
      if(Math.abs(m.position-m.target)<.0005)m.position=m.target;
      const targetVelocity=reduced?0:clamp((m.position-before)/dt/5,-1.4,1.4,0);
      m.velocity=mix(m.velocity,targetVelocity,1-Math.exp(-10*dt));if(Math.abs(m.velocity)<.002)m.velocity=0;
      m.reveal=reduced?1:mix(m.reveal,m.revealTarget,1-Math.exp(-5.2*dt));if(Math.abs(m.reveal-m.revealTarget)<.001)m.reveal=m.revealTarget;
      m.revealVelocity=reduced||m.reveal===1?0:(m.revealTarget-m.reveal)*5.2;
      if(m.reveal===1)m.entering=false;
      m.detail=reduced?m.detailTarget:mix(m.detail,m.detailTarget,1-Math.exp(-9*dt));if(Math.abs(m.detail-m.detailTarget)<.001)m.detail=m.detailTarget;
      const nearest=Math.round(m.position),index=mod(nearest,count);
      if(nearest!==m.anchor){m.anchor=nearest;setAnchor(nearest);}
      if(index!==m.active){m.active=index;setActive(index);callbacks.current.onIndexChange?.(index,entries[index]);}
      draw();
      if((m.entering&&ready)||m.position!==m.target||m.velocity||m.reveal!==m.revealTarget||m.detail!==m.detailTarget)frame=requestAnimationFrame(tick);
    };
    api.current={wake,draw};
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
    document.addEventListener('visibilitychange',visibility);draw();wake();
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);};
  },[width,h,count,cardW,cardH,spacing,small,reduced,visible,stretch,blur,pixelRatio,imageKey,epoch,ready,expandAt]);
  useLayoutEffect(()=>{api.current.draw();},[anchor,mode,width,h,count]);

  const expand=()=>{motion.current.entering=false;motion.current.revealTarget=1;api.current.wake();};
  const navigate=delta=>{if(count<2)return;motion.current.target=Math.round(motion.current.target)+delta;expand();};
  const detail=value=>{if(value===opened)return;expand();motion.current.detailTarget=value?1:0;setOpened(value);callbacks.current.onOpenChange?.(value);api.current.wake();};
  const choose=logical=>{
    if(ignore.current)return;
    const m=motion.current;expand();
    if(Math.abs(logical-m.position)<.45)detail(!opened);else{m.target=logical;api.current.wake();}
  };
  const end=event=>{
    const gesture=drag.current;if(!gesture||gesture.id!==event.pointerId)return;drag.current=null;root.current.dataset.dragging='false';
    if(root.current.hasPointerCapture(event.pointerId))root.current.releasePointerCapture(event.pointerId);
    if(gesture.moved){motion.current.target=Math.round(motion.current.target);ignore.current=true;clearTimeout(clickTimer.current);clickTimer.current=setTimeout(()=>{ignore.current=false;},0);api.current.wake();}
  };
  const seen=new Set();
  // Put the nearest copy first for a single accessible button per image.
  const ordered=[...logicals].sort((a,b)=>Math.abs(a-anchor)-Math.abs(b-anchor));
  return <section ref={root} className={`elastic-carousel ${className}`} data-renderer={mode} data-index={selected} data-open={opened} style={{height:h,'--elastic-stretch':stretch,'--elastic-blur':blur}} role="region" aria-roledescription="carousel" aria-label="Elastic image carousel" tabIndex={0}
    onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();navigate(event.key==='ArrowRight'?1:-1);}else if(event.key==='Escape'){event.preventDefault();detail(false);root.current.focus({preventScroll:true});}else if((event.key==='Enter'||event.code==='Space')&&event.target===root.current){event.preventDefault();detail(!opened);}}}
    onPointerDown={event=>{if(count<2||event.button!==0||!event.isPrimary||event.target.closest('.elastic-carousel__controls,.elastic-carousel__close'))return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,start:motion.current.position,moved:false};}}
    onPointerMove={event=>{const gesture=drag.current;if(!gesture||gesture.id!==event.pointerId)return;const dx=event.clientX-gesture.x;if(!gesture.moved&&Math.abs(event.clientY-gesture.y)>Math.abs(dx))return;if(Math.abs(dx)>5){gesture.moved=true;root.current.setPointerCapture(event.pointerId);root.current.dataset.dragging='true';expand();motion.current.target=gesture.start-dx/step;api.current.wake();}}}
    onPointerUp={end} onPointerCancel={end} onClickCapture={event=>{if(ignore.current){event.preventDefault();event.stopPropagation();}}}>
    <canvas ref={canvas} className="elastic-carousel__canvas" aria-hidden="true" style={{visibility:count?undefined:'hidden'}} />
    <div className="elastic-carousel__hit-area">{ordered.map(logical=>{const index=mod(logical,count),item=entries[index],duplicate=seen.has(index);seen.add(index);return <button key={logical} ref={element=>{if(element)nodes.current.set(logical,element);else nodes.current.delete(logical);}} className="elastic-carousel__card" data-logical={logical} type="button" tabIndex={-1} aria-label={`${logical===anchor?'View':'Show'} ${item.title||`image ${index+1}`}`} aria-current={logical===anchor?'true':undefined} aria-hidden={duplicate||opened&&logical!==anchor?true:undefined} onClick={()=>choose(logical)}><Photo key={item.src} item={item} hidden={duplicate}/></button>;})}</div>
    {count>0?<><div className="elastic-carousel__title" aria-live="polite"><p>{entries[selected]?.title}</p></div><div className="elastic-carousel__counter">{String(selected+1).padStart(2,'0')}/{String(count).padStart(2,'0')}</div>{opened&&<button type="button" className="elastic-carousel__close" onClick={()=>detail(false)}>Close</button>}{showControls&&<div className="elastic-carousel__controls"><button type="button" aria-label="Previous image" disabled={count<2} onClick={()=>navigate(-1)}>←</button><span>Drag to explore · Click to view</span><button type="button" aria-label="Next image" disabled={count<2} onClick={()=>navigate(1)}>→</button></div>}</>:<p className="elastic-carousel__empty">Add items to start your reel.</p>}
  </section>;
}
