import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const base=process.env.TEST_URL||'http://localhost:5173';
const dir='test-artifacts/hover-members';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const root=()=>page.locator('.hover-members');
const selected=()=>page.locator('.hm-profile[aria-pressed=true]');
const near=(a,b,t=.3)=>assert.ok(Math.abs(a-b)<t,`${a} should be near ${b}`);
const settle=()=>page.waitForTimeout(1200);
const open=async(query='')=>{await page.goto(`${base}/preview/hover-members?embed=1${query}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);};
const sample=async(duration=420)=>page.evaluate(duration=>new Promise(resolve=>{
  const start=performance.now(),frames=[];
  function tick(){frames.push({t:performance.now()-start,layers:[...document.querySelectorAll('.hm-word')].map(e=>({text:e.innerText,active:e.dataset.active,base:e.dataset.default,ys:[...e.querySelectorAll('.hm-letters>span')].map(s=>new DOMMatrix(getComputedStyle(s).transform).m42/s.getBoundingClientRect().height*100)}))});if(performance.now()-start<duration)requestAnimationFrame(tick);else resolve(frames)}requestAnimationFrame(tick);
}),duration);
try{
  await open();
  assert.equal(await page.locator('.hm-profile').count(),9);assert.equal(await selected().count(),0);
  assert.equal((await page.locator('.hm-word').innerText()).replace(/\u00a0/g,' '),'OUR TEAM');
  assert.equal(await root().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(18, 18, 18)');
  const thumb=await page.locator('.hm-profile img').first().boundingBox();near(thumb.x,455);near(thumb.y,125);near(thumb.width,50);
  const windowBox=await page.locator('.hm-text-window').boundingBox();near(windowBox.y,291.6);near(windowBox.height,316.8);
  near(await page.locator('.hm-word').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)),403.2);
  assert.ok(await page.locator('.hm-profile img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)));
  await page.screenshot({path:`${dir}/desktop.png`});
  // Initial default exits upward, incoming member arrives from below, with center-out delays.
  await page.mouse.move(480,150);const frames=await sample();
  const early=frames.find(s=>s.t>65);const old=early.layers.find(l=>l.base==='true');const incoming=early.layers.find(l=>l.active==='true');
  assert.ok(old.ys[4]<-15&&Math.abs(old.ys[0])<1,'middle default letter exits first; edges wait');
  assert.ok(incoming.ys[2]<85&&incoming.ys[0]>95,'member center enters before its edges');
  assert.ok(frames.some(s=>s.layers.some(l=>l.active==='true'&&l.ys.some(y=>y>10&&y<90))),'real vertical movement, not a text swap');
  await settle();assert.equal(await root().getAttribute('data-active-index'),'0');assert.equal(await selected().getAttribute('aria-label'),'faffa');
  const expanded=await selected().boundingBox();near(expanded.width,120);near(expanded.height,120);near(expanded.x,420);near(expanded.y,90);
  assert.equal(await page.locator('.hm-word').count(),1);assert.equal(await page.locator('.hm-word').evaluate(e=>getComputedStyle(e).color),'rgb(251, 44, 54)');
  const circle=await page.locator('.hm-cursor').boundingBox();near(circle.width,120);near(circle.x,450,1);near(circle.y,150,1);
  await page.screenshot({path:`${dir}/hover.png`});
  // Neighbor switch: outgoing member moves DOWN; incoming member moves UP.
  await page.mouse.move(690,150);const switchFrames=await sample(250);
  assert.ok(switchFrames.some(s=>s.layers.some(l=>l.text.toLowerCase()==='faffa'&&l.ys[2]>10)),'outgoing member retreats downward');
  const half=await page.locator('.hm-cursor').boundingBox();assert.ok(half.x>450&&half.x<690,'follower lags instead of snapping');
  await settle();near((await page.locator('.hm-cursor').boundingBox()).x,690,2);
  assert.equal(await selected().getAttribute('aria-label'),'Bamb');
  // Leaving returns the default from above, not from below.
  await page.mouse.move(1200,700);const exitFrames=await sample(250);
  assert.ok(exitFrames.some(s=>s.layers.some(l=>l.base==='true'&&l.ys[4]<-1&&l.ys[4]>-99)),'default returns from above');
  await settle();assert.equal(await selected().count(),0);assert.equal((await page.locator('.hm-word').innerText()).replace(/\u00a0/g,' '),'OUR TEAM');
  assert.equal(await page.locator('.hm-cursor').getAttribute('data-visible'),'false');
  // Rapid alternation remains bounded and resolves to a single correct layer.
  for(let i=0;i<12;i++){
    const n=i%2?8:0;const b=await page.locator('.hm-profile').nth(n).boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.waitForTimeout(35);
    assert.ok(await page.locator('.hm-word').count()<=3);
  }
  await page.locator('.hm-profile').first().hover();await settle();assert.equal(await page.locator('.hm-word').count(),1);assert.equal((await page.locator('.hm-word').innerText()).toLowerCase(),'faffa');
  await page.mouse.move(1200,700);await settle();
  await page.keyboard.press('Tab');assert.equal(await selected().getAttribute('aria-label'),'faffa');
  await page.keyboard.press('ArrowRight');assert.equal(await selected().getAttribute('aria-label'),'kaint');
  await page.keyboard.press('End');assert.equal(await selected().getAttribute('aria-label'),'Khatam');
  await page.keyboard.press('Home');assert.equal(await selected().getAttribute('aria-label'),'faffa');
  await page.keyboard.press('Escape');await settle();assert.equal(await selected().count(),0);
  // Visible lettering is hidden from AT; one live heading exposes the selection.
  assert.equal(await page.locator('h2[aria-live=polite]').count(),1);
  assert.ok(await page.locator('.hm-word').evaluateAll(es=>es.every(e=>e.getAttribute('aria-hidden')==='true')));
  // Reduced motion is instantaneous and disables the custom pointer.
  await page.emulateMedia({reducedMotion:'reduce'});await open();await page.locator('.hm-profile').first().hover();await page.waitForTimeout(80);
  near((await selected().boundingBox()).width,120);assert.equal(await page.locator('.hm-word').count(),1);
  assert.equal(await page.locator('.hm-word .hm-letters>span').first().evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m42),0);
  assert.equal(await page.locator('.hm-cursor').isVisible(),false);
  await page.emulateMedia({reducedMotion:'no-preference'});
  // Real touch: two compact rows, tap selects, tap again / background resets.
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(`${base}/preview/hover-members?embed=1`,{waitUntil:'networkidle'});await mobile.evaluate(()=>document.fonts.ready);
  const mobileFirst=await mobile.locator('.hm-profile img').first().boundingBox();near(mobileFirst.x,47.5);near(mobileFirst.y,86.9);near(mobileFirst.width,55);
  assert.ok((await mobile.locator('.hm-profile img').nth(5).boundingBox()).y>mobileFirst.y+50);
  await mobile.screenshot({path:`${dir}/mobile.png`});
  await mobile.locator('.hm-profile').first().tap();await mobile.waitForTimeout(300);assert.equal(await mobile.locator('.hover-members').getAttribute('data-active-index'),'0');
  assert.equal(await mobile.locator('.hm-cursor').getAttribute('data-visible'),'false');
  await mobile.locator('.hm-profile').first().tap();await mobile.waitForTimeout(100);assert.equal(await mobile.locator('.hover-members').getAttribute('data-active-index'),'');
  await mobile.locator('.hm-profile').nth(3).tap();await mobile.touchscreen.tap(350,700);await mobile.waitForTimeout(100);assert.equal(await mobile.locator('.hover-members').getAttribute('data-active-index'),'');
  assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.close();
  // Fixture: long names, data updates, callbacks, missing portraits, empty lists and cleanup.
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    document.getElementById('root').remove();const host=document.createElement('div');document.body.append(host);
    const React=(await import('/node_modules/.vite/deps/react.js')).default;
    const{createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;
    const{default:Members}=await import('/src/components/HoverMembers.jsx');window.memberRoot=createRoot(host);window.activeCalls=[];window.selectCalls=[];
    window.renderMembers=(props={})=>window.memberRoot.render(React.createElement(Members,{height:900,onActiveChange:i=>activeCalls.push(i),onMemberSelect:i=>selectCalls.push(i),...props}));
    window.renderMembers();
  });
  await page.locator('.hm-word').waitFor();assert.equal(await page.locator('.hm-profile').count(),0);assert.deepEqual(await page.evaluate(()=>activeCalls),[]);
  await page.evaluate(()=>renderMembers({defaultName:'A VERY LONG HEADING THAT STILL FITS',teamMembers:[{id:'a',name:'Avery Alexandra Montgomery',image:'/missing-hover-member.webp'}]}));
  await page.locator('.hm-avatar-fallback').waitFor();await page.waitForTimeout(100);
  assert.ok(await page.locator('.hm-letters').first().evaluate(e=>e.getBoundingClientRect().width<innerWidth*.95),'long heading fits');
  await page.locator('.hm-profile').click();await settle();assert.deepEqual(await page.evaluate(()=>selectCalls),[0]);assert.equal((await page.evaluate(()=>activeCalls)).filter(i=>i===0).length,1);
  assert.ok(await page.locator('.hm-letters').first().evaluate(e=>e.getBoundingClientRect().width<innerWidth*.95),'long member name fits');
  await page.evaluate(()=>renderMembers({defaultName:'A DIFFERENT EXTREMELY LONG HEADING THAT FITS TOO',teamMembers:[]}));await settle();
  assert.equal(await page.locator('.hm-profile').count(),0);assert.ok(await page.locator('.hm-letters').evaluate(e=>e.getBoundingClientRect().width<innerWidth*.95));
  await page.evaluate(()=>memberRoot.unmount());assert.equal(await root().count(),0);
  // Docs and customization keep the Usage tab and full-screen link synchronized.
  await page.goto(`${base}/components/hover-members`,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Hover Members',exact:true}).waitFor();
  await page.frameLocator('iframe').locator('.hover-members').waitFor();await page.getByRole('button',{name:'Customize',exact:true}).click();
  await page.getByLabel('Default heading',{exact:true}).fill('OUR TEAM');await page.getByRole('switch',{name:'Pointer follower',exact:true}).click();await page.waitForTimeout(500);
  assert.ok((await page.locator('iframe').getAttribute('src')).includes('showCursor=false'));
  await page.getByRole('tab',{name:'Usage',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('OUR TEAM'));
  await page.getByRole('tab',{name:'Component',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('function HoverMembers'));
  await page.getByRole('tab',{name:'CSS',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('Thunder-BlackLC.otf'));
  const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download files',exact:true}).click();assert.equal((await download).suggestedFilename(),'hover-members.zip');
  await page.setViewportSize({width:390,height:844});await page.getByRole('tab',{name:'Preview',exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log('PASS Hover Members: reference geometry/font, center-out letter wave, outgoing/return directions, portrait reflow, cursor lag, rapid interruption, keyboard/touch, reduced motion, long text/fallbacks/callbacks, docs/customization/source and ZIP.');
}finally{await browser.close();}
