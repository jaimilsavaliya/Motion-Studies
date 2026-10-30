'use client';

import React,{forwardRef,useCallback,useEffect,useId,useImperativeHandle,useMemo,useRef,useState} from 'react';
import './PaperCrumple.css';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const number=(value,min,max,fallback)=>{
 const parsed=Number(value);
 return Number.isFinite(parsed)?clamp(parsed,min,max):fallback;
};
const integer=(value,min,max,fallback)=>Math.round(number(value,min,max,fallback));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{const x=clamp(t,0,1);return x*x*(3-2*x);};
const seeded=(seed,index)=>{
 const value=Math.sin((Number(seed)||0)*12.9898+(index+1)*78.233)*43758.5453;
 return value-Math.floor(value);
};
const cssColor=value=>typeof value==='string'&&value.trim()?value.trim().slice(0,80):'#f4f0e8';

export const paperCrumpleDefaults={
 src:'',alt:'Crumplable image',backSrc:'',width:312,height:312,sceneHeight:360,imageFit:'contain',
 releaseBehavior:'restore',crumpleAmount:.85,crumpleDuration:.55,releaseDuration:.4,foldCount:6,
 foldSharpness:.6,wrinkleDepth:.65,creaseStrength:.18,paperColor:'#f4f0e8',roughness:.92,
 paperTexture:.08,lightIntensity:1.8,lightAngle:-35,shadow:true,shadowOpacity:.16,
 draggable:true,dragRotation:10,dragRadius:180,returnToOrigin:true,rotation:0,seed:7,
 detail:64,disabled:false,resetKey:0
};

function normalise(input){
 const source={...paperCrumpleDefaults,...input};
 return{
  src:typeof source.src==='string'?source.src.slice(0,2000):'',
  alt:typeof source.alt==='string'&&source.alt.trim()?source.alt.trim().slice(0,260):paperCrumpleDefaults.alt,
  backSrc:typeof source.backSrc==='string'?source.backSrc.slice(0,2000):'',
  width:integer(source.width,80,1600,paperCrumpleDefaults.width),height:integer(source.height,80,1800,paperCrumpleDefaults.height),sceneHeight:integer(source.sceneHeight,180,1400,paperCrumpleDefaults.sceneHeight),
  imageFit:source.imageFit==='contain'?'contain':'cover',releaseBehavior:['stay','restore','creased'].includes(source.releaseBehavior)?source.releaseBehavior:'restore',
  crumpleAmount:number(source.crumpleAmount,0,1,paperCrumpleDefaults.crumpleAmount),crumpleDuration:number(source.crumpleDuration,0,4,paperCrumpleDefaults.crumpleDuration),releaseDuration:number(source.releaseDuration,0,4,paperCrumpleDefaults.releaseDuration),
  foldCount:integer(source.foldCount,3,16,paperCrumpleDefaults.foldCount),foldSharpness:number(source.foldSharpness,0,1,paperCrumpleDefaults.foldSharpness),wrinkleDepth:number(source.wrinkleDepth,0,2,paperCrumpleDefaults.wrinkleDepth),creaseStrength:number(source.creaseStrength,0,1,paperCrumpleDefaults.creaseStrength),
  paperColor:cssColor(source.paperColor),roughness:number(source.roughness,0,1,paperCrumpleDefaults.roughness),paperTexture:number(source.paperTexture,0,1,paperCrumpleDefaults.paperTexture),lightIntensity:number(source.lightIntensity,0,4,paperCrumpleDefaults.lightIntensity),lightAngle:number(source.lightAngle,-180,180,paperCrumpleDefaults.lightAngle),
  shadow:source.shadow!==false,shadowOpacity:number(source.shadowOpacity,0,1,paperCrumpleDefaults.shadowOpacity),draggable:source.draggable!==false,dragRotation:number(source.dragRotation,0,30,paperCrumpleDefaults.dragRotation),dragRadius:number(source.dragRadius,0,600,paperCrumpleDefaults.dragRadius),returnToOrigin:source.returnToOrigin!==false,
  rotation:number(source.rotation,-180,180,paperCrumpleDefaults.rotation),seed:integer(source.seed,0,9999,paperCrumpleDefaults.seed),detail:integer(source.detail,32,96,paperCrumpleDefaults.detail),disabled:source.disabled===true,resetKey:source.resetKey
 };
}

function drawTexture(context,image,backImage,rect,config,preferBack=false){
 const texture=preferBack&&backImage?backImage:image;
 if(!texture||!texture.naturalWidth||!texture.naturalHeight){
  context.fillStyle=config.paperColor;context.fillRect(rect.x,rect.y,rect.width,rect.height);
  context.fillStyle='rgba(37,48,50,.78)';context.font=`${Math.max(12,rect.width*.048)}px ui-monospace,monospace`;
  context.fillText('FIELD NOTE / NO SIGNAL',rect.x+rect.width*.1,rect.y+rect.height*.19);
  context.strokeStyle='rgba(37,48,50,.22)';context.lineWidth=1;
  for(let i=0;i<7;i++)context.strokeRect(rect.x+rect.width*.1,rect.y+rect.height*(.29+i*.08),rect.width*.78,1);
  return;
 }
 const sourceRatio=texture.naturalWidth/texture.naturalHeight,rectRatio=rect.width/rect.height;
 let dw=rect.width,dh=rect.height,dx=rect.x,dy=rect.y;
 const contain=config.imageFit==='contain';
 if((contain&&sourceRatio>rectRatio)||(!contain&&sourceRatio<rectRatio)){
  dh=dw/sourceRatio;dy=rect.y+(rect.height-dh)/2;
 }else{dw=dh*sourceRatio;dx=rect.x+(rect.width-dw)/2;}
 context.fillStyle=config.paperColor;context.fillRect(rect.x,rect.y,rect.width,rect.height);
 context.drawImage(texture,dx,dy,dw,dh);
}

function drawGrain(context,width,height,amount,seed){
 if(amount<=0)return;
 const count=Math.round(35+amount*145);
 context.save();context.globalAlpha=.08+amount*.18;
 for(let i=0;i<count;i++){
  const x=seeded(seed,i*5)*width-width/2,y=seeded(seed,i*5+1)*height-height/2;
  const tone=seeded(seed,i*5+2)>.5?'#4b4034':'#fff9e8';
  context.fillStyle=tone;context.fillRect(x,y,1,1);
 }
 context.restore();
}

function drawCreases(context,width,height,amount,config){
 if(amount<=.005)return;
 const count=Math.max(3,Math.round(config.foldCount*.72));
 context.save();context.lineCap='round';
 for(let i=0;i<count;i++){
  const edge=seeded(config.seed,i*19+.2),bend=seeded(config.seed,i*19+.8),side=i%2?-1:1;
  const sx=side*width*.5,sy=mix(-height*.42,height*.42,edge);
  const mx=side*width*(.11+bend*.18),my=sy+(seeded(config.seed,i*19+1.5)-.5)*height*.38;
  const ex=-side*width*(.18+seeded(config.seed,i*19+2.3)*.22),ey=mix(-height*.4,height*.4,seeded(config.seed,i*19+3.1));
  context.beginPath();context.moveTo(sx,sy);context.quadraticCurveTo(mx,my,ex,ey);
  context.strokeStyle=`rgba(38,31,25,${amount*(.11+.18*config.foldSharpness)})`;context.lineWidth=1+amount*config.wrinkleDepth*2.2;context.stroke();
  context.beginPath();context.moveTo(sx+.9,sy-1);context.quadraticCurveTo(mx+.6,my-1.4,ex+.9,ey-1);
  context.strokeStyle=`rgba(255,252,239,${amount*.27})`;context.lineWidth=.8+amount;context.stroke();
 }
 context.restore();
}

function drawFlat(context,box,state,config,images){
 const rotation=(config.rotation+state.angle)*Math.PI/180;
 context.save();context.translate(box.cx,box.cy);context.rotate(rotation);
 if(config.shadow){context.shadowColor=`rgba(0,0,0,${config.shadowOpacity})`;context.shadowBlur=18+config.roughness*20;context.shadowOffsetY=10+config.wrinkleDepth*6;}
 context.fillStyle=config.paperColor;context.fillRect(-box.width/2,-box.height/2,box.width,box.height);
 context.shadowColor='transparent';
 context.save();context.beginPath();context.rect(-box.width/2,-box.height/2,box.width,box.height);context.clip();
 drawTexture(context,images.front,images.back,{x:-box.width/2,y:-box.height/2,width:box.width,height:box.height},config,false);
 drawGrain(context,box.width,box.height,config.paperTexture,config.seed);
 context.restore();
 context.strokeStyle=`rgba(47,39,30,${.19+config.roughness*.15})`;context.lineWidth=1;context.strokeRect(-box.width/2+.5,-box.height/2+.5,box.width-1,box.height-1);
 drawCreases(context,box.width,box.height,Math.max(state.crease,state.amount*.16),config);
 context.restore();
}

function drawImageTriangle(context,image,points,opacity=1){
 if(!image||!image.naturalWidth||!image.naturalHeight)return false;
 const [a,b,c]=points;
 const x0=a.u*image.naturalWidth,y0=a.v*image.naturalHeight;
 const x1=b.u*image.naturalWidth,y1=b.v*image.naturalHeight;
 const x2=c.u*image.naturalWidth,y2=c.v*image.naturalHeight;
 const determinant=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);
 if(Math.abs(determinant)<.00001)return false;
 const solve=(p0,p1,p2)=>({
  a:(p0*(y1-y2)+p1*(y2-y0)+p2*(y0-y1))/determinant,
  c:(p0*(x2-x1)+p1*(x0-x2)+p2*(x1-x0))/determinant,
  e:(p0*(x1*y2-x2*y1)+p1*(x2*y0-x0*y2)+p2*(x0*y1-x1*y0))/determinant
 });
 const x=solve(a.x,b.x,c.x),y=solve(a.y,b.y,c.y);
 context.save();context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.lineTo(c.x,c.y);context.closePath();context.clip();
 context.globalAlpha=opacity;context.transform(x.a,y.a,x.c,y.c,x.e,y.e);context.drawImage(image,0,0);context.restore();
 return true;
}

function drawCrumpled(context,box,state,config,images){
 const fullness=clamp(state.amount/Math.max(.001,config.crumpleAmount),0,1),t=smooth(fullness);
 // Measured from the rendered public interaction: a 312px sheet compacts to roughly 135 × 146px.
 const tilt=Math.abs(state.angle)/Math.max(1,config.dragRotation);
 const width=mix(box.width,box.width*.433*(1+tilt*.1),t),height=mix(box.height,box.height*.468,t);
 const columns=clamp(Math.round(4+config.detail/18+config.foldCount*.13),5,9),rows=columns;
 const points=[];
 for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){
  const u=column/columns,v=row/rows,nx=u*2-1,ny=v*2-1;
  const edge=Math.max(Math.abs(nx),Math.abs(ny));
  const theta=Math.atan2(ny,nx)+(seeded(config.seed,row*67+column*31+.2)-.5)*.18*(1-edge)*config.foldSharpness;
  const rim=1+(seeded(config.seed,row*37+column*17+.9)-.5)*(.1+.12*config.wrinkleDepth)*Math.pow(edge,3);
  const flatX=nx*box.width/2,flatY=ny*box.height/2;
  const jitter=(1-edge)*(.045+.07*config.wrinkleDepth);
  const compactX=Math.cos(theta)*(width/2)*edge*rim+(seeded(config.seed,row*71+column*11+2)-.5)*width*jitter;
  const compactY=Math.sin(theta)*(height/2)*edge*rim+(seeded(config.seed,row*11+column*73+3)-.5)*height*jitter;
  const ridges=Math.sin((u*config.foldCount+v*1.7+seeded(config.seed,row*13+column*7))*Math.PI)*.6+Math.cos((v*config.foldCount-u*1.3+seeded(config.seed,row*5+column*19))*Math.PI)*.4;
  const z=(1-edge)*height*(.18+.14*config.wrinkleDepth)+ridges*height*(.045+.09*config.wrinkleDepth)*t;
  points.push({u,v,x:mix(flatX,compactX,t),y:mix(flatY,compactY,t),z});
 }
 const at=(column,row)=>points[row*(columns+1)+column];
 const triangles=[];
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const a=at(column,row),b=at(column+1,row),c=at(column,row+1),d=at(column+1,row+1);
  if((column+row+config.seed)%2){triangles.push([a,b,c],[b,d,c]);}else{triangles.push([a,b,d],[a,d,c]);}
 }
 const perimeter=[];
 for(let column=0;column<=columns;column++)perimeter.push(at(column,0));
 for(let row=1;row<=rows;row++)perimeter.push(at(columns,row));
 for(let column=columns-1;column>=0;column--)perimeter.push(at(column,rows));
 for(let row=rows-1;row>0;row--)perimeter.push(at(0,row));
 const trace=list=>{context.beginPath();list.forEach((point,index)=>index?context.lineTo(point.x,point.y):context.moveTo(point.x,point.y));context.closePath();};
 const rotation=(config.rotation+state.angle)*Math.PI/180;
 context.save();context.translate(box.cx,box.cy);context.rotate(rotation);
 if(config.shadow){trace(perimeter);context.shadowColor=`rgba(0,0,0,${config.shadowOpacity*(.8+.45*t)})`;context.shadowBlur=18+config.roughness*25;context.shadowOffsetY=8+config.wrinkleDepth*9;context.fillStyle=config.paperColor;context.fill();context.shadowColor='transparent';}
 trace(perimeter);context.fillStyle=config.paperColor;context.fill();
 const lightAngle=(config.lightAngle-90)*Math.PI/180,light={x:Math.cos(lightAngle),y:Math.sin(lightAngle),z:.8};
 triangles.sort((first,second)=>(first[0].z+first[1].z+first[2].z)-(second[0].z+second[1].z+second[2].z));
 triangles.forEach((triangle,index)=>{
  drawImageTriangle(context,images.front,triangle,1);
  if(images.back&&(index+config.seed)%7===0)drawImageTriangle(context,images.back,triangle,.16+.15*t);
  const [a,b,c]=triangle,ab={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},ac={x:c.x-a.x,y:c.y-a.y,z:c.z-a.z};
  let normal={x:ab.y*ac.z-ab.z*ac.y,y:ab.z*ac.x-ab.x*ac.z,z:ab.x*ac.y-ab.y*ac.x};
  const length=Math.max(.001,Math.hypot(normal.x,normal.y,normal.z));normal={x:normal.x/length,y:normal.y/length,z:normal.z/length};
  if(normal.z<0)normal={x:-normal.x,y:-normal.y,z:-normal.z};
  const lum=normal.x*light.x+normal.y*light.y+normal.z*light.z;
  const shade=(lum-.34)*config.lightIntensity*(.15+.14*config.foldSharpness);
  context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.lineTo(c.x,c.y);context.closePath();
  context.fillStyle=shade>=0?`rgba(255,255,255,${Math.min(.36,shade)})`:`rgba(24,20,18,${Math.min(.42,-shade)})`;context.fill();
 });
 // Interrupted seams are more paper-like than a regular grid, and keep the folds legible at small scale.
 context.save();context.lineCap='round';
 triangles.forEach((triangle,index)=>{
  if((index+config.seed)%3!==0)return;
  const [a,b,c]=triangle,edge=index%3===0?[a,b]:index%3===1?[b,c]:[c,a];
  context.beginPath();context.moveTo(edge[0].x,edge[0].y);context.lineTo(edge[1].x,edge[1].y);
  context.strokeStyle=`rgba(32,27,24,${.08+.18*t*config.foldSharpness})`;context.lineWidth=.45+config.wrinkleDepth*.7;context.stroke();
  if((index+config.seed)%2===0){context.beginPath();context.moveTo(edge[0].x+.65,edge[0].y-.65);context.lineTo(edge[1].x+.65,edge[1].y-.65);context.strokeStyle=`rgba(255,255,255,${.08+.14*t})`;context.lineWidth=.45;context.stroke();}
 });
 context.save();trace(perimeter);context.clip();drawGrain(context,width,height,config.paperTexture*(.65+t*.9),config.seed+91);context.restore();
 context.restore();
 trace(perimeter);context.strokeStyle=`rgba(32,27,24,${.18+.26*t})`;context.lineWidth=.8;context.stroke();
 context.restore();
 return{width,height};
}
function PaperCrumpleBase({src,alt,backSrc,width,height,sceneHeight,imageFit,releaseBehavior,crumpleAmount,crumpleDuration,releaseDuration,foldCount,foldSharpness,wrinkleDepth,creaseStrength,paperColor,roughness,paperTexture,lightIntensity,lightAngle,shadow,shadowOpacity,draggable,dragRotation,dragRadius,returnToOrigin,rotation,seed,detail,disabled,resetKey,onStateChange,onError,className='',style},ref){
 const rootRef=useRef(null),canvasRef=useRef(null),hitRef=useRef(null),focusRef=useRef(null),animationRef=useRef(0),dragRef=useRef(null),imagesRef=useRef({front:null,back:null}),lastTimeRef=useRef(0),stateRef=useRef({amount:0,target:0,crease:0,targetCrease:0,x:0,y:0,targetX:0,targetY:0,angle:0,targetAngle:0,holding:false,phase:'flat'}),callbacksRef=useRef({onStateChange,onError}),lastEmitRef=useRef(''),lastResetRef=useRef(resetKey);
 const [stage,setStage]=useState({width:0,height:0});
 const [status,setStatus]=useState('loading');
 const id=useId();
 const config=useMemo(()=>normalise({src,alt,backSrc,width,height,sceneHeight,imageFit,releaseBehavior,crumpleAmount,crumpleDuration,releaseDuration,foldCount,foldSharpness,wrinkleDepth,creaseStrength,paperColor,roughness,paperTexture,lightIntensity,lightAngle,shadow,shadowOpacity,draggable,dragRotation,dragRadius,returnToOrigin,rotation,seed,detail,disabled,resetKey}),[src,alt,backSrc,width,height,sceneHeight,imageFit,releaseBehavior,crumpleAmount,crumpleDuration,releaseDuration,foldCount,foldSharpness,wrinkleDepth,creaseStrength,paperColor,roughness,paperTexture,lightIntensity,lightAngle,shadow,shadowOpacity,draggable,dragRotation,dragRadius,returnToOrigin,rotation,seed,detail,disabled,resetKey]);
 callbacksRef.current={onStateChange,onError};
 const paperBox=useCallback(()=>{
  const availableWidth=Math.max(0,stage.width-48),availableHeight=Math.max(0,stage.height-48);
  const scale=Math.min(1,availableWidth/config.width||1,availableHeight/config.height||1);
  return{width:config.width*scale,height:config.height*scale,cx:stage.width/2+stateRef.current.x,cy:stage.height/2+stateRef.current.y};
 },[config.height,config.width,stage.height,stage.width]);
 const emitState=useCallback((force=false)=>{
  const state=stateRef.current;
  const snapshot={state:state.phase,holding:state.holding,amount:Math.round(state.amount*1000)/1000,crease:Math.round(state.crease*1000)/1000,x:Math.round(state.x),y:Math.round(state.y)};
  // The public callback is a lifecycle signal, not a per-frame telemetry stream.
  const key=`${snapshot.state}/${snapshot.holding}`;
  if(force||key!==lastEmitRef.current){lastEmitRef.current=key;callbacksRef.current.onStateChange?.(snapshot);}
  if(rootRef.current){rootRef.current.dataset.state=state.phase;rootRef.current.dataset.amount=String(snapshot.amount);rootRef.current.dataset.holding=String(state.holding);}
 },[]);
 const updateHit=useCallback((box,crumpleSize)=>{
  const hit=hitRef.current,focus=focusRef.current;
  if(!hit||!focus)return;
  const current=stateRef.current,isBall=current.amount>.08;
  const width=isBall?crumpleSize.width:box.width,height=isBall?crumpleSize.height:box.height;
  const left=box.cx-width/2,top=box.cy-height/2;
  hit.style.width=`${Math.max(28,width)}px`;hit.style.height=`${Math.max(28,height)}px`;hit.style.transform=`translate3d(${left}px,${top}px,0)`;
  focus.style.width=`${Math.max(28,width)}px`;focus.style.height=`${Math.max(28,height)}px`;focus.style.transform=`translate3d(${left}px,${top}px,0)`;
 },[]);
 const draw=useCallback(()=>{
  const canvas=canvasRef.current;
  if(!canvas||!stage.width||!stage.height)return;
  const ratio=Math.min(2,typeof window==='undefined'?1:window.devicePixelRatio||1);
  const pixelWidth=Math.max(1,Math.round(stage.width*ratio)),pixelHeight=Math.max(1,Math.round(stage.height*ratio));
  if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
  const context=canvas.getContext('2d');
  if(!context){setStatus('fallback');return;}
  context.setTransform(ratio,0,0,ratio,0,0);context.clearRect(0,0,stage.width,stage.height);
  const box=paperBox(),current=stateRef.current;
  const crumpleSize=current.amount>.08?drawCrumpled(context,box,current,config,imagesRef.current):null;
  if(!crumpleSize)drawFlat(context,box,current,config,imagesRef.current);
  updateHit(box,crumpleSize||{width:box.width,height:box.height});
 },[config,paperBox,stage.height,stage.width,updateHit]);
 const animate=useCallback(now=>{
  const current=stateRef.current;
  const dt=Math.min(.05,Math.max(.001,(now-lastTimeRef.current||now)/1000));lastTimeRef.current=now;
  const reduce=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const motionDuration=current.holding?config.crumpleDuration:config.releaseDuration;
  // The material locks into its folded silhouette almost immediately on a press/release;
  // duration remains a useful response control without making the direct hold feel laggy.
  const follow=reduce||motionDuration===0?1:1-Math.exp(-dt/Math.max(.012,motionDuration*.05));
  // The compact material tracks a drag and snaps home with the same brisk physical response
  // as the observed release, rather than visibly easing across the whole stage.
  const positionDuration=current.holding?.035:Math.max(.012,motionDuration*.035);
  const positionFollow=reduce||motionDuration===0?1:1-Math.exp(-dt/positionDuration);
  current.amount+=((current.target-current.amount)*follow);
  current.crease+=((current.targetCrease-current.crease)*follow);
  current.x+=((current.targetX-current.x)*positionFollow);current.y+=((current.targetY-current.y)*positionFollow);current.angle+=((current.targetAngle-current.angle)*positionFollow);
  const active=Math.abs(current.target-current.amount)>.002||Math.abs(current.targetCrease-current.crease)>.002||Math.abs(current.targetX-current.x)>.35||Math.abs(current.targetY-current.y)>.35||Math.abs(current.targetAngle-current.angle)>.08||current.holding;
  if(!current.holding&&!active){
   current.amount=current.target;current.crease=current.targetCrease;current.x=current.targetX;current.y=current.targetY;current.angle=current.targetAngle;
   if(current.phase==='releasing')current.phase=current.targetCrease>.005?'creased':'flat';
   animationRef.current=0;draw();emitState();return;
  }
  draw();emitState();animationRef.current=requestAnimationFrame(animate);
 },[config.crumpleDuration,config.releaseDuration,draw,emitState]);
 const startAnimation=useCallback(()=>{if(!animationRef.current){lastTimeRef.current=0;animationRef.current=requestAnimationFrame(animate);}},[animate]);
 const reset=useCallback(()=>{
  const current=stateRef.current;current.amount=0;current.target=0;current.crease=0;current.targetCrease=0;current.x=0;current.y=0;current.targetX=0;current.targetY=0;current.angle=0;current.targetAngle=0;current.holding=false;current.phase='flat';draw();emitState(true);
 },[draw,emitState]);
 const release=useCallback(()=>{
  const current=stateRef.current;if(!current.holding&&current.phase!=='holding')return;
  current.holding=false;
  if(config.releaseBehavior==='stay'){current.target=config.crumpleAmount;current.targetCrease=Math.max(current.crease,config.creaseStrength*.25);current.phase='crumpled';}
  else{current.target=0;current.targetCrease=config.releaseBehavior==='creased'?Math.max(current.crease,config.creaseStrength*Math.max(.3,current.amount/Math.max(.01,config.crumpleAmount))):0;if(config.returnToOrigin){current.targetX=0;current.targetY=0;current.targetAngle=0;}current.phase='releasing';}
  emitState(true);startAnimation();
 },[config,emitState,startAnimation]);
 const beginHold=useCallback((x,y,pointerId=null,capture=null)=>{
  if(config.disabled)return;
  const current=stateRef.current;current.holding=true;current.target=config.crumpleAmount;current.targetCrease=Math.max(current.crease,config.creaseStrength*.42);current.phase='holding';
  dragRef.current={id:pointerId,x,y,startX:x,startY:y,originX:current.targetX,originY:current.targetY,capture};
  emitState(true);startAnimation();
 },[config,emitState,startAnimation]);
 useImperativeHandle(ref,()=>({reset,release}),[release,reset]);
 useEffect(()=>()=>{if(animationRef.current)cancelAnimationFrame(animationRef.current);},[]);
 useEffect(()=>{
  const node=rootRef.current;if(!node)return undefined;
  const measure=()=>{const rect=node.getBoundingClientRect();setStage({width:Math.round(rect.width),height:Math.round(rect.height)});};
  measure();if(typeof ResizeObserver==='undefined')return undefined;const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{draw();},[draw]);
 useEffect(()=>{
  let cancelled=false;const load=url=>new Promise(resolve=>{
   if(!url){resolve(null);return;}const image=new Image();image.crossOrigin='anonymous';image.onload=()=>resolve(image);image.onerror=()=>resolve({error:new Error(`Could not load paper image: ${url}`)});image.src=url;
  });
  Promise.all([load(config.src),load(config.backSrc)]).then(([front,back])=>{
   if(cancelled)return;let failed=null;if(front?.error)failed=front.error;if(back?.error)failed=back.error;imagesRef.current={front:front?.error?null:front,back:back?.error?null:back};setStatus(failed?'fallback':'ready');if(failed)callbacksRef.current.onError?.(failed);draw();
  });
  return()=>{cancelled=true;};
 },[config.backSrc,config.src,draw]);
 useEffect(()=>{if(lastResetRef.current!==config.resetKey){lastResetRef.current=config.resetKey;reset();}},[config.resetKey,reset]);
 useEffect(()=>{if(config.disabled)release();},[config.disabled,release]);
 const onPointerDown=event=>{
  if(config.disabled)return;const node=event.currentTarget;node.setPointerCapture?.(event.pointerId);const rect=rootRef.current?.getBoundingClientRect();beginHold(event.clientX-(rect?.left||0),event.clientY-(rect?.top||0),event.pointerId,node);
 };
 const onPointerMove=event=>{
  const drag=dragRef.current;if(!drag||drag.id!==event.pointerId||!config.draggable)return;const rect=rootRef.current?.getBoundingClientRect();const x=event.clientX-(rect?.left||0),y=event.clientY-(rect?.top||0);const dx=x-drag.startX,dy=y-drag.startY,current=stateRef.current;
  current.targetX=clamp(drag.originX+dx,-config.dragRadius,config.dragRadius);current.targetY=clamp(drag.originY+dy,-config.dragRadius,config.dragRadius);current.targetAngle=clamp(dx/Math.max(1,config.dragRadius)*config.dragRotation,-config.dragRotation,config.dragRotation);startAnimation();
 };
 const endPointer=event=>{const drag=dragRef.current;if(!drag||drag.id!==event.pointerId)return;drag.capture?.releasePointerCapture?.(event.pointerId);dragRef.current=null;release();};
 const onKeyDown=event=>{
  if(config.disabled)return;if((event.key===' '||event.key==='Enter')&&!event.repeat){event.preventDefault();beginHold(stage.width/2,stage.height/2);}if(event.key==='Escape'){event.preventDefault();reset();}
  const step=event.shiftKey?24:8;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();if(!config.draggable)return;const current=stateRef.current;if(event.key==='ArrowLeft')current.targetX=clamp(current.targetX-step,-config.dragRadius,config.dragRadius);if(event.key==='ArrowRight')current.targetX=clamp(current.targetX+step,-config.dragRadius,config.dragRadius);if(event.key==='ArrowUp')current.targetY=clamp(current.targetY-step,-config.dragRadius,config.dragRadius);if(event.key==='ArrowDown')current.targetY=clamp(current.targetY+step,-config.dragRadius,config.dragRadius);startAnimation();}
 };
 const onKeyUp=event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();release();}};
 return <div ref={rootRef} className={['paper-crumple',className,status==='fallback'?'paper-crumple--fallback':'',config.disabled?'paper-crumple--disabled':''].filter(Boolean).join(' ')} style={{'--pc-height':`${config.sceneHeight}px`,...style}} data-status={status} data-state="flat" data-amount="0" data-holding="false">
  <canvas ref={canvasRef} className="paper-crumple__canvas" aria-hidden="true" />
  <button ref={hitRef} type="button" className="paper-crumple__hit" aria-label={`${config.alt}. Hold to crumple and drag. Keyboard: hold Space or Enter, arrow keys to move, Escape to reset.`} aria-describedby={`${id}-hint`} disabled={config.disabled} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer} onPointerCancel={endPointer} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
  <span ref={focusRef} className="paper-crumple__focus" aria-hidden="true" />
  <img className="paper-crumple__fallback" src={config.src||undefined} alt={config.alt} />
  <p id={`${id}-hint`} className="paper-crumple__sr">Hold the paper to crumple it. While holding, drag to move it. Release behavior follows the selected setting.</p>
 </div>;
}

const PaperCrumple=forwardRef(PaperCrumpleBase);
export default PaperCrumple;
