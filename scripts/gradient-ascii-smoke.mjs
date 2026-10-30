import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const base=process.env.TEST_URL||'http://localhost:5173',dir='test-artifacts/gradient-ascii';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1200,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const root=()=>page.locator('.gradient-ascii');
const frame=async()=>Number(await root().getAttribute('data-frame'));
const wait=ms=>page.waitForTimeout(ms);
try{
 await page.goto(`${base}/preview/gradient-ascii?embed=1&intro=false`,{waitUntil:'networkidle'});
 await page.locator('.gradient-ascii[data-renderer=webgl]').waitFor();
 assert.equal(await root().getAttribute('aria-hidden'),'true');assert.equal(await root().evaluate(e=>getComputedStyle(e).pointerEvents),'none');
 const start=await frame();await wait(250);assert.ok(await frame()>start,'ambient animation runs');
 await page.getByRole('button',{name:'Pause animation',exact:true}).click();await wait(150);const paused=await frame();await wait(180);assert.equal(await frame(),paused,'pause stops animation frames');
 await page.getByRole('button',{name:'Resume animation',exact:true}).click();await wait(160);assert.ok(await frame()>paused);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.gradient-ascii').dataset.reducedMotion==='true'&&document.querySelector('.gradient-ascii').dataset.running==='false');await wait(350);const reduced=await frame();await wait(150);assert.equal(await frame(),reduced);assert.equal(await root().getAttribute('data-intro'),'true');
 await page.screenshot({path:`${dir}/desktop.png`});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(`${base}/preview/gradient-ascii?embed=1&dpr=.5`,{waitUntil:'domcontentloaded'});await root().waitFor();await page.waitForFunction(()=>document.querySelector('.gradient-ascii')?.dataset.intro==='false');await page.waitForFunction(()=>document.querySelector('.gradient-ascii')?.dataset.intro==='true',null,{timeout:8000});
 await page.goto(`${base}/preview/gradient-ascii?embed=1&paused=true`,{waitUntil:'networkidle'});assert.equal(await root().getAttribute('data-intro'),'true','initial pause shows a fully revealed field');await page.emulateMedia({reducedMotion:'reduce'});
 // A real reusable-component fixture, independently of docs/demo query parsing.
 await page.goto(base,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{
  document.getElementById('root').remove();document.body.style.margin='0';
  const host=document.createElement('section');host.id='ascii-fixture';host.style.cssText='position:relative;width:800px;height:600px;background:#101016';document.body.append(host);
  const React=(await import('/node_modules/.vite/deps/react.js')).default;const{createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;
  const{default:ASCII}=await import('/src/components/GradientASCII.jsx');window.fixture=createRoot(host);window.renderASCII=(props={})=>fixture.render(React.createElement(ASCII,{paused:true,intro:false,grain:0,speed:0,flicker:0,...props}));renderASCII();
  window.sampleASCII=()=>new Promise(resolve=>{
   const canvas=host.querySelector('canvas'),gl=canvas.getContext('webgl'),original=gl.drawArrays;
   gl.drawArrays=function(...args){original.apply(gl,args);const pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let hash=2166136261,alpha=0,nonzero=0;for(let j=0;j<pixels.length;j+=16){hash=Math.imul(hash^pixels[j],16777619);hash=Math.imul(hash^pixels[j+1],16777619);hash=Math.imul(hash^pixels[j+2],16777619);hash=Math.imul(hash^pixels[j+3],16777619);alpha+=pixels[j+3];if(pixels[j+3])nonzero++;}gl.drawArrays=original;resolve({hash:hash>>>0,alpha,nonzero,width:canvas.width,height:canvas.height});};window.dispatchEvent(new Event('resize'));
  });
 });
 await root().waitFor();await page.waitForFunction(()=>document.querySelector('.gradient-ascii')?.dataset.renderer==='webgl');
 const render=async props=>{const old=await frame();await page.evaluate(props=>renderASCII(props),props);await page.waitForFunction(old=>Number(document.querySelector('.gradient-ascii').dataset.frame)>old,old);await wait(50);};
 const pixels=()=>page.evaluate(()=>sampleASCII());
 await root().evaluate(e=>e.dataset.probe='same');
 const shapes=[];for(const shape of ['horizon','pinch','rise','eclipse']){await render({shape});const image=await pixels();assert.ok(image.alpha>0);shapes.push(image.hash);await root().screenshot({path:`${dir}/${shape}.png`});}
 assert.equal(new Set(shapes).size,4,'all four fields are visually distinct');assert.equal(await root().getAttribute('data-probe'),'same','props do not remount the renderer');
 await render({});const standard=await pixels();
 for(const props of [{cellSize:30},{density:.15},{colors:['#ff3300','#ffcc00']},{characters:' 01'},{variation:11},{softness:0},{scale:.6},{flow:2},{glow:1.5},{depthOfField:1},{lightMode:true},{fontFamily:'serif'}]){
  await render(props);assert.notEqual((await pixels()).hash,standard.hash,JSON.stringify(props)+' changes actual rendered pixels');
 }
 await render({glyphOpacity:0,gradientOpacity:0});assert.equal((await pixels()).alpha,0,'fully transparent when both layers are off');
 await render({gradientOpacity:0});const glyphs=await pixels();assert.ok(glyphs.alpha>0&&glyphs.alpha<standard.alpha,'glyph-only transparency');
 await render({gradientOpacity:0,characters:''});assert.equal((await pixels()).alpha,0,'empty character set really hides glyphs');
 await render({gradientOpacity:0,density:0});assert.equal((await pixels()).alpha,0,'zero density hides glyphs');
 await render({colors:['not-a-color',null],shape:'invalid',cellSize:-200,dpr:99,variation:NaN,fontFamily:'bad; }'});assert.equal(await root().getAttribute('data-cell-size'),'8');assert.equal(await root().getAttribute('data-shape'),'horizon');assert.ok((await pixels()).alpha>0);
 // Pause/reduced motion are independent of speed. Interactive clocks run with drift held still.
 await page.emulateMedia({reducedMotion:'no-preference'});
 await render({paused:false,mouseInteraction:false,clickEffect:'none'});await wait(180);const idle=await frame();await wait(120);assert.equal(await frame(),idle);
 await page.mouse.move(250,180);await page.mouse.click(250,180);await wait(100);assert.equal(await frame(),idle,'disabled interactions stay idle');
 await render({paused:false,mouseInteraction:true,clickEffect:'none'});const calm=await pixels();await page.mouse.move(260,160);await page.mouse.move(500,160,{steps:5});await wait(100);assert.ok(Number(await root().getAttribute('data-interactions'))>0);assert.notEqual((await pixels()).hash,calm.hash,'pointer scrambles glyph pixels');await wait(1000);assert.equal(await root().getAttribute('data-interactions'),'0');
 for(const clickEffect of ['wave','burst']){await render({paused:false,mouseInteraction:false,clickEffect});const before=await pixels();await page.mouse.click(400,150);await wait(140);assert.ok(Number(await root().getAttribute('data-interactions'))>0);assert.notEqual((await pixels()).hash,before.hash,`${clickEffect} changes glyphs`);await wait(1500);assert.equal(await root().getAttribute('data-interactions'),'0');}
 // Field/background itself does not move when only characters are scrambled.
 await render({paused:false,mouseInteraction:true,clickEffect:'wave',glyphOpacity:0});const background=await pixels();await page.mouse.move(450,140);await page.mouse.click(450,140);await wait(100);assert.equal((await pixels()).hash,background.hash);
 await render({paused:false,speed:1,flicker:.2});await wait(100);const t=Number(await root().getAttribute('data-time'));await wait(150);assert.ok(Number(await root().getAttribute('data-time'))>t);
 await page.evaluate(()=>{document.querySelector('#ascii-fixture').style.width='390px';});await wait(100);assert.equal((await pixels()).width,390);
 await root().evaluate(e=>e.dataset.resizeProbe='retained');await page.evaluate(()=>{document.querySelector('#ascii-fixture').style.width='800px';});await wait(100);assert.equal(await root().getAttribute('data-resize-probe'),'retained');
 // Offscreen and hidden-document suspension.
 await page.evaluate(()=>document.querySelector('#ascii-fixture').style.marginTop='2000px');await wait(160);const away=await frame();await wait(150);assert.equal(await frame(),away);
 await page.evaluate(()=>document.querySelector('#ascii-fixture').style.marginTop='0');await wait(150);assert.ok(await frame()>away);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.simulatedHidden});window.simulatedHidden=true;document.dispatchEvent(new Event('visibilitychange'));});await wait(80);const hidden=await frame();await wait(120);assert.equal(await frame(),hidden);
 await page.evaluate(()=>{window.simulatedHidden=false;document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;});await wait(100);assert.ok(await frame()>hidden);
 // Context loss shows a fallback and recovery creates a working replacement renderer.
 await page.evaluate(()=>{window.loss=document.querySelector('canvas').getContext('webgl').getExtension('WEBGL_lose_context');loss.loseContext();});await page.locator('.gradient-ascii[data-renderer=fallback]').waitFor();await wait(150);assert.equal(await page.locator('.ga-fallback').evaluate(e=>getComputedStyle(e).display),'block');await page.evaluate(()=>loss.restoreContext());await page.locator('.gradient-ascii[data-renderer=webgl]').waitFor();await wait(120);assert.ok((await pixels()).alpha>0);
 // Native controls in the parent remain functional and do not create effects.
 await render({paused:false,mouseInteraction:true,clickEffect:'wave'});
 await page.evaluate(()=>{const button=document.createElement('button');button.id='foreground';button.textContent='Foreground action';button.style.cssText='position:absolute;left:200px;top:100px';button.onclick=()=>window.activated=true;document.querySelector('#ascii-fixture').append(button);});
 await page.getByRole('button',{name:'Foreground action'}).click();assert.equal(await page.evaluate(()=>window.activated),true);assert.equal(await root().getAttribute('data-interactions'),'0');
 await page.evaluate(()=>{window.frameRequests=0;const request=requestAnimationFrame;window.requestAnimationFrame=fn=>{frameRequests++;return request(fn);};});await render({paused:false,speed:1});await wait(120);await page.evaluate(()=>fixture.unmount());await wait(80);const requests=await page.evaluate(()=>frameRequests);await wait(180);assert.equal(await page.evaluate(()=>frameRequests),requests,'unmount cancels RAF and font callbacks');
 // Fallback when no WebGL context can be created.
 const fallback=await browser.newPage();fallback.on('pageerror',e=>errors.push(e.message));await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...rest){return type.startsWith('webgl')?null:get.call(this,type,...rest);};});await fallback.goto(`${base}/preview/gradient-ascii?embed=1`,{waitUntil:'networkidle'});await fallback.locator('.gradient-ascii[data-renderer=fallback]').waitFor();assert.equal(await fallback.locator('.ga-fallback').evaluate(e=>getComputedStyle(e).display),'block');await fallback.close();
 // Mobile, high DPR, touch tap and native vertical scrolling.
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(`${base}/preview/gradient-ascii?embed=1&intro=false&speed=0&flicker=0&grain=0&dpr=2`,{waitUntil:'networkidle'});assert.equal(await mobile.locator('canvas').evaluate(e=>e.width),780);await mobile.touchscreen.tap(195,200);await mobile.waitForTimeout(100);assert.ok(Number(await mobile.locator('.gradient-ascii').getAttribute('data-interactions'))>0);assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.screenshot({path:`${dir}/touch.png`});await mobile.evaluate(()=>{const spacer=document.createElement('div');spacer.style.height='1500px';document.body.append(spacer);});const touch=await mobile.context().newCDPSession(mobile);await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:650}]});await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:350}]});await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(150);assert.ok(await mobile.evaluate(()=>scrollY>0),'native touch scrolling is not blocked');await mobile.close();
 // Documentation/customization, generated code, source, downloads and mobile sizing.
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`${base}/components/gradient-ascii`,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Gradient ASCII',exact:true}).waitFor();await page.frameLocator('iframe').locator('.gradient-ascii[data-renderer=webgl]').waitFor();await page.getByRole('button',{name:'Customize',exact:true}).click();
 await page.getByLabel('Color preset',{exact:true}).selectOption('Ember');await page.getByLabel('Shape',{exact:true}).selectOption('eclipse');await page.getByLabel('Character set',{exact:true}).selectOption('Binary');await page.getByRole('slider',{name:'Cell size',exact:true}).fill('24');await page.getByLabel('Click effect',{exact:true}).selectOption('burst');await page.getByRole('switch',{name:'Light background',exact:true}).click();await wait(450);
 const src=await page.locator('iframe').getAttribute('src');assert.ok(src.includes('shape=eclipse')&&src.includes('cellSize=24')&&src.includes('lightMode=true')&&src.includes('clickEffect=burst'));assert.ok((await page.getByRole('link',{name:'Open full-screen preview'}).getAttribute('href')).includes('shape=eclipse'));
 await page.getByRole('button',{name:'Add color'}).click();assert.equal(await page.locator('input[type=color]').count(),5);await page.getByRole('button',{name:'Remove last color'}).click();assert.equal(await page.locator('input[type=color]').count(),4);
 await page.getByRole('tab',{name:'Usage',exact:true}).click();const usage=await page.locator('pre').first().innerText();assert.ok(usage.includes('shape={"eclipse"}')&&usage.includes('cellSize={24}')&&usage.includes('#ff6437')&&usage.includes('lightMode={true}'));
 await page.getByRole('tab',{name:'Component',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('function GradientASCII'));await page.getByRole('tab',{name:'CSS',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('.gradient-ascii'));
 const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download files',exact:true}).click();assert.equal((await download).suggestedFilename(),'gradient-ascii.zip');
 await page.getByRole('tab',{name:'Preview',exact:true}).click();await page.getByRole('button',{name:'Reset',exact:true}).click();await wait(350);assert.equal(await page.getByLabel('Color preset',{exact:true}).inputValue(),'Atmosphere');
 await page.getByRole('button',{name:'Mobile preview',exact:true}).click();await wait(350);const iframe=await page.locator('iframe').boundingBox();assert.ok(iframe.width<=375);await page.setViewportSize({width:390,height:844});await page.goto(`${base}/components/gradient-ascii`,{waitUntil:'networkidle'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#playground').screenshot({path:`${dir}/docs-mobile.png`});
 assert.deepEqual(errors,[]);console.log('PASS Gradient ASCII: four rendered fields, palette/glyph parameters, real transparency, pointer/wave/burst pixels, pause/reduced motion, same renderer on prop changes, resize/DPR, offscreen/hidden suspension, fallback/context recovery, native controls, touch, cleanup, docs/customization/source and ZIP.');
}finally{await browser.close();}
