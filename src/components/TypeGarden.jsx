'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './TypeGarden.css';

// Original botanical geometry. Only the public interaction and palette were used as a reference.
export const gardenPalettes = [
  ['Rose noir','#000000','#ff1400','#3257ff','#ffffff'],
  ['Paper','#f3eee4','#ff3b1f','#1c2b8f','#111111'],
  ['Midnight','#0d1b4c','#ff5a4e','#9fb4ff','#ffffff'],
  ['Citrus','#0e1a12','#ff8a00','#1fa463','#fff6e8'],
  ['Orchid','#140a1f','#e63cff','#2fb8a6','#ffffff'],
  ['Moss','#133a2a','#ffb7c5','#7fd18b','#f6f1e7'],
  ['Tomato','#ff1400','#fff1e0','#0b0b0b','#000000'],
  ['Butter','#ffe9a8','#e4002b','#0f5132','#1a1a1a'],
  ['Blush','#fad4d8','#c8102e','#274690','#1a1a1a'],
  ['Mono','#000000','#f2f2f2','#6e6e6e','#ffffff'],
];
export const gardenMotions = [
  ['breathe','Breathe','Slow sway',3],['grow','Grow & wither','Bloom, then back',6],
  ['typed','Typed','Type, cut, repeat',5],['gust','Gust','Wind sweeps through',4],
  ['reach','Reach','Stems follow a light',6],['scatter','Scatter','Random bloom, fade',6],
  ['visitor','Visitor','Butterfly drops by',7],
];
const fontURL = new URL('./type-garden/BodoniModa.ttf', import.meta.url).href;
const fontFamily = 'Type Garden Serif, Georgia, serif';
const clamp = (v,a,b,f=a) => Number.isFinite(Number(v))?Math.max(a,Math.min(b,Number(v))):f;
const chars = text => typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(x=>x.segment):Array.from(text);
const clean = (text,max) => chars(String(text??'').replace(/[\r\n\t]/g,' ')).slice(0,max).join('');
const escapeXML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const ease = x => 1-Math.pow(1-clamp(x,0,1),3);
function random(seed) { let s=seed>>>0;return()=>{s+=0x6D2B79F5;let x=Math.imul(s^s>>>15,1|s);x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296;}; }
const lengths = new Map(), rasterPaths = new Map();
let ruler;
function curveLength(d) {
  if(lengths.has(d))return lengths.get(d);
  ruler ||= document.createElementNS('http://www.w3.org/2000/svg','path');
  ruler.setAttribute('d',d);const length=Math.max(.01,ruler.getTotalLength());
  if(lengths.size>4096)lengths.clear();lengths.set(d,length);return length;
}
const path = (d,fill='none',stroke,strokeWidth=1) => ({tag:'path',d,fill,stroke,strokeWidth,length:stroke?curveLength(d):0});
const smooth = x => {const t=clamp(x,0,1);return t*t*(3-2*t);};
const unfold = x => {const t=clamp(x,0,1)-1;return 1+2.70158*t*t*t+1.70158*t*t;};
function trace(node,progress) {
  if(node.tag==='g')return {...node,children:node.children.map(child=>trace(child,progress))};
  return node.stroke?{...node,reveal:clamp(progress,0,1)}:node;
}
// Grow along each curve; only leaves and buds scale about their own attachment points.
function plantAtAge(plant,age) {
  if(age>=1600)return {back:plant.back,front:[...plant.front,...plant.blooms]};
  const back=plant.back.map((node,i)=>{
    if(node.tag==='g'){
      const stemProgress=smooth((age-25)/620);
      const opening=Math.min(ease((age-(180+(i-1)*90))/300),smooth((stemProgress-(.28+(i-1)*.22))/.2));
      return {...node,scale:node.scale*opening,rotate:node.rotate+(1-opening)*(i%2?22:-22)};
    }
    return trace(node,smooth((age-(i?55:25))/620));
  });
  const blooms=plant.blooms.map((bloom,i)=>{
    const open=(age-460-i*95)/700,scale=unfold(open);
    if(open<=0)return {...bloom,scale:0};
    const children=bloom.children.map((n,j)=>j===0?n:trace(n,smooth((age-(j===1?900:700+(j-2)*40)-i*95)/500)));
    return {...bloom,children,scale:bloom.scale*scale,rotate:bloom.rotate+(1-clamp(open,0,1))*48};
  });
  return {back,front:[...plant.front.map(n=>trace(n,smooth((age-25)/400))),...blooms]};
}
function witherPlant(plant,progress,age) {
  const base=plantAtAge(plant,age);
  const shrink=node=>node.tag==='g'?{...node,scale:node.scale*progress,rotate:node.rotate+(1-progress)*16}:trace(node,Math.min(node.reveal??1,progress));
  return [...base.back.map(shrink),...base.front.map(shrink)];
}
function settleLayout(target,state,now,reduced,growth) {
  const dt=state.last?Math.min(.064,(now-state.last)/1000):1/60;
  state.last=now;const alpha=reduced?1:1-Math.exp(-12*dt),next=[];
  const blend=(a,b)=>Math.abs(a-b)<.015?b:a+(b-a)*alpha;
  const nodes=target.nodes.map((n,i)=>{
    const old=state.nodes?.[i],birth=growth?.[i];
    const value=old?.letter===n.letter&&old.birth===birth?old:{...n,birth};
    const result={...n,birth};
    for(const key of ['x','y','font','advance'])result[key]=blend(value[key],n[key]);
    result.unit=result.font/200;next.push(result);return result;
  });
  const caretTarget=target.start+target.textWidth+target.font*.045;
  state.caret=blend(state.caret??target.w/2,caretTarget);state.nodes=next;
  state.font=blend(state.font??target.font,target.font);state.baseline=blend(state.baseline??target.baseline,target.baseline);
  return {...target,nodes,font:state.font,baseline:state.baseline,caretX:state.caret};
}
const group = (children,x=0,y=0,rotate=0,scale=1,opacity=1) => ({tag:'g',children,x,y,rotate,scale,opacity});
function leaf(x,y,angle,length,stem,bg) {
  return group([path(`M0 0 Q${-length*.46} ${-length*.55} 0 ${-length} Q${length*.5} ${-length*.48} 0 0Z`,stem),path(`M0 -2 Q${length*.08} ${-length*.42} 0 ${-length*.87}`,'none',bg,1.4)],x,y,angle);
}
function rose(r,petal,ink,rand) {
  const phase=rand()*6.28,points=[];
  for(let k=0;k<=80;k++) {const t=k/80*Math.PI*2,rr=r*(1+.08*Math.sin(5*t+phase)+.035*Math.sin(9*t+phase));points.push(`${k?'L':'M'}${(Math.cos(t)*rr*1.13).toFixed(2)} ${(Math.sin(t)*rr*.68).toFixed(2)}`);}
  const details=[path(points.join(' ')+'Z',petal)];
  // Overlapping, incomplete inner petals rather than a generic radial daisy.
  const spiral=[];
  for(let k=0;k<64;k++){const t=k/63*Math.PI*3.1,rr=r*(.035+.055*t);spiral.push(`${k?'L':'M'}${(Math.cos(t)*rr*1.13).toFixed(2)} ${(Math.sin(t)*rr*.59).toFixed(2)}`);}
  details.push(path(spiral.join(' '),'none',ink,1.35));
  for(let k=0;k<3;k++){
    const a=k*Math.PI*2/3+phase,rr=r*(.48+rand()*.15);
    details.push(group([path(`M${-rr*.6} ${-rr*.55} Q0 ${-rr*1.12} ${rr*.78} ${-rr*.5} Q${rr*1.15} ${-rr*.1} ${rr*.8} ${rr*.18}`,'none',ink,1.35)],0,0,a*180/Math.PI));
  }
  return details;
}
function plant(index,letter,seed,palette,density) {
  const rnd=random(seed+index*1741+letter.codePointAt(0)*83),[,bg,petal,stem,ink]=palette;
  const downward=index%5===3,tipX=(rnd()-.5)*85,tipY=(downward?1:-1)*(94+rnd()*60),r=34+rnd()*21;
  const startX=(rnd()-.5)*26;
  const stemPath=`M${startX} 8 C${startX-40} ${tipY*.26} ${tipX+34} ${tipY*.66} ${tipX} ${tipY}`;
  const back=[path(stemPath,'none',stem,3.1)];
  for(let j=0;j<3;j++) {
    const f=.28+j*.22,u=1-f;
    const x=u*u*u*startX+3*u*u*f*(startX-40)+3*u*f*f*(tipX+34)+f*f*f*tipX;
    const y=u*u*u*8+3*u*u*f*tipY*.26+3*u*f*f*tipY*.66+f*f*f*tipY;
    back.push(leaf(x,y,(j%2?-48:52)+(downward?180:0),29+rnd()*24,stem,bg));
  }
  const curlSide=rnd()>.5?1:-1;
  if(rnd()>.4)back.push(path(`M${startX} 5 C${curlSide*62} -30 ${curlSide*88} 44 ${curlSide*108} 3 C${curlSide*119} -20 ${curlSide*86} -21 ${curlSide*91} -1`,'none',stem,2.4));
  const blooms=[group(rose(r,petal,ink,rnd),tipX,tipY,(rnd()-.5)*32)];
  if(rnd()<.85*density){const x=tipX+(rnd()>.5?1:-1)*(35+rnd()*17),y=tipY+30+rnd()*23;back.push(path(`M${startX} 6 Q${x*.15} ${y*.6} ${x} ${y}`,'none',stem,2.5));blooms.push(group(rose(r*.55,petal,ink,rnd),x,y,(rnd()-.5)*50));}
  const front=[path(`M${startX+4} 4 Q${startX+12} 26 ${startX+17} 35`,'none',stem,3)];
  return {back,blooms,front,phase:rnd()*Math.PI*2};
}

function layout(text,w,h,options,measure) {
  const letters=chars(text),{fontSize,seed,palette,density}=options;
  let font=Math.min(fontSize,h*.32,w*.62);
  measure.font=`${font}px "Type Garden Serif", Georgia, serif`;
  const maxW=w*.8,total=measure.measureText(text).width;
  if(total>maxW)font*=maxW/total;
  measure.font=`${font}px "Type Garden Serif", Georgia, serif`;
  const textWidth=measure.measureText(text).width,start=(w-textWidth)/2,baseline=h/2+font*.32;
  let prefix='';
  const nodes=letters.map((letter,i)=>{
    const x=start+measure.measureText(prefix).width;prefix+=letter;
    const advance=measure.measureText(prefix).width-(x-start);
    return {letter,index:i,x,y:baseline,advance,font,unit:font/200,plant:letter.trim()?plant(i,letter,seed,palette,density):null};
  });
  return {w,h,nodes,palette,font,text,start,textWidth,baseline};
}
function sample(scene,time,motion='breathe',growth=null,reduced=false,caret=false) {
  const {w,h,nodes,palette,font,baseline,start,textWidth}=scene,[,bg,,stem,ink]=palette;
  const duration=(gardenMotions.find(m=>m[0]===motion)||gardenMotions[0])[3];
  const phase=(time%duration)/duration*Math.PI*2,cycle=(time%duration)/duration;
  const back=[],front=[],type=[];
  let typedCount=nodes.length;
  if(motion==='typed'&&!reduced){const p=cycle<.65?cycle/.65:Math.max(0,(1-cycle)/.22);typedCount=Math.floor(Math.min(1,p)*nodes.length);}
  for(const n of nodes) {
    const {index,x,y,unit,plant:p,letter,advance,font}=n;
    const born=growth?.[index];
    let age=reduced||born===undefined?Infinity:Math.max(0,time*1000-born);
    if(!reduced&&motion==='grow')age=(cycle<.4?cycle/.4:cycle<.6?1:(1-cycle)/.4)*1600;
    if(!reduced&&motion==='typed'&&growth===null)age=Math.max(0,(time%duration-index*duration*.65/Math.max(1,nodes.length))*1000);
    let grow=1;
    if(!reduced&&motion==='scatter')grow=Math.pow(Math.max(0,Math.sin(phase-index*2.39)),.5);
    if(index>=typedCount)grow=0;
    if(index<typedCount)type.push({tag:'text',x,y,text:letter,font,fill:ink,opacity:reduced?1:ease(age/32)});
    if(!p)continue;
    let sway=reduced?0:Math.sin(phase+p.phase)*1.4;
    if(!reduced&&motion==='gust')sway+=Math.sin(phase-index*.24)*10;
    if(!reduced&&motion==='reach')sway+=Math.sin(phase)*13;
    const px=x+advance*.5,py=y-font*.16;
    if(grow>.001){
      const parts=plantAtAge(p,age);
      back.push(group(parts.back,px,py,sway,unit*grow));
      front.push(group(parts.front,px,py,sway,unit*grow));
    }
    // A word boundary cuts the connecting vine; it does not erase existing flowers.
    if(index&&nodes[index-1].plant&&grow>.001){const prev=nodes[index-1],x0=prev.x+prev.advance*.5;back.push(trace(path(`M${x0} ${py+font*.06} C${x0+advance*.5} ${py+font*(.15+Math.sin(p.phase)*.7)} ${px-advance*.4} ${py+font*(.08+Math.cos(p.phase)*.8)} ${px} ${py+font*.06}`,'none',stem,Math.max(1,font*.016)),smooth((age-45)/650)));}
  }
  if(caret&&nodes.length)front.push(path(`M${scene.caretX??start+textWidth+font*.045} ${baseline-font*.76} V${baseline+font*.07}`,'none',ink,Math.max(1,font*.025)));
  if(motion==='visitor'&&!reduced&&nodes.length){const x=w/2+Math.cos(phase)*w*.29,y=h*.29+Math.sin(phase*2)*h*.055,wing=.5+Math.abs(Math.sin(phase*18))*.5;front.push(group([group([path('M0 0 C-44 -40 -48 20 0 10 C44 20 44 -40 0 0Z',palette[2],ink,.8)],0,0,0,wing),path('M0 -8 L0 16','none',stem,3)],x,y,Math.sin(phase)*20,w/900));}
  return {w,h,bg,nodes:[...back,...type,...front]};
}
function drawNodes(ctx,nodes) {
  for(const n of nodes){ctx.save();if(n.opacity!==undefined)ctx.globalAlpha*=n.opacity;
    if(n.tag==='g'){ctx.translate(n.x,n.y);ctx.rotate(n.rotate*Math.PI/180);ctx.scale(n.scale,n.scale);drawNodes(ctx,n.children);}
    else if(n.tag==='text'){ctx.fillStyle=n.fill;ctx.font=`${n.font}px "Type Garden Serif", Georgia, serif`;ctx.fillText(n.text,n.x,n.y);}
    else {let p=rasterPaths.get(n.d);if(!p){p=new Path2D(n.d);if(rasterPaths.size>4096)rasterPaths.clear();rasterPaths.set(n.d,p);}if(n.fill&&n.fill!=='none'){ctx.fillStyle=n.fill;ctx.fill(p);}if(n.stroke&&(n.reveal??1)>0){if(n.reveal!==undefined&&n.reveal<1){ctx.setLineDash([n.length,n.length]);ctx.lineDashOffset=n.length*(1-n.reveal);}ctx.strokeStyle=n.stroke;ctx.lineWidth=n.strokeWidth;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(p);}}
    ctx.restore();
  }
}
function draw(ctx,scene,ratio=1) {ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle=scene.bg;ctx.fillRect(0,0,scene.w,scene.h);drawNodes(ctx,scene.nodes);}
function svgNodes(nodes) {return nodes.map(n=>n.tag==='g'?`<g transform="translate(${n.x} ${n.y}) rotate(${n.rotate}) scale(${n.scale})" opacity="${n.opacity??1}">${svgNodes(n.children)}</g>`:n.tag==='text'?`<text x="${n.x}" y="${n.y}" font-family="${fontFamily}" font-size="${n.font}" fill="${n.fill}" opacity="${n.opacity??1}">${escapeXML(n.text)}</text>`:`<path d="${n.d}" opacity="${n.reveal===0?0:1}" fill="${n.fill||'none'}"${n.stroke?` stroke="${n.stroke}" stroke-width="${n.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${n.reveal!==undefined?` stroke-dasharray="${n.length} ${n.length}" stroke-dashoffset="${n.length*(1-n.reveal)}"`:""}`:''}/>`).join('');}
let fontData;
async function embeddedFont() {if(!fontData)fontData=fetch(fontURL).then(r=>{if(!r.ok)throw Error('Font could not be loaded');return r.blob();}).then(blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);})).catch(error=>{fontData=null;throw error;});return fontData;}
async function svgFile(scene) {const font=await embeddedFont();return `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.w}" height="${scene.h}" viewBox="0 0 ${scene.w} ${scene.h}"><style>@font-face{font-family:'Type Garden Serif';src:url('${font}') format('truetype');font-weight:400}</style><rect width="100%" height="100%" fill="${scene.bg}"/>${svgNodes(scene.nodes)}</svg>`;}
const blobPNG = canvas => new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Image export failed')),'image/png'));
function save(blob,name) {const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
// Small dependency-free, uncompressed ZIP writer for numbered PNG frames.
function zipFiles(files) {
  const table=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;table[i]=c;}
  const locals=[],central=[];let offset=0,centralSize=0;
  for(const [name,data] of files){const nameBytes=new TextEncoder().encode(name);let crc=0xffffffff;for(const byte of data)crc=table[(crc^byte)&255]^(crc>>>8);crc=(crc^0xffffffff)>>>0;
    const local=new Uint8Array(30+nameBytes.length),a=new DataView(local.buffer);a.setUint32(0,0x04034b50,true);a.setUint16(4,20,true);a.setUint32(14,crc,true);a.setUint32(18,data.length,true);a.setUint32(22,data.length,true);a.setUint16(26,nameBytes.length,true);local.set(nameBytes,30);
    const dir=new Uint8Array(46+nameBytes.length),d=new DataView(dir.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,nameBytes.length,true);d.setUint32(42,offset,true);dir.set(nameBytes,46);
    locals.push(local,data);central.push(dir);offset+=local.length+data.length;centralSize+=dir.length;
  }
  const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);
  return new Blob([...locals,...central,end],{type:'application/zip'});
}
function videoType() {if(typeof MediaRecorder==='undefined')return null;return ['video/mp4;codecs=avc1.42001E','video/mp4','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t))||null;}

export default function TypeGarden({initialText='',initialMode='type',initialPalette='Rose noir',initialMotion='breathe',height=720,fontSize=240,density=1,seed=23,maxLength=80,exportSize=1080,exportFps=30,autoFocus=false,onTextChange,onExport,className=''}) {
  const maximum=Math.round(clamp(maxLength,1,160,80));
  const [text,setText]=useState(()=>clean(initialText,maximum)),[posterText,setPosterText]=useState(()=>clean(initialText||'in bloom',maximum));
  const [mode,setMode]=useState(initialMode==='poster'?'poster':'type'),[paletteName,setPaletteName]=useState(initialPalette),[motion,setMotion]=useState(initialMotion),[regrow,setRegrow]=useState(0);
  const [size,setSize]=useState({w:1200,h:720}),[fontReady,setFontReady]=useState(0),[reduced,setReduced]=useState(false),[visible,setVisible]=useState(true),[busy,setBusy]=useState(''),[progress,setProgress]=useState(0),[status,setStatus]=useState(''),[mime,setMime]=useState(null);
  const root=useRef(null),canvas=useRef(null),input=useRef(null),measure=useRef(null),born=useRef([]),ghosts=useRef([]),sceneRef=useRef(null),exportJob=useRef(null),alive=useRef(true),callbacks=useRef({onTextChange,onExport}),clock=useRef(0);
  const presentation=useRef({nodes:[],last:0}),lastEdit=useRef(0);
  callbacks.current={onTextChange,onExport};
  const palette=gardenPalettes.find(p=>p[0]===paletteName)||gardenPalettes[0];
  const motionName=gardenMotions.some(m=>m[0]===motion)?motion:'breathe',duration=gardenMotions.find(m=>m[0]===motionName)[3];
  const displayText=mode==='type'?text:posterText;
  const options=useMemo(()=>({palette,fontSize:clamp(fontSize,60,360,240),density:clamp(density,0,2,1),seed:Math.round(clamp(seed,0,999999,23))+regrow*7919}),[palette,fontSize,density,seed,regrow]);
  useLayoutEffect(()=>{const observer=new ResizeObserver(([e])=>setSize({w:Math.max(1,e.contentRect.width),h:Math.max(1,e.contentRect.height)}));observer.observe(root.current);return()=>observer.disconnect();},[]);
  useEffect(()=>{
    alive.current=true;measure.current=document.createElement('canvas').getContext('2d');setMime(videoType());
    const media=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(media.matches);change();media.addEventListener('change',change);
    const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting));observer.observe(root.current);
    document.fonts.load('240px "Type Garden Serif"').catch(()=>{}).then(()=>{if(alive.current)setFontReady(v=>v+1);});
    if(autoFocus)input.current?.focus({preventScroll:true});
    return()=>{alive.current=false;observer.disconnect();media.removeEventListener('change',change);if(exportJob.current)exportJob.current.aborted=true;};
  },[]);
  const scene=useMemo(()=>{
    if(!measure.current)return null;
    return layout(displayText,mode==='poster'?1080:size.w,mode==='poster'?1080:size.h,mode==='poster'?{...options,fontSize:options.fontSize*.8}:options,measure.current);
  },[displayText,mode,size,options,fontReady]);
  sceneRef.current=scene;
  useEffect(()=>{
    if(!scene||!canvas.current)return;let frame=0,last=0;
    const element=canvas.current,ctx=element.getContext('2d');if(!ctx)return;
    const ratio=mode==='poster'?1:Math.min(devicePixelRatio||1,2);
    if(element.width!==Math.round(scene.w*ratio))element.width=Math.round(scene.w*ratio);if(element.height!==Math.round(scene.h*ratio))element.height=Math.round(scene.h*ratio);
    const render=now=>{
      frame=0;if(!visible||document.hidden)return;
      if(now-last>(mode==='type'?0:30)||reduced){last=now;clock.current=now/1000;
        const live=mode==='type'?settleLayout(scene,presentation.current,now,reduced,born.current):scene;
        const sampled=sample(live,now/1000,mode==='type'?'breathe':motionName,mode==='type'?born.current:null,reduced,mode==='type'&&document.activeElement===input.current&&Math.floor((now-lastEdit.current)/500)%2===0);
        ghosts.current=ghosts.current.filter(g=>now-g.start<280);
        if(mode==='type'&&!reduced)for(const ghost of ghosts.current){
          const progress=1-ease((now-ghost.start)/280);
          sampled.nodes.push(group(witherPlant(ghost.plant,progress,ghost.age),ghost.x,ghost.y,0,ghost.scale,progress));
        }
        draw(ctx,sampled,ratio);
      }
      if(!reduced&&(displayText||ghosts.current.length))frame=requestAnimationFrame(render);
    };
    const wake=()=>{if(!frame){last=0;frame=requestAnimationFrame(render);}};
    const visibility=()=>{cancelAnimationFrame(frame);frame=0;if(!document.hidden)wake();};document.addEventListener('visibilitychange',visibility);wake();
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);};
  },[scene,reduced,visible,mode,motionName,displayText]);

  const changeText=value=>{
    const next=clean(value,maximum),old=chars(text),fresh=chars(next);let shared=0;while(shared<old.length&&shared<fresh.length&&old[shared]===fresh[shared])shared++;
    const now=performance.now();lastEdit.current=now;
    if(sceneRef.current&&fresh.length<old.length&&!reduced){
      for(const original of sceneRef.current.nodes.slice(shared)){
        const n=presentation.current.nodes[original.index]||original;
        if(n.plant)ghosts.current.push({start:now,plant:n.plant,age:born.current[n.index]===undefined?Infinity:now-born.current[n.index],x:n.x+n.advance*.5,y:n.y-n.font*.16,scale:n.unit});
      }
      ghosts.current=ghosts.current.slice(-20);
    }

    born.current=fresh.map((_,i)=>i<shared?born.current[i]:now);setText(next);callbacks.current.onTextChange?.(next);setStatus('');
  };
  const focusTyping=()=>{if(mode==='type'){input.current?.focus({preventScroll:true});const length=input.current?.value.length||0;input.current?.setSelectionRange(length,length);}};
  const clear=()=>{if(mode==='type')changeText('');else{setPosterText('');callbacks.current.onTextChange?.('');}};
  const freshGarden=()=>{setRegrow(v=>v+1);born.current=chars(text).map(()=>performance.now());setStatus('A new garden, from the same words.');};
  const snapshot=(time=clock.current,poster=mode==='poster')=>{
    const width=poster?Math.round(clamp(exportSize,256,1080,1080)):Math.round(size.w),h=poster?width:Math.round(size.h);
    const composition=layout(displayText,width,h,poster?{...options,fontSize:options.fontSize*.8*width/1080}:options,measure.current);
    if(!poster)composition.nodes=composition.nodes.map((n,i)=>{
      const pose=presentation.current.nodes[i];
      return pose?.letter===n.letter?{...n,x:pose.x,y:pose.y,font:pose.font,unit:pose.unit,advance:pose.advance}:n;
    });
    return sample(composition,time,poster?motionName:'breathe',poster?null:born.current,poster?false:reduced,false);
  };
  const exportArt=async kind=>{
    if(exportJob.current||!displayText)return;const job={aborted:false};exportJob.current=job;setBusy(kind);setProgress(0);setStatus('');let recorder,stream;
    const check=()=>{if(job.aborted||!alive.current)throw new DOMException('Cancelled','AbortError');};
    try {
      await document.fonts.load('240px "Type Garden Serif"');check();
      let blob,extension=kind;
      if(kind==='svg'||kind==='copy'){
        const source=await svgFile(snapshot());check();
        if(kind==='copy'){await navigator.clipboard.writeText(source);setStatus('SVG code copied');return;}
        blob=new Blob([source],{type:'image/svg+xml'});
      }else{
        const surface=document.createElement('canvas'),first=snapshot(),ctx=surface.getContext('2d');surface.width=first.w;surface.height=first.h;
        if(!ctx)throw Error('Canvas export is unavailable');
        if(kind==='png'){draw(ctx,first);blob=await blobPNG(surface);}
        else{
          const fps=Math.round(clamp(exportFps,6,30,30)),frames=Math.round(duration*fps);
          if(kind==='frames'){
            const files=[];
            for(let i=0;i<frames;i++){check();draw(ctx,snapshot(i/fps,true));const png=await blobPNG(surface);files.push([`frame-${String(i+1).padStart(4,'0')}.png`,new Uint8Array(await png.arrayBuffer())]);setProgress(Math.round((i+1)/frames*100));await new Promise(r=>setTimeout(r,0));}
            blob=zipFiles(files);extension='zip';
          }else{
            if(!mime||!surface.captureStream)throw Error('Video recording is unavailable. Use PNG frames instead.');
            stream=surface.captureStream(0);const track=stream.getVideoTracks()[0],parts=[];
            recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8_000_000});
            const complete=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};recorder.onerror=()=>reject(Error('Video encoding failed; try PNG frames.'));recorder.onstop=()=>resolve(new Blob(parts,{type:mime.split(';')[0]}));});
            recorder.start();
            for(let i=0;i<frames;i++){check();draw(ctx,snapshot(i/fps,true));track.requestFrame();setProgress(Math.round((i+1)/frames*100));await new Promise(r=>setTimeout(r,1000/fps));}
            recorder.stop();blob=await complete;extension=mime.includes('mp4')?'mp4':'webm';
          }
        }
      }
      check();save(blob,`type-garden${kind==='frames'?'-frames':''}.${extension}`);callbacks.current.onExport?.({format:extension,blob});setStatus(`${extension.toUpperCase()} exported`);
    }catch(error){if(alive.current)setStatus(error.name==='AbortError'?'Export cancelled':error.message||'Export failed. Please try again.');}
    finally{if(recorder&&recorder.state!=='inactive')recorder.stop();stream?.getTracks().forEach(t=>t.stop());exportJob.current=null;if(alive.current){setBusy('');setProgress(0);}}
  };
  const paletteButtons=large=>gardenPalettes.map(p=><button key={p[0]} type="button" aria-label={p[0]} title={p[0]} aria-pressed={palette[0]===p[0]} disabled={!!busy} className={large?'tg-palette-card':'tg-swatch'} onClick={()=>setPaletteName(p[0])} style={{'--swatch-bg':p[1],'--swatch-flower':p[2],'--swatch-stem':p[3],'--swatch-ink':p[4]}}>{large?<><span className="tg-palette-sample"><i/><b/>Aa</span><span>{p[0]}</span></>:<i/>}</button>);
  return <section ref={root} className={`type-garden ${className}`} data-mode={mode} data-palette={palette[0]} data-motion={motionName} style={{height:typeof height==='number'?clamp(height,400,1200,720):height,'--tg-bg':palette[1],'--tg-ink':palette[4],'--tg-square':`${Math.max(180,size.h-96)}px`}} aria-label="Type Garden">
    <div className="tg-mode" role="tablist" aria-label="Garden mode">{['type','poster'].map(m=><button key={m} type="button" role="tab" aria-selected={mode===m} disabled={!!busy} onClick={()=>{setMode(m);setStatus('');if(m==='type')requestAnimationFrame(()=>input.current?.focus({preventScroll:true}));}}>{m==='type'?'Type':'Poster'}</button>)}</div>
    <textarea ref={input} className="tg-input" value={text} aria-label="Type to grow a garden" autoCapitalize="off" autoComplete="off" spellCheck={false} tabIndex={mode==='type'?0:-1} onChange={e=>changeText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();changeText('');}}}/>
    <div className="tg-layout">
      {mode==='poster'&&<aside className="tg-editor"><h2>Poster</h2><p className="tg-subtitle">1:1 · {duration}s loop · {Math.round(clamp(exportFps,6,30,30))} fps</p>
        <label className="tg-field">WORDS<input value={posterText} disabled={!!busy} onChange={e=>{const value=clean(e.target.value,maximum);setPosterText(value);callbacks.current.onTextChange?.(value);}} /></label>
        <button className="tg-pill" type="button" disabled={!!busy} onClick={freshGarden}>Regrow garden</button>
        <h3>MOTION</h3><div className="tg-motion-grid">{gardenMotions.map(([id,label,hint,seconds])=><button key={id} type="button" aria-pressed={motionName===id} disabled={!!busy} onClick={()=>setMotion(id)}><span>{label}</span><small>{hint} · {seconds}s</small></button>)}</div>
        <h3>PALETTE</h3><div className="tg-palette-grid">{paletteButtons(true)}</div>
        <h3>EXPORT · {Math.round(clamp(exportSize,256,1080,1080))} × {Math.round(clamp(exportSize,256,1080,1080))} LOOP</h3>
        <button className="tg-export-video" type="button" disabled={!!busy||!posterText||!mime} onClick={()=>exportArt('video')}>Export {mime?.includes('mp4')?'MP4':'WebM'} loop</button>
        <button className="tg-export-frames" type="button" disabled={!!busy||!posterText} onClick={()=>exportArt('frames')}>PNG frames (.zip)</button>
        {!mime&&<p className="tg-export-note">Video is not supported in this browser. Export PNG frames instead.</p>}
        <div className="tg-still-exports"><button className="tg-pill" type="button" disabled={!!busy||!posterText} onClick={()=>exportArt('png')}>PNG</button><button className="tg-pill" type="button" disabled={!!busy||!posterText} onClick={()=>exportArt('svg')}>SVG</button></div>
      </aside>}
      <div className="tg-artboard" onClick={focusTyping}>
        <canvas ref={canvas} className="tg-canvas" role="img" aria-label={displayText?`A botanical garden growing around “${displayText}”`:'Empty garden. Type to grow flowers.'}/>
      </div>
    </div>
    {mode==='type'&&<><div className="tg-brand"><button className="tg-pill" type="button" disabled={!text||!!busy} onClick={()=>exportArt('copy')}>Copy SVG</button></div>
      <footer className="tg-footer"><div className="tg-instructions"><button type="button" onClick={focusTyping}>type to grow</button><span>space cuts</span><span>backspace withers</span><button type="button" onClick={clear}>enter clears</button></div><div className="tg-tools"><div className="tg-swatches">{paletteButtons(false)}</div><button className="tg-pill" type="button" disabled={!text||!!busy} onClick={()=>exportArt('png')}>PNG</button><button className="tg-pill" type="button" disabled={!text||!!busy} onClick={()=>exportArt('svg')}>SVG</button></div></footer></>}
    <div className="tg-status" role="status" aria-live="polite">{busy?<>{busy==='copy'?'Copying':`Exporting ${progress}%`} <button type="button" onClick={()=>{if(exportJob.current)exportJob.current.aborted=true;}}>Cancel</button></>:status}</div>
    <span className="tg-sr-only" aria-live="polite">{displayText.length?`${chars(displayText).length} characters in your garden`:'Your garden is empty'}</span>
  </section>;
}
