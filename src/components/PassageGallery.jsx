'use client';

import React,{forwardRef,useEffect,useId,useImperativeHandle,useRef,useState} from 'react';
import './PassageGallery.css';

// Independent photo-tunnel gallery: a canvas 2D scene that projects a grid of tiles
// along a corridor and glides the camera through it. No 3D library, no reference
// source: the perspective, tile field, motion blur and focus animation are all drawn
// here from scratch.
export const passageGalleryPresets={
  passage:{},
  daylight:{backgroundColor:'#f2ede6',colors:['#2f3a8f','#e2622e'],lineOpacity:.16,gap:.08,radius:.10,photoFill:.34,accentFill:.10,fog:.85,speed:.4,boost:8,blur:.8,look:1,fov:70,hover:1},
  rush:{backgroundColor:'#07070a',colors:['#3b0ff0','#ff2e9a'],lineOpacity:.10,gap:.06,radius:.04,photoFill:.46,accentFill:.12,fog:1.15,speed:1.7,boost:22,blur:1.6,look:1.2,fov:86,hover:1.1},
  still:{backgroundColor:'#0c0b10',colors:['#8f7bff','#ffb2c9'],lineOpacity:.18,gap:.14,radius:.18,photoFill:.34,accentFill:.08,fog:.55,speed:0,boost:6,blur:.5,look:1.5,fov:64,hover:1.7}
};
const defaults={items:null,colors:['#5227FF','#FF9FFC'],backgroundColor:'#0a0a0a',lanes:5,gap:.1,radius:.06,photoFill:.3,accentFill:.06,lineOpacity:.12,fog:1,speed:.6,boost:10,blur:1,look:1,fov:72,hover:1,focusOnClick:true,captions:true,wheel:true,interactive:true,seed:0,paused:false,dpr:2,ariaLabel:'Photo tunnel. Scroll or drag to travel, hold to speed up, click a photo to view it.',onFocusChange:null};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Exponential smoothing leaves a tiny residue; published values snap it to zero.
const zero=v=>Math.abs(v)<5e-4?0:v;
const numeric=(v,a,b,f)=>{const n=Number(v);return Number.isFinite(n)?clamp(n,a,b):f;};
const FACE_FLOOR=0,FACE_CEILING=1,FACE_LEFT=2,FACE_RIGHT=3;
const FONT='"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace';

function normalize(input){
 // Explicit undefined props must not clobber the defaults.
 const c={...defaults};
 for(const key of Object.keys(input||{}))if(input[key]!==undefined)c[key]=input[key];
 c.lanes=Math.round(numeric(c.lanes,2,12,defaults.lanes));
 c.gap=numeric(c.gap,0,.4,defaults.gap);
 c.radius=numeric(c.radius,0,1,defaults.radius);
 c.photoFill=numeric(c.photoFill,0,1,defaults.photoFill);
 c.accentFill=numeric(c.accentFill,0,.6,defaults.accentFill);
 c.lineOpacity=numeric(c.lineOpacity,0,.6,defaults.lineOpacity);
 c.fog=numeric(c.fog,.2,3,defaults.fog);
 c.speed=clamp(Number(c.speed)||0,-2,4);
 c.boost=numeric(c.boost,1,20,defaults.boost);
 c.blur=numeric(c.blur,0,3,defaults.blur);
 c.look=numeric(c.look,0,3,defaults.look);
 c.fov=clamp(Number(c.fov)||defaults.fov,40,100);
 c.hover=numeric(c.hover,0,2,defaults.hover);
 c.seed=Math.round(clamp(Number(c.seed)||0,0,20));
 c.dpr=numeric(c.dpr,.5,3,defaults.dpr);
 c.colors=Array.isArray(c.colors)&&c.colors.length>=2?c.colors.slice(0,2).map(String):defaults.colors.slice();
 c.backgroundColor=typeof c.backgroundColor==='string'&&c.backgroundColor.trim()?c.backgroundColor.trim().slice(0,40):defaults.backgroundColor;
 c.ariaLabel=typeof c.ariaLabel==='string'&&c.ariaLabel.trim()?c.ariaLabel.trim().slice(0,240):defaults.ariaLabel;
 c.items=Array.isArray(c.items)?c.items.slice(0,48).map((item,index)=>({
  src:typeof item?.src==='string'?item.src.slice(0,2000):'',
  alt:typeof item?.alt==='string'?item.alt.slice(0,220):'',
  title:typeof item?.title==='string'?item.title.slice(0,220):'',
  _i:index
 })).filter(item=>item.src):null;
 for(const key of['focusOnClick','captions','wheel','interactive','paused'])c[key]=!!c[key];
 return c;
}

// Deterministic per-cell content. The same corridor cell keeps the same tile no matter
// how often the camera passes it, which is what makes the tunnel feel like a place.
function hash32(a,b,seed){
 let h=(a*374761393+b*668265263+seed*2246822519)>>>0;
 h=Math.imul(h^(h>>>13),1274126177)>>>0;
 return ((h^(h>>>16))>>>0)/4294967296;
}
// Measured: the reference paints noticeably more tiles than the raw fraction
// suggests, because the fills land per tile and the far ones fade out. Weighting the
// probability reproduces its visible density at 0.06 / 0.3 / 0.6 / 1.
const photoShare=fill=>Math.pow(clamp(fill,0,1),.62);
const accentShare=fill=>Math.pow(clamp(fill,0,.6),.92);
function tileKind(cell,face,slot,config){
 const seed=config.seed;
 const h=hash32(cell*16+face*4+slot,cell+face*7+slot*31,seed);
 const photo=photoShare(config.photoFill),accent=accentShare(config.accentFill);
 if(h<photo)return{pick:'photo',h};
 if(h<photo+accent)return{pick:'accent',h};
 return{pick:'empty',h};
}
function parseColor(value){
 const v=String(value||'').trim();
 if(v==='transparent')return null;
 const hex=v.replace('#','');
 if(/^[0-9a-f]{3}$/i.test(hex))return[parseInt(hex[0]+hex[0],16),parseInt(hex[1]+hex[1],16),parseInt(hex[2]+hex[2],16),1];
 if(/^[0-9a-f]{6}$/i.test(hex))return[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16),1];
 const m=v.match(/^rgba?\(([^)]+)\)$/i);
 if(m){const parts=m[1].split(',').map(Number);if(parts.length>=3&&parts.slice(0,3).every(Number.isFinite))return[clamp(parts[0],0,255),clamp(parts[1],0,255),clamp(parts[2],0,255),parts.length>3?clamp(parts[3],0,1):1];}
 return null;
}
const rgba=(c,a)=>`rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a.toFixed(3)})`;
const mixColor=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const smoothTo=(current,target,time,dt)=>current+(target-current)*(time<=0?1:1-Math.exp(-dt/time));

function averageColour(image){
 try{
  const c=document.createElement('canvas');c.width=c.height=1;
  const g=c.getContext('2d',{willReadFrequently:true});
  g.drawImage(image,0,0,1,1);
  const d=g.getImageData(0,0,1,1).data;
  return[d[0],d[1],d[2]];
 }catch{return[70,50,120];}
 }
function createEngine(parts,report,initial){
 const{root,canvas,caption,captionTitle,captionIndex,list}=parts;
 const ctx=canvas.getContext('2d');
 let c=normalize(initial);
 let W=0,H=0,DPR=1,dead=false,raf=0,running=false,last=0,frames=0,reported='',phase='';
 // Camera: travel is the position along the corridor, look* is the smoothed pointer aim.
 let travel=0,velocity=0,yaw=0,pitch=0,lookX=0,lookY=0,shiftX=0,shiftY=0,renderOffset=0;
 let hover=null,focus=null,pointer={x:.5,y:.5,inside:false,down:false,dragging:false,moved:0,lastX:0,lastY:0,dragVel:0};
 let visible=true,hidden=false,reduced=false,painted=false,imgReady=0,imgFailed=0;
 const images=[];
 const base=[];
 const setData=(key,value)=>{value=String(value);if(root.dataset[key]!==value)root.dataset[key]=value;};
 const listen=(target,event,fn,options)=>{target.addEventListener(event,fn,options);base.push(()=>target.removeEventListener(event,fn,options));};
 const mediaQuery=typeof window!=='undefined'&&window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
 reduced=!!mediaQuery?.matches;

 function items(){return c.items||[];}
 function bg(){return parseColor(c.backgroundColor);}
 function lineColor(){
  const back=bg();
  if(!back)return[255,255,255];
  const luma=(back[0]*.299+back[1]*.587+back[2]*.114)/255;
  return luma>.55?[0,0,0]:[255,255,255];
 }
 function loadImages(){
  images.length=0;imgReady=0;imgFailed=0;
  const source=items();
  for(let i=0;i<source.length;i++){
   const record={item:source[i],image:null,ready:false,failed:false};
   images.push(record);
   if(typeof Image==='undefined'){record.failed=true;imgFailed++;continue;}
   const image=new Image();
   if(!/^data:|^blob:/.test(record.item.src)&&!/^\//.test(record.item.src))image.crossOrigin='anonymous';
   image.decoding='async';
   image.onload=()=>{record.ready=true;record.avg=averageColour(image);imgReady++;publishStatus();wake();};
   image.onerror=()=>{record.failed=true;imgFailed++;publishStatus();};
   image.src=record.item.src;
   record.image=image;
  }
  publishStatus();
 }
 function publishStatus(){
  const next=!items().length?'empty':(imgReady>=images.length||images.every(r=>r.ready||r.failed))?'ready':'loading';
  if(next!==reported){reported=next;report('status',next);setData('status',next);}
 }
 function photoFor(index){
  const record=images[index%Math.max(1,images.length)];
  return record&&record.ready?record:null;
 }
 // ---- geometry ------------------------------------------------------------------------
 function nearPlane(){return .06;}
// The passage is one lane deep. `lanes` controls the horizontal floor/ceiling
 // columns; the side-wall rows follow the observed stepped layout below. Each tile
 // remains one lane square, producing the reference's low rectangular section.
 const CELL=1;
 function floorCols(){return c.lanes;}
 // Horizontal 1–5 → 2 rows; 6–7 → 3; 8–9 → 4; 10–11 → 5; 12 → 6.
 function wallRows(){return clamp(Math.floor(c.lanes/2),2,6);}
 function project(x,y,z){
  const dz=z-(travel+renderOffset);
  let dx=x-shiftX,dy=y-shiftY;
  const cy=Math.cos(yaw),sy=Math.sin(yaw);
  const rx=dx*cy+dz*sy,rz1=-dx*sy+dz*cy;
  const cp=Math.cos(pitch),sp=Math.sin(pitch);
  const ry=dy*cp-rz1*sp,rz=dy*sp+rz1*cp;
  if(rz<=nearPlane())return null;
  const f=(H/2)/Math.tan((c.fov*Math.PI/180)/2);
  return{x:W/2+f*rx/rz,y:H/2-f*ry/rz,z:rz,f};
 }
 // Measured against the reference: tiles stay readable to roughly 27/fog lanes
// (about 20 at fog 1, 13 at fog 2, 9 at fog 3) and fade on a gently curved ramp,
// so denser fog shortens the passage instead of turning it into a vignette.
 const SEE_SPAN=27,SEE_CURVE=1.15;
 function seenLanes(){return clamp(SEE_SPAN/Math.max(.05,c.fog),6,34);}
 function visibleCells(){return Math.max(2,Math.min(32,Math.ceil(seenLanes()*.9)+1));}
 function fogAlpha(distance){
  return Math.pow(clamp(1-distance/seenLanes(),0,1),SEE_CURVE);
 }
 // One cell of the corridor: the ring of tiles between z=k and z=k+CELL.
 function cellTiles(k){
  const cols=floorCols(),rows=wallRows(),hw=cols/2,hh=rows/2,inset=c.gap*.5;
  const tiles=[];
  for(let face=0;face<4;face++){
   const slots=face===FACE_FLOOR||face===FACE_CEILING?cols:rows;
   for(let slot=0;slot<slots;slot++){
    const kind=tileKind(k,face,slot,c);
    const itemIndex=kind.pick==='photo'?Math.floor(hash32(k*13+slot,face*29+slot*7,c.seed+977)*Math.max(1,items().length)):0;
    let corners;
    const z0=k+inset,z1=k+CELL-inset;
    if(face===FACE_FLOOR||face===FACE_CEILING){
     const y=face===FACE_FLOOR?-hh:hh,step=1;
     const x0=-hw+slot*step,x1=-hw+(slot+1)*step;
     corners=[[x0+c.gap/2,y,z0],[x1-c.gap/2,y,z0],[x1-c.gap/2,y,z1],[x0+c.gap/2,y,z1]];
     if(!c.gap)corners=[[x0,y,k],[x1,y,k],[x1,y,k+CELL],[x0,y,k+CELL]];
    }else{
     const x=face===FACE_LEFT?-hw:hw;
     const y0=-hh+slot,y1=-hh+slot+1;
     corners=[[x,y0+c.gap/2,z0],[x,y1-c.gap/2,z0],[x,y1-c.gap/2,z1],[x,y0+c.gap/2,z1]];
     if(!c.gap)corners=[[x,y0,k],[x,y1,k],[x,y1,k+CELL],[x,y0,k+CELL]];
    }
    tiles.push({k,face,slot,slots,kind,itemIndex,corners,key:`${k}.${face}.${slot}`});
   }
  }
  return tiles;
 }
 // Grow a quad about its own centre, so a hovered photo swallows its gap instead of
 // sliding off the wall (the reference's hover).
 function growQuad(corners,factor){
  const cx=(corners[0][0]+corners[1][0]+corners[2][0]+corners[3][0])/4;
  const cy=(corners[0][1]+corners[1][1]+corners[2][1]+corners[3][1])/4;
  const cz=(corners[0][2]+corners[1][2]+corners[2][2]+corners[3][2])/4;
  return corners.map(([x,y,z])=>[cx+(x-cx)*factor,cy+(y-cy)*factor,cz+(z-cz)*factor]);
 }
 function quadArea(quad){
  const a=Math.abs((quad[1].x-quad[0].x)*(quad[2].y-quad[0].y)-(quad[2].x-quad[0].x)*(quad[1].y-quad[0].y));
  const b=Math.abs((quad[2].x-quad[0].x)*(quad[3].y-quad[0].y)-(quad[3].x-quad[0].x)*(quad[2].y-quad[0].y));
  return (a+b)*.5;
 }
 function screenQuad(corners){
  const out=[];
  for(const [x,y,z] of corners){const p=project(x,y,z);if(!p)return null;out.push(p);}
  return out;
 }
 function tilePath(quad,radius,simple){
  ctx.beginPath();
  if(simple){
   ctx.moveTo(quad[0].x,quad[0].y);
   for(let i=1;i<quad.length;i++)ctx.lineTo(quad[i].x,quad[i].y);
   ctx.closePath();
   return;
  }
  const n=quad.length,r=clamp(radius,0,1)*.5;
  for(let i=0;i<n;i++){
   const prev=quad[(i-1+n)%n],cur=quad[i],next=quad[(i+1)%n];
   const inLen=Math.hypot(cur.x-prev.x,cur.y-prev.y),outLen=Math.hypot(next.x-cur.x,next.y-cur.y);
   const t=Math.min(r,Math.min(inLen,outLen)/2/Math.max(1e-3,Math.min(inLen,outLen))*r);
   const a={x:cur.x+(prev.x-cur.x)*t,y:cur.y+(prev.y-cur.y)*t};
   const b={x:cur.x+(next.x-cur.x)*t,y:cur.y+(next.y-cur.y)*t};
   if(i===0)ctx.moveTo(a.x,a.y);else ctx.lineTo(a.x,a.y);
   ctx.quadraticCurveTo(cur.x,cur.y,b.x,b.y);
  }
  ctx.closePath();
 }
 function fillQuad(quad,style,radius,simple){
  if(!quad)return;
  tilePath(quad,radius,simple);
  ctx.fillStyle=style;
  ctx.fill();
 }
 function drawTri(source,dest,image,dstExpand=0,srcExpand=0){
  const denom=source[0].x*(source[2].y-source[1].y)+source[1].x*(source[0].y-source[2].y)+source[2].x*(source[1].y-source[0].y);
  if(!denom)return;
  const grow=(pts,amount)=>{
   if(!amount)return pts;
   const cx=(pts[0].x+pts[1].x+pts[2].x)/3,cy=(pts[0].y+pts[1].y+pts[2].y)/3;
   return pts.map(p=>{const dx=p.x-cx,dy=p.y-cy,len=Math.hypot(dx,dy)||1;return{x:p.x+dx/len*amount,y:p.y+dy/len*amount};});
  };
  const src=grow(source,srcExpand),d=grow(dest,dstExpand);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(d[0].x,d[0].y);ctx.lineTo(d[1].x,d[1].y);ctx.lineTo(d[2].x,d[2].y);
  ctx.closePath();ctx.clip();
  const a=(d[0].x*(src[2].y-src[1].y)+d[1].x*(src[0].y-src[2].y)+d[2].x*(src[1].y-src[0].y))/denom;
  const b=(d[0].y*(src[2].y-src[1].y)+d[1].y*(src[0].y-src[2].y)+d[2].y*(src[1].y-src[0].y))/denom;
  const cc=(d[0].x*(src[1].x-src[2].x)+d[1].x*(src[2].x-src[0].x)+d[2].x*(src[0].x-src[1].x))/denom;
  const dd=(d[0].y*(src[1].x-src[2].x)+d[1].y*(src[2].x-src[0].x)+d[2].y*(src[0].x-src[1].x))/denom;
  const e=(d[0].x*(src[1].y*src[2].x-src[2].y*src[1].x)+d[1].x*(src[2].y*src[0].x-src[0].y*src[2].x)+d[2].x*(src[0].y*src[1].x-src[1].y*src[0].x))/denom;
  const f=(d[0].y*(src[1].y*src[2].x-src[2].y*src[1].x)+d[1].y*(src[2].y*src[0].x-src[0].y*src[2].x)+d[2].y*(src[0].y*src[1].x-src[1].y*src[0].x))/denom;
  ctx.transform(a,b,cc,dd,e,f);
  ctx.drawImage(image,0,0);
  ctx.restore();
 }
 function isAligned(quad,tolerance=1.5){
  const flat=Math.abs(quad[1].y-quad[0].y)+Math.abs(quad[3].y-quad[2].y)+Math.abs(quad[1].x-quad[2].x);
  const flat2=Math.abs(quad[2].y-quad[3].y)+Math.abs(quad[0].y-quad[1].y)+Math.abs(quad[0].x-quad[3].x);
  return flat<tolerance&&flat2<tolerance;
 }
 function drawImageQuad(image,quad,radius){
  if(!quad)return;
  ctx.save();
  tilePath(quad,radius);
  ctx.clip();
  const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
  if(!w||!h){ctx.restore();return;}
  if(isAligned(quad)){
   // An axis-aligned quad needs exactly one transform: no seams, no bending.
   const x=Math.min(quad[0].x,quad[1].x,quad[2].x,quad[3].x),y=Math.min(quad[0].y,quad[1].y,quad[2].y,quad[3].y);
   const dw=Math.max(quad[0].x,quad[1].x,quad[2].x,quad[3].x)-x,dh=Math.max(quad[0].y,quad[1].y,quad[2].y,quad[3].y)-y;
   if(dw>0&&dh>0)ctx.drawImage(image,0,0,w,h,x,y,dw,dh);
  }else if(quadArea(quad)<2600){
   // Small and mid tiles map as one affined draw: corner pairs pin the parallelogram,
   // which is indistinguishable from the true perspective at this size and a fraction
   // of the cost of a clipped triangle fan. Big near tiles keep the exact mapping.
   const ax=(quad[1].x-quad[0].x)/w,ay=(quad[1].y-quad[0].y)/w;
   const bx=(quad[3].x-quad[0].x)/h,by=(quad[3].y-quad[0].y)/h;
   ctx.restore();ctx.save();
   tilePath(quad,radius);ctx.clip();
   ctx.transform(ax,ay,bx,by,quad[0].x,quad[0].y);
   ctx.drawImage(image,0,0,w,h,0,0,w,h);
  }else{
   // Perspective quads map as a fan around the centre. Each triangle is grown a little
   // in both source and destination so shared edges overlap: clipping alone would leave
   // a half-covered hairline where the two triangles meet.
   const cxp=quad.reduce((sum,p)=>sum+p.x,0)/4,cyp=quad.reduce((sum,p)=>sum+p.y,0)/4;
   const corners=[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}];
   const centre={x:w/2,y:h/2};
   const scale=Math.max(1,Math.hypot(quad[1].x-quad[0].x,quad[1].y-quad[0].y)/Math.max(1,w));
   for(let i=0;i<4;i++){
    const j=(i+1)%4;
    drawTri([centre,corners[i],corners[j]],[{x:cxp,y:cyp},quad[i],quad[j]],image,.7,.7*scale);
   }
  }
  ctx.restore();
 }
 // Photo mapping: walls stand upright, floors and ceilings lie flat with their top edge
 // pointing down the corridor.
 function photoCorners(tile,quad,image){
  const wall=tile.face===FACE_LEFT||tile.face===FACE_RIGHT;
  const backside=tile.face===FACE_CEILING||tile.face===FACE_LEFT;
  const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
  if(!w||!h)return null;
  const src=wall
   ?[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}]
   :[{x:0,y:h},{x:w,y:h},{x:w,y:0},{x:0,y:0}];
  return backside?[src[1],src[0],src[3],src[2]]:src;
 }
 // ---- picking -------------------------------------------------------------------------
 function pointInQuad(px,py,quad){
  let inside=false;
  for(let i=0,j=3;i<4;j=i++){
   const xi=quad[i].x,yi=quad[i].y,xj=quad[j].x,yj=quad[j].y;
   if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
 }
 function sceneTiles(){
  // Only near rings can be meaningfully hit; the far ones are a few pixels across.
  const cells=Math.min(visibleCells(),10);
  const start=Math.floor(travel)-1,out=[];
  for(let k=start;k<start+cells;k++)for(const tile of cellTiles(k))out.push(tile);
  return out;
 }
 function pick(){
  if(!pointer.inside)return null;
  let best=null;
  for(const tile of sceneTiles()){
   const quad=screenQuad(tile.corners);
   if(!quad||quad.length!==4)continue;
   if(!pointInQuad(pointer.px,pointer.py,quad))continue;
   const depth=(tile.k-travel)*CELL+CELL;
   if(depth<0)continue;
   if(!best||depth<best.depth)best={tile,depth,quad};
  }
  return best;
 }
 // ---- painting ------------------------------------------------------------------------
 function paintScene(alphaMul){
  const cells=visibleCells();
  const start=Math.floor(travel)-2;
  const back=bg(),line=lineColor();
  const colA=parseColor(c.colors[0])||[82,39,255,1],colB=parseColor(c.colors[1])||[255,159,252,1];
  let count=0;
  for(let k=start+cells+2;k>=start;k--){
   const distance=Math.max(0,(k-travel)*CELL+CELL);
   const fogFactor=fogAlpha(distance);
   if(fogFactor<.03)continue;
   for(const tile of cellTiles(k)){
    // Hover applies to photos only: the tile grows about its centre and brightens.
    const isHover=!!hover&&hover.tile.key===tile.key&&c.hover>0&&tile.kind.pick==='photo';
    const corners=isHover?growQuad(tile.corners,1+.08*c.hover):tile.corners;
    const quad=screenQuad(corners);
    if(!quad||quadArea(quad)<1.6)continue;
    const photo=tile.kind.pick==='photo'?photoFor(tile.itemIndex):null;
    const area=quadArea(quad);
    const accent=mixColor(colA,colB,Math.abs(((tile.k/9)+tile.slot*.13)%1*2-1));
    if(tile.kind.pick==='photo'&&photo){
     if(isHover&&'filter' in ctx)ctx.filter=`brightness(${(1+.29*c.hover).toFixed(3)})`;
     if(area<260&&photo.avg)fillQuad(quad,rgba(photo.avg,1),area<120?0:c.radius,true);
     else drawImageQuad(photo.image,quad,c.radius);
     if(isHover&&'filter' in ctx)ctx.filter='none';
     if(c.fog>0&&fogFactor<1){ctx.save();fillQuad(quad,rgba(back||[0,0,0],(1-fogFactor)*alphaMul),c.radius);ctx.restore();}
    }else if(tile.kind.pick==='accent'){
     // Accent tiles are dark graded planes in the reference, not bright flats.
     const colour=mixColor(accent,[0,0,0],.42);
     ctx.save();
     ctx.globalAlpha=alphaMul*.72;
     const spread=Math.hypot(quad[1].x-quad[0].x,quad[1].y-quad[0].y)+Math.hypot(quad[3].x-quad[0].x,quad[3].y-quad[0].y);
     if(spread>34){
      const grad=tile.kind.pick==='accent'
       ?ctx.createLinearGradient(quad[0].x,quad[0].y,quad[2].x,quad[2].y)
       :ctx.createLinearGradient(quad[0].x,quad[0].y,quad[3].x,quad[3].y);
      const other=tile.kind.pick==='accent'?mixColor(colour,mixColor(colA,colB,(tile.slot/Math.max(1,tile.slots))),.55):mixColor(colour,[Math.min(255,colour[0]+46),Math.min(255,colour[1]+30),Math.min(255,colour[2]+30)],.9);
      grad.addColorStop(0,rgba(colour,1));grad.addColorStop(1,rgba(other,1));
      tilePath(quad,c.radius);
      ctx.fillStyle=grad;ctx.fill();
     }else fillQuad(quad,rgba(colour,1),c.radius);
     if(c.fog>0&&fogFactor<1)fillQuad(quad,rgba(back||[0,0,0],1-fogFactor),c.radius);
     ctx.restore();
    }
    count++;
   }
   if(c.lineOpacity>0&&distance<seenLanes()*.72){
    const alpha=alphaMul*Math.pow(fogFactor,1.35)*c.lineOpacity*1.6;
    if(alpha>.004){
     ctx.save();
     ctx.globalAlpha=alpha;
     ctx.strokeStyle=rgba(line,1);
     ctx.lineWidth=Math.max(.6,Math.min(W,H)/900);
     const cols=floorCols(),rows=wallRows(),hw=cols/2,hh=rows/2;
     const ring=screenQuad([[-hw,-hh,k],[hw,-hh,k],[hw,hh,k],[-hw,hh,k]]);
     if(ring){ctx.beginPath();ring.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();}
     // Rails run the length of the corridor, so one stroke covers a whole lane edge
     // every third ring: same look, a fraction of the draw calls.
     if(k%3===0){
      const zEnd=k+3;
      for(let i=1;i<cols;i++){
       const x=-hw+i;
       for(const y of[-hh,hh]){
        const a=project(x,y,k),b=project(x,y,zEnd);
        if(a&&b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
       }
      }
      for(let i=1;i<rows;i++){
       const y=-hh+i;
       for(const x of[-hw,hw]){
        const a=project(x,y,k),b=project(x,y,zEnd);
        if(a&&b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
       }
      }
     }
     ctx.restore();
    }
   }
  }
  return count;
 }
 // The reference frames the opened photo in a 51% x 66% box, aspect preserved.
 function focusedTarget(image){
  const aspect=(image?.naturalWidth||640)/Math.max(1,image?.naturalHeight||400);
  const boxW=W*.51,boxH=H*.66;
  let w=boxW,h=w/aspect;
  if(h>boxH){h=boxH;w=h*aspect;}
  return{x:W/2-w/2,y:H/2-h/2,w,h};
 }
 function paint(){
  const back=bg();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(back)ctx.fillStyle=rgba(back,1);else ctx.clearRect(0,0,W,H);
  if(back)ctx.fillRect(0,0,W,H);
  const speed=effectiveSpeed();
  const blurAmount=c.blur>0&&!reduced?clamp(Math.abs(speed)/6,0,1)*c.blur:0;
  const passes=blurAmount>0?Math.min(3,1+Math.round(blurAmount)):1;
  let tiles=0;
  if(passes===1)tiles=paintScene(1);
  else{
   // Back-to-front smear: the trailing passes sit behind the current view, so colour is
   // preserved instead of accumulating into a bright wash.
   for(let pass=0;pass<passes;pass++){
    renderOffset=(pass-(passes-1))*speed*0.05;
    tiles=paintScene(pass===passes-1?1:.55);
   }
   renderOffset=0;
  }
  const image=focus?photoFor(focus.itemIndex)?.image:null;
  if(focus&&image){
   const target=focusedTarget(image);
   // The corridor recedes behind the photo: dark overall, darkest right around the frame.
   const cx=target.x+target.w/2,cy=target.y+target.h/2;
   ctx.save();
   ctx.fillStyle='rgba(0,0,0,0.5)';
   ctx.fillRect(0,0,W,H);
   const glow=ctx.createRadialGradient(cx,cy,Math.min(target.w,target.h)*.4,cx,cy,Math.hypot(W,H)*.55);
   glow.addColorStop(0,'rgba(0,0,0,0.62)');
   glow.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=glow;
   ctx.fillRect(0,0,W,H);
   ctx.restore();
   const rect=[{x:target.x,y:target.y},{x:target.x+target.w,y:target.y},{x:target.x+target.w,y:target.y+target.h},{x:target.x,y:target.y+target.h}];
   drawImageQuad(image,rect,c.radius*Math.min(target.w,target.h)*.5);
  }
  painted=true;
  return tiles;
 }

 // ---- state ---------------------------------------------------------------------------
 // Measured: the reference advances 0.72 lanes per second for every unit of `speed`,
// and holding the pointer multiplies that by `boost`.
 const SPEED_UNIT=.72;
 function effectiveSpeed(){
  if(focus)return 0;
  if(reduced||c.paused)return velocity;
  const hold=pointer.down&&c.interactive&&!reduced?c.boost:1;
  return c.speed*SPEED_UNIT*hold+velocity;
 }
 function reduceMotion(){
  if(!mediaQuery)return false;
  return !!mediaQuery.matches;
 }
 function publish(){
  const speed=effectiveSpeed();
  setData('travel',zero(travel).toFixed(3));
  setData('speed',zero(speed).toFixed(3));
  setData('look',`${zero(yaw).toFixed(3)} ${zero(pitch).toFixed(3)}`);
  setData('hover',hover?(hover.tile.kind.pick==='photo'?'photo:':'tile:')+hover.tile.key:'');
 setData('hoverPhoto',hover&&hover.tile.kind.pick==='photo'&&photoFor(hover.tile.itemIndex)?'true':'false');
  setData('focus',focus?String(focus.itemIndex):'');
  setData('caption',focus?(captionTitle.textContent||''):'');
  setData('cells',visibleCells());
  setData('verticalLanes',wallRows());
  setData('tiles',frames?lastTiles:0);
  const next=focus?'focused':(reduced||c.paused||Math.abs(speed)<.001)?'still':'cruising';
  if(next!==phase){phase=next;report('phase',next);setData('phase',next);}
 }
 let lastTiles=0;
 // ---- loop ----------------------------------------------------------------------------
 function frame(now){
  if(dead)return;
  const dt=Math.min(.05,Math.max(0,(now-(last||now))/1000));
  last=now;
  frames++;
  framesRef.value=frames;
  const speed=effectiveSpeed();
  travel+=speed*dt;
  if(velocity){velocity*=Math.exp(-dt/.45);if(Math.abs(velocity)<.002)velocity=0;}
  const aimX=pointer.inside?clamp((pointer.x-W/2)/(W/2),-1,1):0;
  const aimY=pointer.inside?clamp((pointer.y-H/2)/(H/2),-1,1):0;
  if(c.look===0){yaw=0;pitch=0;shiftX=0;shiftY=0;}
  else{
   yaw=smoothTo(yaw,-aimX*.16*c.look,.12,dt);
   pitch=smoothTo(pitch,-aimY*.12*c.look,.12,dt);
   shiftX=smoothTo(shiftX,aimX*.10*c.look,.14,dt);
   shiftY=smoothTo(shiftY,aimY*.08*c.look,.14,dt);
  }
  const tiles=paint();
  lastTiles=tiles;
  paintFocusDom();
  publish();
  raf=requestAnimationFrame(frame);
  setAnimating(true);
 }
 let framesRef={value:0};
 function paintFocusDom(){
  if(!focus){if(caption.dataset.open==='true'){caption.dataset.open='false';report('focus',null);}return;}
  const record=photoFor(focus.itemIndex);
  const title=record?.item.title||record?.item.alt||'';
  captionTitle.textContent=title;
  captionIndex.textContent=`${String(focus.itemIndex+1).padStart(2,'0')} / ${String(Math.max(1,items().length)).padStart(2,'0')}`;
  caption.dataset.open='true';
 }
 function setAnimating(value){
  if(root.dataset.animating!==String(value))root.dataset.animating=String(value);
 }
 function wake(){
  if(dead||running||!visible||hidden)return;
  running=true;last=0;raf=requestAnimationFrame(frame);
 }
 function rest(){
  if(!running)return;
  running=false;cancelAnimationFrame(raf);raf=0;setAnimating(false);
 }
 function measure(){
  const box=root.getBoundingClientRect();
  W=Math.max(1,Math.round(box.width));H=Math.max(1,Math.round(box.height));
  DPR=Math.min(c.dpr,(typeof window!=='undefined'?window.devicePixelRatio:1)||1);
  const bw=Math.max(1,Math.round(W*DPR)),bh=Math.max(1,Math.round(H*DPR));
  if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}
  canvas.style.width='100%';canvas.style.height='100%';
  setData('stage',`${W}x${H}`);
  setData('dpr',DPR.toFixed(2));
  return {W,H};
 }
 function setPointerFromEvent(event){
  const box=canvas.getBoundingClientRect();
  pointer.px=clamp((event.clientX-box.left)/Math.max(1,box.width)*W,0,W);
  pointer.py=clamp((event.clientY-box.top)/Math.max(1,box.height)*H,0,H);
  pointer.x=pointer.px;pointer.y=pointer.py;
 }
 function onPointerEnter(event){pointer.inside=true;setPointerFromEvent(event);}
 function onPointerLeave(){pointer.inside=false;pointer.down=false;pointer.dragging=false;hover=null;}
 function onPointerMove(event){
  if(!c.interactive)return;
  setPointerFromEvent(event);
  if(pointer.down){
   pointer.moved+=Math.hypot(event.clientX-pointer.lastX,event.clientY-pointer.lastY);
   const touch=event.pointerType==='touch';
   const delta=touch?(event.clientX-pointer.lastX):(event.clientY-pointer.lastY);
   const cells=(touch?-.009:-.006)*delta;
   travel+=cells*(touch?1:1);
   pointer.dragVel=Math.abs(cells)>.0001?cells/Math.max(.016,(event.timeStamp-(pointer.lastTime||event.timeStamp))/1000):pointer.dragVel;
   pointer.dragging=pointer.moved>6;
  }
  pointer.lastX=event.clientX;pointer.lastY=event.clientY;pointer.lastTime=event.timeStamp;
  hover=pick();
  wake();
 }
 function onPointerDown(event){
  if(!c.interactive)return;
  setPointerFromEvent(event);
  pointer.down=true;pointer.moved=0;pointer.lastX=event.clientX;pointer.lastY=event.clientY;pointer.lastTime=event.timeStamp;pointer.dragVel=0;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  wake();
 }
 function onPointerUp(event){
  if(!c.interactive){pointer.down=false;return;}
  const wasDrag=pointer.dragging;
  pointer.down=false;pointer.dragging=false;
  if(wasDrag){velocity=clamp(pointer.dragVel,-10,10);pointer.dragVel=0;return;}
  if(event.type==='pointerup'&&c.focusOnClick){
   const hit=pick();
   if(hit&&hit.tile.kind.pick==='photo'){
    if(focus&&focus.tileKey===hit.tile.key)close();
    else open(hit);
   }else if(focus)close();
  }
 }
 function onWheel(event){
  if(!c.wheel||!c.interactive)return;
  event.preventDefault();
  const step=clamp(event.deltaY*0.0022,-.9,.9);
  if(focus){close();}
  travel+=step;
  velocity=clamp(velocity+step*2.4,-12,12);
  wake();
 }
 function onKeyDown(event){
  const step=1;
  let used=true;
  if(event.key==='ArrowDown'||event.key==='ArrowRight')travel+=step;
  else if(event.key==='ArrowUp'||event.key==='ArrowLeft')travel-=step;
  else if(event.key==='PageDown')travel+=c.lanes;
  else if(event.key==='PageUp')travel-=c.lanes;
  else if(event.key==='Home')travel=0;
  else if(event.key==='Escape'&&focus)close();
  else if((event.key==='Enter'||event.key===' ')&&!focus){
   const hit=pick()||nearestPhoto();
   if(hit)open(hit);else used=false;
  }else used=false;
  if(used){event.preventDefault();wake();}
 }
 function nearestPhoto(){
  let best=null;
  for(const tile of sceneTiles()){
   if(tile.kind.pick!=='photo')continue;
   const depth=(tile.k-travel)*CELL+CELL;
   if(depth<0)continue;
   if(!best||depth<best.depth)best={tile,depth,quad:screenQuad(tile.corners)};
  }
  return best;
 }
 function open(hit){
  const record=photoFor(hit.tile.itemIndex);
  if(!record)return;
  // The reference opens the photo immediately, so there is no flight to animate.
  focus={tileKey:hit.tile.key,itemIndex:hit.tile.itemIndex};
  velocity=0;
  report('focus',{item:record.item,index:hit.tile.itemIndex});
  c.onFocusChange?.(record.item,hit.tile.itemIndex);
  caption.dataset.open='true';
 }
 function close(){
  if(!focus)return;
  focus=null;
  caption.dataset.open='false';
  report('focus',null);
  c.onFocusChange?.(null,-1);
 }
 function onVisibility(){hidden=document.hidden;if(hidden)rest();else wake();}
 function setVisible(value){visible=value;if(visible)wake();else rest();}
 function attach(){
  if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(()=>{measure();wake();});observer.observe(root);}
  listen(window,'resize',()=>{measure();wake();});
  listen(document,'visibilitychange',onVisibility);
  listen(canvas,'pointerenter',onPointerEnter);
  listen(canvas,'pointerleave',onPointerLeave);
  listen(canvas,'pointermove',onPointerMove);
  listen(canvas,'pointerdown',onPointerDown);
  listen(window,'pointerup',onPointerUp);
  listen(canvas,'wheel',onWheel,{passive:false});
  // Keyboard travel lives on the focusable canvas.
  listen(canvas,'keydown',onKeyDown);
  listen(canvas,'contextmenu',event=>event.preventDefault());
  if(mediaQuery)listen(mediaQuery,'change',onMotionChange);
 }
 let observer=null;
 function detach(){for(const off of base.splice(0))off();observer?.disconnect();observer=null;}
 function onMotionChange(){reduced=reduceMotion();setData('reducedMotion',reduced);wake();}
 function update(next){
  const previous=c;c=normalize({...initial,...next});
  if(c.items!==previous.items&&JSON.stringify(c.items)!==JSON.stringify(previous.items))loadImages();
  // Turning interaction off must also drop the pointer state it produced.
  if(!c.interactive){hover=null;pointer.inside=false;pointer.down=false;pointer.dragging=false;}
  setData('mode',c.interactive?'interactive':'still');
  measure();wake();
 }
 function start(){
  measure();loadImages();attach();
  setData('reducedMotion',reduced);
  setData('mode',c.interactive?'interactive':'still');
  if(items().length===0)reported='empty';
  publishStatus();
  wake();
 }
 function destroy(){
  dead=true;rest();detach();
  for(const record of images)if(record.image)record.image.src='';
  images.length=0;
  setAnimating(false);
 }
 return{start,destroy,update,wake,rest,setVisible,close,open,travelBy(cells){travel+=Number(cells)||0;wake();},reset(){travel=0;velocity=0;focus=null;caption.dataset.open='false';wake();},progress(){return{travel,speed:effectiveSpeed(),focus:focus?{item:photoFor(focus.itemIndex)?.item||null,index:focus.itemIndex}:null,frames,hover:hover?hover.tile.key:null};},measure};
}

function PassageGalleryBase({ref,items,colors,backgroundColor,lanes,gap,radius,photoFill,accentFill,lineOpacity,fog,speed,boost,blur,look,fov,hover,focusOnClick,captions,wheel,interactive,seed,paused,dpr,ariaLabel,onFocusChange,children,className='',style}){
 const root=useRef(null),canvasRef=useRef(null),captionRef=useRef(null),captionTitleRef=useRef(null),captionIndexRef=useRef(null),engine=useRef(null);
 const initial={items,colors,backgroundColor,lanes,gap,radius,photoFill,accentFill,lineOpacity,fog,speed,boost,blur,look,fov,hover,focusOnClick,captions,wheel,interactive,seed,paused,dpr,ariaLabel,onFocusChange};
 const latest=useRef(initial);latest.current=initial;
 const listId=useId();
 const[state,setState]=useState({status:'loading',focus:null});
 useEffect(()=>{
  const host=root.current;
  const parts={root:host,canvas:canvasRef.current,caption:captionRef.current,captionTitle:captionTitleRef.current,captionIndex:captionIndexRef.current};
  const instance=createEngine(parts,(type,payload)=>{
   if(type==='status')setState(current=>current.status===payload?current:{...current,status:payload});
   if(type==='focus')setState(current=>(current.focus?.index??null)===(payload?.index??null)?current:{...current,focus:payload});
  },latest.current);
  engine.current=instance;
  instance.start();
  const io=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{for(const entry of entries)instance.setVisible(entry.isIntersecting);},{threshold:.01}):null;
  io?.observe(host);
  return()=>{io?.disconnect();instance.destroy();engine.current=null;};
 },[]);
 useEffect(()=>{engine.current?.update(latest.current);},[items,colors,backgroundColor,lanes,gap,radius,photoFill,accentFill,lineOpacity,fog,speed,boost,blur,look,fov,hover,focusOnClick,captions,wheel,interactive,seed,paused,dpr,ariaLabel,onFocusChange]);
 useImperativeHandle(ref,()=>({
  close:()=>engine.current?.close(),
  travel:cells=>engine.current?.travelBy(cells),
  reset:()=>engine.current?.reset()
 }),[]);
 const sources=Array.isArray(items)?items.filter(item=>item&&item.src):[];
 return <div ref={root} className={['passage-gallery',className].filter(Boolean).join(' ')} style={style} data-status={state.status}>
  <canvas ref={canvasRef} className="passage-gallery__canvas" tabIndex={0} role="region" aria-roledescription="gallery" aria-label={typeof ariaLabel==='string'&&ariaLabel.trim()?ariaLabel:defaults.ariaLabel} aria-describedby={listId}/>
  <ul id={listId} className="passage-gallery__sr">
   {sources.map((item,index)=><li key={`${item.src}-${index}`}>{item.title?`${item.title}. ${item.alt||''}`:item.alt||`Photo ${index+1}`}</li>)}
  </ul>
  {children?<div className="passage-gallery__overlay">{children}</div>:null}
  <div ref={captionRef} className="passage-gallery__caption" aria-live="polite" data-open="false">
   <span ref={captionTitleRef} className="passage-gallery__caption-title"/>
   <span ref={captionIndexRef} className="passage-gallery__caption-index"/>
  </div>
 </div>;
}

const PassageGallery=forwardRef((props,ref)=>React.createElement(PassageGalleryBase,{...props,ref}));
export default PassageGallery;
