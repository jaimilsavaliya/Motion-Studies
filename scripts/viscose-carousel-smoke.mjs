import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const base=process.env.TEST_URL||'http://localhost:5173';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1000,height:700},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',error=>errors.push(`page: ${error.message}`));
page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text()}`);});

const host=()=>page.locator('.viscose-original');
const activeProject=()=>page.locator('.viscose-original ul li').evaluateAll(items=>items.map(item=>({name:item.textContent?.trim(),opacity:Number(getComputedStyle(item).opacity)})).filter(item=>item.opacity>.72).sort((a,b)=>b.opacity-a.opacity)[0]?.name||'');
const wait=milliseconds=>page.waitForTimeout(milliseconds);
const waitForSettled=async(target=page)=>{
 await target.locator('.viscose-original canvas').waitFor({timeout:15000});
 await target.waitForFunction(()=>{
  const list=document.querySelector('.viscose-original > ul');
  const stage=document.querySelector('.viscose-original');
  if(!list||!stage)return false;
  const labels=[...list.querySelectorAll('li')];
  return Number(getComputedStyle(list).opacity)>.92&&labels.some(label=>Number(getComputedStyle(label).opacity)>.72);
 },null,{timeout:45000});
};

try{
 // The adapted upstream runtime: mount, wait through the original seed entry,
 // then exercise the native wheel/drag/select/open/close path.
 await page.goto(`${base}/preview/viscose-carousel?embed=1&smoke=upstream`,{waitUntil:'domcontentloaded'});
 await waitForSettled();
 assert.equal(await host().count(),1,'the scoped upstream host mounts once');
 const canvas=host().locator('canvas');
 const box=await canvas.boundingBox();
 assert.ok(box&&box.width===1000&&box.height===700,'the upstream renderer owns the full preview viewport');
 assert.ok((await canvas.evaluate(node=>node.width))>0&&(await canvas.evaluate(node=>node.height))>0,'the WebGL canvas has a backing store');
 const localAsset=await page.request.get(`${base}/viscose-original/study-01.webp`);
 assert.equal(localAsset.status(),200,'the local replacement media is served');
 assert.ok(await activeProject(),'the original project index reaches an active project after its entry');
 const initial=await activeProject();

 await page.mouse.move(500,350);await page.mouse.wheel(0,460);
 await page.waitForFunction(name=>{
  const labels=[...document.querySelectorAll('.viscose-original ul li')];
  const active=labels.map(label=>({name:label.textContent?.trim(),opacity:Number(getComputedStyle(label).opacity)})).sort((a,b)=>b.opacity-a.opacity)[0]?.name;
  return active&&active!==name;
 },initial,{timeout:10000});
 const wheeled=await activeProject();
 assert.notEqual(wheeled,initial,'wheel input turns the original project ring');

 // The source measures drag as a turn around its ring centre, so use an arc
 // that changes both axes rather than a radial horizontal pull.
 await page.mouse.move(200,200);await page.mouse.down();await page.mouse.move(800,500,{steps:12});await page.mouse.up();
 await page.waitForFunction(name=>{
  const labels=[...document.querySelectorAll('.viscose-original ul li')];
  const active=labels.map(label=>({name:label.textContent?.trim(),opacity:Number(getComputedStyle(label).opacity)})).sort((a,b)=>b.opacity-a.opacity)[0]?.name;
  return active&&active!==name;
 },wheeled,{timeout:12000});
 const dragged=await activeProject();
 assert.notEqual(dragged,wheeled,'drag input turns the original project ring independently');

 // A centred card is selected directly through the WebGL picking path.
 await page.mouse.move(500,350);await page.mouse.click(500,350);
 const dialog=page.locator('.viscose-original [role="dialog"]');
 await page.waitForFunction(()=>document.querySelector('.viscose-original [role="dialog"]')?.getAttribute('aria-hidden')==='false',null,{timeout:12000});
 assert.equal(await dialog.getAttribute('aria-hidden'),'false','selecting the front card opens the upstream editorial view');
 assert.equal(await dialog.evaluate(element=>element.hasAttribute('inert')),false,'the opened project view becomes interactive');
 assert.ok((await dialog.evaluate(element=>element.scrollHeight))>700,'the original editorial layer contains its scrollable project story');
 await page.locator('.viscose-original .close').click();
 await page.waitForFunction(()=>document.querySelector('.viscose-original [role="dialog"]')?.getAttribute('aria-hidden')==='true',null,{timeout:12000});

 // Documentation must acknowledge direct source provenance and expose actual support source.
 await page.goto(`${base}/components/viscose-carousel`,{waitUntil:'domcontentloaded'});
 await page.getByRole('heading',{name:'Viscose Carousel',exact:true}).waitFor();
 assert.ok((await page.locator('.ms-component-doc').innerText()).includes('Yousuf Soomro'),'the docs credit the upstream author');
 await page.getByRole('tab',{name:'Project data',exact:true}).click();
 assert.ok((await page.locator('#playground-panel').innerText()).includes('LOCAL_PROJECTS'),'the docs expose local replacement project data instead of the old prop API');
 await page.getByRole('tab',{name:'Preview',exact:true}).click();
 const frame=page.frameLocator('iframe[title="Original Viscose Carousel interactive preview"]');
 await frame.locator('.viscose-original canvas').waitFor({timeout:20000});
 assert.ok(await frame.locator('.viscose-original').count(),'the docs iframe mounts the actual upstream runtime');

 // The downloadable archive has the complete adapted upstream source, notices, and local media.
 const archiveResponse=await page.request.get(`${base}/downloads/viscose-carousel.zip`);
 assert.equal(archiveResponse.status(),200,'the Viscose source archive is available');
 const directory=mkdtempSync(join(tmpdir(),'viscose-archive-'));
 const archivePath=join(directory,'viscose-carousel.zip');
 try{
  writeFileSync(archivePath,await archiveResponse.body());
  const listing=execFileSync('unzip',['-Z1',archivePath],{encoding:'utf8'});
  for(const required of [
   'src/components/ViscoseCarousel.jsx',
   'src/components/ViscoseCarousel.css',
   'src/components/viscose-carousel/ring/atlas.js',
   'src/components/viscose-carousel/ring/projects.js',
   'src/components/viscose-carousel/shaders/planeShaders.js',
   'src/components/viscose-carousel/licenses/Viscose-MIT-LICENSE.txt',
   'src/components/viscose-carousel/THIRD_PARTY_NOTICES.md',
   'public/viscose-original/study-01.webp',
   'public/viscose-original/sm/study-01.webp',
   'README.md',
  ])assert.ok(listing.includes(required),`archive retains ${required}`);
  execFileSync('unzip',['-p',archivePath,'README.md'],{encoding:'utf8'});
  const readme=execFileSync('unzip',['-p',archivePath,'README.md'],{encoding:'utf8'});
  assert.ok(readme.includes('Yousuf Soomro')&&readme.includes('Important asset boundary'),'archive README retains attribution and asset restrictions');
 }finally{rmSync(directory,{recursive:true,force:true});}

 // Newest-first catalog and a compact full-screen mobile stage remain intact.
 await page.goto(`${base}/components`,{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('.ms-component-card').first().getAttribute('href'),'/components/viscose-carousel','Viscose stays first in the newest-first catalog');
 assert.ok((await page.locator('.ms-component-card[href="/components/viscose-carousel"] img').first().getAttribute('src')).startsWith('data:image/webp;base64,'),'the Viscose poster remains embedded in the catalog');
 await page.setViewportSize({width:390,height:844});
 await page.goto(`${base}/preview/viscose-carousel?embed=1&smoke=mobile`,{waitUntil:'domcontentloaded'});
 await host().locator('canvas').waitFor({timeout:20000});
 const mobileCanvas=await host().locator('canvas').boundingBox();
 assert.ok(mobileCanvas&&mobileCanvas.width===390&&mobileCanvas.height===844,'the original fixed stage fits a narrow preview viewport');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'the scoped fixed stage does not create mobile horizontal overflow');

 assert.deepEqual(errors,[],'the upstream runtime emits no page or console errors');
 console.log('PASS Viscose Carousel: original upstream WebGL runtime, wheel/drag input, project open/close, docs provenance, archive notices/support tree, local media, catalog order, and mobile framing verified.');
}finally{
 await browser.close();
}
