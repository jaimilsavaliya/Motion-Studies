'use client';

import {useEffect,useRef} from 'react';
import './GradientASCII.css';

// Independent renderer: analytical light fields and a generated glyph atlas.
// No external renderer, font, image, shader, or animation package is required.
const DEFAULT_COLORS=['#1e3fd8','#f6f8ff','#a5d8ff','#38bdf8'];
const DEFAULT_CHARS=' =+xX0S8#@';
const FONT='ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const SHAPES=['horizon','pinch','rise','eclipse'];
const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
const vertex=`
attribute vec2 position;
varying vec2 uv;
void main(){uv=vec2(position.x*.5+.5,.5-position.y*.5);gl_Position=vec4(position,0.,1.);}
`;
const fragment=`
precision highp float;
varying vec2 uv;
uniform vec2 viewport;
uniform vec3 colors[8];
uniform int colorCount,shape,clickKind;
uniform float drift,clock,seed,cell,density,glyphOpacity,gradientOpacity,glow,depth,flicker,softness,zoom,flow,grain,light,reveal,radius,glyphCount;
uniform sampler2D atlas;
uniform vec4 trails[12],clicks[4];
float random(vec2 p){return fract(sin(dot(p,vec2(57.73,129.31))+seed*19.47)*41731.31);}
float saturate(float a){return clamp(a,0.,1.);}
vec4 field(vec2 point){
  float aspect=viewport.x/viewport.y;
  vec2 p=(point-.5)/zoom;
  float xx=p.x*2.;
  float wave=(sin(xx*3.7+drift*.24+seed)+sin(xx*1.4-drift*.19+seed*2.))*flow*.014;
  float level=0.;float alpha=0.;float order=0.;
  if(shape==0){
    float boundary=.04+.24*xx*xx+wave;
    float distance=boundary-p.y;
    float feather=.10+softness*.18;
    alpha=smoothstep(-feather*.6,feather,distance);
    level=pow(saturate(distance/.70),2.7);
    order=saturate(distance*1.55);
  }else if(shape==1){
    float width=(.055+.19*xx*xx)*(.75+softness*.6);
    float distance=abs(p.y-wave);
    level=exp(-pow(distance/width,2.))*(.72+.28*cos(xx));
    alpha=smoothstep(0.,.32,level);order=saturate(distance*2.5+abs(xx)*.15);
  }else if(shape==2){
    vec2 q=vec2((p.x-wave)*1.3,(p.y-.68)*1.8);
    level=pow(saturate(1.1-length(q)),.7+softness*.7);
    alpha=smoothstep(0.,.3,level);order=saturate(length(q));
  }else{
    vec2 q=vec2(p.x*aspect,p.y);
    float fit=min(1.,aspect*1.1),angle=atan(q.y,q.x);
    float edge=length(q)-.225*fit;
    float rays=1.+flow*.09*sin(angle*7.+drift*.2)*sin(angle*3.-drift*.13);
    float reach=(.045+softness*.11)*fit*rays;
    level=exp(-max(0.,edge)/reach);
    alpha=smoothstep(-.012,.018,edge)*smoothstep(0.,.28,level);
    order=saturate(max(0.,edge)*3.);
  }
  float intro=smoothstep(order,order+.24,reveal*1.24);
  float coord=saturate(level)*float(colorCount-1);
  vec3 color=colors[0];
  for(int i=0;i<7;i++){
    if(i<colorCount-1){float blend=clamp(coord-float(i),0.,1.);color=mix(color,colors[i+1],i==0?blend*blend:blend);}
  }
  if(shape==0){
    float highlight=exp(-xx*xx*4.)*smoothstep(.32,.68,.5-p.y)*.45;
    color=mix(color,colors[1],highlight);
  }
  return vec4(color,alpha*intro);
}
float ink(float index,vec2 local,vec2 shift){
  vec2 q=local+shift;
  if(q.x<.02||q.y<.02||q.x>.98||q.y>.98)return 0.;
  vec2 tile=vec2(mod(index,16.),floor(index/16.));
  return texture2D(atlas,(tile+q)/vec2(16.,8.)).a;
}
void main(){
  vec4 background=field(uv);
  vec2 grid=vec2(cell*.62,cell);
  vec2 offset=mod(viewport,grid)*.5;
  vec2 pos=(uv*viewport-offset)/grid;
  vec2 id=floor(pos),local=fract(pos);
  vec2 center=(id+.5)*grid+offset;
  vec4 sampleColor=field(center/viewport);
  float brightness=dot(sampleColor.rgb,vec3(.22,.70,.08))*sampleColor.a;
  float pick=random(id);
  float luma=light>.5?(1.-dot(sampleColor.rgb,vec3(.22,.70,.08)))*sampleColor.a:pow(brightness,.7);
  float index=floor(saturate(luma)*max(0.,glyphCount-1.));
  float tick=floor(clock*9.);
  float jitter=random(id+vec2(tick,37.));
  if(jitter<flicker*.45)index+=jitter<flicker*.225?-1.:1.;
  float influence=0.;
  vec2 point=(center-viewport*.5)/viewport.y;
  for(int i=0;i<12;i++){
    vec4 t=trails[i];float age=clock-t.z;
    if(t.w>.5&&age>=0.&&age<.8){
      float d=length(point-t.xy)/max(.008,radius);
      influence=max(influence,exp(-d*d*2.)*(1.-age/.8));
    }
  }
  for(int i=0;i<4;i++){
    vec4 c=clicks[i];float age=clock-c.z;
    if(c.w>.5&&age>=0.&&age<1.4){
      float d=length(point-c.xy),power=1.-age/1.4;
      if(clickKind==1)influence=max(influence,exp(-pow((d-age*.65)/.05,2.))*power);
      if(clickKind==2)influence=max(influence,(1.-smoothstep(.04,.15+age*.18,d))*power);
    }
  }
  float decoding=(1.-reveal)*sampleColor.a;
  if(random(id+vec2(tick,11.))<max(influence,decoding))index=floor(random(id+tick*1.73)*glyphCount);
  index=clamp(index,0.,max(0.,glyphCount-1.));
  float present=density<=0.?0.:step(pick,density*(.35+.65*saturate(luma+influence)));
  float base=ink(index,local,vec2(0.));
  float blur=0.;
  float spread=mix(.045,.14,depth*step(pick,depth));
  blur+=ink(index,local,vec2(spread,0.));blur+=ink(index,local,vec2(-spread,0.));
  blur+=ink(index,local,vec2(0.,spread));blur+=ink(index,local,vec2(0.,-spread));
  blur*=.25;
  float blurred=step(pick,depth)*depth;
  float glyph=mix(base,blur,blurred)+blur*glow*.65;
  float glyphAlpha=saturate(glyph*glyphOpacity*present*sampleColor.a);
  vec3 inkColor=light>.5?sampleColor.rgb*.55:min(vec3(1.),sampleColor.rgb*1.4+vec3(.08));
  float bgAlpha=background.a*gradientOpacity;
  vec3 rgb=background.rgb*bgAlpha;
  rgb=rgb*(1.-glyphAlpha)+inkColor*glyphAlpha;
  float alpha=bgAlpha+(1.-bgAlpha)*glyphAlpha;
  float noise=(random(gl_FragCoord.xy+floor(clock*24.))-0.5)*grain;
  rgb=clamp(rgb+noise*alpha,0.,alpha);
  gl_FragColor=vec4(rgb,alpha);
}
`;

function settings(props){
  const ranges={cellSize:[8,80,18],density:[0,1,.8],glyphOpacity:[0,1,.85],gradientOpacity:[0,1,.9],glow:[0,1.5,.2],depthOfField:[0,1,0],flicker:[0,1,.2],softness:[0,1,.5],scale:[.4,2.5,1],flow:[0,2,.5],speed:[0,5,1],grain:[0,.4,.08],variation:[-10000,10000,0],scrambleRadius:[.01,.5,.1],dpr:[.5,2,2]};
  const s={};for(const [key,[min,max,value]] of Object.entries(ranges))s[key]=props[key]===undefined?value:clamp(props[key],min,max,value);
  return {...s,colors:Array.isArray(props.colors)?props.colors.slice(0,8):DEFAULT_COLORS,
    characters:typeof props.characters==='string'?Array.from(props.characters).slice(0,128).join(''):DEFAULT_CHARS,
    fontFamily:typeof props.fontFamily==='string'&&props.fontFamily.trim()?props.fontFamily:FONT,
    shape:SHAPES.includes(props.shape)?props.shape:'horizon',clickEffect:['none','wave','burst'].includes(props.clickEffect)?props.clickEffect:'wave',
    mouseInteraction:props.mouseInteraction!==false,intro:props.intro!==false,lightMode:props.lightMode===true,paused:props.paused===true};
}

function renderer(canvas,root,initial){
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false});
  if(!gl)throw new Error('WebGL unavailable');
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(message);}return s;};
  let vs,fs,program,buffer,texture;
  try{
    vs=shader(gl.VERTEX_SHADER,vertex);fs=shader(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    buffer=gl.createBuffer();texture=gl.createTexture();
  }catch(error){if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);if(program)gl.deleteProgram(program);throw error;}
  gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const loc={};const uniform=name=>loc[name]??(loc[name]=gl.getUniformLocation(program,name));
  const f=(name,value)=>gl.uniform1f(uniform(name),value),i=(name,value)=>gl.uniform1i(uniform(name),value);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);i('atlas',0);
  const atlas=document.createElement('canvas');atlas.width=512;atlas.height=384;
  const ctx=atlas.getContext('2d');if(!ctx){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);throw new Error('Canvas unavailable');}
  let cfg=initial,alive=true,raf=0,last=0,time=0,driftTime=0,introTime=initial.intro&&!initial.paused?0:3,frame=0,visible=true,width=0,height=0,fontVersion=0,atlasKey='';
  const media=matchMedia('(prefers-reduced-motion: reduce)');let reduced=media.matches;if(reduced)introTime=3;
  const trails=[],clicks=[],trailUniform=new Float32Array(48),clickUniform=new Float32Array(16);
  const updateAtlas=()=>{
    ctx.clearRect(0,0,512,384);ctx.font=`34px ${cfg.fontFamily}`;ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';
    const chars=Array.from(cfg.characters||' ');chars.forEach((ch,n)=>ctx.fillText(ch,(n%16)*32+16,Math.floor(n/16)*48+24,30));
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);f('glyphCount',chars.length);
  };
  const palette=()=>{
    const parsed=[];for(const color of cfg.colors){if(typeof color!=='string'||!CSS.supports('color',color)||/^(currentcolor|inherit|initial|unset|var\()/i.test(color))continue;
      ctx.clearRect(0,0,1,1);ctx.fillStyle='#000';ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const p=ctx.getImageData(0,0,1,1).data;if(p[3])parsed.push([p[0]/255,p[1]/255,p[2]/255]);
    }
    if(!parsed.length)parsed.push([.118,.247,.847],[.965,.973,1],[.647,.847,1],[.22,.741,.973]);
    if(parsed.length===1)parsed.push(parsed[0]);const packed=new Float32Array(24);parsed.forEach((rgb,n)=>packed.set(rgb,n*3));gl.uniform3fv(uniform('colors[0]'),packed);i('colorCount',parsed.length);
  };
  const resize=()=>{
    const box=root.getBoundingClientRect();width=box.width;height=box.height;
    const max=gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    const ratio=Math.min(devicePixelRatio||1,cfg.dpr,max/Math.max(1,width),max/Math.max(1,height),Math.sqrt(8e6/Math.max(1,width*height)));
    const w=Math.max(1,Math.round(width*ratio)),h=Math.max(1,Math.round(height*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    gl.uniform2f(uniform('viewport'),Math.max(1,width),Math.max(1,height));root.dataset.dpr=String(ratio);wake();
  };
  const eventsActive=()=>trails.some(t=>time-t[2]<.8)||clicks.some(t=>time-t[2]<1.4);
  const canAnimate=()=>!cfg.paused&&!reduced&&(cfg.speed>0||cfg.flicker>0||(cfg.intro&&introTime<2.8)||eventsActive());
  const pack=(list,array,lifetime)=>{while(list.length&&time-list[0][2]>lifetime)list.shift();array.fill(0);list.forEach((point,n)=>array.set(point,n*4));};
  const draw=now=>{
    raf=0;if(!alive||!visible||document.hidden||!width||!height)return;
    const dt=last?Math.min(.25,(now-last)/1000):0;last=now;
    if(!cfg.paused&&!reduced){time+=dt;driftTime+=dt*cfg.speed;introTime+=dt;}
    f('drift',driftTime);f('clock',time);f('reveal',reduced||!cfg.intro?1:Math.min(1,introTime/2.8));
    pack(trails,trailUniform,.8);pack(clicks,clickUniform,1.4);gl.uniform4fv(uniform('trails[0]'),trailUniform);gl.uniform4fv(uniform('clicks[0]'),clickUniform);
    gl.drawArrays(gl.TRIANGLES,0,6);root.dataset.frame=String(++frame);root.dataset.time=driftTime.toFixed(3);root.dataset.intro=String(reduced||introTime>=2.8||!cfg.intro);root.dataset.interactions=String(trails.length+clicks.length);
    const running=canAnimate();root.dataset.running=String(running);if(running)raf=requestAnimationFrame(draw);else last=0;
  };
  function wake(){if(alive&&visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(draw);}}
  const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;root.dataset.running='false';};
  const update=next=>{
    const old=cfg;cfg=CSS.supports('font-family',next.fontFamily)?next:{...next,fontFamily:FONT};
    if(!old.intro&&cfg.intro)introTime=cfg.paused||reduced?3:0;
    if(!cfg.mouseInteraction)trails.length=0;if(cfg.clickEffect==='none')clicks.length=0;
    i('shape',SHAPES.indexOf(cfg.shape));i('clickKind',['none','wave','burst'].indexOf(cfg.clickEffect));
    for(const [name,key] of Object.entries({seed:'variation',cell:'cellSize',density:'density',glyphOpacity:'glyphOpacity',gradientOpacity:'gradientOpacity',glow:'glow',depth:'depthOfField',flicker:'flicker',softness:'softness',zoom:'scale',flow:'flow',grain:'grain',radius:'scrambleRadius'}))f(name,cfg[key]);
    f('light',cfg.lightMode?1:0);palette();
    const nextAtlasKey=JSON.stringify([cfg.characters,cfg.fontFamily]);
    if(atlasKey!==nextAtlasKey){
      atlasKey=nextAtlasKey;updateAtlas();const version=++fontVersion;
      try{document.fonts?.load(`34px ${cfg.fontFamily}`).then(()=>{if(alive&&version===fontVersion){updateAtlas();wake();}}).catch(()=>{});}catch{/* Keep the system-font atlas if font loading is unsupported. */}
    }
    root.dataset.shape=cfg.shape;root.dataset.cellSize=String(cfg.cellSize);root.dataset.paused=String(cfg.paused);root.dataset.reducedMotion=String(reduced);resize();
  };
  const point=event=>{const b=root.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom||!b.height)return null;return [(event.clientX-b.left-b.width/2)/b.height,(event.clientY-b.top-b.height/2)/b.height,time,1];};
  const ignored=event=>event.target?.closest?.('a,button,input,select,textarea,[contenteditable],[data-ascii-ignore]');
  const move=event=>{if(ignored(event)||!cfg.mouseInteraction||cfg.paused||reduced||event.pointerType==='touch')return;const p=point(event);if(!p)return;
    const prev=trails[trails.length-1];if(prev&&Math.hypot(prev[0]-p[0],prev[1]-p[1])<.012&&time-prev[2]<.06)return;
    trails.push(p);if(trails.length>12)trails.shift();wake();};
  const click=event=>{if(ignored(event)||cfg.clickEffect==='none'||cfg.paused||reduced)return;const p=point(event);if(!p)return;clicks.push(p);if(clicks.length>4)clicks.shift();wake();};
  const parent=root.parentElement||root;parent.addEventListener('pointermove',move,{passive:true});parent.addEventListener('click',click,{passive:true});
  const visibility=()=>document.hidden?stop():wake();document.addEventListener('visibilitychange',visibility);
  const motion=()=>{reduced=media.matches;if(reduced)introTime=3;trails.length=0;clicks.length=0;root.dataset.reducedMotion=String(reduced);stop();wake();};media.addEventListener('change',motion);
  const ro=new ResizeObserver(resize);ro.observe(root);window.addEventListener('resize',resize);
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else stop();});io.observe(root);
  update(cfg);root.dataset.renderer='webgl';
  return {update,destroy(){alive=false;stop();ro.disconnect();io.disconnect();media.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);parent.removeEventListener('pointermove',move);parent.removeEventListener('click',click);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
}

export default function GradientASCII(props){
  const root=useRef(null),canvas=useRef(null),engine=useRef(null),latest=useRef(null);latest.current=settings(props);
  useEffect(()=>{
    const element=root.current,node=canvas.current;
    const start=()=>{engine.current?.destroy();engine.current=null;try{engine.current=renderer(node,element,latest.current);}catch{element.dataset.renderer='fallback';element.dataset.running='false';}};
    const lost=event=>{event.preventDefault();engine.current?.destroy();engine.current=null;element.dataset.renderer='fallback';element.dataset.running='false';};
    node.addEventListener('webglcontextlost',lost);node.addEventListener('webglcontextrestored',start);start();
    return()=>{node.removeEventListener('webglcontextlost',lost);node.removeEventListener('webglcontextrestored',start);engine.current?.destroy();engine.current=null;};
  },[]);
  useEffect(()=>{engine.current?.update(latest.current);});
  return <div ref={root} className={`gradient-ascii ${props.className||''}`} style={props.style} data-light={props.lightMode===true} data-shape={latest.current.shape} aria-hidden="true">
    <div className="ga-fallback"/><canvas ref={canvas}/>
  </div>;
}
