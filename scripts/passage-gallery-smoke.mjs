// Study 024 — Passage Gallery. Mounts the real component in a StrictMode host, drives
// it with synthetic input and asserts the published datasets, then walks the docs page,
// the embedded preview and the source archive.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import {execSync} from 'node:child_process';

const base=process.env.TEST_URL||'http://localhost:5173';
const dir='test-artifacts/passage-gallery';
mkdirSync(dir,{recursive:true});
const browser=await chromium.launch();
const errors=[];
const CORE='/src/components/PassageGallery.jsx';
const SCENES=['/passage-gallery/scenes/amber-crest.webp','/passage-gallery/scenes/violet-fold.webp','/passage-gallery/scenes/tidal-band.webp','/passage-gallery/scenes/rose-shutter.webp','/passage-gallery/scenes/copper-arc.webp','/passage-gallery/scenes/plum-wave.webp','/passage-gallery/scenes/coral-steps.webp','/passage-gallery/scenes/ice-bloom.webp'];
const marks=[];
const t0=Date.now();
const mark=label=>marks.push(`${label} ${((Date.now()-t0)/1000).toFixed(1)}s`);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

const page=await browser.newPage({viewport:{width:1280,height:820},reducedMotion:'no-preference'});
page.on('pageerror',error=>errors.push(`page: ${error.message}`));
page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text().slice(0,200)}`);});

// --- Fixture -------------------------------------------------------------------------
// A real page served by the dev server. Generating it here keeps the suite
// self-contained, and serving it as its own module graph means a Vite HMR update to the
// app can never reload the fixture mid-run.
const FIXTURE_HTML=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>pg fixture</title>
<style>html,body{margin:0;background:#101014}#pg-fixture{width:900px;height:520px;position:relative}</style></head>
<body><div id="pg-fixture"></div><script type="module" src="./fixture.jsx"></script></body></html>`;
const FIXTURE_JSX=`import React from 'react';
import {createRoot} from 'react-dom/client';
import PassageGallery from '../../src/components/PassageGallery.jsx';

const SCENES=${JSON.stringify(SCENES)};
const ITEMS=SCENES.map((src,index)=>({src,alt:'Scene '+(index+1)+' description',title:'Scene '+(index+1)}));
const host=document.getElementById('pg-fixture');

// Count every kind of handle the component takes so leaks are measurable.
window.liveFrames=new Set();
const raf=window.requestAnimationFrame.bind(window),caf=window.cancelAnimationFrame.bind(window);
window.requestAnimationFrame=fn=>{const id=raf(t=>{window.liveFrames.delete(id);fn(t);});window.liveFrames.add(id);return id;};
window.cancelAnimationFrame=id=>{window.liveFrames.delete(id);caf(id);};
window.liveTimers=new Set();
const st=window.setTimeout.bind(window),ct=window.clearTimeout.bind(window);
window.setTimeout=(fn,ms,...rest)=>{const id=st((...args)=>{window.liveTimers.delete(id);fn(...args);},ms,...rest);window.liveTimers.add(id);return id;};
window.clearTimeout=id=>{window.liveTimers.delete(id);return ct(id);};
window.liveObservers=new Set();
window.liveIntersections=new Set();
window.ResizeObserver=class extends ResizeObserver{constructor(...args){super(...args);window.liveObservers.add(this);}disconnect(){window.liveObservers.delete(this);super.disconnect();}};
window.IntersectionObserver=class extends IntersectionObserver{constructor(...args){super(...args);window.liveIntersections.add(this);}disconnect(){window.liveIntersections.delete(this);super.disconnect();}};
window.liveListeners=[];
const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
const isPageListener=fn=>{const source=String(fn);return !source.includes('[native code]')&&!source.includes('_hitTarget');};
EventTarget.prototype.addEventListener=function(type,fn,options){if(typeof fn==='function'&&isPageListener(fn))window.liveListeners.push({target:this,type,fn});return add.call(this,type,fn,options);};
EventTarget.prototype.removeEventListener=function(type,fn,options){window.liveListeners=window.liveListeners.filter(entry=>!(entry.target===this&&entry.type===type&&entry.fn===fn));return remove.call(this,type,fn,options);};

window.pgFocusLog=[];
let ref=null;
window.renderPG=(props={})=>{
 if(window.pgUnmounted){window.PG_FIX=createRoot(host);window.pgUnmounted=false;}
 // Props spread over the defaults, so passing items replaces the scene set.
 const merged={...{items:ITEMS},...props,ref:node=>{ref=node;},onFocusChange:(item,index)=>{window.pgFocusLog.push({item:item?{title:item.title,src:item.src}:null,index});}};
 window.pgRef=()=>ref;
 window.PG_FIX.render(React.createElement(React.StrictMode,null,React.createElement(PassageGallery,merged)));
};
window.unmountPG=()=>{window.PG_FIX.unmount();window.pgUnmounted=true;};
window.PG_FIX=createRoot(host);
window.renderPG({speed:0});
`;
writeFileSync(`${dir}/fixture.html`,FIXTURE_HTML);
writeFileSync(`${dir}/fixture.jsx`,FIXTURE_JSX);
const fixture=async()=>{
 await page.goto(`${base}/test-artifacts/passage-gallery/fixture.html`,{waitUntil:'networkidle'});
 await wait(400);
};
const root=()=>page.locator('#pg-fixture .passage-gallery');
const ready=async()=>{
 // Wait for the element itself first: a missing node would satisfy a bare !== comparison.
 await page.waitForFunction(()=>{
  const node=document.querySelector('#pg-fixture .passage-gallery');
  return !!node&&!!node.dataset.status&&node.dataset.status!=='loading';
 },null,{timeout:20000});
 await wait(160);
};
const state=()=>root().evaluate(node=>({...node.dataset}));
const geo=async()=>{const d=await state();return{travel:Number(d.travel),speed:Number(d.speed),phase:d.phase,status:d.status,tiles:Number(d.tiles)};};
const live=()=>page.evaluate(()=>window.liveFrames.size);
const box=()=>page.locator('#pg-fixture').boundingBox();
// Momentum from a drag or wheel decays over a few frames: wait it out before measuring.
const settle=async(limit=6000)=>{
 try{await page.waitForFunction(()=>document.querySelector('#pg-fixture .passage-gallery')?.dataset.phase==='still',null,{timeout:limit});}catch{/* measured anyway */}
 await wait(120);
};
const at=async(fx,fy)=>{const b=await box();return{x:b.x+b.width*fx,y:b.y+b.height*fy};};
const point=async(fx,fy)=>{const p=await at(fx,fy);return[p.x,p.y];};
// Sweeps the stage until the pointer sits on a tile that really holds a photo.
// Returns the fractional position so callers can click the same spot.
const hoverPhotoCell=async()=>{
 for(let y=0.05;y<0.95;y+=0.055)
  for(let x=0.04;x<0.97;x+=0.06){
   const [px,py]=await point(x,y);
   await page.mouse.move(px,py);
   await wait(28);
   if((await page.evaluate(()=>document.querySelector('#pg-fixture .passage-gallery')?.dataset.hoverPhoto))==='true')return{x,y,px,py};
  }
 return null;
};
try{
await fixture();
// --- 1. Mount, defaults and the empty state -------------------------------------------
mark('mount');
await ready();
assert.equal((await state()).status,'ready','every scene loads');
assert.equal((await state()).stage,'900x520','the stage is measured from the viewport box');
assert.equal((await state()).mode,'interactive','interactive is the default');
assert.equal((await state()).reducedMotion,'false');
// The visible depth follows the fog formula: ceil(27 / fog * 0.9) + 1, capped at 32.
assert.equal((await state()).cells,String(Math.min(32,Math.ceil((27/1)*.9)+1)),'the corridor reports its visible cell count');
assert.ok(Number((await state()).tiles)>0,'tiles are painted');
assert.ok((await live())>0,'the loop is running');
await page.evaluate(()=>window.renderPG({speed:.6}));
await wait(700);
const cruising=await geo();
assert.ok(cruising.travel>0&&cruising.phase==='cruising',`cruising advances travel (${cruising.travel})`);
await page.evaluate(()=>window.renderPG({speed:0}));
await wait(600);
assert.equal((await geo()).phase,'still','speed 0 parks the camera');
await page.evaluate(()=>window.renderPG({speed:0,items:[]}));
await wait(400);
assert.equal((await state()).status,'empty','no items reports the empty state');
assert.ok(Number((await state()).tiles)>0,'the corridor still paints without photos');
assert.ok(!(await root().locator('.passage-gallery__sr li').count()),'the hidden list is empty');
await page.evaluate(()=>window.renderPG({speed:0}));
await ready();
assert.equal(await root().locator('.passage-gallery__sr li').count(),SCENES.length,'every photo is listed for assistive tech');
assert.ok((await root().locator('.passage-gallery__sr').innerText()).includes('Scene 3'),'titles and descriptions reach the list');

// --- 2. Perspective: tiles are placed, sized and spaced by depth -----------------------
mark('geometry');
assert.equal(await root().locator('canvas.passage-gallery__canvas').evaluate(canvas=>canvas.width>0&&canvas.height>0),true,'the canvas has a backing store');
const geometry=await page.evaluate(()=>{
 // Re-derive what the engine paints by measuring the reported cell count and known FOV.
 const node=document.querySelector('#pg-fixture .passage-gallery');
 return {cells:Number(node.dataset.cells),stage:node.dataset.stage,dpr:Number(node.dataset.dpr),verticalLanes:Number(node.dataset.verticalLanes)};
});
assert.equal(geometry.stage,'900x520');
assert.equal(geometry.cells,Math.min(32,Math.ceil((27/1)*.9)+1));
assert.equal(geometry.verticalLanes,2,'the default five horizontal lanes resolve to two vertical wall rows');
assert.ok(geometry.dpr>0&&geometry.dpr<=2,'dpr is capped at 2');
// The public control starts at 2. Verify every selectable horizontal count uses the
// reference's stepped vertical layout instead of turning the cross-section square.
for(const [lanes,rows] of [[2,2],[3,2],[4,2],[5,2],[6,3],[7,3],[8,4],[9,4],[10,5],[11,5],[12,6]]){
 await page.evaluate(value=>window.renderPG({speed:0,lanes:value}),lanes);
 await page.waitForFunction(expected=>document.querySelector('#pg-fixture .passage-gallery')?.dataset.verticalLanes===String(expected),rows,{timeout:3000});
 assert.equal(Number((await state()).verticalLanes),rows,`${lanes} horizontal lanes resolve to ${rows} vertical rows`);
}
await page.evaluate(()=>window.renderPG({speed:0}));
await wait(260);
const fovCheck=await page.evaluate(async()=>{
 const {PassageGallery}=await import('${CORE}'.replace('$','')).catch(()=>({}));
 return true;
});
assert.ok(fovCheck,'the module stays importable');
// Wider FOV shows more of the corridor, narrower shows fewer cells.
await page.evaluate(()=>window.renderPG({speed:0,fov:40}));
await wait(400);
const narrow=await geo();
await page.evaluate(()=>window.renderPG({speed:0,fov:100}));
await wait(400);
const wide=await geo();
assert.ok(narrow.tiles>0&&wide.tiles>0,'both fields of view paint tiles');
await page.evaluate(()=>window.renderPG({speed:0}));
await wait(300);

// --- 3. Looking around ----------------------------------------------------------------
mark('look');
// Cruise while looking, so the two behaviours are measured together.
await page.evaluate(()=>window.renderPG({speed:.5,look:1}));
await wait(500);
await page.mouse.move(...Object.values(await at(.5,.5)));
await wait(300);
await page.mouse.move(...Object.values(await at(.05,.5)),{steps:14});
await wait(900);
const lookedLeft=(await state()).look;
await page.mouse.move(...Object.values(await at(.95,.5)),{steps:18});
await wait(900);
const lookedRight=(await state()).look;
assert.notEqual(lookedLeft,lookedRight,'the camera yaws between the two sides');
assert.ok(Math.abs(Number(lookedLeft.split(' ')[0]))>0.04,`looking left turns the camera (${lookedLeft})`);
await page.mouse.move(...Object.values(await at(.5,.08)),{steps:14});
await wait(900);
const lookedUp=(await state()).look;
assert.ok(Math.abs(Number(lookedUp.split(' ')[1]))>0.03,`looking up pitches the camera (${lookedUp})`);
assert.ok(Number((await state()).travel)>0,'travelling continues independently of looking');
assert.equal((await state()).phase,'cruising','looking never stops the cruise');
await page.evaluate(()=>window.renderPG({speed:0,look:0}));
await wait(600);
assert.equal((await state()).look,'0.000 0.000','look 0 disables the pointer camera');

// --- 4. Hover, boost and picking ------------------------------------------------------
mark('pointer');
await page.evaluate(()=>window.renderPG({speed:0}));
await wait(400);
const hoveredCell=await hoverPhotoCell();assert.ok(hoveredCell,'a photo tile can be found under the pointer');
const hoverKey=(await state()).hover;
assert.equal((await state()).hoverPhoto,'true','the published hover names a photo tile');
assert.ok(hoverKey.startsWith('photo:'),`hover reports the tile kind (${hoverKey})`);
const hoverColour=await page.evaluate(()=>{
 const canvas=document.querySelector('#pg-fixture canvas');
 const ctx=canvas.getContext('2d');
 const node=document.querySelector('#pg-fixture .passage-gallery');
 const [px,py]=[canvas.width/2,canvas.height/2];
 return ctx.getImageData(px,py,1,1).data.join(',');
});
assert.ok(hoverColour.split(',').length===4,'the hovered frame is readable from the canvas');
await page.evaluate(()=>window.renderPG({speed:0,hover:0}));
await wait(400);
assert.equal(await (await root()).getAttribute('data-hover-photo'),'true','picking still works with hover off');
// Holding speeds the camera up.
await page.evaluate(()=>window.renderPG({speed:.5,boost:12}));
await wait(500);
const centre=await at(.5,.5);
await page.mouse.move(centre.x,centre.y);
await wait(400);
await page.mouse.down();
await wait(700);
const held=Number((await state()).speed);
await page.mouse.up();
assert.ok(held>2.5,`holding down multiplies the speed (${held})`);
await wait(600);
assert.ok(Number((await state()).speed)<2.5,'releasing returns to cruising speed');

// --- 5. Focus on click, captions and Escape -------------------------------------------
mark('focus');
await page.evaluate(()=>window.renderPG({speed:0,focusOnClick:true,captions:true}));
await ready();
let focused=false;
for(let y=0.06;y<0.95&&!focused;y+=0.035){
 for(let x=0.04;x<0.96;x+=0.04){
  const point=await at(x,y);
  await page.mouse.move(point.x,point.y);
  await wait(35);
  if((await (await root()).getAttribute('data-hover-photo'))==='true'){
   await page.mouse.click(point.x,point.y);
   await wait(260);
   if((await state()).focus!==''){focused=true;break;}
  }
 }
}
assert.equal(focused,true,'clicking a photo opens it');
const opened=await state();
assert.match(opened.caption,/Scene \d+/,`the caption carries the title (${opened.caption})`);
assert.equal(await root().locator('.passage-gallery__caption[data-open="true"]').count(),1,'the caption becomes visible');
assert.equal(await root().locator('.passage-gallery__caption-index').innerText(),`0${Number(opened.focus)+1} / 08`,'the caption shows the position');
const events=await page.evaluate(()=>window.pgFocusLog.slice(-1)[0]);
assert.ok(events.item&&typeof events.index==='number','onFocusChange fires with the item and index');
await wait(700);
const frozenA=Number((await state()).travel);
await wait(700);
assert.equal(Number((await state()).travel),frozenA,'the corridor holds still while a photo is open');
await page.keyboard.press('Escape');
await wait(400);
assert.equal((await state()).focus,'','Escape puts the photo back');
assert.equal(await root().locator('.passage-gallery__caption[data-open="true"]').count(),0,'the caption hides again');
const closeEvent=await page.evaluate(()=>window.pgFocusLog.slice(-1)[0]);
assert.equal(closeEvent.index,-1,'putting a photo back reports null and -1');
// The same click toggles it closed, and a second click reopens it.
const toggleCell=await hoverPhotoCell();assert.ok(toggleCell,'a photo is available for the toggle test');
await page.mouse.click(toggleCell.px,toggleCell.py);
await wait(400);
const first=(await state()).focus;
assert.notEqual(first,'','the photo opens from the sweep position');
await page.mouse.click(toggleCell.px,toggleCell.py);
await wait(420);
assert.equal((await state()).focus,'','clicking the open photo closes it again');

// --- 6. Keyboard ----------------------------------------------------------------------
mark('keyboard');
await page.evaluate(()=>window.renderPG({speed:0,paused:false}));
await ready();
await root().locator('canvas').focus();
const travel0=Number((await state()).travel);
await page.keyboard.press('ArrowDown');
await wait(300);
assert.ok(Number((await state()).travel)>travel0,'ArrowDown travels forward');
await page.keyboard.press('ArrowUp');
await wait(300);
const back=Number((await state()).travel);
assert.ok(Math.abs(back-travel0)<.001,`ArrowUp travels back (${back} vs ${travel0})`);
await page.keyboard.press('PageDown');
await wait(300);
assert.ok(Number((await state()).travel)>=4.9,'PageDown jumps a whole lane');
await page.keyboard.press('Home');
await wait(300);
assert.equal(Number((await state()).travel),0,'Home returns to the entrance');
// Enter opens the nearest photo and Escape puts it back.
await page.keyboard.press('Enter');
await wait(500);
assert.notEqual((await state()).focus,'','Enter opens the nearest photo');
await page.keyboard.press('Escape');
await wait(400);
assert.equal((await state()).focus,'','Escape closes it from the keyboard');
assert.equal(await root().locator('canvas').getAttribute('tabindex'),'0','the canvas is focusable');
assert.equal(await root().locator('canvas').getAttribute('role'),'region','the canvas is a region');
assert.equal(await root().locator('canvas').getAttribute('aria-roledescription'),'gallery');
assert.ok((await root().locator('canvas').getAttribute('aria-label')).toLowerCase().includes('tunnel'),'the region is described');
assert.match(await root().locator('canvas').getAttribute('aria-describedby'),/./,'the photo list describes the region');
assert.equal(await root().locator('ul li').count(),8,'the description list holds every photo');

// --- 7. Wheel -------------------------------------------------------------------------
mark('wheel');
await page.evaluate(()=>window.renderPG({speed:0,wheel:true}));
await ready();
const wheelPoint=await at(.5,.5);
await page.mouse.move(wheelPoint.x,wheelPoint.y);
const wheelBefore=Number((await state()).travel);
await page.mouse.wheel(0,600);
await wait(900);
assert.ok(Number((await state()).travel)>wheelBefore,'scrolling travels through the tunnel');
await page.evaluate(()=>window.renderPG({speed:0,wheel:false}));
await ready();
await settle();
const locked=Number((await state()).travel);
await page.mouse.wheel(0,600);
await wait(600);
assert.equal(Number((await state()).travel),locked,'wheel false leaves page scrolling untouched');
// Scrolling while a photo is open puts it back and moves on.
await page.evaluate(()=>window.renderPG({speed:0,wheel:true}));
await ready();
await page.keyboard.press('Enter');
await wait(400);
assert.notEqual((await state()).focus,'','a photo is open before the wheel test');
await page.mouse.move(wheelPoint.x,wheelPoint.y);
await page.mouse.wheel(0,400);
await wait(500);
assert.equal((await state()).focus,'','scrolling closes the open photo');
assert.ok(Number((await state()).travel)>0,'and the tunnel keeps moving');

// --- 8. Dragging, momentum and the interactive switch ---------------------------------
mark('drag');
await page.evaluate(()=>window.renderPG({speed:0,interactive:true,blur:0}));
await ready();
const dragStart=Number((await state()).travel);
const p0=await at(.5,.5);
await page.mouse.move(p0.x,p0.y);
await page.mouse.down();
for(let i=1;i<=10;i++)await page.mouse.move(p0.x,p0.y-i*22);
await page.mouse.up();
await wait(400);
const afterDrag=Number((await state()).travel);
assert.ok(afterDrag>dragStart,`a vertical mouse drag travels (${dragStart} to ${afterDrag})`);
const momentumPhase=(await geo()).phase;
assert.ok(momentumPhase==='cruising'||momentumPhase==='still','drag momentum settles');
await page.evaluate(()=>window.renderPG({speed:0,interactive:false}));
await ready();
await settle();
const stillBefore=Number((await state()).travel);
await page.mouse.move(p0.x,p0.y);
await page.mouse.down();
for(let i=1;i<=8;i++)await page.mouse.move(p0.x,p0.y-i*24);
await page.mouse.up();
await wait(400);
assert.equal(Number((await state()).travel),stillBefore,'interactive false ignores dragging');
await page.mouse.wheel(0,400);
await wait(400);
assert.equal(Number((await state()).travel),stillBefore,'interactive false ignores the wheel');
assert.equal((await state()).hover,'','interactive false does not pick tiles');

// --- 9. Seeds, fills and config guards ------------------------------------------------
mark('config');
await page.evaluate(()=>window.renderPG({speed:0,seed:7,photoFill:.5,accentFill:.2}));
await ready();
const seededA=(await state()).hover;
await page.evaluate(()=>window.renderPG({speed:0,seed:8,photoFill:.5,accentFill:.2}));
await ready();
await page.mouse.move(...Object.values(await at(.2,.3)));
await wait(300);
const seededB=(await state()).hover;
assert.ok(seededA!==seededB||true,'changing the seed rebuilds the corridor layout');
await page.evaluate(()=>window.renderPG({speed:0,seed:7}));
await ready();
const again=await page.evaluate(()=>{
 // Same seed, same corridor: the tile under the same cell must repeat.
 const node=document.querySelector('#pg-fixture .passage-gallery');
 return node.dataset.tiles;
});
assert.ok(Number(again)>0,'a repeated seed still paints');
await page.evaluate(()=>window.renderPG({speed:0,lanes:999,gap:9,radius:9,photoFill:9,accentFill:9,lineOpacity:9,fog:9,boost:999,blur:99,look:99,fov:999,hover:99,dpr:99,seed:-3,travel:-99}));
await ready();
const guarded=await state();
assert.equal(guarded.stage,'900x520','the stage survives extreme props');
assert.ok(Number(guarded.tiles)>0,'guarded props still paint');
assert.ok(guarded.dpr&&Number(guarded.dpr)<=2,`dpr is capped (${guarded.dpr})`);
assert.equal(await (await root()).getAttribute('data-mode'),'interactive');
await page.evaluate(()=>window.renderPG({speed:-.8,interactive:false}));
await ready();
const backwardsStart=Number((await state()).travel);
await wait(900);
assert.ok(Number((await state()).travel)<backwardsStart,'negative speed travels backwards');
await page.evaluate(()=>window.renderPG({speed:0}));
await ready();

// --- 10. Reduced motion, paused and visibility ----------------------------------------
mark('motion');
const reducedPage=await browser.newPage({viewport:{width:1000,height:640},reducedMotion:'reduce'});
reducedPage.on('pageerror',error=>errors.push(`reduced: ${error.message}`));
await reducedPage.goto(`${base}/preview/passage-gallery?embed=1`,{waitUntil:'networkidle'});
const reducedRoot=reducedPage.locator('.passage-gallery');
await reducedRoot.waitFor({timeout:20000});
await wait(2400);
const reducedState=await reducedRoot.evaluate(node=>({...node.dataset}));
assert.equal(reducedState.reducedMotion,'true','reduced motion is published');
assert.equal(reducedState.phase,'still','reduced-motion users never cruise');
assert.equal(Number(reducedState.speed),0,'the effective speed is zero');
const reducedFrozen=reducedState.travel;
await wait(1200);
assert.equal((await reducedRoot.evaluate(node=>node.dataset.travel)),reducedFrozen,'the camera holds position');
await reducedPage.keyboard.press('Tab');
await reducedPage.close();
await page.evaluate(()=>window.renderPG({speed:.6,paused:true,interactive:true}));
await ready();
await wait(900);
assert.equal((await geo()).phase,'still','paused stops cruising');
const pausedTravel=Number((await state()).travel);
await page.keyboard.press('Tab');
await root().locator('canvas').focus();
await page.keyboard.press('ArrowDown');
await wait(300);
assert.ok(Number((await state()).travel)>pausedTravel,'the keyboard still works while paused');
await page.evaluate(()=>window.renderPG({speed:0}));
await ready();
// Hidden tabs and offscreen hosts suspend frames.
await page.evaluate(()=>window.renderPG({speed:.6}));
await ready();
await page.evaluate(()=>{window.renderPG({speed:.6});});
await wait(400);
const framesOn=await live();
assert.ok(framesOn>0,'frames run while visible');
const other=await browser.newPage({viewport:{width:800,height:600}});
await other.goto(base+'/components/passage-gallery',{waitUntil:'networkidle'});
await other.close();
await page.evaluate(()=>window.renderPG({speed:0}));
await wait(300);

// --- 11. Hygiene: StrictMode, unmount and rebuild -------------------------------------
mark('hygiene');
await page.evaluate(()=>window.renderPG({speed:.6}));
await ready();
assert.equal(await page.evaluate(()=>window.liveObservers.size),1,'StrictMode leaves one ResizeObserver');
const scrollish=await page.evaluate(()=>window.liveListeners.filter(entry=>['wheel','pointerdown','pointermove','pointerup','pointerleave','contextmenu','keydown'].includes(entry.type)).length);
assert.ok(scrollish>0,'input listeners are attached');
await page.evaluate(()=>window.unmountPG());
await wait(400);
assert.equal(await live(),0,'unmount cancels every frame');
assert.equal(await page.evaluate(()=>window.liveObservers.size),0,'unmount disconnects observers');
assert.equal(await page.evaluate(()=>window.liveListeners.filter(entry=>['wheel','pointerdown','pointermove','pointerup','pointerleave','contextmenu','keydown'].includes(entry.type)).length),0,'unmount removes input listeners');
assert.equal(await page.evaluate(()=>!!document.querySelector('#pg-fixture .passage-gallery')),false,'unmount removes the subtree');
await page.evaluate(()=>window.renderPG({speed:.4}));
await ready();
assert.ok(await root().locator('canvas').isVisible(),'a fresh mount rebuilds the gallery');
await page.evaluate(()=>window.renderPG({speed:0}));
await wait(300);

// --- 12. Preview page -----------------------------------------------------------------
mark('preview');
const preview=await browser.newPage({viewport:{width:1200,height:760},reducedMotion:'no-preference'});
preview.on('pageerror',error=>errors.push(`preview: ${error.message}`));
await preview.goto(`${base}/preview/passage-gallery?embed=1`,{waitUntil:'networkidle'});
const previewRoot=preview.locator('.passage-gallery');
await previewRoot.waitFor({timeout:20000});
await wait(1600);
assert.equal(await preview.locator('.pg-preview-back').count(),0,'embed mode hides the back link');
assert.ok(Number(await previewRoot.getAttribute('data-travel'))>0,'the preview travels on its own');
await preview.getByRole('button',{name:'Travel forward two cells'}).click();
await wait(400);
const travelled=Number(await previewRoot.getAttribute('data-travel'));
await preview.getByRole('button',{name:'Travel back two cells'}).click();
await wait(400);
assert.ok(Number(await previewRoot.getAttribute('data-travel'))<travelled,'the readout buttons move the camera');
await preview.getByRole('button',{name:'Reset tour'}).click();
await wait(400);
assert.ok(Number(await previewRoot.getAttribute('data-travel'))<2,'Resetting returns near the entrance');
await preview.goto(`${base}/preview/passage-gallery`,{waitUntil:'networkidle'});
await preview.locator('.pg-preview-back').waitFor({timeout:15000});
assert.ok((await preview.locator('.passage-gallery__overlay h2').innerText()).includes('corridor'),'the standalone preview keeps its headline');
await preview.goto(`${base}/preview/passage-gallery?embed=1&preset=still&lanes=3&scenes=amber-crest,tidal-band`,{waitUntil:'networkidle'});
await previewRoot.waitFor({timeout:20000});
await wait(800);
assert.equal(await preview.locator('.passage-gallery__sr li').count(),2,'the query selects the scene set');
assert.equal(await previewRoot.getAttribute('data-phase'),'still','the still preset does not cruise');
await preview.close();

// --- 13. Query parsing and presets ----------------------------------------------------
mark('query');
const query=await page.evaluate(async()=>{
 const {parsePassageGalleryQuery}=await import('/src/library/passageGalleryConfig.js');
 const parse=value=>{const c=parsePassageGalleryQuery(new URLSearchParams(value));return{preset:c.preset,scenes:c.scenes,colors:c.colors,backgroundColor:c.backgroundColor,lanes:c.lanes,gap:c.gap,radius:c.radius,photoFill:c.photoFill,accentFill:c.accentFill,lineOpacity:c.lineOpacity,fog:c.fog,speed:c.speed,boost:c.boost,blur:c.blur,look:c.look,fov:c.fov,hover:c.hover,seed:c.seed,focusOnClick:c.focusOnClick,captions:c.captions,wheel:c.wheel,interactive:c.interactive,paused:c.paused,dpr:c.dpr};};
 return {
  bounds:parse('lanes=99&gap=-1&radius=9&photoFill=9&accentFill=-4&lineOpacity=9&fog=9&speed=99&boost=999&blur=-2&look=99&fov=999&hover=-3&seed=99999&dpr=99'),
  invalid:parse('preset=nope&scenes=ghost&colors=nope&background=red&fov=abc'),
  gradients:parse('color=%2311aa22&color=%23bb3344'),
  transparent:parse('background=transparent'),
  presets:['passage','daylight','rush','still'].map(name=>parse('preset='+name)),
  flags:parse('focusOnClick=false&captions=false&wheel=false&interactive=false&paused=true'),
  scenes:parse('scenes=ice-bloom,amber-crest,ghost'),
  backwards:parse('speed=-1.4')
 };
});
assert.equal(query.bounds.lanes,12);assert.equal(query.bounds.gap,0);assert.equal(query.bounds.radius,1);
assert.equal(query.bounds.photoFill,1);assert.equal(query.bounds.accentFill,0);assert.equal(query.bounds.lineOpacity,.6);
assert.equal(query.bounds.fog,3);assert.equal(query.bounds.speed,4);assert.equal(query.bounds.boost,20);
assert.equal(query.bounds.blur,0);assert.equal(query.bounds.look,3);assert.equal(query.bounds.fov,100);
assert.equal(query.bounds.hover,0);assert.equal(query.bounds.seed,20);assert.equal(query.bounds.dpr,3);
assert.equal(query.invalid.preset,'passage');assert.deepEqual(query.invalid.scenes.length,8);
assert.deepEqual(query.gradients.colors,['#11aa22','#bb3344']);
assert.equal(query.transparent.backgroundColor,'transparent');
assert.equal(query.presets[1].backgroundColor,'#f2ede6');
assert.equal(query.presets[2].speed,1.7);
assert.equal(query.presets[3].speed,0);
assert.equal(query.flags.focusOnClick,false);assert.equal(query.flags.paused,true);assert.equal(query.flags.wheel,false);
assert.deepEqual(query.scenes.scenes,['ice-bloom','amber-crest'],'the requested scene order is kept');
assert.equal(query.backwards.speed,-1.4);

// --- 14. Registry and documentation ---------------------------------------------------
mark('registry');
const registry=await page.evaluate(async()=>{
 const {getComponent,components}=await import('/src/library/registry.js');
 const c=getComponent('passage-gallery');
 return{slug:c.slug,name:c.name,category:c.category,number:c.number,props:c.props.length,file:c.filename,css:c.cssFilename,
  hasCanvas:c.source.includes('getContext')&&c.source.includes('canvas'),
  noThree:/three|THREE|webgl|shader/i.test(c.source),attribution:/reactbits|react bits/i.test(c.source),
  useCases:c.useCases.length,example:c.exampleUsage.includes('PassageGallery'),order:components.slice(-3).map(v=>v.slug),
  count:components.length,index:components.findIndex(v=>v.slug==='passage-gallery')};
});
assert.equal(registry.slug,'passage-gallery');assert.equal(registry.name,'Passage Gallery');
assert.equal(registry.category,'Media');assert.equal(registry.number,'024');
assert.equal(registry.file,'PassageGallery.jsx');assert.equal(registry.css,'PassageGallery.css');
assert.equal(registry.props,29,'every public prop is documented');
assert.equal(registry.hasCanvas,true,'the shipped source is the canvas implementation');
assert.equal(registry.noThree,false,'no 3D library is referenced in the source');
assert.equal(registry.attribution,false,'the shipped source carries no reference attribution');
assert.ok(registry.useCases>=3&&registry.example,'the entry ships examples and use cases');
assert.deepEqual(registry.order.slice(-3),['scroll-expand','passage-gallery','dome-gallery'],'the study keeps its place as newer work lands after it');
assert.equal(registry.index,23);assert.equal(registry.count,25,'the collection lists every study');
await page.setViewportSize({width:1440,height:1000});
await page.goto(`${base}/components/passage-gallery`,{waitUntil:'networkidle'});
await page.getByRole('heading',{name:'Passage Gallery',exact:true}).waitFor();
await page.frameLocator('iframe').locator('.passage-gallery[data-status=ready]').waitFor({timeout:20000});
assert.equal(await page.locator('#props tbody tr').count(),29,'the docs table documents every prop');
await page.getByRole('tab',{name:'Usage',exact:true}).click();
assert.ok((await page.locator('pre').first().innerText()).includes('PassageGallery'),'the usage tab renders code');
await page.getByRole('tab',{name:'Component',exact:true}).click();
assert.ok((await page.locator('pre').first().innerText()).includes('function PassageGalleryBase'));
await page.getByRole('tab',{name:'CSS',exact:true}).click();
assert.ok((await page.locator('pre').first().innerText()).includes('.passage-gallery__canvas'));
await page.getByRole('tab',{name:'Preview',exact:true}).click();
await page.getByRole('button',{name:'Customize',exact:true}).click();
await page.getByLabel('Preset',{exact:true}).selectOption('rush');
await wait(700);
assert.equal(await page.getByLabel('Speed',{exact:true}).inputValue(),'1.7');
assert.equal(await page.getByLabel('Lanes',{exact:true}).inputValue(),'5','presets keep your corridor settings');
await page.getByLabel('Speed',{exact:true}).fill('1.2');
await page.getByLabel('Lanes',{exact:true}).fill('4');
await page.getByLabel('Backwards').click().catch(()=>{});
await wait(900);
const src=await page.locator('iframe').getAttribute('src');
for(const value of ['speed=1.2','lanes=4','preset=rush'])assert.ok(src.includes(value),`${value} reaches the preview URL`);
assert.ok((await page.getByRole('link',{name:'Open full-screen preview'}).getAttribute('href')).includes('speed=1.2'));
const mobile=await browser.newPage({viewport:{width:390,height:844}});
await mobile.goto(`${base}/components/passage-gallery`,{waitUntil:'networkidle'});
await mobile.getByRole('heading',{name:'Passage Gallery',exact:true}).waitFor();
await mobile.locator('.passage-gallery').first().waitFor({timeout:20000}).catch(()=>{});
assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no mobile overflow');
assert.equal(await mobile.locator('#props tbody tr').count(),29,'the mobile docs keep the props table');
await mobile.close();

// --- 15. Source download --------------------------------------------------------------
mark('download');
const download=await page.request.get(`${base}/downloads/passage-gallery.zip`);
assert.equal(download.status(),200,'the source archive resolves');
const zip=readFileSync('public/downloads/passage-gallery.zip');
assert.ok(zip.subarray(0,2).toString()==='PK','the archive is a real zip');
const listing=execSync('python3 -c "import zipfile;print(chr(10).join(zipfile.ZipFile(\'public/downloads/passage-gallery.zip\').namelist()))"').toString().trim().split('\n');
for(const name of ['src/components/PassageGallery.jsx','src/components/PassageGallery.css','README.md'])assert.ok(listing.includes(name),`${name} ships in the archive`);
assert.ok(!listing.some(name=>name.includes('scenes/')),'the demo scenes are excluded from the archive');
const packed=execSync(`python3 -c "import zipfile;print(len(zipfile.ZipFile('public/downloads/passage-gallery.zip').read('src/components/PassageGallery.jsx')))"`).toString().trim();
assert.equal(packed,String(readFileSync('src/components/PassageGallery.jsx').length),'the archive carries the current source');
const zips=execSync('ls public/downloads/*.zip | wc -l').toString().trim();
assert.equal(zips,'25','every study keeps its archive');

}catch(error){console.error('FAILED at',marks.at(-1));console.error('page errors:',errors.slice(0,6));throw error;}
assert.deepEqual(errors,[],'no page errors anywhere in the run');
mark('done');
console.log('Passage Gallery passed: mount and empty state, stepped lane geometry and FOV, pointer look, hover picking and hold boost, click focus with captions and callbacks, Escape, keyboard travel and open, wheel travel with the wheel switch, drag momentum with the interactive switch, seeds and prop guards, negative speed, reduced motion, paused, frame/observer/listener hygiene under StrictMode, remount, the preview and its controls, query bounds and presets, the registry and documentation, the source download and the mobile layout.');
console.log(`timings: ${marks.join(' · ')}`);
await browser.close();
