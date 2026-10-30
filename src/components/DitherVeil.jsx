'use client';

import {useEffect, useId, useRef, useState} from 'react';
import './DitherVeil.css';

// Independently implemented from the public interaction, using standard dithering
// algorithms. No renderer package, reference shader, remote asset or app import.
const defaults = {fit:'contain',pattern:'floyd',palette:'duotone',pixelSize:2,levels:2,inkColor:'#120f17',paperColor:'#f4f1ea',contrast:1.15,brightness:0,revealRadius:200,softness:.6,linger:1,rimColor:'#a78bfa',rim:0,reverse:false,wander:false,clickBurst:true,paused:false,pixelRatio:1.5};
const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
const number = (v,a,b,f) => Number.isFinite(Number(v)) ? clamp(Number(v),a,b) : f;
const canvas = () => document.createElement('canvas');
const bayer = (x,y) => {
  // Recursively expand the conventional 2 × 2 ordered threshold matrix.
  let value=0;
  for(let bit=0;bit<3;bit++) value=value*4+(((x>>bit)&1)^((y>>bit)&1))*2+((y>>bit)&1);
  return (value+.5)/64;
};
let noiseTile;
function blueNoise() {
  if(noiseTile) return noiseTile;
  // Deterministic progressive farthest-point sampling on a periodic 32px tile.
  // Its threshold ranks distribute sparse marks without white-noise clumping.
  const n=32, count=n*n, distance=new Float64Array(count).fill(Infinity), used=new Uint8Array(count);
  noiseTile=new Float32Array(count);
  let point=471;
  for(let rank=0;rank<count;rank++) {
    used[point]=1; noiseTile[point]=(rank+.5)/count;
    const px=point%n, py=Math.floor(point/n); let best=-1, next=0;
    for(let i=0;i<count;i++) if(!used[i]) {
      let dx=Math.abs(i%n-px),dy=Math.abs(Math.floor(i/n)-py);dx=Math.min(dx,n-dx);dy=Math.min(dy,n-dy);
      distance[i]=Math.min(distance[i],dx*dx+dy*dy);
      const score=distance[i]+((Math.imul(i+1,1597334677)>>>0)%997)*.00001;
      if(score>best){best=score;next=i;}
    }
    point=next;
  }
  return noiseTile;
}
function color(value,fallback) {
  const c=canvas();c.width=c.height=1;const ctx=c.getContext('2d',{willReadFrequently:true});
  ctx.fillStyle=fallback;
  if(typeof value==='string') ctx.fillStyle=value;
  ctx.fillRect(0,0,1,1);
  return Array.from(ctx.getImageData(0,0,1,1).data).slice(0,3);
}
const rgb = c => `rgb(${c.join(',')})`;
function normalize(input) {
  const c={...defaults,...input};
  c.fit=['contain','cover'].includes(c.fit)?c.fit:defaults.fit;
  c.pattern=['floyd','atkinson','bayer','noise','lines'].includes(c.pattern)?c.pattern:defaults.pattern;
  c.palette=c.palette==='rgb'?'rgb':'duotone';
  for(const [key,min,max] of [['pixelSize',1,20],['levels',2,8],['contrast',0,3],['brightness',-1,1],['revealRadius',0,1000],['softness',0,1],['linger',0,5],['rim',0,1],['pixelRatio',.5,2]]) c[key]=number(c[key],min,max,defaults[key]);
  c.levels=Math.round(c.levels);
  c.ink=color(c.inkColor,defaults.inkColor);c.paper=color(c.paperColor,defaults.paperColor);c.rimRGB=color(c.rimColor,defaults.rimColor);
  return c;
}

function dither(input,w,h,c,inside) {
  const channels=c.palette==='rgb'?3:1, work=new Float32Array(w*h*channels), output=new ImageData(w,h), tones=c.levels-1;
  const diffusion=c.pattern==='floyd'||c.pattern==='atkinson';
  const noise=c.pattern==='noise'?blueNoise():null;
  for(let i=0;i<w*h;i++) {
    const j=i*4;
    // A print-like luminance curve preserves the dark material between highlights.
    if(channels===1)work[i]=clamp((Math.pow((input[j]*.2126+input[j+1]*.7152+input[j+2]*.0722)/255,1.5)-.5)*c.contrast+.5+c.brightness,0,1);
    else for(let k=0;k<3;k++)work[i*3+k]=clamp((input[j+k]/255-.5)*c.contrast+.5+c.brightness,0,1);
  }
  function distribute(x,y,k,error,weight) {
    if(x>=0&&x<w&&y>=0&&y<h&&inside[y*w+x]) work[(y*w+x)*channels+k]+=error*weight;
  }
  for(let y=0;y<h;y++) {
    // Serpentine error diffusion avoids a persistent left-to-right grain.
    const direction=diffusion&&y%2?-1:1;
    for(let step=0;step<w;step++) {
      const x=direction===1?step:w-1-step,i=y*w+x,j=i*4;
      output.data[j+3]=255;
      if(!inside[i]) {for(let k=0;k<3;k++)output.data[j+k]=c.ink[k];continue;}
      const threshold=c.pattern==='noise'?noise[(y%32)*32+x%32]:c.pattern==='lines'?((x+y)%6+.5)/6:bayer(x,y);
      for(let k=0;k<channels;k++) {
        const old=work[i*channels+k],q=clamp(diffusion?Math.round(old*tones):Math.floor(old*tones+threshold),0,tones)/tones;
        if(channels===1)for(let channel=0;channel<3;channel++)output.data[j+channel]=Math.round(c.ink[channel]+(c.paper[channel]-c.ink[channel])*q);
        else output.data[j+k]=Math.round(q*255);
        const error=old-q;
        if(c.pattern==='floyd') {
          distribute(x+direction,y,k,error,7/16);distribute(x-direction,y+1,k,error,3/16);
          distribute(x,y+1,k,error,5/16);distribute(x+direction,y+1,k,error,1/16);
        } else if(c.pattern==='atkinson') {
          distribute(x+direction,y,k,error,1/8);distribute(x+2*direction,y,k,error,1/8);
          distribute(x-direction,y+1,k,error,1/8);distribute(x,y+1,k,error,1/8);
          distribute(x+direction,y+1,k,error,1/8);distribute(x,y+2,k,error,1/8);
        }
      }
    }
  }
  return output;
}

const vertex=`attribute vec2 aPosition; varying vec2 uv; void main(){uv=vec2((aPosition.x+1.)*.5,(1.-aPosition.y)*.5);gl_Position=vec4(aPosition,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 uv;
uniform sampler2D uImage,uDither,uField;
uniform vec2 uGrid;
uniform vec3 uRimColor;
uniform float uReverse,uRim;
float threshold(vec2 p){
 float v=0.;
 for(int i=0;i<3;i++) {vec2 b=mod(floor(p/pow(2.,float(i))),2.);v=v*4.+abs(b.x-b.y)*2.+b.y;}
 return (v+.5)/64.;
}
void main(){
 float amount=texture2D(uField,uv).r;
 float t=threshold(floor(uv*uGrid));
 float reveal=step(t,amount);
 vec3 inked=texture2D(uDither,uv).rgb;
 vec3 photo=texture2D(uImage,uv).rgb;
 vec3 result=mix(inked,photo,mix(reveal,1.-reveal,uReverse));
 float edge=(1.-step(uRim*.15,abs(t-amount)))*step(.005,amount)*(1.-step(.995,amount));
 gl_FragColor=vec4(mix(result,uRimColor,edge),1.);
}`;
function makeGPU(element) {
  const gl=element.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:true});
  if(!gl||gl.isContextLost()) return null;
  const resources={shaders:[],textures:[],program:null,buffer:null};
  function dispose(){resources.textures.forEach(t=>gl.deleteTexture(t));resources.shaders.forEach(s=>gl.deleteShader(s));if(resources.buffer)gl.deleteBuffer(resources.buffer);if(resources.program)gl.deleteProgram(resources.program);}
  try {
    const compile=(type,text)=>{const s=gl.createShader(type);resources.shaders.push(s);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader unavailable');return s;};
    const program=gl.createProgram();resources.program=program;
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Program unavailable');
    gl.useProgram(program);
    const buffer=gl.createBuffer();resources.buffer=buffer;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const uniforms=Object.fromEntries(['uGrid','uRimColor','uReverse','uRim'].map(name=>[name,gl.getUniformLocation(program,name)]));
    const sizes=[];
    ['uImage','uDither','uField'].forEach((name,i)=>{const t=gl.createTexture();resources.textures.push(t);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,i===0?gl.LINEAR:gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,i===0?gl.LINEAR:gl.NEAREST);gl.uniform1i(gl.getUniformLocation(program,name),i);});
    return {gl,dispose,limit:Math.min(4096,gl.getParameter(gl.MAX_TEXTURE_SIZE)),
      upload(index,source){gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,resources.textures[index]);const size=`${source.width}:${source.height}`;if(sizes[index]===size)gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,source);else{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);sizes[index]=size;}},
      draw(c,w,h){gl.viewport(0,0,element.width,element.height);gl.useProgram(program);gl.uniform2f(uniforms.uGrid,w,h);gl.uniform3f(uniforms.uRimColor,...c.rimRGB.map(v=>v/255));gl.uniform1f(uniforms.uReverse,c.reverse?1:0);gl.uniform1f(uniforms.uRim,c.rim);gl.drawArrays(gl.TRIANGLES,0,6);}
    };
  } catch {dispose();return null;}
}

function createEngine(root,gpuCanvas,cpuCanvas,report,initial) {
  let c=normalize(initial),gpu=makeGPU(gpuCanvas),image=null,request=null,loadTimer=0,loadId=0,dead=false;
  let width=0,height=0,cols=0,rows=0,frame=0,lastTime=0,time=0,visible=true,ready=false,rebuild=true;
  let pointer=null,mode=null,trail=[],bursts=[],lastSample=null,down=null,lastInput='keyboard',suppressClick=false,escapeWander=false,wanderPoint=null;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');let reduced=motion.matches;
  const original=canvas(),processed=canvas(),field=canvas(),selection=canvas(),rimLayer=canvas(),overlay=canvas();
  const originalCtx=original.getContext('2d'),processedCtx=processed.getContext('2d',{willReadFrequently:true});
  const fieldCtx=field.getContext('2d',{willReadFrequently:true}),selectionCtx=selection.getContext('2d'),rimCtx=rimLayer.getContext('2d'),overlayCtx=overlay.getContext('2d');
  const cpu=cpuCanvas.getContext('2d');let selectPixels=null,rimPixels=null;
  root.dataset.renderer=gpu?'webgl':'canvas';root.dataset.reducedMotion=String(reduced);
  const clean=[];
  function listen(target,name,fn,options){target.addEventListener(name,fn,options);clean.push(()=>target.removeEventListener(name,fn,options));}
  function stop(){cancelAnimationFrame(frame);frame=0;lastTime=0;root.dataset.animating='false';}
  function wake(){if(!dead&&visible&&!document.hidden&&ready&&!frame){root.dataset.animating='true';frame=requestAnimationFrame(draw);}}
  function clear(){pointer=null;mode=null;trail=[];bursts=[];lastSample=null;down=null;}
  function load(src){
    loadId++;const id=loadId;clearTimeout(loadTimer);
    if(request){request.onload=request.onerror=null;request.src='';request=null;}
    image=null;ready=false;clear();stop();report(src?'loading':'empty');
    if(!src)return;
    const img=new Image();request=img;img.crossOrigin='anonymous';img.decoding='async';
    const failed=()=>{if(dead||id!==loadId)return;clearTimeout(loadTimer);img.onload=img.onerror=null;request=null;report('original');};
    img.onload=()=>{if(dead||id!==loadId)return;clearTimeout(loadTimer);img.onload=img.onerror=null;request=null;if(!img.naturalWidth||!img.naturalHeight){failed();return;}image=img;ready=true;rebuild=true;report('ready');wake();};
    img.onerror=failed;loadTimer=setTimeout(failed,12000);img.src=src;
  }
  function prepare(){
    rebuild=false;
    if(!image||width<1||height<1)return false;
    const limit=gpu?.limit||4096;
    const ratio=Math.min(window.devicePixelRatio||1,c.pixelRatio,Math.sqrt(4000000/(width*height)),limit/width,limit/height);
    const w=Math.max(1,Math.round(width*ratio)),h=Math.max(1,Math.round(height*ratio));
    gpuCanvas.width=cpuCanvas.width=original.width=overlay.width=w;
    gpuCanvas.height=cpuCanvas.height=original.height=overlay.height=h;
    const cell=Math.max(c.pixelSize,Math.sqrt(width*height/600000),width/limit,height/limit);
    cols=Math.max(1,Math.ceil(width/cell));rows=Math.max(1,Math.ceil(height/cell));
    for(const target of [processed,field,selection,rimLayer]){target.width=cols;target.height=rows;}
    selectPixels=new ImageData(cols,rows);rimPixels=new ImageData(cols,rows);
    originalCtx.fillStyle=rgb(c.ink);originalCtx.fillRect(0,0,w,h);
    const scale=(c.fit==='cover'?Math.max:Math.min)(width/image.naturalWidth,height/image.naturalHeight);
    const iw=image.naturalWidth*scale,ih=image.naturalHeight*scale,ix=(width-iw)/2,iy=(height-ih)/2;
    originalCtx.drawImage(image,ix*w/width,iy*h/height,iw*w/width,ih*h/height);
    processedCtx.drawImage(original,0,0,cols,rows);
    const input=processedCtx.getImageData(0,0,cols,rows).data,inside=new Uint8Array(cols*rows);
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const px=(x+.5)*width/cols,py=(y+.5)*height/rows;inside[y*cols+x]=px>=ix&&px<ix+iw&&py>=iy&&py<iy+ih?1:0;}
    processedCtx.putImageData(dither(input,cols,rows,c,inside),0,0);
    if(gpu){gpu.upload(0,original);gpu.upload(1,processed);}
    root.dataset.grid=`${cols}x${rows}`;
    return true;
  }
  function stamp(x,y,strength){
    const radius=c.revealRadius;if(radius<=0||strength<=0)return;
    const bright=Math.round(clamp(strength,0,1)*255),tone=`rgb(${bright},${bright},${bright})`;
    if(c.softness<.001){fieldCtx.fillStyle=tone;fieldCtx.beginPath();fieldCtx.arc(x,y,radius,0,Math.PI*2);fieldCtx.fill();}
    else {const gradient=fieldCtx.createRadialGradient(x,y,radius*(1-c.softness),x,y,radius);gradient.addColorStop(0,tone);gradient.addColorStop(1,'#000');fieldCtx.fillStyle=gradient;fieldCtx.fillRect(x-radius,y-radius,2*radius,2*radius);}
  }
  function updateField(){
    fieldCtx.setTransform(1,0,0,1,0,0);fieldCtx.globalCompositeOperation='source-over';fieldCtx.fillStyle='#000';fieldCtx.fillRect(0,0,cols,rows);
    fieldCtx.setTransform(cols/width,0,0,rows/height,0,0);fieldCtx.globalCompositeOperation='lighten';
    if(!reduced&&c.linger>0)for(const point of trail)stamp(point.x,point.y,Math.pow(Math.max(0,1-(time-point.time)/c.linger),1.3));
    if(pointer)stamp(pointer.x,pointer.y,1);
    if(c.wander&&!reduced&&!pointer&&!escapeWander){
      if(!c.paused||!wanderPoint)wanderPoint={x:width*(.5+.29*Math.sin(time*.47)),y:height*(.5+.27*Math.sin(time*.61+.8))};
      stamp(wanderPoint.x,wanderPoint.y,1);
    }
    if(!reduced)for(const burst of bursts){
      const age=(time-burst.time)/1.35,radius=Math.hypot(width,height)*age,band=Math.max(12,c.revealRadius*.22),outer=radius+band;
      const v=Math.round(255*Math.pow(1-age,1.1));
      const gradient=fieldCtx.createRadialGradient(burst.x,burst.y,0,burst.x,burst.y,outer);
      gradient.addColorStop(0,'#000');gradient.addColorStop(Math.max(0,(radius-band)/outer),'#000');gradient.addColorStop(radius/outer,`rgb(${v},${v},${v})`);gradient.addColorStop(1,'#000');
      fieldCtx.fillStyle=gradient;fieldCtx.fillRect(burst.x-outer,burst.y-outer,outer*2,outer*2);
    }
  }
  function drawCPU(){
    const values=fieldCtx.getImageData(0,0,cols,rows).data;
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const i=(y*cols+x)*4,amount=values[i]/255,t=bayer(x,y);
      selectPixels.data[i+3]=amount>=t?255:0;
      rimPixels.data[i]=c.rimRGB[0];rimPixels.data[i+1]=c.rimRGB[1];rimPixels.data[i+2]=c.rimRGB[2];
      rimPixels.data[i+3]=amount>=.005&&amount<.995&&Math.abs(t-amount)<c.rim*.15?255:0;
    }
    selectionCtx.putImageData(selectPixels,0,0);rimCtx.putImageData(rimPixels,0,0);
    cpu.imageSmoothingEnabled=!!c.reverse;cpu.drawImage(c.reverse?original:processed,0,0,cpuCanvas.width,cpuCanvas.height);
    overlayCtx.globalCompositeOperation='source-over';overlayCtx.imageSmoothingEnabled=!c.reverse;overlayCtx.drawImage(c.reverse?processed:original,0,0,overlay.width,overlay.height);
    overlayCtx.globalCompositeOperation='destination-in';overlayCtx.imageSmoothingEnabled=false;overlayCtx.drawImage(selection,0,0,overlay.width,overlay.height);
    cpu.drawImage(overlay,0,0);cpu.imageSmoothingEnabled=false;cpu.drawImage(rimLayer,0,0,cpuCanvas.width,cpuCanvas.height);
  }
  function draw(now){
    frame=0;
    if(dead||!ready||!visible||document.hidden||width<1||height<1){stop();return;}
    if(lastTime)time+=Math.min(.1,(now-lastTime)/1000);lastTime=now;
    trail=trail.filter(p=>!reduced&&c.linger>0&&time-p.time<c.linger);bursts=bursts.filter(p=>!reduced&&time-p.time<1.35);
    try {
      if(rebuild&&!prepare()){stop();return;}
      updateField();
      if(gpu){gpu.upload(2,field);gpu.draw(c,cols,rows);}else drawCPU();
    } catch {ready=false;report('original');stop();return;}
    const animated=!reduced&&(trail.length||bursts.length||(c.wander&&!c.paused&&!pointer&&!escapeWander));
    if(animated)frame=requestAnimationFrame(draw);else stop();
  }
  function remember(point,force=false){
    if(reduced||!c.linger||!point)return;
    if(force||!lastSample||Math.hypot(point.x-lastSample.x,point.y-lastSample.y)>Math.max(4,c.pixelSize*2)||time-lastSample.time>.04){const p={...point,time};trail.push(p);if(trail.length>32)trail.shift();lastSample=p;}
  }
  function move(point,input){if(pointer)remember(pointer);pointer=point;mode=input;escapeWander=false;wake();}
  function leave(){if(mode==='pointer'){remember(pointer,true);pointer=null;mode=null;wake();}}
  function position(event){const rect=root.getBoundingClientRect();return {x:clamp((event.clientX-rect.left)*width/Math.max(1,rect.width),0,width),y:clamp((event.clientY-rect.top)*height/Math.max(1,rect.height),0,height)};}
  function burst(point){if(!c.clickBurst||reduced)return;bursts.push({...point,time});if(bursts.length>4)bursts.shift();wake();}
  listen(root,'pointermove',event=>{if(!event.isPrimary)return;lastInput='pointer';const p=position(event);if(down&&Math.hypot(p.x-down.x,p.y-down.y)>8)suppressClick=true;move(p,'pointer');});
  listen(root,'pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;lastInput='pointer';root.focus({preventScroll:true});down=position(event);suppressClick=false;move(down,'pointer');});
  listen(root,'pointerleave',leave);
  listen(root,'pointerup',event=>{down=null;if(event.pointerType!=='mouse')leave();});
  listen(root,'pointercancel',()=>{suppressClick=true;down=null;leave();});
  listen(root,'lostpointercapture',()=>{down=null;leave();});
  listen(root,'click',event=>{if(event.button===0&&!suppressClick)burst(position(event));suppressClick=false;});
  listen(root,'focus',()=>{if(lastInput!=='pointer')move({x:width/2,y:height/2},'keyboard');});
  listen(root,'blur',()=>{lastInput='keyboard';if(mode==='keyboard'){remember(pointer,true);pointer=null;mode=null;wake();}});
  listen(root,'keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' ','Escape','Home'].includes(event.key))return;
    event.preventDefault();lastInput='keyboard';
    if(event.key==='Escape'){clear();escapeWander=true;wake();return;}
    const p=pointer?{...pointer}:{x:width/2,y:height/2},step=event.shiftKey?64:24;
    if(event.key==='ArrowLeft')p.x-=step;if(event.key==='ArrowRight')p.x+=step;if(event.key==='ArrowUp')p.y-=step;if(event.key==='ArrowDown')p.y+=step;
    if(event.key==='Home'){p.x=width/2;p.y=height/2;}p.x=clamp(p.x,0,width);p.y=clamp(p.y,0,height);move(p,'keyboard');
    if(event.key==='Enter'||event.key===' ')burst(p);
  });
  listen(gpuCanvas,'webglcontextlost',event=>{event.preventDefault();gpu?.dispose();gpu=null;root.dataset.renderer='canvas';wake();});
  listen(gpuCanvas,'webglcontextrestored',()=>{gpu=makeGPU(gpuCanvas);root.dataset.renderer=gpu?'webgl':'canvas';rebuild=true;wake();});
  listen(document,'visibilitychange',()=>{clear();if(document.hidden)stop();else wake();});
  listen(window,'blur',()=>{clear();wake();});
  listen(motion,'change',()=>{reduced=motion.matches;trail=[];bursts=[];root.dataset.reducedMotion=String(reduced);wake();});
  const resize=new ResizeObserver(entries=>{const rect=entries[0].contentRect;if(rect.width===width&&rect.height===height)return;if(wanderPoint&&width>0&&height>0)wanderPoint={x:wanderPoint.x*rect.width/width,y:wanderPoint.y*rect.height/height};width=rect.width;height=rect.height;clear();rebuild=true;wake();});resize.observe(root);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){clear();stop();}else wake();});intersection.observe(root);
  // Moving a window between displays can change DPR without changing CSS size.
  listen(window,'resize',()=>{rebuild=true;wake();});
  load(typeof initial.src==='string'?initial.src:'');
  return {
    update(input){const previous=c;c=normalize(input);root.style.setProperty('--dv-ink',rgb(c.ink));
      if(input.src!==previous.src){load(typeof input.src==='string'?input.src:'');return;}
      if(['fit','pattern','palette','pixelSize','levels','inkColor','paperColor','contrast','brightness','pixelRatio'].some(key=>c[key]!==previous[key]))rebuild=true;
      if(c.wander!==previous.wander||c.paused!==previous.paused)escapeWander=false;
      if(!c.linger)trail=[];if(!c.clickBurst)bursts=[];
      wake();
    },
    destroy(){dead=true;loadId++;stop();clearTimeout(loadTimer);if(request){request.onload=request.onerror=null;request.src='';}resize.disconnect();intersection.disconnect();clean.forEach(fn=>fn());gpu?.dispose();image=null;for(const target of [original,processed,field,selection,rimLayer,overlay])target.width=target.height=1;}
  };
}

export default function DitherVeil({src='',alt='Interactive dithered image',fit='contain',pattern='floyd',palette='duotone',pixelSize=2,levels=2,inkColor='#120f17',paperColor='#f4f1ea',contrast=1.15,brightness=0,revealRadius=200,softness=.6,linger=1,rimColor='#a78bfa',rim=0,reverse=false,wander=false,clickBurst=true,paused=false,pixelRatio=1.5,className='',style}) {
  const root=useRef(null),gpu=useRef(null),cpu=useRef(null),engine=useRef(null),help=useId();
  const [status,setStatus]=useState(src?'loading':'empty');
  const props={src,fit,pattern,palette,pixelSize,levels,inkColor,paperColor,contrast,brightness,revealRadius,softness,linger,rimColor,rim,reverse,wander,clickBurst,paused,pixelRatio};
  const latest=useRef(props);latest.current=props;
  useEffect(()=>{engine.current=createEngine(root.current,gpu.current,cpu.current,setStatus,latest.current);return()=>{engine.current?.destroy();engine.current=null;};},[]);
  useEffect(()=>{engine.current?.update(latest.current);},[src,fit,pattern,palette,pixelSize,levels,inkColor,paperColor,contrast,brightness,revealRadius,softness,linger,rimColor,rim,reverse,wander,clickBurst,paused,pixelRatio]);
  return <div ref={root} className={`dither-veil ${className}`} style={{'--dv-ink':inkColor,...style}} tabIndex={status==='ready'?0:-1} role="region" aria-roledescription="interactive image" aria-label={alt||'Interactive dithered image'} aria-describedby={help} aria-busy={status==='loading'} data-status={status}>
    <canvas ref={gpu} className="dv-gpu" aria-hidden="true"/>
    <canvas ref={cpu} className="dv-cpu" aria-hidden="true"/>
    {status==='original'&&<img className="dv-original" src={src} alt="" style={{objectFit:fit==='cover'?'cover':'contain'}} onError={()=>setStatus('error')}/>}
    {status!=='ready'&&<span className="dv-status" role="status">{status==='loading'?'Preparing image…':status==='empty'?'Choose an image to reveal.':status==='error'?'Image could not be loaded. Check the image source.':'Image shown without effects. Use a same-origin image or a host that permits CORS.'}</span>}
    <span className="dv-sr" id={help}>Move over the image to {reverse?'dither':'reveal'} it. With focus, use the arrow keys to move, Home to center, Enter or Space to ripple, and Escape to clear. Vertical touch scrolling is available.</span>
  </div>;
}
