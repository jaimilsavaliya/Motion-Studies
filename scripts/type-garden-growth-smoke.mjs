import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch(),base=process.env.TEST_URL||'http://localhost:5173';
const results=[];
try{
 for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1200,height:850},hasTouch:mobile});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:0});await page.clock.pauseAt(0);
  await page.goto(`${base}/preview/type-garden`,{waitUntil:'networkidle'});await page.clock.runFor(1000);
  const pixels=()=>page.locator('canvas').evaluate(c=>{
    const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let red=0,blue=0,white=0,bodyLeft=c.width,whiteAbove=0,hash=0;
    for(let i=0;i<data.length;i+=4){const [r,g,b]=data.slice(i,i+3),x=i/4%c.width,y=Math.floor(i/4/c.width);hash=(hash*31+r+g+b)>>>0;
      if(r>150&&g<90&&b<90)red++;
      if(b>160&&r<100&&g<160)blue++;
      if(r>200&&g>200&&b>200){white++;if(y>c.height*.45&&y<c.height*.6)bodyLeft=Math.min(x,bodyLeft);if(y<300&&x>480&&x<670)whiteAbove++;}
    }
    return {red,blue,white,bodyLeft,whiteAbove,hash};
  });
  await page.keyboard.type('a');let previous=0;const timeline={};
  for(const ms of [32,100,240,400,600,900,1600]){await page.clock.runFor(ms-previous);previous=ms;timeline[ms]=await pixels();}
  assert.ok(timeline[32].white>timeline[100].white*.8,'letter should resolve promptly, not slowly scale/fade in');
  for(const ms of [32,100,240,400])assert.equal(timeline[ms].red,0,`buds should not appear at ${ms}ms`);
  assert.ok(timeline[100].blue>0&&timeline[240].blue>timeline[100].blue&&timeline[400].blue>timeline[240].blue,'stems trace forward before flowers open');
  assert.ok(timeline[600].red>0&&timeline[900].red>timeline[600].red,'delayed flower opening');
  assert.ok(timeline[900].red>timeline[1600].red*1.05,'bud overshoot should settle rather than growing monotonically');
  if(!mobile){assert.equal(timeline[600].whiteAbove,0,'petal lines wait for the bud');assert.ok(timeline[1600].whiteAbove>timeline[900].whiteAbove,'petal details finish after opening');}
  const before=await pixels();await page.keyboard.type('b');assert.equal((await pixels()).hash,before.hash,'editing must not clear the existing canvas between frames');
  await page.clock.runFor(32);const early=await pixels();await page.clock.runFor(368);const settled=await pixels();
  assert.ok(before.bodyLeft>early.bodyLeft&&early.bodyLeft>settled.bodyLeft+8,'existing letter should glide to its new position');
  await page.clock.runFor(1400);const mature=await pixels();await page.keyboard.press('Backspace');assert.equal((await pixels()).hash,mature.hash);
  await page.clock.runFor(32);const earlyDelete=await pixels();await page.clock.runFor(768);const finishedDelete=await pixels();
  assert.ok(earlyDelete.bodyLeft<finishedDelete.bodyLeft-8,'deletion should also re-center smoothly');
  assert.equal(await page.getByLabel('Type to grow a garden').inputValue(),'a');
  await page.keyboard.type(' long words keep growing');await page.clock.runFor(1800);assert.ok((await pixels()).red>0,'rapid typing and automatic type-size fitting stay usable');
  await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(100);const still=await pixels();await page.clock.runFor(100);assert.equal((await pixels()).hash,still.hash,'reduced motion must stay static within a caret interval');
  await page.keyboard.press('Enter');await page.clock.runFor(100);assert.equal((await pixels()).red,0);
  assert.deepEqual(errors,[]);results.push({mobile,timeline});await page.close();
 }
 console.log('PASS: desktop/mobile prompt lettering, smooth recentering, no cleared edit frames, stem-first growth, delayed overshooting buds, late petal details, deletion, rapid typing/type fitting and reduced motion.');
}finally{await browser.close();}
