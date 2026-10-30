import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const base = process.env.TEST_URL || 'http://localhost:5173';
const dir = 'test-artifacts/tik-tik-color-list'; mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const stage = () => page.locator('.tik-tik-color-list');
const scroll = () => page.locator('.tik-scroller');
const image = () => page.locator('.tik-preview');
const index = async () => Number(await stage().getAttribute('data-active-index'));
const near = (a, b, tolerance = .15) => assert.ok(Math.abs(a - b) < tolerance, `${a} should be near ${b}`);
const settle = () => page.waitForTimeout(700);
const open = async (query = '') => { await page.goto(`${base}/preview/tik-tik-color-list?embed=1${query}`, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); await settle(); };
const yTo = async y => { await scroll().evaluate((e, y) => { e.scrollTop = y; }, y); await page.waitForTimeout(70); };
const dragImage = async () => {
  const box = await image().boundingBox();
  await page.mouse.move(box.x + 200, box.y + 200); await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(box.x + 200 - i * 12, box.y + 200 - i * 4); await page.waitForTimeout(18); }
  const held = await image().boundingBox(); near(held.x, box.x - 96, .5); near(held.y, box.y - 32, .5);
  await page.mouse.up(); return held;
};
try {
  await open();
  assert.equal(await index(), 5);
  assert.equal(await stage().evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(16, 185, 129)');
  const box = await image().boundingBox(); near(box.x, 1000); near(box.y, 460); near(box.width, 400); near(box.height, 400);
  assert.equal(await page.locator('.tik-preview img').getAttribute('alt'), 'Fading Memories');
  assert.ok(await page.locator('.tik-preview img').evaluate(e => e.complete && e.naturalWidth > 0));
  assert.equal(await page.locator('.tik-name').first().evaluate(e => getComputedStyle(e).fontSize), '72px');
  near(await page.locator('.tik-row').first().evaluate(e => e.getBoundingClientRect().height), 88);
  assert.equal(await page.locator('.tik-list>li[aria-hidden=false]').count(), 12);
  assert.equal(await page.locator('.tik-row[tabindex="0"]').count(), 1);
  await page.screenshot({ path: `${dir}/desktop.png` });
  const origin = await scroll().evaluate(e => e.scrollTop);
  for (const [y, expected] of [[40,5],[42,5],[44,6],[500,10],[800,0],[760,0],[720,0],[680,0],[650,0],[648,0],[646,11],[600,11],[500,10],[400,9],[200,8],[80,6],[0,6]]) {
    await yTo(origin + y); assert.equal(await index(), expected, `reference entry at offset ${y}`);
  }
  // Direction reversal inside the dead band must not flash a different image.
  await yTo(origin + 1); assert.equal(await index(), 6);
  await yTo(origin + 20); assert.equal(await index(), 6);
  const beforeHover = await index(); await page.mouse.move(160,255); await page.waitForTimeout(100); assert.equal(await index(), beforeHover);
  // Real wheel input and synchronized color/image.
  await page.mouse.move(450,500); await page.mouse.wheel(0,500); await settle();
  assert.equal(await index(), 10); assert.equal(await stage().evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(255, 255, 255)');
  assert.equal(await page.locator('.tik-preview img').getAttribute('alt'), 'Invisible Threads');
  await page.screenshot({ path: `${dir}/scrolled.png` });
  // Sample transitions rather than only checking their end state.
  const samples = await scroll().evaluate(e => new Promise(resolve => {
    const rows = document.querySelector('.tik-tik-color-list'), start = performance.now(), result = [];
    e.scrollTop += 200;
    function frame() { result.push({ t: performance.now() - start, bg: getComputedStyle(rows).backgroundColor, opacity: getComputedStyle(rows.querySelector('[aria-current=true]')).opacity }); if (performance.now() - start < 720) requestAnimationFrame(frame); else resolve(result); }
    requestAnimationFrame(frame);
  }));
  assert.ok(new Set(samples.map(s => s.bg)).size > 8, 'background genuinely interpolates');
  assert.ok(samples.some(s => +s.opacity > .2 && +s.opacity < .99), 'selected text fades rather than snapping');
  // Bounded DOM and stable visual continuity through forward/backward recentering.
  const rowCount = await page.locator('.tik-row').count();
  for (const direction of [1,1,1,-1,-1,-1]) {
    await scroll().evaluate((e, direction) => { e.scrollTop = direction > 0 ? e.scrollHeight - e.clientHeight - 990 : 990; }, direction);
    await page.waitForTimeout(100);
    const info = await scroll().evaluate(e => ({ y: e.scrollTop, max: e.scrollHeight - e.clientHeight }));
    assert.ok(info.y > 1000 && info.y < info.max - 1000, 'loop recenters away from its boundaries');
    assert.equal(await page.locator('.tik-row').count(), rowCount);
    assert.equal(await page.locator('.tik-row[aria-current=true]').count(), 1);
  }
  // Direct dragging, time-based coasting, persistent position, Escape recovery.
  const held = await dragImage(); await page.waitForTimeout(240); const coast = await image().boundingBox();
  assert.ok(coast.x < held.x - 20 && coast.y < held.y - 5, 'preview continues in the release direction');
  const offset = await image().evaluate(e => getComputedStyle(e).transform); await page.mouse.move(450,500); await page.mouse.wheel(0,400); await page.waitForTimeout(100);
  assert.notEqual(await image().evaluate(e => getComputedStyle(e).transform), 'none');
  assert.notEqual(offset, 'matrix(1, 0, 0, 1, 0, 0)');
  await scroll().focus(); await page.keyboard.press('Escape'); near((await image().boundingBox()).x, 1000);
  await image().focus(); await page.keyboard.press('ArrowLeft'); near((await image().boundingBox()).x, 980);
  await page.keyboard.press('Enter'); near((await image().boundingBox()).x, 1000);
  // Wheel input still scrolls when the pointer is over the floating image.
  const oldY = await scroll().evaluate(e => e.scrollTop); await page.mouse.move(1200,700); await page.mouse.wheel(0,150); await page.waitForTimeout(150);
  assert.ok((await scroll().evaluate(e => e.scrollTop)) > oldY);
  await scroll().focus(); const oldIndex = await index(); await page.keyboard.press('ArrowDown'); await settle();
  assert.equal(await index(), (oldIndex + 1) % 12); assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('tik-row')), true);
  await page.keyboard.press('Home'); await settle(); assert.equal(await index(), 0);
  await page.keyboard.press('End'); await settle(); assert.equal(await index(), 11);
  assert.equal(await page.evaluate(() => document.activeElement?.closest('li')?.getAttribute('aria-hidden')), 'false');
  // Preview sizing, finite mode and keyboard reachability of both ends.
  await open('&previewSize=sm&infiniteScroll=false'); near((await image().boundingBox()).width, 240);
  assert.equal(await index(), 0); assert.equal(await page.locator('.tik-row').count(), 12);
  await scroll().focus(); await page.keyboard.press('End'); await settle(); assert.equal(await index(), 11);
  await page.keyboard.press('Home'); await settle(); assert.equal(await index(), 0);
  await open('&showPreview=false'); assert.equal(await image().count(), 0);
  // Mobile geometry, native touch scrolling, no horizontal overflow or floating image.
  await page.setViewportSize({ width: 390, height: 844 }); await open(); assert.equal(await index(), 7);
  assert.equal(await image().isVisible(), false); near(await page.locator('.tik-row').first().evaluate(e => e.getBoundingClientRect().height), 56);
  assert.equal(await page.locator('.tik-name').first().evaluate(e => getComputedStyle(e).fontSize), '36px');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: `${dir}/mobile.png` });
  const mobileOrigin = await scroll().evaluate(e => e.scrollTop);
  for (const [y,expected] of [[400,0],[340,0],[332,0],[330,11],[260,11],[240,10],[20,8],[0,7]]) { await yTo(mobileOrigin+y); assert.equal(await index(),expected); }
  const session = await page.context().newCDPSession(page);
  const touchStart = await scroll().evaluate(e => e.scrollTop);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:700}]});
  for(let y=680;y>=360;y-=40){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y}]});await page.waitForTimeout(18);}
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await page.waitForTimeout(200);
  assert.ok((await scroll().evaluate(e=>e.scrollTop))>touchStart,'touch scroll is native and responsive');
  // Reduced motion preserves direct input but eliminates release momentum and fades.
  await page.setViewportSize({ width:1440, height:900 }); await page.emulateMedia({ reducedMotion:'reduce' }); await open();
  assert.equal(await stage().evaluate(e => getComputedStyle(e).transitionDuration),'0s');
  const reducedHeld = await dragImage(); await page.waitForTimeout(300); near((await image().boundingBox()).x, reducedHeld.x,.5);
  await scroll().focus(); await page.keyboard.press('Escape'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60); assert.equal(await index(),6);
  await page.emulateMedia({ reducedMotion:'no-preference' });
  // Fixture: callbacks, empty/single data, broken images, dynamic data and cleanup.
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    document.getElementById('root').remove(); const host=document.createElement('div');document.body.append(host);
    const React=(await import('/node_modules/.vite/deps/react.js')).default;const {createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;const {default:List}=await import('/src/components/TikTikColorList.jsx');
    window.tikEvents=[];window.tikSelect=[];window.tikRoot=createRoot(host);
    window.renderTik=(projects)=>window.tikRoot.render(React.createElement(List,{projects,height:900,onActiveChange:(i,p)=>window.tikEvents.push([i,p.name]),onSelect:(i,p)=>window.tikSelect.push([i,p.name])}));
    window.renderTik([]);
  });
  await page.getByText('No projects yet.').waitFor(); assert.equal(await index(),-1);
  await page.evaluate(()=>window.renderTik([{id:'one',name:'Only project',badge:'Test',bgColor:'#10b981',image:'/missing-tik-image.jpg'}]));
  await page.locator('.tik-image-fallback').waitFor(); assert.equal(await page.locator('.tik-row').count(),1); assert.equal(await stage().getAttribute('data-looping'),'false');
  assert.deepEqual(await page.evaluate(()=>window.tikEvents),[[0,'Only project']]);
  await page.locator('.tik-row').click(); assert.deepEqual(await page.evaluate(()=>window.tikSelect),[[0,'Only project']]);
  await page.evaluate(()=>window.renderTik(Array.from({length:12},(_,i)=>({id:i,name:`Project ${i}`,badge:'Test',bgColor:'#fff',image:'/tik-tik-color-list/1.webp'}))));
  await page.waitForTimeout(150); assert.equal(await index(),5); assert.equal(await page.locator('.tik-row').count(),84);
  await page.evaluate(()=>window.tikRoot.unmount()); await page.waitForTimeout(100); assert.equal(await stage().count(),0);
  // Audio is genuinely opt-in and runs only after a user gesture.
  const audioPage=await browser.newPage({viewport:{width:1440,height:900}});
  await audioPage.addInitScript(()=>{
    window.audioCalls={created:0,played:0};const Native=window.AudioContext;
    if(Native)window.AudioContext=class extends Native{constructor(...args){super(...args);window.audioCalls.created++;}createOscillator(){window.audioCalls.played++;return super.createOscillator();}createBufferSource(){window.audioCalls.played++;return super.createBufferSource();}};
  });
  await audioPage.goto(`${base}/preview/tik-tik-color-list?embed=1`,{waitUntil:'networkidle'});await audioPage.mouse.click(900,20);assert.equal(await audioPage.evaluate(()=>audioCalls.created),0);
  await audioPage.goto(`${base}/preview/tik-tik-color-list?embed=1&enableSound=true`,{waitUntil:'networkidle'});assert.equal(await audioPage.evaluate(()=>audioCalls.created),0);
  await audioPage.locator('.tik-scroller').focus();await audioPage.keyboard.press('ArrowDown');await audioPage.waitForTimeout(900);
  assert.equal(await audioPage.evaluate(()=>audioCalls.created),1);assert.ok(await audioPage.evaluate(()=>audioCalls.played)>0);await audioPage.close();
  // Full documentation/playground integration and downloadable source.
  await page.goto(`${base}/components/tik-tik-color-list`,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Tik Tik Color List',exact:true}).waitFor();
  await page.frameLocator('iframe').locator('.tik-tik-color-list').waitFor();await page.getByRole('button',{name:'Customize',exact:true}).click();
  await page.getByLabel('Preview size',{exact:true}).selectOption('md');await page.waitForTimeout(500);
  assert.ok((await page.locator('iframe').getAttribute('src')).includes('previewSize=md'));
  await page.getByRole('switch',{name:'Infinite scrolling',exact:true}).click();await page.waitForTimeout(500);
  assert.ok((await page.locator('iframe').getAttribute('src')).includes('infiniteScroll=false'));
  await page.getByRole('tab',{name:'Usage',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('previewSize="md"'));
  await page.getByRole('tab',{name:'Component',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('function TikTikColorList'));
  await page.getByRole('tab',{name:'CSS',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('@font-face'));
  const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download files',exact:true}).click();assert.equal((await download).suggestedFilename(),'tik-tik-color-list.zip');
  await page.setViewportSize({width:390,height:844});await page.getByRole('tab',{name:'Preview',exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log('PASS Tik Tik Color List: reference geometry, directional entry thresholds, live fades/colors/images, bounded loops, drag/momentum/reset, keyboard, mobile/touch, reduced motion, callbacks/fallbacks, opt-in sound, customization, source and ZIP.');
} finally { await browser.close(); }
