'use client';

import {useEffect,useId,useRef,useState} from 'react';
import './TechText.css';

// Independent Canvas implementation. Glyph boundaries come from locally rasterized
// fonts; no reference source, path data, font parser or animation package is used.
export const techTextPresets={
  vector:{fontFamily:'',fontWeight:600,letterSpacing:-.05,reveal:'letter',reach:200,softness:.7,lineStyle:'dashed',dashLength:4,dashGap:2,strokeWidth:1.5,specks:15,labels:true,guides:false,bounce:.4,intro:'none',introDuration:2},
  lens:{fontFamily:'',fontWeight:600,letterSpacing:-.05,reveal:'area',reach:240,softness:.85,lineStyle:'solid',dashLength:4,dashGap:2,strokeWidth:1,specks:0,labels:false,guides:false,bounce:.4,intro:'type',introDuration:1.4},
  mono:{fontFamily:'"Geist Mono", ui-monospace, monospace',fontWeight:500,letterSpacing:-.02,reveal:'letter',reach:200,softness:.7,lineStyle:'dashed',dashLength:2,dashGap:2,strokeWidth:1,specks:32,labels:true,guides:false,bounce:.4,intro:'assemble',introDuration:2.2},
  serif:{fontFamily:'Georgia, "Times New Roman", serif',fontWeight:400,letterSpacing:-.03,reveal:'letter',reach:200,softness:.7,lineStyle:'solid',dashLength:4,dashGap:2,strokeWidth:1.25,specks:6,labels:true,guides:true,bounce:.75,intro:'metrics',introDuration:2.8}
};
const defaults={text:'Tech Text',fontFamily:'',fontWeight:600,fontSize:150,letterSpacing:-.05,align:'center',color:'currentColor',accentColor:'currentColor',reveal:'letter',reach:200,softness:.7,dashLength:4,dashGap:2,lineStyle:'dashed',strokeWidth:1.5,specks:15,selection:true,labels:true,draggable:true,bounce:.4,clickKick:true,intro:'none',introDuration:2,guides:false,sweep:true,speed:1,paused:false,pixelRatio:1.5};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const numeric=(v,a,b,f)=>Number.isFinite(Number(v))?clamp(Number(v),a,b):f;
const ease=v=>1-Math.pow(1-clamp(v,0,1),3);
const random=(i,seed=0)=>{let n=Math.imul(i+seed*131+79,1597334677);n^=n>>>13;return (Math.imul(n,2246822519)>>>0)/4294967296;};
function characters(text){const value=String(text??'').slice(0,4096).replace(/[\r\n\t]/g,' ');return typeof Intl.Segmenter==='function'?Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(value),v=>v.segment).slice(0,96):Array.from(value).slice(0,96);}
function normalize(input){
 const c={...defaults,...input};c.text=characters(c.text).join('');
 for(const[key,a,b]of[['fontWeight',100,900],['fontSize',12,640],['letterSpacing',-.1,.3],['reach',0,800],['softness',0,1],['dashLength',.5,32],['dashGap',0,24],['strokeWidth',.25,8],['specks',0,64],['bounce',0,1],['introDuration',.2,8],['speed',0,5],['pixelRatio',.5,2]])c[key]=numeric(c[key],a,b,defaults[key]);
 c.specks=Math.round(c.specks);
 for(const[key,values]of Object.entries({align:['left','center','right'],reveal:['letter','area','off'],lineStyle:['dashed','solid'],intro:['none','type','assemble','metrics']}))if(!values.includes(c[key]))c[key]=defaults[key];
 c.fontFamily=typeof c.fontFamily==='string'?c.fontFamily.slice(0,300):'';
 return c;
}
function simplify(points,tolerance){
 if(points.length<5)return points;
 const keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;const stack=[[0,points.length-1]];
 while(stack.length){const[a,b]=stack.pop(),p=points[a],q=points[b],dx=q.x-p.x,dy=q.y-p.y,length=dx*dx+dy*dy;let far=-1,max=tolerance*tolerance;
  for(let i=a+1;i<b;i++){const v=points[i],t=length?clamp(((v.x-p.x)*dx+(v.y-p.y)*dy)/length,0,1):0;const distance=(v.x-p.x-t*dx)**2+(v.y-p.y-t*dy)**2;if(distance>max){max=distance;far=i;}}
  if(far!==-1){keep[far]=1;stack.push([a,far],[far,b]);}
 }
 return points.filter((_,i)=>keep[i]);
}
function traceGlyph(char,font,measure){
 const pad=3,left=-measure.actualBoundingBoxLeft-pad,top=-measure.actualBoundingBoxAscent-pad;
 const width=Math.max(1,measure.actualBoundingBoxLeft+measure.actualBoundingBoxRight+pad*2),height=Math.max(1,measure.actualBoundingBoxAscent+measure.actualBoundingBoxDescent+pad*2);
 const scale=Math.min(2,Math.sqrt(750000/(width*height))),raster=document.createElement('canvas');raster.width=Math.ceil(width*scale);raster.height=Math.ceil(height*scale);
 const unavailable={path:null,samples:[],contours:0};
 const ctx=raster.getContext('2d',{willReadFrequently:true});
 // Text still renders through fillText when a scratch raster cannot be read back.
 if(!ctx){raster.width=raster.height=1;return unavailable;}
 try{
 const ctx2=ctx;ctx2.scale(scale,scale);ctx2.font=font;ctx2.fontKerning='normal';ctx2.fillStyle='#fff';ctx2.fillText(char,-left,-top);
 const w=raster.width,h=raster.height,data=ctx2.getImageData(0,0,w,h).data,occupied=new Uint8Array(w*h),edges=new Map(),samples=[];
 for(let i=0;i<occupied.length;i++)occupied[i]=data[i*4+3]>127?1:0;
 const edge=(x,y,tx,ty,d)=>{const key=y*(w+1)+x;let list=edges.get(key);if(!list){list=[];edges.set(key,list);}list.push({x:tx,y:ty,d});};
 const sampleStep=Math.max(3,Math.round(Math.sqrt(w*h/260)));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(occupied[y*w+x]){
  if(y===0||!occupied[(y-1)*w+x])edge(x,y,x+1,y,0);
  if(x===w-1||!occupied[y*w+x+1])edge(x+1,y,x+1,y+1,1);
  if(y===h-1||!occupied[(y+1)*w+x])edge(x+1,y+1,x,y+1,2);
  if(x===0||!occupied[y*w+x-1])edge(x,y+1,x,y,3);
  if(x%sampleStep===0&&y%sampleStep===0)samples.push({x:left+x/scale,y:top+y/scale});
 }
 const path=new Path2D();let contours=0;
 while(edges.size){const start=edges.keys().next().value;let key=start,direction=0;const points=[];let guard=0;
  do {const x=key%(w+1),y=Math.floor(key/(w+1));points.push({x:left+x/scale,y:top+y/scale});const list=edges.get(key);if(!list?.length)break;
   let choice=0;if(list.length>1){const priority=[(direction+1)%4,direction,(direction+3)%4,(direction+2)%4];choice=list.findIndex(e=>e.d===priority.find(d=>list.some(item=>item.d===d)));}
   const next=list.splice(Math.max(0,choice),1)[0];if(!list.length)edges.delete(key);direction=next.d;key=next.y*(w+1)+next.x;
  }while(key!==start&&++guard<w*h*4);
  if(points.length>2){points.push(points[0]);const polygon=simplify(points,.32);path.moveTo(polygon[0].x,polygon[0].y);for(let i=1;i<polygon.length;i++)path.lineTo(polygon[i].x,polygon[i].y);path.closePath();contours++;}
 }
 raster.width=raster.height=1;
 return {path,samples,contours};
 }catch{raster.width=raster.height=1;return unavailable;}
}

function createEngine(root,element,inkProbe,accentProbe,report,announce,initial){
 const ctx=element.getContext('2d');if(!ctx||typeof Path2D==='undefined'){report('fallback');return{update(){},destroy(){}};}
 const solid=document.createElement('canvas'),outline=document.createElement('canvas'),mask=document.createElement('canvas');
 const fill=solid.getContext('2d'),line=outline.getContext('2d'),lens=mask.getContext('2d');
 let c=normalize(initial),w=root.clientWidth,h=root.clientHeight,ratio=1,glyphs=[],indices=[],font='',fontKey='',fontReady=false,fontTimer=0,fontVersion=0;
 let dirty=true,dead=false,visible=false,raf=0,last=0,time=0,physicsTime=0,introTime=0,introDone=c.intro==='none',sweepTime=0,frames=0;
 let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,inside=false,pointer=null,keyboard=-1,active=-1,press=null,released=-1,modality='keyboard',sweepPoint=null,sweepSuppressed=false;
 let actualSize=0,start=0,total=0,baseline=0,cap=0,xHeight=0,descender=0,ink='',accent='';
 let frame={x:0,y:0,width:0,height:0,opacity:0},lastAnnouncement='';
 const media=matchMedia('(prefers-reduced-motion: reduce)'),cleanup=[];
 const listen=(target,event,fn,options)=>{target.addEventListener(event,fn,options);cleanup.push(()=>target.removeEventListener(event,fn,options));};
 const setData=(key,value)=>{value=String(value);if(root.dataset[key]!==value)root.dataset[key]=value;};
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;setData('animating',false);}
 function wake(){if(!dead&&visible&&!document.hidden&&!raf&&w>0&&h>0){setData('animating',true);raf=requestAnimationFrame(draw);}}
 function finishIntro(){if(!introDone)sweepTime=0;introDone=true;introTime=c.introDuration;}
 function releaseCapture(){const id=press?.id;press=null;if(typeof id==='number'&&root.hasPointerCapture?.(id))try{root.releasePointerCapture(id);}catch{}}
 function resetMotion(){releaseCapture();for(const g of glyphs){g.dx=g.dy=g.vx=g.vy=0;g.kickAt=null;}released=-1;}
 function clearInput(){resetMotion();inside=false;pointer=null;keyboard=-1;active=-1;}
 function readStyle(){
  const computed=getComputedStyle(root),family=c.fontFamily||computed.fontFamily||'sans-serif',key=`${c.fontWeight} ${family}`;
  ink=getComputedStyle(inkProbe).color;accent=getComputedStyle(accentProbe).color;
  if(key!==fontKey){fontKey=key;fontReady=!document.fonts;const token=++fontVersion;clearTimeout(fontTimer);
   if(document.fonts){const done=()=>{if(dead||token!==fontVersion)return;clearTimeout(fontTimer);fontReady=true;dirty=true;wake();};fontTimer=setTimeout(done,2000);document.fonts.load(`${c.fontWeight} 40px ${family}`,c.text||'M').then(done,done);}
  }
  return family;
 }
 function layout(){
  const family=readStyle();if(!fontReady)return false;
  resetMotion();const chars=characters(c.text);const available=Math.max(1,w-2*Math.min(32,Math.max(12,w*.045)));
  ctx.font=`${c.fontWeight} ${c.fontSize}px ${family}`;ctx.fontKerning='normal';
  const natural=ctx.measureText(c.text).width+Math.max(0,chars.length-1)*c.letterSpacing*c.fontSize;
  actualSize=Math.max(.5,Math.min(c.fontSize,c.fontSize*available/Math.max(1,natural),h*.48));
  font=`${c.fontWeight} ${actualSize}px ${family}`;ctx.font=font;const metrics=chars.map(char=>ctx.measureText(char)),tracking=c.letterSpacing*actualSize;
  total=Math.max(0,ctx.measureText(c.text).width+Math.max(0,chars.length-1)*tracking);
  const pad=(w-available)/2;start=c.align==='left'?pad:c.align==='right'?w-pad-total:(w-total)/2;
  const ascent=Math.max(1,...metrics.map(m=>m.actualBoundingBoxAscent)),descent=Math.max(0,...metrics.map(m=>m.actualBoundingBoxDescent));baseline=(h+ascent-descent)/2;
  cap=baseline-ctx.measureText('H').actualBoundingBoxAscent;xHeight=baseline-ctx.measureText('x').actualBoundingBoxAscent;descender=baseline+ctx.measureText('g').actualBoundingBoxDescent;
  const cache=new Map();glyphs=chars.map((char,index)=>{const m=metrics[index],x=start+(index?ctx.measureText(chars.slice(0,index+1).join('')).width-m.width:0)+index*tracking,space=/^\s+$/.test(char);let traced=cache.get(char);if(!space&&!traced){traced=traceGlyph(char,font,m);cache.set(char,traced);}
   const glyph={char,index,x,top:baseline-m.actualBoundingBoxAscent,left:x-m.actualBoundingBoxLeft,width:m.actualBoundingBoxLeft+m.actualBoundingBoxRight,height:m.actualBoundingBoxAscent+m.actualBoundingBoxDescent,space,path:traced?.path,samples:traced?.samples||[],contours:traced?.contours||0,dx:0,dy:0,vx:0,vy:0,amount:0,kickAt:null,kickVelocity:0};return glyph;
  });indices=glyphs.filter(g=>!g.space&&g.width>0&&g.height>0).map(g=>g.index);keyboard=indices.includes(keyboard)?keyboard:-1;
  ratio=Math.min(window.devicePixelRatio||1,c.pixelRatio,Math.sqrt(3000000/Math.max(1,w*h)),4096/w,4096/h);
  for(const target of[element,solid,outline,mask]){target.width=Math.max(1,Math.round(w*ratio));target.height=Math.max(1,Math.round(h*ratio));}
  dirty=false;frame.opacity=0;setData('fontSize',actualSize.toFixed(3));setData('glyphs',indices.length);setData('layout',JSON.stringify(glyphs.map(g=>({index:g.index,char:g.char,x:g.left,y:g.top,width:g.width,height:g.height,contours:g.contours}))));
  report(indices.length?'ready':'empty');return true;
 }
 function prepareContext(target){target.setTransform(1,0,0,1,0,0);target.clearRect(0,0,element.width,element.height);target.setTransform(element.width/w,0,0,element.height/h,0,0);target.globalCompositeOperation='source-over';target.globalAlpha=1;target.font=font;target.fontKerning='normal';target.textBaseline='alphabetic';target.textAlign='left';target.fillStyle=ink;target.strokeStyle=ink;target.lineWidth=c.strokeWidth;target.lineJoin='round';target.setLineDash(c.lineStyle==='dashed'?[c.dashLength,c.dashGap]:[]);}
 function fillGlyph(target,g,opacity=1,dx=g.dx,dy=g.dy){if(opacity<=0)return;target.globalAlpha=clamp(opacity,0,1);target.fillText(g.char,g.x+dx,baseline+dy);target.globalAlpha=1;}
 function outlineGlyph(target,g,opacity=1,dx=0,dy=0){if(!g.path||opacity<=0)return;target.save();target.globalAlpha=clamp(opacity,0,1);target.translate(g.x+dx,baseline+dy);target.stroke(g.path);target.restore();}
 function hit(p){if(!p)return -1;for(let i=glyphs.length-1;i>=0;i--){const g=glyphs[i];if(!g.space&&p.x>=g.left+g.dx-3&&p.x<=g.left+g.dx+g.width+3&&p.y>=g.top+g.dy-5&&p.y<=g.top+g.dy+g.height+5)return i;}return -1;}
 function kick(index){if(!c.clickKick||reduced||!glyphs[index])return;released=index;for(const g of glyphs){const distance=Math.abs(g.index-index);if(g.space||distance>6)continue;g.kickAt=physicsTime+distance*.045;g.kickVelocity=-actualSize*8*Math.pow(.55,distance);}wake();}
 function spring(g,dt){
  if(g.kickAt!==null&&physicsTime>=g.kickAt){g.vy=clamp(g.vy+g.kickVelocity,-2400,2400);g.kickAt=null;}
  if(press?.index===g.index&&c.draggable)return;
  if(reduced){g.dx=g.dy=g.vx=g.vy=0;g.kickAt=null;return;}
  if(c.bounce===0&&g.kickAt===null&&g.vy===0){const q=Math.exp(-15*dt);g.dx*=q;g.dy*=q;g.vx=0;}
  else {const stiffness=190,damping=2*Math.sqrt(stiffness)*(1-c.bounce*.8),steps=Math.max(1,Math.ceil(dt/.008)),step=dt/steps;
   for(let i=0;i<steps;i++){g.vx+=(-stiffness*g.dx-damping*g.vx)*step;g.vy+=(-stiffness*g.dy-damping*g.vy)*step;g.dx+=g.vx*step;g.dy+=g.vy*step;}
  }
  if(Math.abs(g.dx)+Math.abs(g.dy)<.035&&Math.abs(g.vx)+Math.abs(g.vy)<.2){g.dx=g.dy=g.vx=g.vy=0;}
 }
 function guideLines(progress=1,opacity=1){
  ctx.save();ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.lineWidth=.6;ctx.setLineDash([]);ctx.font='9px ui-monospace, monospace';
  [[cap,'cap height'],[xHeight,'x-height'],[baseline,'baseline'],[descender,'descender']].forEach(([y,label],i)=>{const p=clamp(progress*1.3-i*.1,0,1),left=Math.max(8,start-14),right=Math.min(w-8,start+total+14),end=left+(right-left)*p;if(p<=0)return;ctx.globalAlpha=.4*opacity;ctx.beginPath();ctx.moveTo(left,y+.5);ctx.lineTo(end,y+.5);ctx.stroke();ctx.globalAlpha=.7*opacity;ctx.fillRect(left-1,y-1,2,2);ctx.fillRect(end-1,y-1,2,2);ctx.fillText(label,Math.max(8,left-ctx.measureText(label).width-8),y-4);});ctx.restore();
 }
 function particles(g,progress){
  const count=Math.min(g.samples.length,Math.max(12,Math.floor(2400/Math.max(1,indices.length))));
  for(let i=0;i<count;i++){const p=g.samples[i],seed=g.index*79+i,q=ease((progress-random(seed)*.15)/.85),distance=(1-q);ctx.globalAlpha=clamp(progress*4,0,1)*(1-ease((progress-.8)/.2));const size=1.5+random(seed,4)*3;ctx.fillRect(g.x+p.x+(random(seed,1)-.5)*actualSize*3*distance,baseline+p.y+(random(seed,2)-.5)*actualSize*2.5*distance,size,size);}
  ctx.globalAlpha=1;
 }
 function drawIntro(){
  const p=clamp(introTime/c.introDuration,0,1);let selected=-1;
  if(c.intro==='type'){
   const step=p*(indices.length+.4);for(let n=0;n<indices.length;n++){const g=glyphs[indices[n]],local=step-n;if(local<=0)continue;const fillAmount=ease((local-.55)/.65);outlineGlyph(ctx,g,1-fillAmount);fillGlyph(ctx,g,fillAmount);if(local<1.15)selected=g.index;}
  }else if(c.intro==='assemble'){
   for(let n=0;n<indices.length;n++){const g=glyphs[indices[n]],local=clamp((p-n/Math.max(1,indices.length-1)*.35)/.65,0,1);if(local<=0)continue;particles(g,local);fillGlyph(ctx,g,ease((local-.65)/.35));}
  }else{
   guideLines(clamp(p/.3,0,1),1-ease((p-.88)/.12));
   for(const g of glyphs)if(!g.space)outlineGlyph(ctx,g,clamp((p-.16)*3,0,.65));
   const zones=[[cap-actualSize*.1,xHeight],[xHeight,baseline],[baseline,descender+actualSize*.1]];
   zones.forEach(([top,bottom],i)=>{const q=ease((p-.32-i*.13)/.35);if(q<=0)return;ctx.save();ctx.beginPath();ctx.rect(Math.max(0,start-4),top,(total+8)*q,bottom-top+.5);ctx.clip();for(const g of glyphs)if(!g.space)fillGlyph(ctx,g);ctx.restore();});
  }
  return selected;
 }
 function selectionFrame(index,dt){
  const g=glyphs[index],target=g?{x:g.left+g.dx-6,y:g.top+g.dy-6,width:g.width+12,height:g.height+12,opacity:1}:{...frame,opacity:0};
  if(!g&&frame.opacity<=.005)return false;
  if(g&&frame.opacity<.02){frame.x=target.x;frame.y=target.y;frame.width=target.width;frame.height=target.height;}
  const factor=reduced?1:1-Math.exp(-24*dt);let changing=false;
  // Ease until the remaining delta snaps to the target, so a settling frame can never
  // stop while still faintly visible.
  for(const key of['x','y','width','height','opacity']){const delta=target[key]-frame[key];if(Math.abs(delta)<.02)frame[key]=target[key];else{frame[key]+=delta*factor;changing=true;}}
  if(!c.selection||frame.opacity<.005)return changing;
  ctx.save();ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.setLineDash([]);ctx.lineWidth=.7;ctx.globalAlpha=frame.opacity*.6;ctx.strokeRect(frame.x,frame.y,frame.width,frame.height);ctx.globalAlpha=frame.opacity;
  for(const x of[frame.x,frame.x+frame.width])for(const y of[frame.y,frame.y+frame.height])ctx.fillRect(x-2,y-2,4,4);
  if(c.labels&&g){ctx.font='10px ui-monospace, monospace';ctx.globalAlpha=frame.opacity*.65;const signed=v=>`${v>=0?'+':'−'}${Math.abs(Math.round(v))}`;const message=press?.dragging?`${g.char} · ${signed(g.dx)}, ${signed(-g.dy)}`:`${g.char} · ${Math.round(g.width)} × ${Math.round(g.height)}`;const tx=clamp(frame.x,5,Math.max(5,w-ctx.measureText(message).width-5)),ty=frame.y>20?(press?.dragging?frame.y-10:Math.min(frame.y-10,cap-12)):Math.min(h-8,frame.y+frame.height+17);ctx.fillText(message,tx,ty);}
  ctx.restore();return changing;
 }
 function specks(index){
  const g=glyphs[index];if(!g||!c.specks)return;
  ctx.save();ctx.fillStyle=accent;ctx.strokeStyle=accent;ctx.lineWidth=.6;ctx.setLineDash([]);
  for(let i=0;i<c.specks;i++){const tick=reduced?0:Math.floor(time*(1.1+random(i,g.index)) +random(i,8)*4),age=reduced?.5:(time*(1.1+random(i,g.index))+random(i,8)*4)%1,seed=i+tick*67+g.index*503,side=i%4,spread=7+random(seed,5)*20;let x=g.left+g.dx+random(seed,2)*g.width,y=g.top+g.dy+random(seed,3)*g.height;
   if(side===0)x=g.left+g.dx-spread;if(side===1)x=g.left+g.dx+g.width+spread;if(side===2)y=g.top+g.dy-spread;if(side===3)y=g.top+g.dy+g.height+spread;
   const size=1.5+random(seed,6)*6;ctx.globalAlpha=(.15+random(seed,7)*.45)*Math.sin(Math.PI*age);if(i%3===0)ctx.strokeRect(x,y,size,size);else ctx.fillRect(x,y,size*.6,size*.6);
  }ctx.restore();
 }
 function draw(now){
  raf=0;if(dead||!visible||document.hidden||w<=0||h<=0){stop();return;}
  const dt=last?Math.min(.064,(now-last)/1000):1/60;last=now;
  if(dirty&&!layout()){stop();return;}
  if(!indices.length){prepareContext(ctx);setData('active',-1);setData('dragging',false);setData('offset','0,0');setData('intro','done');setData('progress',1);setData('reducedMotion',reduced);setData('frame',++frames);stop();return;}
  physicsTime+=dt;if(!c.paused&&!reduced){time+=dt;if(!introDone)introTime+=dt;}
  if(reduced||introTime>=c.introDuration)finishIntro();
  let moving=false;for(const g of glyphs){spring(g,dt);if(g.dx||g.dy||g.vx||g.vy||g.kickAt!==null)moving=true;}
  if(released>=0){const g=glyphs[released];if(!g||(!g.dx&&!g.dy&&!g.vy&&g.kickAt===null))released=-1;}
  const sweepUseful=c.reveal!=='off'||c.selection||c.specks>0||c.guides;
  const automatic=introDone&&c.sweep&&sweepUseful&&!inside&&keyboard<0&&!press&&!sweepSuppressed&&!reduced;
  let point=pointer;
  if(automatic){if(!c.paused)sweepTime+=dt*c.speed;if(!c.paused||!sweepPoint){const phase=(sweepTime/3.8)%1;sweepPoint=phase<.9?{x:start+total*clamp(phase/.9,0,1),y:baseline-actualSize*.36}:null;}point=sweepPoint;}
  active=press?.index??(keyboard>=0?keyboard:released>=0?released:hit(point));
  prepareContext(ctx);let changing=false;
  if(!introDone)active=drawIntro();
  else{
   if(c.guides&&active>=0)guideLines();
   const area=c.reveal==='area'&&point&&c.reach>0,raised=[];
   if(area){prepareContext(fill);prepareContext(line);prepareContext(lens);}
   for(const g of glyphs){if(g.space)continue;const displacement=Math.hypot(g.dx,g.dy);if(displacement>.15){outlineGlyph(ctx,g,.45);raised.push(g);continue;}
    if(area){fillGlyph(fill,g);outlineGlyph(line,g);continue;}
    const target=c.reveal==='letter'&&g.index===active?1:0;g.amount=reduced?target:g.amount+(target-g.amount)*(1-Math.exp(-24*dt));if(Math.abs(target-g.amount)<.002)g.amount=target;else changing=true;
    fillGlyph(ctx,g,1-g.amount);outlineGlyph(ctx,g,g.amount);
   }
   if(area){lens.fillStyle='#fff';if(c.softness===0){lens.beginPath();lens.arc(point.x,point.y,c.reach,0,Math.PI*2);lens.fill();}else{const grad=lens.createRadialGradient(point.x,point.y,c.reach*(1-c.softness),point.x,point.y,c.reach);grad.addColorStop(0,'#fff');grad.addColorStop(1,'#fff0');lens.fillStyle=grad;lens.fillRect(point.x-c.reach,point.y-c.reach,c.reach*2,c.reach*2);}
    fill.setTransform(1,0,0,1,0,0);fill.globalCompositeOperation='destination-out';fill.drawImage(mask,0,0);line.setTransform(1,0,0,1,0,0);line.globalCompositeOperation='destination-in';line.drawImage(mask,0,0);ctx.drawImage(solid,0,0,w,h);ctx.drawImage(outline,0,0,w,h);
   }
   for(const g of raised.filter(g=>g.index!==active))fillGlyph(ctx,g);if(raised.some(g=>g.index===active))fillGlyph(ctx,glyphs[active]);
   const g=glyphs[active];if(g&&c.selection&&Math.hypot(g.dx,g.dy)>1){ctx.save();ctx.strokeStyle=accent;ctx.globalAlpha=.35;ctx.lineWidth=.8;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(g.left+g.width/2,g.top+g.height/2);ctx.lineTo(g.left+g.width/2+g.dx,g.top+g.height/2+g.dy);ctx.stroke();ctx.restore();}
  }
  changing=selectionFrame(active,dt)||changing;specks(active);
  setData('active',active);setData('dragging',!!press?.dragging);setData('offset',active>=0?`${glyphs[active].dx.toFixed(2)},${glyphs[active].dy.toFixed(2)}`:'0,0');setData('intro',introDone?'done':c.intro);setData('progress',introDone?1:(introTime/c.introDuration).toFixed(3));setData('frame',++frames);setData('reducedMotion',reduced);
  const ambient=!c.paused&&!reduced&&((!introDone)||(automatic&&c.speed>0)||(active>=0&&c.specks>0));
  if(moving||changing||ambient)raf=requestAnimationFrame(draw);else stop();
 }
 function position(e){const r=root.getBoundingClientRect();return{x:(e.clientX-r.left)*w/Math.max(1,r.width),y:(e.clientY-r.top)*h/Math.max(1,r.height)};}
 function selectKeyboard(index){keyboard=index;inside=false;pointer=null;sweepSuppressed=false;modality='keyboard';setData('input','keyboard');const order=indices.indexOf(index),g=glyphs[index];if(g){const message=`${g.char}, letter ${order+1} of ${indices.length}.`;if(message!==lastAnnouncement){lastAnnouncement=message;announce(message);}}wake();}
 function drop(cancelled=false){if(!press)return;const old=press;releaseCapture();released=old.index;if(reduced){const g=glyphs[old.index];if(g)g.dx=g.dy=g.vx=g.vy=0;}if(!cancelled&&!old.moved)kick(old.index);wake();}
 listen(root,'pointermove',e=>{if(!e.isPrimary)return;modality='pointer';setData('input','pointer');inside=true;pointer=position(e);keyboard=-1;sweepSuppressed=false;
  if(press&&press.id===e.pointerId){const g=glyphs[press.index];if(!g)return;if(Math.hypot(pointer.x-press.x,pointer.y-press.y)>4){press.moved=true;press.dragging=!!c.draggable;}if(press.dragging){g.dx=clamp(press.dx+pointer.x-press.x,-g.left+10,w-g.left-g.width-10);g.dy=clamp(press.dy+pointer.y-press.y,-g.top+22,h-g.top-g.height-10);g.vx=g.vy=0;}}
  else released=-1;wake();
 });
 listen(root,'pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;modality='pointer';setData('input','pointer');finishIntro();inside=true;pointer=position(e);keyboard=-1;const index=hit(pointer);if(index<0){wake();return;}root.focus({preventScroll:true});const g=glyphs[index];g.kickAt=null;g.vx=g.vy=0;press={id:e.pointerId,index,x:pointer.x,y:pointer.y,dx:g.dx,dy:g.dy,dragging:false,moved:false};try{root.setPointerCapture(e.pointerId);}catch{}wake();});
 listen(root,'pointerup',e=>{if(press?.id!==e.pointerId)return;drop();if(e.pointerType!=='mouse'){inside=false;pointer=null;}wake();});
 listen(root,'pointercancel',e=>{if(press?.id===e.pointerId)drop(true);inside=false;pointer=null;wake();});
 listen(root,'lostpointercapture',()=>{if(press)drop(true);});
 listen(root,'pointerleave',()=>{if(!press){inside=false;pointer=null;wake();}});
 listen(root,'focus',()=>{if(modality!=='pointer'&&indices.length){finishIntro();selectKeyboard(indices[0]);}});
 listen(root,'blur',()=>{modality='keyboard';keyboard=-1;if(press?.id==='keyboard')drop(true);wake();});
 listen(root,'keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Enter',' ','Escape'].includes(e.key)||!indices.length)return;
  e.preventDefault();finishIntro();
  if(e.key==='Escape'){resetMotion();keyboard=-1;inside=false;pointer=null;sweepSuppressed=true;announce('Letters returned to the baseline.');wake();return;}
  let index=keyboard>=0?keyboard:active>=0?active:indices[0];
  if(e.key===' '&&c.draggable){selectKeyboard(index);if(press?.id==='keyboard'){drop(true);announce('Letter released.');}else{resetMotion();const g=glyphs[index];press={id:'keyboard',index,dragging:true,x:0,y:0,dx:g.dx,dy:g.dy};announce(`${g.char} picked up. Use arrow keys to move; Space to release.`);}wake();return;}
  if(press?.id==='keyboard'){
   const g=glyphs[press.index],step=e.shiftKey?24:8;if(e.key==='Enter'){drop(true);announce('Letter released.');}else{if(e.key==='ArrowLeft')g.dx-=step;if(e.key==='ArrowRight')g.dx+=step;if(e.key==='ArrowUp')g.dy-=step;if(e.key==='ArrowDown')g.dy+=step;g.dx=clamp(g.dx,-g.left+10,w-g.left-g.width-10);g.dy=clamp(g.dy,-g.top+22,h-g.top-g.height-10);if(e.key==='Home')g.dx=g.dy=0;}wake();return;
  }
  const at=Math.max(0,indices.indexOf(index));if(e.key==='ArrowLeft'||e.key==='ArrowUp')index=indices[(at-1+indices.length)%indices.length];if(e.key==='ArrowRight'||e.key==='ArrowDown')index=indices[(at+1)%indices.length];if(e.key==='Home')index=indices[0];if(e.key==='End')index=indices.at(-1);selectKeyboard(index);if(e.key==='Enter'||e.key===' ')kick(index);
 });
 listen(document,'visibilitychange',()=>{clearInput();if(document.hidden)stop();else wake();});listen(window,'blur',()=>{clearInput();wake();});
 listen(media,'change',()=>{reduced=media.matches;resetMotion();if(reduced)finishIntro();wake();});
 listen(window,'resize',()=>{dirty=true;wake();});
 if(document.fonts)listen(document.fonts,'loadingdone',()=>{dirty=true;wake();});
 const resize=new ResizeObserver(entries=>{const r=entries[0].contentRect;if(r.width===w&&r.height===h)return;w=r.width;h=r.height;dirty=true;wake();});resize.observe(root);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){clearInput();stop();}else wake();});intersection.observe(root);
 const mutation=new MutationObserver(()=>{const previous=fontKey;readStyle();if(previous!==fontKey)dirty=true;wake();});for(let node=root;node;node=node.parentElement)mutation.observe(node,{attributes:true,attributeFilter:['class','style','data-theme','dir']});
 readStyle();
 return {update(input){const previous=c;c=normalize(input);if(c.text!==previous.text||c.intro!==previous.intro){clearInput();introTime=0;introDone=c.intro==='none';time=0;sweepTime=0;sweepPoint=null;announce('');lastAnnouncement='';}
  if(['text','fontFamily','fontWeight','fontSize','letterSpacing','align','pixelRatio'].some(key=>c[key]!==previous[key]))dirty=true;
  if(c.sweep!==previous.sweep||c.paused!==previous.paused)sweepSuppressed=false;
  if(previous.draggable&&!c.draggable&&press)drop(true);readStyle();wake();
 },destroy(){dead=true;fontVersion++;clearTimeout(fontTimer);releaseCapture();stop();resize.disconnect();intersection.disconnect();mutation.disconnect();cleanup.forEach(fn=>fn());glyphs=[];for(const target of[solid,outline,mask])target.width=target.height=1;}};
}

export default function TechText({text='Tech Text',fontFamily='',fontWeight=600,fontSize=150,letterSpacing=-.05,align='center',color='currentColor',accentColor='currentColor',reveal='letter',reach=200,softness=.7,dashLength=4,dashGap=2,lineStyle='dashed',strokeWidth=1.5,specks=15,selection=true,labels=true,draggable=true,bounce=.4,clickKick=true,intro='none',introDuration=2,guides=false,sweep=true,speed=1,paused=false,pixelRatio=1.5,className='',style}){
 const root=useRef(null),canvas=useRef(null),ink=useRef(null),accent=useRef(null),engine=useRef(null),help=useId();
 const[status,setStatus]=useState('loading'),[announcement,setAnnouncement]=useState('');const safeText=characters(text).join('');
 // Instructions only describe interactions that are actually available.
 const instructions=[reveal==='off'?null:'Move over a letter to inspect it.','Arrow keys select letters.',clickKick?'Enter kicks a letter.':null,draggable?'Space picks up or releases it; use arrows while picked up, or Shift with arrows for larger steps.':null,'Escape resets.',draggable?'Vertical touch swipes scroll the page.':null].filter(Boolean).join(' ');
 const config={text:safeText,fontFamily,fontWeight,fontSize,letterSpacing,align,color,accentColor,reveal,reach,softness,dashLength,dashGap,lineStyle,strokeWidth,specks,selection,labels,draggable,bounce,clickKick,intro,introDuration,guides,sweep,speed,paused,pixelRatio};
 const latest=useRef(config);latest.current=config;
 useEffect(()=>{engine.current=createEngine(root.current,canvas.current,ink.current,accent.current,setStatus,setAnnouncement,latest.current);return()=>{engine.current?.destroy();engine.current=null;};},[]);
 useEffect(()=>{engine.current?.update(latest.current);},[safeText,fontFamily,fontWeight,fontSize,letterSpacing,align,color,accentColor,reveal,reach,softness,dashLength,dashGap,lineStyle,strokeWidth,specks,selection,labels,draggable,bounce,clickKick,intro,introDuration,guides,sweep,speed,paused,pixelRatio]);
 return <div ref={root} className={`tech-text ${className}`} style={{'--tt-color':color,'--tt-accent':accentColor,'--tt-size':`${numeric(fontSize,12,640,150)}px`,'--tt-weight':fontWeight,'--tt-family':fontFamily||'inherit',...style}} role="group" aria-roledescription="interactive wordmark" aria-label={safeText.trim()||'Empty wordmark'} aria-describedby={help} tabIndex={status==='ready'?0:-1} data-status={status}>
  <canvas ref={canvas} className="tt-canvas" aria-hidden="true"/>
  <span className="tt-fallback" aria-hidden="true">{safeText.trim()?safeText:'Add a wordmark.'}</span>
  <span ref={ink} className="tt-ink tt-sr" aria-hidden="true"/><span ref={accent} className="tt-accent tt-sr" aria-hidden="true"/>
  <span className="tt-sr" id={help}>{instructions}</span>
  <span className="tt-sr" role="status" aria-live="polite">{announcement}</span>
 </div>;
}
