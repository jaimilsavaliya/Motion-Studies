import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const base=process.env.TEST_URL||'http://localhost:5173';
const dir='test-artifacts/drag-elements';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1200,height:800}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const items=()=>page.locator('.de-item');
const pos=locator=>locator.evaluate(e=>({x:Number(e.dataset.x||0),y:Number(e.dataset.y||0)}));
const near=(a,b,t=.5)=>assert.ok(Math.abs(a-b)<t,`${a} should be near ${b}`);
const open=async(query='')=>{await page.goto(`${base}/preview/drag-elements?${query}`,{waitUntil:'networkidle'});await items().last().waitFor();};
async function drag(locator,dx,dy,{release=true}={}){const b=await locator.boundingBox();const x=b.x+b.width/2,y=b.y+b.height*.8;await page.mouse.move(x,y);await page.mouse.down();for(let i=1;i<=8;i++){await page.mouse.move(x+dx*i/8,y+dy*i/8);await page.waitForTimeout(15);}if(release)await page.mouse.up();}
const settled=async()=>page.waitForFunction(()=>[...document.querySelectorAll('.de-item')].every(e=>e.dataset.moving!=='true'),null,{timeout:10000});
try{
  await open();assert.equal(await items().count(),6);
  const stage=await page.locator('.de-showcase').boundingBox(),card=await items().last().boundingBox();near(stage.width,660);near(stage.height,530);near(card.x-stage.x,160);near(card.y-stage.y,160);near(card.width,129);near(card.height,171);
  assert.ok(await page.locator('.de-demo-photo img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0&&!image.draggable)));
  await page.locator('.de-showcase').screenshot({path:`${dir}/implemented-photos.png`});
  // Pointer selection must not inherit a keyboard focus ring, even after keyboard input.
  await page.keyboard.press('Tab');await items().last().focus();
  assert.equal(await items().last().evaluate(e=>getComputedStyle(e).outlineWidth),'2px');
  await items().last().click();
  assert.equal(await items().last().evaluate(e=>getComputedStyle(e).outlineStyle),'none');
  await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  assert.equal(await items().last().evaluate(e=>getComputedStyle(e).outlineWidth),'2px');
  await items().last().click();
  const rotation=await page.locator('.de-demo-photo').last().evaluate(e=>getComputedStyle(e).transform);
  await page.mouse.move(800,300);await page.waitForTimeout(100);assert.deepEqual(await pos(items().last()),{x:0,y:0});
  await drag(items().last(),100,50);assert.equal(await items().last().evaluate(e=>getComputedStyle(e).outlineStyle),'none');near((await pos(items().last())).x,100);await page.waitForTimeout(350);near((await pos(items().last())).x,100);near((await pos(items().last())).y,50);assert.equal(await page.locator('.de-demo-photo').last().evaluate(e=>getComputedStyle(e).transform),rotation);
  await items().last().focus();await page.keyboard.press('Home');
  await drag(items().last(),-250,-250,{release:false});near((await pos(items().last())).x,-205);near((await pos(items().last())).y,-205);
  await page.mouse.up();await page.waitForTimeout(500);const mid=(await pos(items().last())).x;assert.ok(mid>-198&&mid<-185,`slow overdamped return: ${mid}`);await settled();near((await pos(items().last())).x,-160);near((await pos(items().last())).y,-160);
  await items().first().focus();assert.ok(Number(await items().first().evaluate(e=>e.style.zIndex))>Number(await items().last().evaluate(e=>e.style.zIndex)));
  await page.keyboard.press('ArrowRight');near((await pos(items().first())).x,20);await page.keyboard.press('Shift+ArrowDown');near((await pos(items().first())).y,80);await page.keyboard.press('Escape');assert.deepEqual(await pos(items().first()),{x:0,y:0});await page.keyboard.press('Tab');assert.ok(await items().nth(1).evaluate(e=>e===document.activeElement));
  await open('&selectedOnTop=false');await items().first().focus();assert.equal(await items().first().evaluate(e=>e.style.zIndex),'0');
  await open('&scene=labels');assert.equal(await items().count(),3);near((await items().last().boundingBox()).height,92);
  await page.locator('.de-showcase').screenshot({path:`${dir}/implemented-labels.png`});
  await drag(items().last(),60,0);const released=(await pos(items().last())).x;await page.waitForTimeout(250);assert.ok((await pos(items().last())).x>released+5,'labels retain release momentum');await settled();
  const labelBox=await items().last().boundingBox(),labelStage=await page.locator('.de-showcase').boundingBox();near(labelBox.x+labelBox.width,labelStage.x+labelStage.width);
  await open('&scene=labels&dragElastic=0');await drag(items().last(),500,0);await settled();const strict=await items().last().boundingBox();near(strict.x+strict.width,stage.x+stage.width);
  await page.emulateMedia({reducedMotion:'reduce'});await open('&scene=labels');await drag(items().last(),-300,-300);near((await pos(items().last())).x,-160);near((await pos(items().last())).y,-160);await page.waitForTimeout(150);near((await pos(items().last())).x,-160);
  await page.emulateMedia({reducedMotion:'no-preference'});
  // Mobile geometry, real touch input, and document scroll isolation.
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto(`${base}/preview/drag-elements?`,{waitUntil:'networkidle'});await mobile.locator('.de-showcase').screenshot({path:`${dir}/implemented-mobile.png`});
  const touch=await mobile.context().newCDPSession(mobile),mb=await mobile.locator('.de-item').last().boundingBox();
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:mb.x+50,y:mb.y+50}]});await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:mb.x+10,y:mb.y+110}]});await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  near((await pos(mobile.locator('.de-item').last())).x,-40);near((await pos(mobile.locator('.de-item').last())).y,60);assert.equal(await mobile.evaluate(()=>scrollY),0);
  await mobile.goto(`${base}/preview/drag-elements?&scene=labels`,{waitUntil:'networkidle'});const lb=await mobile.locator('.de-item').last().boundingBox(),ms=await mobile.locator('.de-showcase').boundingBox();near(lb.x-ms.x,120);near(lb.y-ms.y,120);near(lb.height,56);assert.equal(await mobile.locator('.de-demo-label').last().evaluate(e=>getComputedStyle(e).fontSize),'24px');await mobile.close();
  // Reusable-component fixture: no demo CSS or media dependencies.
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    document.getElementById('root').remove();const area=document.createElement('div');area.id='bounds';area.style.cssText='position:relative;width:500px;height:350px;margin:40px';const host=document.createElement('div');area.append(host);document.body.append(area);
    const React=(await import('/node_modules/.vite/deps/react.js')).default;const{createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;const{default:Drag}=await import('/src/components/DragElements.jsx');
    window.fixture=createRoot(host);window.boundsRef={current:area};window.ended=[];window.childWidth=80;
    window.renderDrag=(props={},keys=['a','b'])=>{const{style,...rest}=props;fixture.render(React.createElement(Drag,{height:400,dragMomentum:false,style:{padding:80,width:600,...style},onDragEnd:(i,p)=>ended.push([i,p]),...rest},keys.map(key=>React.createElement('div',{key,'aria-label':key,style:{width:childWidth,height:80,background:'#eee',color:'#111'}},React.createElement('a',{href:'#activated'},key),React.createElement('input',{'aria-label':'Input '+key,style:{width:30}}),React.createElement('button',{'data-drag-ignore':true},'Ignore')))));};
    window.renderRefBox=()=>fixture.render(React.createElement(function RefBox(){const ref=React.useRef(null);window.mountedBounds=ref;return React.createElement('div',{ref,style:{width:500,height:350}},React.createElement(Drag,{dragConstraints:ref,dragElastic:false,dragMomentum:false,height:350,style:{padding:80,width:600}},React.createElement('div',{style:{width:80,height:80,background:'pink'}},'Shared bounds')));}));
    window.renderNested=propagate=>fixture.render(React.createElement(Drag,{className:'outer',height:400,dragMomentum:false,style:{padding:40,width:600}},React.createElement(Drag,{className:'inner',height:200,dragMomentum:false,dragPropagation:propagate,style:{padding:40,width:300}},React.createElement('div',{style:{width:80,height:80,background:'pink'}},'Nested'))));
    renderDrag();
  });
  await items().last().waitFor();await items().last().focus();await drag(items().last(),50,20);near((await pos(items().last())).x,50);assert.equal(await page.evaluate(()=>ended.length),1);
  await page.evaluate(()=>renderDrag({dragElastic:.2},['b','c']));await page.waitForTimeout(80);near((await pos(items().first())).x,50);near((await pos(items().first())).y,20);
  await page.evaluate(()=>renderDrag({dragElastic:false,dragConstraints:{left:-30,right:50,top:-20,bottom:60}},['b']));await page.waitForTimeout(80);await items().first().focus();await page.keyboard.press('Home');await drag(items().first(),300,300);near((await pos(items().first())).x,50);near((await pos(items().first())).y,60);
  await page.evaluate(()=>renderDrag({dragElastic:{left:0,right:.5,top:0,bottom:0},dragConstraints:{left:-30,right:50,top:-20,bottom:60}},['b']));await page.waitForTimeout(80);await items().first().focus();await page.keyboard.press('Home');await drag(items().first(),100,0,{release:false});near((await pos(items().first())).x,75);await page.mouse.up();await settled();near((await pos(items().first())).x,50);
  await page.evaluate(()=>renderDrag({dragElastic:false,dragConstraints:boundsRef},['b']));await page.waitForTimeout(80);await items().first().focus();await page.keyboard.press('Home');await drag(items().first(),500,0);near((await pos(items().first())).x,340);
  await page.evaluate(()=>boundsRef.current.style.width='300px');await page.waitForTimeout(100);near((await pos(items().first())).x,140);
  // Native input, opt-out controls, and un-dragged links retain their own actions.
  await items().first().focus();await page.keyboard.press('Home');const old=await pos(items().first());await page.getByLabel('Input b').fill('ok');assert.deepEqual(await pos(items().first()),old);await page.getByRole('button',{name:'Ignore',exact:true}).click();assert.deepEqual(await pos(items().first()),old);await page.getByRole('link',{name:'b',exact:true}).click();assert.ok(page.url().endsWith('#activated'));
  await page.evaluate(()=>history.replaceState(null,'',location.pathname));const a=await page.getByRole('link',{name:'b',exact:true}).boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(a.x+60,a.y+20,{steps:5});await page.mouse.up();assert.ok(!page.url().endsWith('#activated'),'dragged link must not navigate');
  // A parent ref attached in the same React commit must also observe external resizing.
  await page.evaluate(()=>renderRefBox());await page.waitForTimeout(100);await drag(items().first(),500,0);near((await pos(items().first())).x,340);await page.evaluate(()=>mountedBounds.current.style.width='300px');await page.waitForTimeout(100);near((await pos(items().first())).x,140);
  // Nested drag propagation, cancellation, oversized children and scaled ancestors.
  await page.evaluate(()=>renderNested(false));await page.waitForTimeout(100);await drag(page.locator('.inner>.de-item'),20,20);near((await pos(page.locator('.inner>.de-item'))).x,20);near((await pos(page.locator('.outer>.de-item'))).x,0);
  await page.evaluate(()=>{fixture.render(null);});await page.waitForTimeout(30);await page.evaluate(()=>renderNested(true));await page.waitForTimeout(100);await drag(page.locator('.inner>.de-item'),20,20);near((await pos(page.locator('.inner>.de-item'))).x,20);near((await pos(page.locator('.outer>.de-item'))).x,20);
  await page.evaluate(()=>{childWidth=700;renderDrag({dragElastic:false},['wide']);});await page.waitForTimeout(100);near((await pos(items().first())).x,-80);await drag(items().first(),-300,0);near((await pos(items().first())).x,-180);
  await page.evaluate(()=>{childWidth=80;boundsRef.current.style.transform='scale(.5)';boundsRef.current.style.transformOrigin='top left';renderDrag({dragElastic:false},['small']);});await page.waitForTimeout(100);await drag(items().first(),40,0);near((await pos(items().first())).x,80);
  await page.evaluate(()=>{boundsRef.current.style.transform='';renderDrag({dragMomentum:true},['small']);});await page.waitForTimeout(80);await items().first().focus();await page.keyboard.press('Home');await drag(items().first(),40,0,{release:false});await page.evaluate(()=>dispatchEvent(new Event('blur')));await page.mouse.up();const canceled=await pos(items().first());await page.waitForTimeout(200);near((await pos(items().first())).x,canceled.x);assert.equal(await items().first().getAttribute('data-dragging'),'false');
  await page.evaluate(()=>renderDrag({},[]));await page.waitForTimeout(50);assert.equal(await items().count(),0);
  await page.evaluate(()=>{window.rafCalls=0;const original=requestAnimationFrame;window.requestAnimationFrame=callback=>{rafCalls++;return original(callback);};renderDrag({},['final']);});await items().first().waitFor();await drag(items().first(),-200,0);await page.evaluate(()=>fixture.unmount());const frameCount=await page.evaluate(()=>rafCalls);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>rafCalls),frameCount);assert.equal(await items().count(),0);
  // Docs, customization, source tabs, ZIP and mobile layout.
  await page.goto(`${base}/components/drag-elements`,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Drag Elements',exact:true}).waitFor();await page.frameLocator('iframe').locator('.de-item').last().waitFor();await page.screenshot({path:`${dir}/documentation.png`,fullPage:true});
  await page.getByRole('button',{name:'Customize',exact:true}).click();await page.getByLabel('Demo scene',{exact:true}).selectOption('labels');await page.getByLabel('Edge elasticity',{exact:true}).fill('0.25');await page.getByRole('switch',{name:'Selection on top',exact:true}).click();await page.waitForTimeout(500);assert.ok((await page.locator('iframe').getAttribute('src')).includes('dragMomentum=true'));await page.frameLocator('iframe').locator('.de-demo-label').last().waitFor();
  await page.getByRole('tab',{name:'Usage',exact:true}).click();const code=await page.locator('pre').first().innerText();assert.ok(code.includes('dragElastic={0.25}')&&code.includes('dragMomentum={true}')&&code.includes('selectedOnTop={false}'));
  await page.getByRole('tab',{name:'Component',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('function DragElements'));await page.getByRole('tab',{name:'CSS',exact:true}).click();assert.ok((await page.locator('pre').first().innerText()).includes('touch-action:none'));
  const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download files',exact:true}).click();assert.equal((await download).suggestedFilename(),'drag-elements.zip');
  await page.setViewportSize({width:390,height:844});await page.getByRole('tab',{name:'Preview',exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);console.log('PASS Drag Elements: geometry, stacking, elastic return, momentum, constraints, resize, touch, keyboard, reduced motion, arbitrary children, nested propagation, links/controls, cancellation, cleanup, docs/source and ZIP.');
}finally{await browser.close();}
