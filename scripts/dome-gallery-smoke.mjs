// Study 025 — Dome Gallery. Exercise the independently authored core in an isolated
// StrictMode fixture, then verify its preview, docs, catalogue treatment and archive.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const base=process.env.TEST_URL||'http://localhost:5173';
const dir='test-artifacts/dome-smoke';
const scenes=['amber-portal','blue-alcove','coral-window','night-bloom','olive-ridge','orchid-figure','plum-archive'];
const assets=scenes.map(key=>`/dome-gallery/scenes/${key}.webp`);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',error=>errors.push(`page: ${error.message}`));
page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text().slice(0,300)}`);});

const fixtureHTML=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Dome Gallery fixture</title><style>html,body{margin:0;background:#120f17}#fixture{width:900px;height:520px;position:relative}</style></head><body><div id="fixture"></div><script type="module" src="./fixture.jsx"></script></body></html>`;
const fixtureJSX=`import React from 'react';
import {createRoot} from 'react-dom/client';
import DomeGallery from '../../src/components/DomeGallery.jsx';

const assets=${JSON.stringify(assets)};
const images=assets.map((src,index)=>({src,alt:'Local scene '+(index+1)}));
const host=document.getElementById('fixture');
const NativeResizeObserver=window.ResizeObserver;
window.liveObservers=new Set();
window.ResizeObserver=class extends NativeResizeObserver{
 constructor(...args){super(...args);window.liveObservers.add(this);}
 disconnect(){window.liveObservers.delete(this);return super.disconnect();}
};
const nativeRaf=window.requestAnimationFrame.bind(window),nativeCaf=window.cancelAnimationFrame.bind(window);
window.liveFrames=new Set();
window.requestAnimationFrame=callback=>{const id=nativeRaf(time=>{window.liveFrames.delete(id);callback(time);});window.liveFrames.add(id);return id;};
window.cancelAnimationFrame=id=>{window.liveFrames.delete(id);return nativeCaf(id);};
let root=createRoot(host),ref=null,unmounted=false;
const baseProps={images,fit:.8,minRadius:600,maxRadius:1200,segments:34,maxVerticalRotationDeg:5,dragDampening:2,ariaLabel:'Fixture dome gallery'};
window.renderDome=(props={})=>{
 if(unmounted){root=createRoot(host);unmounted=false;}
 root.render(React.createElement(React.StrictMode,null,React.createElement(DomeGallery,{...baseProps,...props,ref:node=>{ref=node;}})));
};
window.domeRef=()=>ref;
window.unmountDome=()=>{root.unmount();unmounted=true;};
window.renderDome();
`;

mkdirSync(dir,{recursive:true});
writeFileSync(`${dir}/fixture.html`,fixtureHTML);
writeFileSync(`${dir}/fixture.jsx`,fixtureJSX);

const root=()=>page.locator('#fixture .dome-gallery');
const ready=async()=>{
 await page.waitForFunction(()=>document.querySelector('#fixture .dome-gallery')?.dataset.status==='ready',null,{timeout:15000});
 await wait(90);
};
const state=()=>root().evaluate(node=>({...node.dataset}));
const render=async props=>{await page.evaluate(value=>window.renderDome(value),props);await wait(60);await ready();};
const reset=async()=>{await page.waitForFunction(()=>typeof window.domeRef==='function'&&!!window.domeRef());await page.evaluate(()=>window.domeRef().reset());await page.waitForFunction(()=>document.querySelector('#fixture .dome-gallery')?.dataset.rotation==='0.0 0.0');await wait(80);};
const stageBox=()=>page.locator('#fixture .dome-gallery__stage').boundingBox();
const interactivePoint=()=>page.locator('#fixture .dome-gallery__tile').evaluateAll(buttons=>{
 for(const button of buttons){
  const rect=button.getBoundingClientRect();
  const style=getComputedStyle(button);
  const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  const hit=document.elementFromPoint(x,y);
  if(style.pointerEvents!=='none'&&rect.width>12&&rect.height>12&&x>0&&y>0&&hit===button)return{x,y};
 }
 return null;
});

try{
 // --- Core mount and public defaults ---------------------------------------------------
 await page.goto(`${base}/${dir}/fixture.html`,{waitUntil:'networkidle'});
 await ready();
 let current=await state();
 assert.equal(current.status,'ready','the measured gallery is ready');
 assert.equal(current.segments,'34','the fixture supplies the documented dense setting');
 assert.equal(current.radius,'600','minimum radius protects the short gallery stage');
 assert.equal(current.grayscale,'true');
 assert.equal(await root().locator('.dome-gallery__surface').evaluate(node=>getComputedStyle(node).filter),'grayscale(1)','the default desaturation is composed once across the surface rather than filtered per tile');
 assert.equal(await root().locator('.dome-gallery__tile img').first().evaluate(image=>getComputedStyle(image).filter),'none','individual moving images avoid expensive per-card filters');
 assert.equal(await root().locator('.dome-gallery__tile').count(),196,'seven latitude bands repeat 28 cards each at 34 segments');
 assert.equal(await root().locator('.dome-gallery__stage').getAttribute('aria-label'),'Fixture dome gallery');
 assert.equal(await root().locator('.dome-gallery__stage').getAttribute('aria-roledescription'),'image gallery');
 await root().locator('.dome-gallery__tile img').first().evaluate(image=>image.decode());
 assert.ok(await root().locator('.dome-gallery__tile img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),'local scene images decode');
 await page.evaluate(()=>{window.domeTileNodes=[...document.querySelectorAll('#fixture .dome-gallery__tile')];});

 // --- Drag, inertia, bounds, keyboard and imperative controls -------------------------
 let box=await stageBox();
 await page.mouse.move(box.x+box.width*.5,box.y+box.height*.52);
 await page.mouse.down();
 await page.mouse.move(box.x+box.width*.76,box.y+box.height*.43,{steps:8});
 await page.mouse.up();
 await wait(90);
 current=await state();
 const [yaw,pitch]=current.rotation.split(' ').map(Number);
 assert.ok(Math.abs(yaw)>8,'a horizontal pointer drag rotates the dome');
 assert.ok(Math.abs(pitch)<=5.05,'vertical rotation stays inside its configured five-degree ceiling');
 assert.equal(current.dragging,'false','release ends the drag state');
 assert.equal(await page.evaluate(()=>{const tiles=[...document.querySelectorAll('#fixture .dome-gallery__tile')];return tiles.length===window.domeTileNodes.length&&tiles.every((tile,index)=>tile===window.domeTileNodes[index]);}),true,'drag projection keeps the existing tile DOM stable instead of rerendering and reordering the field');
 assert.ok((await root().locator('.dome-gallery__tile').first().getAttribute('style')).includes('translate3d('),'the moving field uses compositor-friendly transforms');
 await reset();
 await root().locator('.dome-gallery__stage').focus();
 await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>Math.abs(Number(document.querySelector('#fixture .dome-gallery')?.dataset.rotation.split(' ')[0]))>1);
 await reset();
 await render({maxVerticalRotationDeg:2});
 box=await stageBox();
 await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();
 await page.mouse.move(box.x+box.width*.5,box.y+box.height*.98,{steps:7});await page.mouse.up();await wait(90);
 const boundedPitch=Math.abs(Number((await state()).rotation.split(' ')[1]));
 assert.ok(boundedPitch<=2.05,`vertical drag is clamped (${boundedPitch}°)`);
 await reset();
 await page.evaluate(()=>window.domeRef().rotate(1,.9));
 current=await state();
 assert.ok(Math.abs(Number(current.rotation.split(' ')[0]))>50,'the ref rotate method turns the field');
 assert.ok(Math.abs(Number(current.rotation.split(' ')[1]))<=2.05,'the ref obeys the vertical ceiling');
 await reset();

 // --- Focused image behavior and visual controls --------------------------------------
 let target=await interactivePoint();
 assert.ok(target,'at least one forward image is a direct interactive hit target');
 await page.mouse.click(target.x,target.y);await page.locator('#fixture .dome-gallery__lightbox').waitFor();
 current=await state();
 assert.notEqual(current.open,'','clicking a tile records an opened image');
 assert.equal(await page.locator('#fixture .dome-gallery__lightbox').getAttribute('role'),'dialog');
 await page.keyboard.press('Escape');await page.locator('#fixture .dome-gallery__lightbox').waitFor({state:'detached'});
 assert.equal((await state()).open,'','Escape returns to the dome');
 target=await interactivePoint();await page.mouse.click(target.x,target.y);await page.locator('#fixture .dome-gallery__lightbox').waitFor();
 box=await stageBox();await page.mouse.click(box.x+5,box.y+5);await page.locator('#fixture .dome-gallery__lightbox').waitFor({state:'detached'});

 await render({images:[],fit:-4,minRadius:5,maxRadius:30,segments:4,grayscale:false,imageBorderRadius:'12px',openedImageWidth:'320px',openedImageHeight:'240px',openedImageBorderRadius:'28px'});
 current=await state();
 assert.equal(current.segments,'12','density clamps at the supported minimum');
 assert.equal(current.radius,'80','radius and max-radius values are guarded together');
 assert.equal(current.grayscale,'false');
 assert.equal(await root().locator('.dome-gallery__surface').evaluate(node=>getComputedStyle(node).filter),'none','turning grayscale off removes the one surface-level composition filter');
 assert.equal(await root().locator('.dome-gallery__tile').count(),112,'minimum density still fills every latitude band');
 assert.ok((await root().locator('.dome-gallery__tile img').first().getAttribute('src')).startsWith('data:image/svg+xml'),'an empty collection uses the self-contained fallback art');
 assert.equal(await root().locator('.dome-gallery__tile').first().evaluate(tile=>getComputedStyle(tile).borderTopLeftRadius),'12px');
 target=await interactivePoint();await page.mouse.click(target.x,target.y);await page.locator('#fixture .dome-gallery__lightbox').waitFor();
 const opened=page.locator('#fixture .dome-gallery__opened');
 assert.deepEqual(await opened.evaluate(node=>{const style=getComputedStyle(node);return{width:style.width,height:style.height,radius:style.borderTopLeftRadius};}),{width:'320px',height:'240px',radius:'28px'},'opened-image dimensions and rounding flow through to the dialog');
 await page.keyboard.press('Escape');
 await render({fit:.1,fitBasis:'width',minRadius:80,maxRadius:130,segments:20});
 assert.equal((await state()).radius,'120','fit basis can derive the radius from stage width');
 assert.equal((await state()).segments,'20');

 // --- StrictMode cleanup ---------------------------------------------------------------
 await reset();
 await page.evaluate(()=>window.unmountDome());await wait(80);
 assert.equal(await page.evaluate(()=>window.liveObservers.size),0,'ResizeObserver is released on unmount');
 assert.equal(await page.evaluate(()=>window.liveFrames.size),0,'inertia animation frames are released on unmount');

 // --- Standalone and embedded preview query plumbing ----------------------------------
 await page.goto(`${base}/preview/dome-gallery?segments=20&fit=.9&maxVerticalRotationDeg=7&grayscale=false&scenes=amber-portal,blue-alcove`,{waitUntil:'networkidle'});
 await page.locator('.dome-gallery[data-status="ready"]').waitFor();
 current=await page.locator('.dome-gallery').evaluate(node=>({...node.dataset}));
 assert.equal(current.segments,'20');assert.equal(current.grayscale,'false');
 assert.equal(await page.locator('.dome-gallery__tile').count(),112,'preview honours its bounded density query');
 assert.equal(await page.getByRole('button',{name:'Reset view'}).count(),1,'standalone preview exposes its reset control');
 await page.getByRole('button',{name:'Reset view'}).click();
 await page.goto(`${base}/preview/dome-gallery?embed=1&segments=999&fit=-2&scenes=missing`,{waitUntil:'networkidle'});
 await page.locator('.dome-gallery[data-status="ready"]').waitFor();
 assert.equal(await page.locator('.dome-gallery').getAttribute('data-segments'),'34','embedded query values are clamped by the public preview range');
 assert.equal(await page.locator('.dg-preview-controls,.dg-preview-back').count(),0,'embedded preview omits standalone chrome');

 // --- Documentation customizer and responsive iframe ----------------------------------
 await page.goto(`${base}/components/dome-gallery`,{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Dome Gallery',exact:true}).waitFor();
 const frame=page.frameLocator('iframe[title="Dome Gallery interactive preview"]');
 await frame.locator('.dome-gallery[data-status="ready"]').waitFor();
 assert.equal(await frame.locator('.dome-gallery').getAttribute('data-segments'),'34');
 await page.getByRole('button',{name:/Customize/}).click();
 const segmentControl=page.locator('input[aria-label="Segments"]');
 await segmentControl.focus();
 for(let i=0;i<14;i++)await page.keyboard.press('ArrowLeft');
 await page.waitForFunction(()=>document.querySelector('iframe')?.contentDocument?.querySelector('.dome-gallery')?.dataset.segments==='20',null,{timeout:6000});
 await page.getByRole('switch',{name:'Grayscale'}).click();
 await page.waitForFunction(()=>document.querySelector('iframe')?.contentDocument?.querySelector('.dome-gallery')?.dataset.grayscale==='false',null,{timeout:6000});
 await page.getByRole('button',{name:'Mobile preview'}).click();
 assert.ok((await page.locator('.dg-playground .ms-iframe-wrap').getAttribute('class')).includes('mobile'),'the docs support mobile preview framing');
 await page.locator('.ms-customize-heading').getByRole('button',{name:'Reset'}).click();
 await page.waitForFunction(()=>{const dome=document.querySelector('iframe')?.contentDocument?.querySelector('.dome-gallery');return dome?.dataset.segments==='34'&&dome?.dataset.grayscale==='true';},null,{timeout:6000});
 await page.getByRole('tab',{name:'Component'}).click();
 assert.ok((await page.locator('#playground-panel').innerText()).includes('function DomeGalleryBase'),'component source tab resolves the local core');

 // --- Archive and contained catalogue poster after newer studies ---------------------
 const archiveResponse=await page.request.get(`${base}/downloads/dome-gallery.zip`);
 assert.equal(archiveResponse.status(),200,'the reusable archive is downloadable');
 const archiveEntries=execFileSync('unzip',['-Z1','public/downloads/dome-gallery.zip'],{encoding:'utf8'}).trim().split('\n');
 assert.deepEqual(archiveEntries.sort(),['README.md','src/ArchiveDome.jsx','src/Hero.jsx','src/components/DomeGallery.css','src/components/DomeGallery.jsx'].sort(),'archive exposes only the core, examples and README');
 assert.equal(execFileSync('unzip',['-p','public/downloads/dome-gallery.zip','src/components/DomeGallery.jsx'],{encoding:'utf8'}),readFileSync('src/components/DomeGallery.jsx','utf8'),'archive core stays synchronized with source');
 assert.equal(execFileSync('unzip',['-p','public/downloads/dome-gallery.zip','src/components/DomeGallery.css'],{encoding:'utf8'}),readFileSync('src/components/DomeGallery.css','utf8'),'archive styling stays synchronized with source');
 await page.goto(`${base}/components`,{waitUntil:'networkidle'});
 const firstCard=page.locator('.ms-component-card').first();
 assert.equal(await firstCard.getAttribute('href'),'/components/viscose-carousel','the newest Viscose study leads the catalogue');
 const domeCard=page.locator('.ms-component-card[href="/components/dome-gallery"]');
 assert.equal(await domeCard.count(),1,'Dome Gallery remains in the newest-first collection');
 const poster=domeCard.locator('img').first();await poster.evaluate(image=>image.decode());
 assert.ok((await poster.getAttribute('src')).startsWith('data:image/webp;base64,'),'Dome Gallery poster is embedded with the app');
 assert.equal(await poster.evaluate(image=>getComputedStyle(image).objectFit),'contain','the dome poster retains its full composition');

 await page.setViewportSize({width:390,height:844});
 await page.goto(`${base}/components/dome-gallery`,{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Dome Gallery',exact:true}).waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'the component page remains inside the mobile viewport');
 assert.deepEqual(errors,[],'Dome Gallery paths produce no browser errors');
 console.log('PASS Dome Gallery: core projection, drag/inertia, focus dialog, prop guards, cleanup, previews, docs controls, archive, catalogue ordering and mobile layout verified.');
}finally{
 await browser.close();
 rmSync(dir,{recursive:true,force:true});
}
