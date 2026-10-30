'use client';

import {useEffect,useId,useRef,useState} from 'react';
import './FlexCarousel.css';

// Independent native-WebGL renderer. The mesh is deformed in stage coordinates,
// so adjacent cards pass through one continuous lens rather than rotating as tiles.
export const flexCarouselPresets={
  liquid:{lensWidth:.74,lensHeight:1.18,tilt:62,roundness:1,bend:.34,reach:.38,curl:'twist',dispersion:.45,liquid:0,followCursor:false},
  ribbon:{lensWidth:.8,lensHeight:.8,tilt:0,roundness:1,bend:.34,reach:.34,curl:'twist',dispersion:.4,liquid:0,followCursor:false},
  vortex:{lensWidth:.7,lensHeight:.95,tilt:30,roundness:1,bend:.46,reach:.3,curl:'twist',dispersion:.5,liquid:0,followCursor:false},
  arch:{lensWidth:.8,lensHeight:.8,tilt:0,roundness:1,bend:.3,reach:.36,curl:'rise',dispersion:.4,liquid:0,followCursor:false},
};
const bounded=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
const wrap=(value,period)=>period?((value%period)+period)%period:0;
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const ease=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3);
function options(props){
  const preset=Object.hasOwn(flexCarouselPresets,props.preset)?props.preset:'liquid';
  const defaults={...flexCarouselPresets[preset],cardHeight:.5,gap:12,radius:0,squeeze:.2,interval:4,pixelRatio:1.5,initialIndex:0};
  const ranges={cardHeight:[.15,.85],gap:[0,80],radius:[0,80],lensWidth:[.2,1.6],lensHeight:[.2,2],tilt:[-180,180],roundness:[0,1],bend:[0,.9],reach:[.05,.9],dispersion:[0,1.5],liquid:[0,1.5],squeeze:[0,.6],interval:[1,30],pixelRatio:[.5,2],initialIndex:[0,49]};
  for(const [key,[min,max]] of Object.entries(ranges))defaults[key]=props[key]===undefined?defaults[key]:bounded(props[key],min,max,defaults[key]);
  return {...defaults,preset,intro:['rise','bloom','spin','deal','none'].includes(props.intro)?props.intro:'rise',fit:['natural','portrait','square','landscape'].includes(props.fit)?props.fit:'natural',
    curl:['twist','rise','fall'].includes(props.curl)?props.curl:defaults.curl,
    followCursor:props.followCursor===undefined?defaults.followCursor:!!props.followCursor,focusOnClick:props.focusOnClick!==false,
    autoplay:props.autoplay===true,captions:props.captions!==false,captureWheel:props.captureWheel!==false,paused:props.paused===true,
    showControls:props.showControls===true};
}
const vertex=`
precision highp float;
attribute vec2 point;
uniform vec2 viewport,center,size,lensCenter,lensSize;
uniform float angle,roundness,bend,reach,curl,focus,liquid,velocity,clock,introOpacity;
varying vec2 uv;
varying float edgeAmount;
void main(){
  vec2 p=center+(point-.5)*size;
  vec2 q=p-lensCenter;
  float c=cos(angle),s=sin(angle);
  vec2 rotated=vec2(c*q.x-s*q.y,s*q.x+c*q.y)/max(lensSize,vec2(1.));
  float power=mix(7.,2.,roundness);
  float d=pow(pow(abs(rotated.x),power)+pow(abs(rotated.y),power),1./power);
  float edge=smoothstep(.62,.62+reach*2.,d);
  float direction=2.*smoothstep(-viewport.x*.22,viewport.x*.22,q.x)-1.;
  float side=curl<.5?-direction:(curl<1.5?-1.:1.);
  float flex=bend*viewport.x*.46*(1.-focus);
  float wobble=sin(q.x/viewport.x*10.+clock*8.)*liquid*min(abs(velocity)/1500.,1.)*viewport.y*.055;
  p.y+=side*flex*edge+wobble*edge;
  p.x-=direction*flex*.13*edge;
  uv=point;edgeAmount=edge*(1.-focus)*introOpacity;
  gl_Position=vec4(p.x/(viewport.x*.5),-p.y/(viewport.y*.5),0.,1.);
}
`;
const fragment=`
precision highp float;
uniform sampler2D image;
uniform vec2 size,crop;
uniform float radius,dispersion,opacity;
varying vec2 uv;
varying float edgeAmount;
void main(){
  vec2 p=(uv-.5)*size;
  float r=min(radius,min(size.x,size.y)*.5);
  vec2 d=abs(p)-(size*.5-r);
  float distance=length(max(d,0.))+min(max(d.x,d.y),0.)-r;
  float mask=1.-smoothstep(-.75,.75,distance);
  vec2 tex=(uv-.5)*crop+.5;
  float shift=dispersion*edgeAmount*.012;
  vec4 normal=texture2D(image,tex);
  vec3 color=vec3(texture2D(image,tex+vec2(shift,0.)).r,normal.g,texture2D(image,tex-vec2(shift,0.)).b);
  float alpha=normal.a*mask*opacity;
  gl_FragColor=vec4(color*alpha,alpha);
}
`;
function graphics(canvas){
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,depth:false,stencil:false});
  if(!gl)throw new Error('WebGL unavailable');
  const shaders=[],textures=new Set();let program,buffer;
  try{
    for(const [type,code] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
      const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,code);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
    }
    program=gl.createProgram();for(const shader of shaders)gl.attachShader(program,shader);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    buffer=gl.createBuffer();if(!buffer)throw new Error('GPU allocation failed');
  }catch(error){for(const shader of shaders)gl.deleteShader(shader);if(program)gl.deleteProgram(program);if(buffer)gl.deleteBuffer(buffer);throw error;}
  for(const shader of shaders)gl.deleteShader(shader);gl.useProgram(program);
  const vertices=[];for(let y=0;y<12;y++)for(let x=0;x<40;x++){const x0=x/40,x1=(x+1)/40,y0=y/12,y1=(y+1)/12;vertices.push(x0,y0,x1,y0,x0,y1,x0,y1,x1,y0,x1,y1);}
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  const attribute=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  const locations={};const loc=name=>locations[name]??(locations[name]=gl.getUniformLocation(program,name));
  const scalar=(name,value)=>gl.uniform1f(loc(name),value),vector=(name,x,y)=>gl.uniform2f(loc(name),x,y);
  gl.uniform1i(loc('image'),0);
  return {
    texture(image){const texture=gl.createTexture();if(!texture)throw new Error('Texture allocation failed');gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
      try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);}catch(error){gl.deleteTexture(texture);throw error;}textures.add(texture);return texture;},
    remove(texture){if(texture){gl.deleteTexture(texture);textures.delete(texture);}},
    resize(w,h,ratio){const limit=gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);const dpr=Math.min(devicePixelRatio||1,ratio,limit/w,limit/h,Math.sqrt(8e6/(w*h)));const width=Math.max(1,Math.round(w*dpr)),height=Math.max(1,Math.round(h*dpr));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}vector('viewport',w,h);},
    begin(w,h,cfg,state){gl.clear(gl.COLOR_BUFFER_BIT);vector('viewport',w,h);vector('lensCenter',state.mouseX,state.mouseY);vector('lensSize',w*cfg.lensWidth*.5,w*cfg.lensHeight*.5);scalar('angle',cfg.tilt*Math.PI/180);scalar('roundness',cfg.roundness);scalar('bend',cfg.bend*state.bendIntro);scalar('reach',cfg.reach);scalar('curl',['twist','rise','fall'].indexOf(cfg.curl));scalar('focus',state.focus);scalar('liquid',cfg.liquid);scalar('velocity',state.velocity);scalar('clock',state.clock);scalar('introOpacity',1);scalar('radius',cfg.radius);scalar('dispersion',cfg.dispersion);},
    card(texture,rect,aspect){if(!texture)return;vector('center',rect.x,rect.y);vector('size',rect.width,rect.height);const view=rect.width/rect.height;vector('crop',view>aspect?1:view/aspect,view>aspect?aspect/view:1);scalar('opacity',rect.opacity);gl.bindTexture(gl.TEXTURE_2D,texture);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);},
    destroy(){for(const texture of textures)gl.deleteTexture(texture);textures.clear();gl.deleteBuffer(buffer);gl.deleteProgram(program);}
  };
}
function makePlaceholder(title){const canvas=document.createElement('canvas');canvas.width=480;canvas.height=640;const ctx=canvas.getContext('2d');if(ctx){const gradient=ctx.createLinearGradient(0,0,480,640);gradient.addColorStop(0,'#292b35');gradient.addColorStop(1,'#101116');ctx.fillStyle=gradient;ctx.fillRect(0,0,480,640);ctx.fillStyle='#a2a4af';ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText('Image unavailable',240,300);ctx.font='14px system-ui';ctx.fillText(String(title||'Photo').slice(0,36),240,335);}return canvas;}
function createEngine(root,canvas,buttons,caption,read,notify){
  let cfg=read().config,items=[],records=[],width=1,height=1,period=1,centers=[],sizes=[],ready=false,gfx=null,alive=true;
  let offset=0,target=0,velocity=0,index=0,open=false,focus=0,pointer=null,hovered=false,focused=false,visible=true,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let clock=0,last=0,raf=0,introTime=0,introDone=cfg.intro==='none'||reduced,mouseX=0,mouseY=0,aimX=0,aimY=0,idleAt=performance.now(),autoTimer=0,frame=0,itemKey='',configKey='',loadVersion=0,loadedOnce=false;
  let lastRects=[],lastState=null,lastWheel=0;
  const clearAuto=()=>{clearTimeout(autoTimer);autoTimer=0;};
  const fireChange=next=>{if(next!==index){index=next;root.dataset.index=String(index);notify(index,open);read().props.onChange?.(index,items[index]);}};
  const announce=()=>{root.dataset.index=String(index);root.dataset.open=String(open);root.dataset.ready=String(ready);root.dataset.reducedMotion=String(reduced);notify(index,open);};
  const setOpen=value=>{if(open===value)return;open=value;idleAt=performance.now();announce();wake();};
  const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;root.dataset.moving='false';clearAuto();};
  const scheduleAuto=()=>{
    clearAuto();if(!alive||!ready||items.length<2||!cfg.autoplay||cfg.paused||reduced||hovered||focused||open||pointer||!visible||document.hidden)return;
    autoTimer=setTimeout(()=>{autoTimer=0;navigate(1,false);},Math.max(16,cfg.interval*1000-(performance.now()-idleAt)));
  };
  function wake(){if(alive&&visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(tick);}scheduleAuto();}
  const skipIntro=()=>{introDone=true;introTime=3;};
  const interaction=()=>{skipIntro();idleAt=performance.now();clearAuto();};
  const closest=value=>{let result=0,distance=Infinity;for(let n=0;n<centers.length;n++){const d=Math.abs(wrap(centers[n]-value+period*.5,period)-period*.5);if(d<distance){distance=d;result=n;}}return result;};
  const centerTarget=n=>offset+(wrap(centers[n]-offset+period*.5,period)-period*.5);
  function select(n){if(!ready||!items.length)return;interaction();n=Math.max(0,Math.min(items.length-1,n));
    if(open){setOpen(false);return;}
    if(n!==index){target=centerTarget(n);velocity=0;if(reduced)offset=target;wake();return;}
    read().props.onSelect?.(n,items[n]);if(cfg.focusOnClick)setOpen(true);else wake();
  }
  function navigate(direction,user=true){if(!ready||items.length<2)return;if(user)interaction();else{skipIntro();idleAt=performance.now();}
    setOpen(false);const base=closest(target);const next=wrap(base+direction,items.length);
    const step=direction>0?wrap(centers[next]-centers[base],period): -wrap(centers[base]-centers[next],period);
    target+=step;velocity=0;if(reduced)offset=target;wake();
  }
  function layout(preserve=true){
    const box=root.getBoundingClientRect(),oldPeriod=period,oldOffset=offset,oldTarget=target;const oldIndex=Math.max(0,Math.min(index,items.length-1));
    const oldCenter=centers[oldIndex]||0,relative=wrap(oldOffset-oldCenter+oldPeriod*.5,oldPeriod)-oldPeriod*.5;
    width=Math.max(1,box.width);height=Math.max(1,box.height);let x=0;
    sizes=records.map(record=>{const ratio=cfg.fit==='natural'?record.aspect:cfg.fit==='portrait'?3/4:cfg.fit==='square'?1:4/3;const h=height*cfg.cardHeight;const w=h*ratio;const result={width:w,height:h};return result;});
    centers=sizes.map(size=>{const center=x+size.width*.5;x+=size.width+cfg.gap;return center;});period=Math.max(1,x);
    if(preserve&&centers.length){const ratio=period/oldPeriod;offset=centers[oldIndex]+relative*ratio;target=offset+(oldTarget-oldOffset)*ratio;}
    else{index=Math.min(Math.floor(cfg.initialIndex),Math.max(0,items.length-1));offset=target=centers[index]||0;}
    gfx?.resize(width,height,cfg.pixelRatio);announce();wake();
  }
  const upload=record=>{if(!gfx||!record.image)return;gfx.remove(record.texture);try{record.texture=gfx.texture(record.image);}catch{record.failed=true;record.image=makePlaceholder(record.item.title);record.aspect=.75;record.texture=gfx.texture(record.image);}};
  const startGraphics=()=>{try{gfx?.destroy();gfx=graphics(canvas);gfx.resize(width,height,cfg.pixelRatio);for(const record of records)upload(record);root.dataset.renderer='webgl';}catch{gfx?.destroy();gfx=null;root.dataset.renderer='fallback';}wake();};
  function load(next){
    const version=++loadVersion;const previous=items[index],previousIndex=index;records.forEach(r=>{clearTimeout(r.timer);if(r.loader){r.loader.onload=r.loader.onerror=null;r.loader.removeAttribute('src');}gfx?.remove(r.texture);});
    items=next;records=items.map(item=>({item,aspect:.75,image:null,texture:null,failed:false,timer:0,loader:null}));ready=!items.length;velocity=0;open=false;focus=0;
    if(!loadedOnce)introDone=cfg.intro==='none'||reduced;else introDone=true;
    let pending=records.length;const done=()=>{if(!alive||version!==loadVersion)return;if(--pending===0){ready=true;introTime=0;const old=previous?items.findIndex(item=>item.id===previous.id): -1;layout(false);if(loadedOnce){index=old>=0?old:Math.min(previousIndex,items.length-1);offset=target=centers[index];if(previous&&(index!==previousIndex||items[index].id!==previous.id))read().props.onChange?.(index,items[index]);}loadedOnce=true;announce();wake();}};
    layout(false);
    for(const record of records){
      let finished=false;const finish=success=>{if(finished||!alive||version!==loadVersion)return;finished=true;clearTimeout(record.timer);record.loader.onload=record.loader.onerror=null;
        record.failed=!success;let image=success?record.loader:makePlaceholder(record.item.title);
        record.aspect=success?image.naturalWidth/image.naturalHeight:.75;
        if(success&&Math.max(image.naturalWidth,image.naturalHeight)>1100){const scaled=document.createElement('canvas');const ratio=1100/Math.max(image.naturalWidth,image.naturalHeight);scaled.width=Math.round(image.naturalWidth*ratio);scaled.height=Math.round(image.naturalHeight*ratio);scaled.getContext('2d')?.drawImage(image,0,0,scaled.width,scaled.height);image=scaled;}
        record.image=image;try{upload(record);}catch{gfx?.destroy();gfx=null;root.dataset.renderer='fallback';}
        done();
      };
      const image=new Image();record.loader=image;image.crossOrigin='anonymous';image.onload=()=>finish(image.naturalWidth>0);image.onerror=()=>finish(false);record.timer=setTimeout(()=>finish(false),12000);if(record.item.src)image.src=record.item.src;else finish(false);
    }
    if(!records.length){announce();wake();}
  }
  const normalize=()=>{if(Math.abs(offset)>period*4){const shift=Math.floor(offset/period)*period;offset-=shift;target-=shift;}};
  function rects(){
    if(!items.length)return[];const result=[];const squeeze=1-cfg.squeeze*Math.min(1,Math.abs(velocity)/1800)*(1-focus);
    for(let n=0;n<items.length;n++){
      const size=sizes[n],base=wrap(centers[n]-offset+period*.5,period)-period*.5;
      const repeat=items.length===1?0:Math.min(8,Math.ceil(width/period)+1);
      for(let copy=-repeat;copy<=repeat;copy++){
        let x=base+copy*period;if(Math.abs(x)>width*.75+size.width)continue;
        const active=n===index&&copy===0;
        const focusedScale=Math.min(.65*height/size.height,.86*width/size.width);
        const scale=squeeze*(active?1+(focusedScale-1)*focus:1);
        const progress=introDone?1:Math.max(0,Math.min(1,(introTime-Math.min(.24,Math.abs(x)/width*.22))/1.15));const introEase=ease(progress);
        let y=0,alpha=introDone?1:smooth(0,.35,progress);
        if(!introDone){if(cfg.intro==='rise')y=(1-introEase)*height*.85;else if(cfg.intro==='deal')x*=introEase;else if(cfg.intro==='spin')x+=(1-introEase)*width*2.5;}
        if(!active){x+=Math.sign(x||1)*focus*width*.65;alpha*=1-focus;}else x*=1-focus;
        result.push({index:n,copy,x,y,width:size.width*scale,height:size.height*scale,opacity:alpha,active});
      }
    }return result;
  }
  function deform(x,y,state){
    const qx=x-state.mouseX,qy=y-state.mouseY,a=cfg.tilt*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
    const rx=(c*qx-s*qy)/(width*cfg.lensWidth*.5),ry=(s*qx+c*qy)/(width*cfg.lensHeight*.5),power=7-5*cfg.roundness;
    const d=Math.pow(Math.pow(Math.abs(rx),power)+Math.pow(Math.abs(ry),power),1/power),edge=smooth(.62,.62+cfg.reach*2,d);
    const flex=cfg.bend*state.bendIntro*width*.46*(1-state.focus),direction=2*smooth(-width*.22,width*.22,qx)-1,sign=cfg.curl==='twist'?-direction:cfg.curl==='rise'?-1:1;
    return [x-direction*flex*.13*edge,y+sign*flex*edge+Math.sin(qx/width*10+state.clock*8)*cfg.liquid*Math.min(Math.abs(state.velocity)/1500,1)*height*.055*edge];
  }
  function paint(){
    const state={mouseX,mouseY,focus,velocity,clock,bendIntro:!introDone&&cfg.intro==='bloom'?ease(introTime/1.15):1};
    lastState=state;lastRects=rects();gfx?.begin(width,height,cfg,state);
    for(const rect of lastRects){if(rect.opacity>.001)gfx?.card(records[rect.index].texture,rect,records[rect.index].aspect);}
    for(let n=0;n<items.length;n++){
      const button=buttons.current[n];if(!button)continue;const rect=lastRects.find(r=>r.index===n&&r.copy===0);
      button.dataset.failed=String(records[n].failed);button.dataset.aspect=String(records[n].aspect);
      if(!rect){button.style.visibility='hidden';continue;}button.style.visibility='visible';
      button.style.borderRadius=`${cfg.radius}px`;button.style.width=`${rect.width}px`;button.style.height=`${rect.height}px`;button.style.left=`${width*.5+rect.x-rect.width*.5}px`;button.style.top=`${height*.5+rect.y-rect.height*.5}px`;button.style.opacity=String(rect.opacity);
      button.dataset.x=rect.x.toFixed(3);button.dataset.width=rect.width.toFixed(3);button.dataset.height=rect.height.toFixed(3);
    }
    if(caption.current&&items[index]){const size=sizes[index],grown=Math.min(height*.65,size.height*.86*width/size.width);const h=size.height+(grown-size.height)*focus;caption.current.style.top=`${Math.min(height-58,height*.5+h*.5+24)}px`;caption.current.style.setProperty('--fxc-counter-opacity',1-focus);}
    root.dataset.frame=String(++frame);root.dataset.offset=offset.toFixed(3);root.dataset.velocity=velocity.toFixed(3);root.dataset.focus=focus.toFixed(3);root.dataset.intro=String(!introDone);root.dataset.period=period.toFixed(3);
  }
  function tick(now){
    raf=0;if(!alive||!visible||document.hidden)return;const dt=last?Math.min(.08,(now-last)/1000):1/60;last=now;clock+=dt;
    if(ready){
      if(!introDone){introTime+=dt;if(introTime>=1.5)introDone=true;}
      if(!pointer){
        if(Math.abs(velocity)>8&&!reduced){target+=velocity*dt;velocity*=Math.exp(-6*dt);}
        else velocity=0;
        if(!velocity&&now-lastWheel>140){const n=closest(target);const snap=target+wrap(centers[n]-target+period*.5,period)-period*.5;target=reduced?snap:target+(snap-target)*(1-Math.exp(-14*dt));if(Math.abs(snap-target)<.025)target=snap;}
        offset=reduced?target:offset+(target-offset)*(1-Math.exp(-13*dt));
        if(Math.abs(target-offset)<.025)offset=target;
      }else if(!pointer.pending){offset=reduced?target:offset+(target-offset)*(1-Math.exp(-24*dt));}
      const next=closest(offset);if(introDone)fireChange(next);
      focus=reduced?Number(open):focus+(Number(open)-focus)*(1-Math.exp(-10*dt));if(Math.abs(Number(open)-focus)<.001)focus=Number(open);
      const lens=cfg.followCursor&&!reduced&&!open?1:0;mouseX+=(aimX*lens-mouseX)*(1-Math.exp(-8*dt));mouseY+=(aimY*lens-mouseY)*(1-Math.exp(-8*dt));
      if(Math.abs(mouseX-aimX*lens)<.05)mouseX=aimX*lens;if(Math.abs(mouseY-aimY*lens)<.05)mouseY=aimY*lens;
      normalize();
    }
    paint();const moving=ready&&(now-lastWheel<=160||!introDone||Math.abs(target-offset)>.025||Math.abs(velocity)>8||focus!==Number(open)||Math.abs(mouseX-(cfg.followCursor&&!reduced&&!open?aimX:0))>.05||Math.abs(mouseY-(cfg.followCursor&&!reduced&&!open?aimY:0))>.05);
    root.dataset.moving=String(moving);if(moving)raf=requestAnimationFrame(tick);else{last=0;scheduleAuto();}
  }
  function hit(clientX,clientY){
    const box=root.getBoundingClientRect(),px=clientX-box.left-width*.5,py=clientY-box.top-height*.5;
    if(!lastState)return null;
    for(const rect of [...lastRects].reverse()){
      if(rect.opacity<.2)continue;
      if(!gfx){if(Math.abs(px-rect.x)<=rect.width*.5&&Math.abs(py-rect.y)<=rect.height*.5)return rect.index;continue;}
      let x=px,y=py;for(let k=0;k<14;k++){const p=deform(x,y,lastState);x+=(px-p[0])*.65;y+=(py-p[1])*.65;}
      if(Math.abs(x-rect.x)<=rect.width*.5&&Math.abs(y-rect.y)<=rect.height*.5)return rect.index;
    }return null;
  }
  const ignored=event=>event.target.closest?.('[data-flex-ignore],input,textarea,select,[contenteditable],a');
  const pointDown=event=>{
    if(event.button!==0||ignored(event)||event.target.closest('.fxc-controls')||!ready||!items.length)return;
    interaction();root.focus({preventScroll:true});pointer={id:event.pointerId,type:event.pointerType,startX:event.clientX,startY:event.clientY,lastX:event.clientX,lastY:event.clientY,last:performance.now(),origin:offset,pending:true,moved:false,wasOpen:open};target=offset;velocity=0;setOpen(false);wake();
  };
  const pointMove=event=>{
    const box=root.getBoundingClientRect();if(event.pointerType!=='touch'){aimX=(event.clientX-box.left-width*.5)*.22;aimY=(event.clientY-box.top-height*.5)*.22;if(cfg.followCursor)wake();}
    if(!pointer||pointer.id!==event.pointerId)return;
    const dx=event.clientX-pointer.startX,dy=event.clientY-pointer.startY;
    if(pointer.pending){if(Math.max(Math.abs(dx),Math.abs(dy))<5)return;if(pointer.type==='touch'&&Math.abs(dy)>Math.abs(dx)){pointer=null;root.dataset.dragging='false';return;}
      pointer.pending=false;pointer.moved=true;root.setPointerCapture?.(event.pointerId);root.dataset.dragging='true';}
    const now=performance.now(),dt=Math.max(8,now-pointer.last)/1000;target=pointer.origin-dx;
    velocity=reduced?0:(pointer.lastX-event.clientX)/dt*.65+velocity*.35;velocity=Math.max(-4000,Math.min(4000,velocity));pointer.lastX=event.clientX;pointer.lastY=event.clientY;pointer.last=now;idleAt=now;wake();
  };
  const pointUp=event=>{if(!pointer||pointer.id!==event.pointerId)return;const p=pointer;pointer=null;root.dataset.dragging='false';if(root.hasPointerCapture?.(event.pointerId))root.releasePointerCapture(event.pointerId);
    if(event.type==='pointercancel'){velocity=0;}else if(!p.moved){velocity=0;if(!p.wasOpen){const n=hit(event.clientX,event.clientY);if(n!==null)select(n);}}else if(performance.now()-p.last>100)velocity=0;
    if(reduced)velocity=0;wake();};
  const captureLost=event=>{if(pointer?.id===event.pointerId){pointer=null;velocity=0;root.dataset.dragging='false';wake();}};
  const wheel=event=>{
    if(!ready||items.length<2||event.ctrlKey||event.metaKey||ignored(event))return;
    const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.shiftKey;
    if(!horizontal&&!cfg.captureWheel)return;
    const factor=event.deltaMode===1?16:event.deltaMode===2?height:1;
    const delta=(horizontal?(event.deltaX||event.deltaY):event.deltaY)*factor;if(!delta)return;
    event.preventDefault();interaction();setOpen(false);velocity=0;target+=Math.max(-width,Math.min(width,delta));if(reduced)offset=target;lastWheel=performance.now();wake();
  };
  const key=event=>{
    if(event.key==='Escape'){setOpen(false);wake();return;}
    if(event.target!==root||!items.length)return;
    if(['ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(event.key)){event.preventDefault();interaction();
      if(event.key==='ArrowLeft'||event.key==='ArrowRight')navigate(event.key==='ArrowRight'?1:-1);
      else if(event.key==='Home'||event.key==='End'){setOpen(false);target=centerTarget(event.key==='Home'?0:items.length-1);velocity=0;if(reduced)offset=target;wake();}
      else select(index);
    }
  };
  const enter=()=>{hovered=true;clearAuto();};const leave=()=>{hovered=false;aimX=aimY=0;idleAt=performance.now();wake();};
  const focusIn=()=>{focused=true;clearAuto();};const focusOut=event=>{if(!root.contains(event.relatedTarget)){focused=false;idleAt=performance.now();scheduleAuto();}};
  const resize=()=>layout(true);const visibility=()=>{idleAt=performance.now();if(document.hidden){const id=pointer?.id;pointer=null;velocity=0;root.dataset.dragging='false';if(id!==undefined&&root.hasPointerCapture?.(id))root.releasePointerCapture(id);stop();}else wake();};
  const media=matchMedia('(prefers-reduced-motion: reduce)');const motion=()=>{reduced=media.matches;if(reduced){skipIntro();velocity=0;offset=target;focus=Number(open);mouseX=mouseY=0;}announce();wake();};
  const lost=event=>{event.preventDefault();gfx?.destroy();gfx=null;root.dataset.renderer='fallback';wake();};
  canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',startGraphics);
  root.addEventListener('pointerdown',pointDown);root.addEventListener('pointermove',pointMove);root.addEventListener('pointerup',pointUp);root.addEventListener('pointercancel',pointUp);root.addEventListener('lostpointercapture',captureLost);root.addEventListener('wheel',wheel,{passive:false});root.addEventListener('keydown',key);root.addEventListener('pointerenter',enter);root.addEventListener('pointerleave',leave);root.addEventListener('focusin',focusIn);root.addEventListener('focusout',focusOut);
  window.addEventListener('pointerup',pointUp);window.addEventListener('pointercancel',pointUp);document.addEventListener('visibilitychange',visibility);media.addEventListener('change',motion);window.addEventListener('resize',resize);
  const observer=new ResizeObserver(resize);observer.observe(root);const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;idleAt=performance.now();if(visible)wake();else stop();});intersection.observe(root);
  startGraphics();
  return {select,navigate,close:()=>setOpen(false),
    update(){const next=read();cfg=next.config;const newConfigKey=JSON.stringify(cfg),newItemKey=JSON.stringify(next.items);
      if(newItemKey!==itemKey){itemKey=newItemKey;configKey=newConfigKey;load(next.items);return;}
      if(newConfigKey!==configKey){configKey=newConfigKey;if(!cfg.focusOnClick)setOpen(false);if(cfg.intro==='none')skipIntro();velocity=0;layout(true);idleAt=performance.now();wake();}
    },
    destroy(){alive=false;++loadVersion;stop();observer.disconnect();intersection.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',motion);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',startGraphics);for(const [name,listener] of [['pointerdown',pointDown],['pointermove',pointMove],['pointerup',pointUp],['pointercancel',pointUp],['lostpointercapture',captureLost],['wheel',wheel],['keydown',key],['pointerenter',enter],['pointerleave',leave],['focusin',focusIn],['focusout',focusOut]])root.removeEventListener(name,listener);
      window.removeEventListener('pointerup',pointUp);window.removeEventListener('pointercancel',pointUp);records.forEach(record=>{clearTimeout(record.timer);if(record.loader){record.loader.onload=record.loader.onerror=null;record.loader.removeAttribute('src');}});gfx?.destroy();gfx=null;
    }
  };
}

export default function FlexCarousel(props){
  const root=useRef(null),canvas=useRef(null),buttons=useRef([]),caption=useRef(null),engine=useRef(null),latest=useRef(null),help=useId();
  const items=(Array.isArray(props.items)?props.items:[]).slice(0,50).filter(item=>item&&typeof item==='object').map((item,index)=>({...item,id:String(item.id??item.src??index),src:typeof item.src==='string'?item.src:'',title:String(item.title??`Image ${index+1}`),alt:String(item.alt??item.title??`Image ${index+1}`)}));
  const [autoPaused,setAutoPaused]=useState(false);
  const config=options({...props,paused:props.paused||autoPaused});latest.current={config,items,props};
  const [state,setState]=useState({index:Math.min(Math.floor(config.initialIndex),Math.max(0,items.length-1)),open:false});
  useEffect(()=>{
    const notify=(index,open)=>setState(old=>old.index===index&&old.open===open?old:{index,open});
    engine.current=createEngine(root.current,canvas.current,buttons,caption,()=>latest.current,notify);engine.current.update();return()=>{engine.current?.destroy();engine.current=null;};
  },[]);
  useEffect(()=>{engine.current?.update();});
  const current=items[state.index]||items[0];
  return <div ref={root} className={`flex-carousel ${props.className||''}`} style={props.style} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={props['aria-label']||'Flex image carousel'} aria-describedby={help} data-dragging="false">
    <canvas ref={canvas} className="fxc-canvas" aria-hidden="true"/>
    <div className="fxc-images">{items.map((item,index)=><button key={`${item.id}-${index}`} ref={node=>buttons.current[index]=node} className="fxc-card" tabIndex={-1} type="button" aria-label={`Select ${item.alt}`} aria-current={state.index===index?'true':undefined} aria-expanded={config.focusOnClick&&state.index===index?state.open:undefined} onClick={()=>engine.current?.select(index)}><img src={item.src||undefined} crossOrigin="anonymous" alt="" draggable="false"/><span className="fxc-failed">Image unavailable<br/>{item.title}</span></button>)}</div>
    {config.captions&&current&&<div ref={caption} className="fxc-caption" aria-hidden="true"><span className="fxc-title">{current.title}</span>{current.subtitle&&<span className="fxc-subtitle">{current.subtitle}</span>}<span className="fxc-count"><span className="fxc-digits">{String(state.index+1).padStart(2,'0').split('').map((digit,n)=><span className="fxc-digit" key={n}><span style={{transform:`translateY(-${Number(digit)*10}%)`}}>{Array.from({length:10},(_,d)=><i key={d}>{d}</i>)}</span></span>)}</span><span>/</span><span>{String(items.length).padStart(2,'0')}</span></span></div>}
    {config.showControls&&items.length>0&&<div className="fxc-controls" data-flex-ignore><button type="button" aria-label="Previous image" disabled={items.length<2} onClick={()=>engine.current?.navigate(-1)}>←</button><button type="button" aria-label="Next image" disabled={items.length<2} onClick={()=>engine.current?.navigate(1)}>→</button>{config.autoplay&&<button type="button" aria-label={config.paused?'Resume autoplay':'Pause autoplay'} disabled={props.paused===true} onClick={()=>setAutoPaused(value=>!value)}>{config.paused?'Play':'Pause'}</button>}{state.open&&<button type="button" onClick={()=>engine.current?.close()}>Close</button>}</div>}
    {!items.length&&<p className="fxc-empty">Add images to the carousel.</p>}
    <span className="fxc-sr-only" id={help}>Drag or scroll to browse. Left and right arrow keys navigate; Home and End jump. Enter selects the centered image. Escape closes focus.</span>
    <span className="fxc-sr-only" aria-live="polite" aria-atomic="true">{current?`${current.alt}, ${state.index+1} of ${items.length}${state.open?', focused':''}`:'No images'}</span>
  </div>;
}
