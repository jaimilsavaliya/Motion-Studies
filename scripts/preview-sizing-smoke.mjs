import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const base=process.env.TEST_URL||'http://localhost:5173';
const dir='test-artifacts/preview-sizing';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const near=(a,b,message)=>assert.ok(Math.abs(a-b)<1,`${message}: ${a} vs ${b}`);
async function verify(frame,selector,height=530){
 await frame.locator(selector).waitFor();
 const sizes=await frame.locator(selector).evaluate(stage=>{
  const rect=stage.getBoundingClientRect(),main=stage.parentElement,s=getComputedStyle(main);
  return {x:rect.x,y:rect.y,width:rect.width,height:rect.height,vw:innerWidth,vh:innerHeight,gutter:parseFloat(s.paddingLeft),
   overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,
   display:s.display,fluid:stage.dataset.fluid};
 });
 assert.equal(sizes.fluid,'true');assert.equal(sizes.display,'flex');assert.equal(sizes.overflow,false);
 near(sizes.x,sizes.gutter,'left gutter');near(sizes.vw-sizes.x-sizes.width,sizes.gutter,'right gutter');
 near(sizes.width,sizes.vw-2*sizes.gutter,'stage fills available width');near(sizes.height,height,'configured height');
 near(sizes.y,(sizes.vh-height)/2,'vertical centering');
 if(selector==='.de-showcase'){
  const contained=await frame.locator(selector).evaluate(stage=>{
   const bounds=stage.getBoundingClientRect(),title=stage.querySelector('.de-memory-title');
   const range=document.createRange();range.selectNodeContents(title);const text=range.getBoundingClientRect();
   return [text,...[...stage.querySelectorAll('.de-demo-photo')].map(e=>e.getBoundingClientRect())]
    .every(r=>r.left>=bounds.left&&r.right<=bounds.right&&r.top>=bounds.top&&r.bottom<=bounds.bottom);
  });assert.ok(contained,'initial photo stack and caption stay inside the stage');
 }else{
  const inside=await frame.locator('.msp-controls').evaluate(e=>{const a=e.getBoundingClientRect(),b=e.closest('.msp-demo').getBoundingClientRect();return a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom;});
  assert.ok(inside,'marquee controls are visible inside the stage');
  assert.equal(await frame.locator('.msp-item').count(),26);
 }
}
try{
 for(const [slug,selector] of [['drag-elements','.de-showcase'],['marquee-along-svg-path','.msp-demo']]){
  for(const width of [1920,1440,1100,820,390]){
   await page.setViewportSize({width,height:1000});
   await page.goto(`${base}/components/${slug}`,{waitUntil:'networkidle'});
   const frame=page.frameLocator('iframe');await verify(frame,selector);
   if(width===1440||width===390)await page.locator('#playground').screenshot({path:`${dir}/${slug}-${width}.png`});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.getByRole('button',{name:'Mobile preview',exact:true}).click();await page.waitForTimeout(350);await verify(frame,selector);
   await page.getByRole('button',{name:'Desktop preview',exact:true}).click();await page.waitForTimeout(350);await verify(frame,selector);
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(`${base}/components/${slug}`,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Customize',exact:true}).click();
  for(const height of [360,800]){
   await page.getByRole('slider',{name:'Stage height',exact:true}).fill(String(height));
   await page.waitForTimeout(400);await verify(page.frameLocator('iframe'),selector,height);
  }
  console.log(`PASS ${slug}: fluid desktop/mobile framing, centered composition, no overflow, custom heights`);
 }
 // Resizing a live embedded demo must not reset its interaction state.
 await page.goto(`${base}/components/drag-elements`,{waitUntil:'networkidle'});
 const frame=page.frameLocator('iframe');await frame.locator('.de-item').last().focus();await page.keyboard.press('ArrowLeft');
 const x=await frame.locator('.de-item').last().getAttribute('data-x');
 await page.getByRole('button',{name:'Mobile preview',exact:true}).click();await page.waitForTimeout(350);
 assert.equal(await frame.locator('.de-item').last().getAttribute('data-x'),x);
 // Framing must not depend on the global library's late preview rules.
 await frame.locator('.ms-demo-preview-stage').evaluate(e=>{for(const sheet of [...document.styleSheets]){try{for(let i=sheet.cssRules.length-1;i>=0;i--)if(sheet.cssRules[i].cssText.includes('.ms-drag-preview'))sheet.deleteRule(i);}catch{}}});
 await verify(frame,'.de-showcase');
 assert.deepEqual(errors,[]);console.log('PASS preview sizing: 5 screen widths, desktop/mobile switches, custom heights, preserved drag state, local framing, no browser errors.');
}finally{await browser.close();}
