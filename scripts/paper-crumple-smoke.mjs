// Study 026 — Paper Crumple. Exercise the independently authored Canvas 2D core,
// then check its preview, docs, archive and embedded catalogue card.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const base=process.env.TEST_URL||'http://localhost:5173';
const dir='test-artifacts/paper-crumple-smoke';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const fixtureHTML=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Paper Crumple fixture</title><style>html,body{margin:0;background:#120f17}#fixture{width:900px;height:560px;position:relative}</style></head><body><div id="fixture"></div><script type="module" src="./fixture.jsx"></script></body></html>`;
const fixtureJSX=`import React from 'react';
import {createRoot} from 'react-dom/client';
import PaperCrumple from '../../src/components/PaperCrumple.jsx';

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
let root=createRoot(host),unmounted=false,paper=null;
const defaults={src:'/paper-crumple/scenes/field-notes.webp',backSrc:'/paper-crumple/scenes/signal-grid.webp',alt:'Local handwritten note'};
window.paperEvents=[];window.paperErrors=[];
window.renderPaper=(props={})=>{
 if(unmounted){root=createRoot(host);unmounted=false;}
 window.paperEvents=[];window.paperErrors=[];
 root.render(React.createElement(React.StrictMode,null,React.createElement(PaperCrumple,{...defaults,...props,ref:node=>{paper=node;},onStateChange:state=>window.paperEvents.push(state),onError:error=>window.paperErrors.push(error.message)})));
};
window.paperRef=()=>paper;
window.unmountPaper=()=>{root.unmount();unmounted=true;paper=null;};
window.renderPaper();
`;

mkdirSync(dir,{recursive:true});
writeFileSync(`${dir}/fixture.html`,fixtureHTML);
writeFileSync(`${dir}/fixture.jsx`,fixtureJSX);
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',error=>errors.push(`page: ${error.message}`));
page.on('console',message=>{
 if(message.type()==='error'&&!/no-such-paper\.webp/.test(message.text()))errors.push(`console: ${message.text().slice(0,300)}`);
});
const root=()=>page.locator('#fixture .paper-crumple');
const hit=()=>root().locator('.paper-crumple__hit');
const ready=async status=>{
 await page.waitForFunction(expected=>{
  const value=document.querySelector('#fixture .paper-crumple')?.dataset.status;
  return expected.includes(value);
 },status? [status] : ['ready'],{timeout:15000});
 await wait(70);
};
const state=()=>root().evaluate(node=>({...node.dataset}));
const hitBox=()=>hit().boundingBox();
const center=async()=>{const box=await hitBox();return{x:box.x+box.width/2,y:box.y+box.height/2};};
const render=async(props,status='ready')=>{await page.evaluate(value=>window.renderPaper(value),props);await ready(status);};
const pointerHold=async(extra={})=>{
 const point=await center();await page.mouse.move(point.x,point.y);await page.mouse.down();await wait(extra.wait??90);return point;
};

try{
 // Core mount, Canvas setup and public geometry.
 await page.goto(`${base}/${dir}/fixture.html`,{waitUntil:'networkidle'});
 await ready();
 let current=await state(),box=await hitBox();
 assert.equal(current.status,'ready');
 assert.equal(current.state,'flat');
 assert.equal(Math.round(await root().evaluate(node=>node.getBoundingClientRect().height)),360,'the default stage retains the compact reference-like scene height');
 assert.equal(Math.round(box.width),312);assert.equal(Math.round(box.height),312);
 assert.equal(await root().locator('canvas').evaluate(canvas=>canvas.width>0&&canvas.height>0),true,'the canvas receives a backing store');
 assert.equal(await hit().getAttribute('aria-label'),'Local handwritten note. Hold to crumple and drag. Keyboard: hold Space or Enter, arrow keys to move, Escape to reset.');
 assert.ok(await root().locator('.paper-crumple__fallback').evaluate(image=>image.complete&&image.naturalWidth>0),'local paper face decodes');

 // Hold reaches the compact, reference-like silhouette promptly; drag uses pointer capture.
 const start=await pointerHold({wait:82});
 current=await state();box=await hitBox();
 assert.equal(current.state,'holding');assert.equal(current.holding,'true');
 assert.ok(Number(current.amount)>.79,'the default hold becomes substantially crumpled within a short press');
 assert.ok(box.width>=132&&box.width<=138&&box.height>=143&&box.height<=149,'the held square paper contracts into the measured 135 × 146px compact footprint');
 await page.mouse.move(start.x+115,start.y+72,{steps:5});await wait(95);
 const dragged=await hitBox();
 assert.ok(dragged.x-box.x>65&&dragged.y-box.y>35,'the compact paper follows a held pointer');
 await page.mouse.up();await wait(100);
 box=await hitBox();current=await state();
 assert.ok(box.width>305&&box.height>305,'restore release recovers the full sheet almost immediately');
 assert.ok(Math.abs(box.x-294)<3&&Math.abs(box.y-24)<3,'restore release rapidly returns the sheet to its centered origin');
 await wait(420);current=await state();
 assert.equal(current.state,'flat');assert.equal(current.holding,'false');
 const lifecycle=await page.evaluate(()=>window.paperEvents.map(event=>event.state));
 assert.deepEqual(lifecycle,['holding','releasing','flat'],'lifecycle callbacks avoid a noisy per-frame telemetry stream');

 // Stay release preserves the compact form and its dragged resting offset.
 await render({releaseBehavior:'stay',crumpleDuration:0,releaseDuration:0});
 const stayStart=await pointerHold({wait:30});await page.mouse.move(stayStart.x+90,stayStart.y-46,{steps:4});await wait(70);await page.mouse.up();await wait(80);
 current=await state();box=await hitBox();
 assert.equal(current.state,'crumpled');assert.ok(box.width<145&&box.height<155,'stay keeps the paper as a small wad');
 assert.ok(box.x>390&&box.y<225,'stay preserves the dragged coordinate instead of returning to centre');
 assert.deepEqual(await page.evaluate(()=>window.paperEvents.map(event=>event.state)),['holding','crumpled']);
 await page.evaluate(()=>window.paperRef().reset());await wait(45);
 current=await state();box=await hitBox();assert.equal(current.state,'flat');assert.equal(Math.round(box.width),312);

 // Creased release unfolds, reports its distinct lifecycle state and retains a crease value.
 await render({releaseBehavior:'creased',creaseStrength:.55,crumpleDuration:0,releaseDuration:0});
 await pointerHold({wait:25});await page.mouse.up();await wait(55);
 current=await state();box=await hitBox();
 assert.equal(current.state,'creased');assert.ok(box.width>305&&box.height>305,'creased returns to a flat hit geometry');
 const creased=await page.evaluate(()=>window.paperEvents.at(-1));
 assert.ok(creased.crease>.12,'creased release publishes residual crease strength');

 // Keyboard implements the same hold/release, movement and escape reset path.
 await render({releaseBehavior:'restore',crumpleDuration:0,releaseDuration:0});
 await hit().focus();await page.keyboard.down('Space');await wait(35);
 current=await state();box=await hitBox();assert.equal(current.state,'holding');assert.ok(box.width<145);
 await page.keyboard.press('Shift+ArrowRight');await page.keyboard.press('ArrowDown');await wait(45);
 const keyed=await hitBox();assert.ok(keyed.x-box.x>12&&keyed.y-box.y>2,'arrow movement repositions the held sheet');
 await page.keyboard.up('Space');await wait(45);assert.equal((await state()).state,'flat');
 const flatBox=await hitBox();await page.keyboard.press('ArrowRight');await wait(45);const offset=await hitBox();assert.ok(offset.x-flatBox.x>3,'arrow movement also works for inspected flat paper');
 await page.keyboard.press('Escape');await wait(45);box=await hitBox();assert.ok(Math.abs(box.x-294)<2,'Escape restores center position');

 // Defensive normalisation, disabled state and source-error fallback.
 await render({width:1,height:1,sceneHeight:1,crumpleAmount:9,detail:4,releaseBehavior:'wrong'});
 box=await hitBox();assert.equal(Math.round(box.width),80);assert.equal(Math.round(box.height),80,'size props are bounded before drawing');
 await render({draggable:false});await hit().focus();const fixed=await hitBox();await page.keyboard.press('ArrowRight');await wait(45);assert.ok(Math.abs((await hitBox()).x-fixed.x)<1,'draggable false also locks keyboard positioning');
 await render({disabled:true});assert.equal(await hit().isDisabled(),true);await hit().focus();await page.keyboard.down('Space');await wait(35);await page.keyboard.up('Space');assert.equal((await state()).state,'flat','disabled paper ignores keyboard holds');
 await render({src:'/paper-crumple/no-such-paper.webp'},'fallback');
 assert.equal((await state()).status,'fallback');assert.equal(await page.evaluate(()=>window.paperErrors.length),1,'failed material source is reported once');
 assert.equal(await root().locator('.paper-crumple__fallback').isVisible(),true,'a failed canvas source leaves an ordinary image fallback');

 // Reduced motion keeps direct interaction but settles synchronously.
 await page.emulateMedia({reducedMotion:'reduce'});await render({crumpleDuration:3,releaseDuration:3});await pointerHold({wait:25});assert.ok(Number((await state()).amount)>.84,'reduced motion skips hold interpolation');await page.mouse.up();await wait(25);assert.equal((await state()).state,'flat','reduced motion skips release interpolation');await page.emulateMedia({reducedMotion:'no-preference'});

 // StrictMode cleanup clears observer and animation resources, then supports remounting.
 await render({});await pointerHold({wait:20});
 await page.evaluate(()=>window.unmountPaper());await wait(70);
 assert.equal(await page.locator('#fixture .paper-crumple').count(),0);
 const clean=await page.evaluate(()=>({observers:window.liveObservers.size,frames:window.liveFrames.size}));
 assert.equal(clean.observers,0);assert.equal(clean.frames,0);
 await page.evaluate(()=>window.renderPaper());await ready();assert.equal((await state()).status,'ready','unmount/remount stays safe');

 // Standalone query parsing and embedded preview framing.
 await page.goto(`${base}/preview/paper-crumple?scene=signal-grid&backScene=field-notes&releaseBehavior=stay&width=160&height=210&sceneHeight=380&foldCount=11&paperColor=%23000000&draggable=false`,{waitUntil:'networkidle'});
 await page.locator('.paper-crumple[data-status=ready]').waitFor();
 assert.equal(await page.locator('.pc-preview-controls').count(),1);box=await page.locator('.paper-crumple__hit').boundingBox();assert.equal(Math.round(box.width),160);assert.equal(Math.round(box.height),210);
 await page.goto(`${base}/preview/paper-crumple?embed=1&disabled=true`,{waitUntil:'networkidle'});await page.locator('.paper-crumple[data-status=ready]').waitFor();assert.equal(await page.locator('.pc-preview-controls').count(),0);assert.equal(await page.locator('.paper-crumple__hit').isDisabled(),true);

 // Documentation integration, controls and current iframe update.
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(`${base}/components/paper-crumple`,{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Paper Crumple',exact:true}).waitFor();
 const docFrame=page.frameLocator('iframe');await docFrame.locator('.paper-crumple[data-status=ready]').waitFor();
 assert.equal(await page.locator('table tbody tr').count(),35,'the documented public prop surface is complete');
 await page.getByRole('button',{name:/Customize/}).click();
 await page.getByLabel('On release').selectOption('stay');await wait(260);
 assert.ok((await page.locator('iframe').getAttribute('src')).includes('releaseBehavior=stay'),'customization reaches the embedded standalone preview');
 for(let index=0;index<4;index++)await page.getByLabel('Fold density').press('ArrowRight');await wait(220);
 assert.ok((await page.locator('iframe').getAttribute('src')).includes('foldCount=10'));
 await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:'networkidle'});await page.getByRole('heading',{name:'Paper Crumple',exact:true}).waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile documentation remains within its viewport');

 // Archive and catalogue poster remain locally embedded after newer studies are added.
 const listing=execFileSync('unzip',['-l','public/downloads/paper-crumple.zip'],{encoding:'utf8'});
 for(const name of ['src/components/PaperCrumple.jsx','src/components/PaperCrumple.css','src/FieldNote.jsx','src/CrumpledArchive.jsx','README.md'])assert.ok(listing.includes(name),`${name} is archived`);
 assert.equal(execFileSync('unzip',['-p','public/downloads/paper-crumple.zip','src/components/PaperCrumple.jsx'],{encoding:'utf8'}),readFileSync('src/components/PaperCrumple.jsx','utf8'),'archived component matches source');
 assert.equal(execFileSync('unzip',['-p','public/downloads/paper-crumple.zip','src/components/PaperCrumple.css'],{encoding:'utf8'}),readFileSync('src/components/PaperCrumple.css','utf8'),'archived stylesheet matches source');
 await page.goto(`${base}/components`,{waitUntil:'networkidle'});const card=page.locator('.ms-component-card[href="/components/paper-crumple"]');assert.equal(await card.count(),1);const poster=card.locator('img').first();await poster.evaluate(image=>image.decode());assert.ok((await poster.getAttribute('src')).startsWith('data:image/webp;base64,'),'the Paper Crumple card poster is embedded instead of remotely fetched');

 assert.deepEqual(errors,[]);
 console.log('PASS Paper Crumple: canvas hold/release/drag modes, keyboard, callbacks, guards, fallbacks, reduced motion, cleanup, preview, docs, archive and embedded catalogue card verified.');
}finally{
 await browser.close();
 rmSync(dir,{recursive:true,force:true});
}
