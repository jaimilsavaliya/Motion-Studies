import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=process.env.TEST_URL||'http://localhost:5173';
const expected=[...readFileSync('src/library/registry.js','utf8').matchAll(/slug: '([^']+)'/g)].map(match=>match[1]);
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const latest=[['viscose-carousel','Viscose Carousel','.viscose-original'],['paper-crumple','Paper Crumple','.paper-crumple'],['dome-gallery','Dome Gallery','.dome-gallery'],['passage-gallery','Passage Gallery','.passage-gallery'],['scroll-expand','Scroll Expand','.scroll-expand'],['tech-text','Tech Text','.tech-text'],['dither-veil','Dither Veil','.dither-veil'],['flex-carousel','Flex Carousel','.flex-carousel'],['gradient-ascii','Gradient ASCII','.gradient-ascii'],['marquee-along-svg-path','Marquee Along SVG Path','.msp-item'],['drag-elements','Drag Elements','.de-item'],['infinite-canvas','Infinite Canvas','.infinite-canvas'],['hover-members','Hover Members','.hover-members']];
async function verifyCatalog(){
  await page.locator('.ms-component-card').first().waitFor();
  const hrefs=await page.locator('.ms-component-card').evaluateAll(cards=>cards.map(card=>card.getAttribute('href')));
  assert.equal(hrefs.length,expected.length);assert.deepEqual(new Set(hrefs),new Set(expected.map(slug=>`/components/${slug}`)));
  assert.deepEqual(hrefs.slice(0,latest.length),latest.map(([slug])=>`/components/${slug}`));
  assert.equal(await page.locator('.ms-count').innerText(),String(expected.length));
  assert.ok((await page.getByRole('status').innerText()).includes(`Showing ${expected.length} of ${expected.length} components`));
  assert.equal(await page.locator('.ms-component-card[href*="claw"]').count(),0);
  for(const [slug] of latest){
    const image=page.locator(`.ms-component-card[href="/components/${slug}"] img`).first();
    await image.evaluate(element=>element.decode());
    assert.ok(await image.evaluate(element=>element.complete&&element.naturalWidth>0));
    assert.ok((await image.getAttribute('src')).startsWith('data:image/webp;base64,'),`${slug} thumbnail must ship inside the application`);
    const geometry=await image.evaluate(image=>{
      const frame=image.parentElement,visual=image.closest('.ms-card-visual');
      const img=image.getBoundingClientRect(),box=frame.getBoundingClientRect(),card=visual.getBoundingClientRect();
      const style=getComputedStyle(image);
      return {fit:style.objectFit,position:style.position,center:style.objectPosition,
        inside:img.left>=box.left-.5&&img.right<=box.right+.5&&img.top>=box.top-.5&&img.bottom<=box.bottom+.5,
        bands:box.top-card.top>=40&&card.bottom-box.bottom>=40, width:img.width,height:img.height};
    });
    assert.equal(geometry.fit,'contain',`${slug} must not crop its composition`);
    assert.equal(geometry.position,'absolute');assert.equal(geometry.center,'50% 50%');
    assert.ok(geometry.inside&&geometry.bands&&geometry.width>0&&geometry.height>0,`${slug} must fit between its card labels`);
  }
}
try {
  // The newest thumbnails must render even if the old public-image URLs fail.
  await page.route(/\/(marquee-along-svg-path|drag-elements|infinite-canvas|hover-members)-poster\.webp(?:\?.*)?$/,route=>route.abort());
  await page.goto(`${base}/components`,{waitUntil:'networkidle'});await verifyCatalog();
  for(const [slug,name,selector] of latest){
    const card=page.locator(`.ms-component-card[href="/components/${slug}"]`);
    assert.ok(await card.locator('img').first().evaluate(image=>image.complete&&image.naturalWidth>0));
    await card.click();await page.getByRole('heading',{name,exact:true}).waitFor();
    await page.frameLocator('iframe').locator(selector).first().waitFor();
    if(slug==='viscose-carousel'){
      const viscose=page.frameLocator('iframe').locator('.viscose-original');
      await viscose.locator('canvas').waitFor({timeout:20000});
      assert.ok(await viscose.locator('canvas').evaluate(canvas=>canvas.width>0&&canvas.height>0),'the upstream Viscose preview has a WebGL backing store');
      assert.ok(await viscose.locator('ul li').count()>=18,'the upstream project index keeps the local project collection');
    }else if(slug==='paper-crumple'){
      await page.frameLocator('iframe').locator('.paper-crumple[data-status=ready]').waitFor();
      const paper=page.frameLocator('iframe').locator('.paper-crumple');
      assert.ok(await paper.locator('canvas').evaluate(canvas=>canvas.width>0&&canvas.height>0),'the paper preview has a Canvas backing store');
      assert.ok((await paper.locator('.paper-crumple__hit').getAttribute('aria-label')).includes('Hold to crumple'),'the paper preview keeps its named keyboard control');
    }else if(slug==='passage-gallery'){
      await page.frameLocator('iframe').locator('.passage-gallery[data-status=ready]').waitFor();
      const gallery=page.frameLocator('iframe').locator('.passage-gallery');
      assert.ok(await gallery.evaluate(node=>Number(node.dataset.tiles)>0),'the corridor paints tiles');
      assert.equal(await page.frameLocator('iframe').locator('canvas.passage-gallery__canvas').evaluate(canvas=>canvas.width>0&&canvas.height>0),true,'the canvas has a backing store');
      assert.ok(Number((await gallery.getAttribute('data-travel')))!==0||(await gallery.getAttribute('data-phase'))!=='cruising','the gallery reports travel or a paused phase');
    }else if(slug==='scroll-expand'){
      await page.frameLocator('iframe').locator('.scroll-expand[data-status=ready]').waitFor();
      assert.equal(await page.frameLocator('iframe').locator('.scroll-expand').getAttribute('data-frame'),'21.000,29.000,24.00');
      assert.ok(await page.frameLocator('iframe').locator('.scroll-expand__media').evaluate(image=>image.complete&&image.naturalWidth>0));
    }else if(slug==='tech-text'){
      await page.frameLocator('iframe').locator('.tech-text[data-status=ready]').waitFor();
      assert.ok(await page.frameLocator('iframe').locator('.tt-canvas').evaluate(canvas=>canvas.width>0&&canvas.height>0));
    }else if(slug==='dither-veil'){
      await page.frameLocator('iframe').locator('.dither-veil[data-status=ready]').waitFor();
      assert.ok(await page.frameLocator('iframe').locator('.dv-gpu').evaluate(canvas=>canvas.width>0&&canvas.height>0));
    }else if(slug==='gradient-ascii'){
      await page.frameLocator('iframe').locator('.gradient-ascii[data-renderer=webgl]').waitFor();
      assert.ok(await page.frameLocator('iframe').locator('canvas').evaluate(canvas=>canvas.width>0&&canvas.height>0));
    }else{
      const previewImages=page.frameLocator('iframe').locator(`${selector} img`);
      await previewImages.first().waitFor();
      await previewImages.evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
      assert.ok(await previewImages.evaluateAll(images=>images.every(image=>image.naturalWidth>0)),`${name} preview media must load`);
    }
    assert.equal((await page.request.get(`${base}/downloads/${slug}.zip`)).status(),200);
    await page.locator('.ms-sidebar-link[href="/components"]').click();await verifyCatalog();
  }
  await page.getByRole('textbox',{name:'Filter components'}).fill('Drag');
  assert.ok(await page.locator('.ms-component-card').count()<expected.length);
  await page.locator('.ms-filter-row button').filter({hasText:'All components'}).click();await verifyCatalog();
  await page.locator('.ms-filter-row button').filter({hasText:'Media'}).click();
  await page.getByRole('textbox',{name:'Filter components'}).fill('nothing matches');
  await page.locator('.ms-sidebar-link[href="/components"]').click();await verifyCatalog();
  await page.goto(`${base}/`,{waitUntil:'networkidle'});await verifyCatalog();
  await page.setViewportSize({width:1100,height:900});await verifyCatalog();
  await page.setViewportSize({width:390,height:844});await page.goto(`${base}/components`,{waitUntil:'networkidle'});await verifyCatalog();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.reload({waitUntil:'networkidle'});await verifyCatalog();
  assert.deepEqual(errors,[]);
  console.log(`PASS Catalog: all ${expected.length} registry entries listed, newest first, counts consistent, embedded thumbnails (old image URLs blocked), contained framing at wide/tablet/mobile sizes, latest cards/previews/downloads working, filters reset, overview and mobile verified.`);
}finally{await browser.close();}
