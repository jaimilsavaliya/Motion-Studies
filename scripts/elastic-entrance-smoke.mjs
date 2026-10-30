import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const base=process.env.TEST_URL||'http://localhost:5173';
const folder='test-artifacts/elastic-carousel/corrected-entrance';mkdirSync(folder,{recursive:true});
try {
 for (const mobile of [false,true]) {
  const p=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1200,height:850}});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.clock.install({time:0});await p.clock.pauseAt(0);
  await p.goto(`${base}/preview/elastic-carousel?embed=1`,{waitUntil:'networkidle'});
  let previous=0;const samples=[];
  for(const t of [0,300,500,1000,1500,2000,2150,2450,3500,4200]){
   await p.clock.runFor(t-previous);previous=t;
   const state=await p.locator('.elastic-carousel').evaluate(e=>({
    renderer:e.dataset.renderer,
    caption:Number(e.style.getPropertyValue('--elastic-reveal')),
    cards:[...e.querySelectorAll('.elastic-carousel__card')].filter(c=>+c.dataset.logical>=0&&+c.dataset.logical<8).map(c=>({name:c.getAttribute('aria-label'),opacity:Number(c.style.opacity),width:parseFloat(c.style.width),height:parseFloat(c.style.height),left:parseFloat(c.style.left),smear:parseFloat(c.style.getPropertyValue('--elastic-smear'))})).sort((a,b)=>a.left-b.left)
   }));samples.push({t,...state});
   if([500,1500,2150,2450,4200].includes(t))await p.screenshot({path:`${folder}/${mobile?'mobile':'desktop'}-${t}.png`});
  }
  writeFileSync(`${folder}/${mobile?'mobile':'desktop'}.json`,JSON.stringify(samples,null,2));
  const at=t=>samples.find(s=>s.t===t);
  assert.equal(at(500).renderer,'webgl');
  assert.ok(at(300).cards[0].opacity>0&&at(300).cards[0].opacity<1);
  assert.equal(at(300).cards[1].opacity,0,'second thumbnail must wait for its stagger');
  assert.ok(at(500).cards[0].opacity>at(500).cards[1].opacity&&at(500).cards[1].opacity>at(500).cards[2].opacity);
  assert.equal(at(500).cards[3].opacity,0,'later thumbnails must not appear all at once');
  assert.ok(at(1500).cards.every(c=>c.opacity>.97),'completed strip should be held');
  assert.equal(at(2000).caption,0,'caption stays hidden during thumbnail hold');
  assert.ok(Math.abs(at(2000).cards[3].height-(mobile?38.4:64))<.01);
  assert.ok(Math.abs(at(2000).cards[3].width-(mobile?25.6:64*2/3))<.01);
  assert.equal(at(2150).caption,1,'caption enters with the expansion, not during the strip');
  assert.ok(at(2150).cards[3].height>at(2000).cards[3].height);
  assert.ok(at(2150).cards.some(c=>c.smear>2),'expansion must create blur even without dragging');
  assert.ok(at(2450).cards[3].height>at(2150).cards[3].height);
  assert.ok(at(4200).cards.every(c=>c.smear===0),'reel must settle sharp');
  assert.ok(at(4200).cards.every(c=>c.height===(mobile?202:336)));
  assert.deepEqual(errors,[]);await p.close();
 }
 console.log('PASS: desktop/mobile staggered thumbnail scale/fade, compact sizing, held strip, delayed expansion/caption, entrance-driven blur, and sharp settled reel.');
}finally{await browser.close();}
