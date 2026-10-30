import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
const base=process.env.TEST_URL||'http://localhost:5173';
const dir='test-artifacts/infinite-canvas';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const root=()=>page.locator('.infinite-canvas');
const position=()=>root().evaluate(e=>({x:Number(e.dataset.x),y:Number(e.dataset.y)}));
const near=(a,b,t=.2)=>assert.ok(Math.abs(a-b)<t,`${a} should be near ${b}`);
const wrap=(value,period)=>-(((-value%period)+period)%period);
const settle=async()=>{await page.waitForFunction(()=>document.querySelector('.infinite-canvas')?.dataset.moving==='false');};
const wheel=async(dx,dy,extra={})=>root().evaluate((e,{dx,dy,extra})=>e.dispatchEvent(new WheelEvent('wheel',{deltaX:dx,deltaY:dy,bubbles:true,cancelable:true,...extra})),{dx,dy,extra});
const open=async(query='')=>{await page.goto(`${base}/preview/infinite-canvas?embed=1${query}`,{waitUntil:'networkidle'});await root().waitFor();};
const coverage=()=>page.locator('.ic-plane').evaluate(e=>{const p=e.getBoundingClientRect(),s=e.parentElement.getBoundingClientRect();return p.left<=s.left+.1&&p.top<=s.top+.1&&p.right>=s.right-.1&&p.bottom>=s.bottom-.1;});
try{
  await open();
  assert.equal(await page.locator('.ic-cell').count(),60);assert.equal(await page.getByRole('img').count(),15);
  const tile=await page.locator('.ic-tile').first().boundingBox();near(tile.width,1512);near(tile.height,936);
  const cell=await page.locator('.ic-cell').first().boundingBox();near(cell.x,72);near(cell.y,72);near(cell.width,216);near(cell.height,216);
  assert.equal(await page.locator('.ic-cell img').first().evaluate(e=>getComputedStyle(e).objectFit),'contain');
  assert.equal(await root().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(245, 244, 243)');
  assert.equal(await root().evaluate(e=>getComputedStyle(e).borderRadius),'24px');
  assert.ok(await page.locator('.ic-cell img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)));
  await page.screenshot({path:`${dir}/desktop.png`});
  await page.mouse.move(1000,600);await page.waitForTimeout(150);assert.deepEqual(await position(),{x:0,y:0},'hover alone never moves the canvas');
  // Sample the actual rendered motion against the measured quintic ease, including the tail.
  const samples=await root().evaluate(e=>new Promise(resolve=>{
    const frames=[],start=performance.now();e.dispatchEvent(new WheelEvent('wheel',{deltaX:200,deltaY:500,bubbles:true,cancelable:true}));
    function tick(){frames.push({t:performance.now()-start,x:Number(e.dataset.x),y:Number(e.dataset.y)});if(performance.now()-start<1600)requestAnimationFrame(tick);else resolve(frames)}requestAnimationFrame(tick);
  }));
  for(const time of [100,250,500,750,1100]){
    const s=samples.reduce((a,b)=>Math.abs(a.t-time)<Math.abs(b.t-time)?a:b);const eased=1-(1-Math.min(1,s.t/1500))**5;
    near(s.y,-500*eased,6);near(s.x,-200*eased,3);
  }
  near((await position()).x,-200);near((await position()).y,-500);assert.equal(await root().getAttribute('data-moving'),'false');
  // Interrupted wheel events accumulate distance; they do not use only the current rendered position.
  await wheel(0,200);await page.waitForTimeout(100);await wheel(0,200);await settle();near((await position()).y,-900);
  await root().focus();await page.keyboard.press('Home');await settle();assert.deepEqual(await position(),{x:0,y:0});
  // Real pointer drag: 2x displacement, delayed tracking, no additional release velocity.
  await page.mouse.move(900,600);await page.mouse.down();await page.mouse.move(600,450,{steps:15});
  assert.equal(await root().getAttribute('data-dragging'),'true');assert.ok((await position()).x>-600,'drag is eased, not snapped');
  await page.mouse.up();await settle();near((await position()).x,-600);near((await position()).y,-300);
  const stopped=await position();await page.waitForTimeout(250);assert.deepEqual(await position(),stopped);
  assert.equal(await root().getAttribute('data-dragging'),'false');
  await page.screenshot({path:`${dir}/dragged.png`});
  // Instant navigation under reduced motion makes wrap continuity and coverage easy to inspect.
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(50);
  const count=await page.locator('.ic-cell').count();
  for(const [dx,dy] of [[9000,6000],[-15000,-10000],[1512,936],[-1512,-936],[100000,-100000]]){
    const old=await position();await wheel(dx,dy);const next=await position();near(next.x,wrap(old.x-dx,1512));near(next.y,wrap(old.y-dy,936));
    assert.equal(await page.locator('.ic-cell').count(),count);assert.ok(await coverage(),'all viewport edges remain covered');
  }
  await root().focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');near((await position()).x,-288);
  await page.keyboard.press('ArrowDown');near((await position()).y,-288);await page.keyboard.press('Escape');assert.deepEqual(await position(),{x:0,y:0});
  await wheel(0,100,{shiftKey:true});near((await position()).x,-100);near((await position()).y,0);
  const old=await position();assert.equal(await wheel(0,100,{ctrlKey:true}),true,'browser zoom is not canceled');assert.deepEqual(await position(),old);
  await root().focus();await page.keyboard.press('Home');await wheel(756,468);await page.setViewportSize({width:1200,height:800});await page.waitForTimeout(100);
  near((await position()).x,-630);near((await position()).y,-390);assert.ok(await coverage(),'resizing preserves tile phase and coverage');
  // Auto mobile sizes, a third tile row, native touch and no empty viewport edges.
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto(`${base}/preview/infinite-canvas?embed=1`,{waitUntil:'networkidle'});
  const mcell=await mobile.locator('.ic-cell').first().boundingBox();near(mcell.x,19.5);near(mcell.y,19.5);near(mcell.width,175.5);
  const mtile=await mobile.locator('.ic-tile').first().boundingBox();near(mtile.width,994.5);near(mtile.height,604.5);
  assert.equal(await mobile.locator('.ic-tile').count(),6);assert.equal(await mobile.locator('.ic-cell').count(),90);
  await mobile.screenshot({path:`${dir}/mobile.png`});
  const session=await mobile.context().newCDPSession(mobile);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:450}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:250,y:550}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await mobile.waitForFunction(()=>document.querySelector('.infinite-canvas').dataset.moving==='false');
  near(Number(await mobile.locator('.infinite-canvas').getAttribute('data-x')),-894.5);near(Number(await mobile.locator('.infinite-canvas').getAttribute('data-y')),-404.5);
  await mobile.emulateMedia({reducedMotion:'reduce'});await mobile.waitForTimeout(50);
  await mobile.locator('.infinite-canvas').evaluate(e=>e.dispatchEvent(new WheelEvent('wheel',{deltaY:180,bubbles:true,cancelable:true})));
  assert.ok(await mobile.locator('.ic-plane').evaluate(e=>e.getBoundingClientRect().bottom>=844),'mobile remains covered near the vertical seam');
  assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.close();
  // Fixed pixel configuration and controls.
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:900});await open('&imageSize=200px&gap=2&columns=3&showControls=true');
  near((await page.locator('.ic-cell').first().boundingBox()).width,200);
  await wheel(150,150);await page.getByRole('button',{name:'Reset view',exact:false}).click();await settle();assert.deepEqual(await position(),{x:0,y:0});
  // Fixture: explicit empty arrays, generated paths, failed images and wheel scoping.
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    document.getElementById('root').remove();const outside=document.createElement('div');outside.id='outside';outside.style.height='350px';outside.textContent='Outside canvas';document.body.append(outside);const host=document.createElement('div');document.body.append(host);const footer=document.createElement('div');footer.style.height='800px';document.body.append(footer);
    const React=(await import('/node_modules/.vite/deps/react.js')).default;const{createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;const{default:Canvas}=await import('/src/components/InfiniteCanvas.jsx');window.canvasRoot=createRoot(host);window.renderCanvas=(props={})=>canvasRoot.render(React.createElement(Canvas,{height:600,...props}));renderCanvas();
  });
  await page.getByText('Add images to explore the canvas.').waitFor();assert.equal(await page.locator('.ic-cell').count(),0);
  await page.evaluate(()=>renderCanvas({images:[],imageRootPath:'/should-not-fetch'}));await page.waitForTimeout(50);assert.equal(await page.locator('.ic-cell').count(),0);
  const loaded=[];const bytes=readFileSync('public/hover-members/1.webp');
  await page.route('**/sequential/img*.png',route=>{loaded.push(route.request().url());return route.fulfill({contentType:'image/webp',body:bytes});});
  await page.evaluate(()=>renderCanvas({imageRootPath:'/sequential',numberOfImages:3,imageSize:200,gap:10,columns:3,showControls:true}));
  await page.locator('.ic-cell img').first().waitFor();await page.waitForTimeout(200);assert.equal(new Set(loaded).size,3);assert.equal(await page.getByRole('img').count(),3);
  await page.mouse.move(200,100);await page.mouse.wheel(0,150);await page.waitForTimeout(200);assert.ok(await page.evaluate(()=>scrollY>0),'wheel outside the canvas scrolls the page');assert.deepEqual(await position(),{x:0,y:0});
  await page.evaluate(()=>renderCanvas({images:[{src:'/missing-canvas-image.webp',alt:'Missing photo'}],imageSize:200,gap:10}));await page.locator('.ic-image-fallback').first().waitFor();assert.equal(await page.getByRole('img',{name:'Missing photo'}).count(),1);assert.ok(await coverage());
  await page.evaluate(()=>canvasRoot.unmount());assert.equal(await root().count(),0);
  // Docs, palette/geometry controls, code tabs and source download.
  await page.goto(`${base}/components/infinite-canvas`,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Infinite Canvas',exact:true}).waitFor();
  await page.frameLocator('iframe').locator('.infinite-canvas').waitFor();await page.getByRole('button',{name:'Customize',exact:true}).click();
  await page.getByLabel('Image size',{exact:true}).selectOption('20vw');await page.getByLabel('Grid gap',{exact:true}).fill('8');await page.getByRole('switch',{name:'Show controls',exact:true}).click();await page.waitForTimeout(500);
  assert.ok((await page.locator('iframe').getAttribute('src')).includes('showControls=true'));
  await page.getByRole('tab',{name:'Usage',exact:true}).click();const code=await page.locator('pre').first().innerText();assert.ok(code.includes('imageSize="20vw"')&&code.includes('gap="8vw"'));
  await page.getByRole('tab',{name:'Component',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('function InfiniteCanvas'));
  await page.getByRole('tab',{name:'CSS',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('object-fit:contain'));
  const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download files',exact:true}).click();assert.equal((await download).suggestedFilename(),'infinite-canvas.zip');
  await page.setViewportSize({width:390,height:844});await page.getByRole('tab',{name:'Preview',exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log('PASS Infinite Canvas: reference geometry, quintic easing, wheel accumulation, 2x drag/touch, no hover or release drift, bounded wraps, mobile coverage, resize, keyboard/reduced motion, scoped input, fallbacks/sequential data, docs/customization/source and ZIP.');
}finally{await browser.close();}
