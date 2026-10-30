import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const browser=await chromium.launch();const base=process.env.TEST_URL||'http://localhost:5173';
const page=await browser.newPage({viewport:{width:1200,height:850}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const stage=()=>page.locator('.image-wheel'),card=i=>page.locator(`[data-card-index="${i}"]`);
const selected=()=>page.locator('.image-wheel__card[aria-current=true]');
const settle=async i=>{await page.waitForFunction(i=>document.querySelector('.image-wheel').dataset.index===String(i),i);await page.waitForTimeout(900);};
try {
 await page.goto(`${base}/preview/image-wheel?embed=1`,{waitUntil:'networkidle'});
 assert.equal(await page.locator('.image-wheel__card').count(),8);
 const ref=JSON.parse(readFileSync('tests/fixtures/image-wheel/initial.json','utf8'));
 for(let i=0;i<8;i++){
  const rect=await card(i).boundingBox();
  for(const key of ['x','y','width','height'])assert.ok(Math.abs(rect[key]-ref.images[i].rect[key])<.03,`reference geometry card ${i}, ${key}`);
 }
 assert.equal(await selected().getAttribute('data-card-index'),'0');assert.equal(await selected().evaluate(e=>e.style.filter),'none');
 assert.equal(await card(1).evaluate(e=>e.style.filter),'blur(0.78px)');assert.equal(await card(2).evaluate(e=>e.style.filter),'blur(2.98px)');
 const initialTransform=await card(0).getAttribute('style');await page.waitForTimeout(700);await page.mouse.move(600,420);await page.waitForTimeout(200);
 assert.equal(await card(0).getAttribute('style'),initialTransform,'no idle or hover autoplay');
 await card(2).click();await settle(2);assert.equal(await selected().evaluate(e=>e.style.filter),'none');
 await page.keyboard.press('ArrowRight');await settle(3);assert.equal(await selected().evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('End');await settle(7);assert.equal(await selected().evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);assert.equal(await stage().getAttribute('data-index'),'7');
 await page.keyboard.press('Home');await settle(0);await page.keyboard.press('ArrowLeft');await page.waitForTimeout(100);assert.equal(await stage().getAttribute('data-index'),'0');
 await page.mouse.move(700,420);await page.mouse.down();await page.mouse.move(400,420,{steps:12});await page.mouse.up();await settle(2);
 await page.mouse.wheel(0,500);await page.waitForTimeout(200);assert.equal(await stage().getAttribute('data-index'),'2');
 await selected().click();assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await stage().getAttribute('data-index'),'2');
 await page.emulateMedia({reducedMotion:'reduce'});await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);
 assert.equal(await stage().getAttribute('data-index'),'3');assert.equal(await selected().evaluate(e=>e.style.filter),'none');assert.notEqual(await card(2).evaluate(e=>e.style.filter),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(`${base}/components/image-wheel`,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Image Wheel',exact:true}).waitFor();
 await page.getByRole('button',{name:'Customize',exact:true}).click();
 for(const [name,value] of [['Card size','210'],['Wheel radius','360'],['Depth blur','0']])await page.getByLabel(name,{exact:true}).fill(value);
 await page.getByRole('switch',{name:'Navigation controls',exact:true}).click();await page.waitForTimeout(400);
 await page.getByRole('tab',{name:'Usage',exact:true}).click();const code=await page.locator('#playground-panel pre').innerText();assert.ok(code.includes('cardSize={210}')&&code.includes('radius={360}')&&code.includes('blur={0}')&&code.includes('showControls={true}'));
 await page.getByRole('tab',{name:'Component',exact:true}).click();assert.ok((await page.locator('#playground-panel pre').innerText()).includes('function ImageWheel'));
 await page.locator('#playground-panel .ms-copy').click();await page.locator('#playground-panel').getByRole('button',{name:'Copied',exact:true}).waitFor();
 await page.getByRole('tab',{name:'CSS',exact:true}).click();assert.ok((await page.locator('#playground-panel pre').innerText()).includes('.image-wheel__card'));
 const dl=page.waitForEvent('download');await page.getByRole('link',{name:'Download files',exact:true}).click();assert.equal((await dl).suggestedFilename(),'image-wheel.zip');
 await page.getByRole('button',{name:'Reset',exact:true}).click();assert.equal(await page.getByLabel('Wheel radius',{exact:true}).inputValue(),'430');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await mobile.goto(`${base}/preview/image-wheel?embed=1&initialIndex=2`,{waitUntil:'networkidle'});
 const mobileRef=JSON.parse(readFileSync('tests/fixtures/image-wheel/mobile.json','utf8'));
 for(let i=0;i<8;i++){const rect=await mobile.locator(`[data-card-index="${i}"]`).boundingBox();for(const k of ['x','y','width','height'])assert.ok(Math.abs(rect[k]-mobileRef.images[i].rect[k])<.04,`mobile reference geometry ${i} ${k}`);}
 await mobile.locator('[data-card-index="3"]').tap();await mobile.waitForTimeout(1000);assert.equal(await mobile.locator('.image-wheel').getAttribute('data-index'),'3');
 const cdp=await mobile.context().newCDPSession(mobile);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:260,y:420}]});for(let i=1;i<=10;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:260-i*11,y:420}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(1000);assert.equal(await mobile.locator('.image-wheel').getAttribute('data-index'),'5');await mobile.close();
 const failed=await browser.newPage();await failed.route('**/parallax-carousel/1.webp',r=>r.abort());await failed.goto(`${base}/preview/image-wheel?embed=1`,{waitUntil:'networkidle'});await failed.locator('[data-card-index="0"] .image-wheel__fallback').waitFor();await failed.close();
 // Exercise exported source directly for empty/single collections and callbacks.
 await page.goto(`${base}/preview/image-wheel?embed=1`,{waitUntil:'networkidle'});await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(async()=>{
  const React=(await import('/node_modules/.vite/deps/react.js')).default;const {createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;const {default:Wheel}=await import('/src/components/ImageWheel.jsx');
  document.querySelector('#root').style.display='none';const host=document.createElement('div');host.id='wheel-test';document.body.append(host);const root=createRoot(host);window.wheelCalls=[];
  window.renderWheel=images=>root.render(React.createElement(Wheel,{images,showControls:true,onSelect:i=>window.wheelCalls.push(['select',i]),onIndexChange:i=>window.wheelCalls.push(['index',i])}));window.renderWheel([]);
 });
 await page.getByText('Add images to start your wheel.',{exact:true}).waitFor();
 await page.evaluate(()=>window.renderWheel([{src:'/parallax-carousel/1.webp',alt:'One'}]));await page.getByRole('button',{name:'One',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Next image',exact:true}).isDisabled(),true);assert.equal(await page.getByRole('button',{name:'Previous image',exact:true}).isDisabled(),true);
 await page.getByRole('button',{name:'One',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.wheelCalls),[['select',0]]);
 await page.evaluate(()=>window.renderWheel([{src:'/parallax-carousel/1.webp',alt:'One'},{src:'/parallax-carousel/2.webp',alt:'Two'}]));await page.getByRole('button',{name:'Next image',exact:true}).click();await page.waitForTimeout(100);assert.ok((await page.evaluate(()=>window.wheelCalls)).some(x=>x[0]==='index'&&x[1]===1));
 await page.evaluate(()=>window.renderWheel([{src:'/parallax-carousel/3.webp',alt:'Three'},{src:'/parallax-carousel/4.webp',alt:'Four'}]));
 await page.getByRole('button',{name:'Four',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Four',exact:true}).evaluate(e=>e.style.opacity),'1');
 assert.deepEqual(errors,[]);
 console.log('PASS: Image Wheel reference geometry desktop/mobile, depth blur, click/drag snap, idle/hover, keyboard/focus/bounds, reduced motion, configuration/source/copy/download, touch, failed images, empty/single items and callbacks.');
}finally{await browser.close();}
