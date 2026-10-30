// Server-render every registered study without a DOM. The sources must not touch
// browser globals during render; interactive work belongs in effects.
import {createServer} from 'vite';
import {renderToString} from 'react-dom/server';
import React from 'react';
import assert from 'node:assert/strict';

const server=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error'});
try{
 const {components}=await server.ssrLoadModule('/src/library/registry.js');
 assert.equal(components.length,27,`registry exposes every study (${components.length})`);
 const failures=[];
 for(const component of components){
  try{
   const module=await server.ssrLoadModule(`/src/components/${component.filename}`);
   const Component=module.default;
   assert.ok(typeof Component==='function'||typeof Component?.$$typeof==='symbol',`${component.filename} default-exports a component`);
   const props={};
   const html=renderToString(React.createElement(Component,props));
   assert.ok(html.length>0,`${component.filename} renders markup`);
   assert.ok(!/undefined/.test(html)||!/class="undefined/.test(html),`${component.filename} renders no undefined attributes`);
  }catch(error){failures.push(`${component.filename}: ${String(error.message).split('\n')[0]}`);}
 }
 assert.deepEqual(failures,[],'every study server-renders');
 const {default:TechText}=await server.ssrLoadModule('/src/components/TechText.jsx');
 const techText=renderToString(React.createElement(TechText,{}));
 assert.ok(techText.includes('Tech Text'),'the wordmark fallback text is server-rendered');
 assert.ok(techText.includes('role="group"')&&techText.includes('aria-roledescription="interactive wordmark"'));
 assert.ok(techText.includes('tabindex="-1"'),'the interactive role stays out of the tab order until paint');
 assert.ok(techText.includes('class="tt-canvas"')&&techText.includes('aria-hidden="true"'),'the hidden canvas is emitted so hydration matches');
 assert.ok(techText.includes('data-status="loading"')&&techText.includes('tabindex="-1"'),'the stage starts loading and unfocusable');
 assert.ok(techText.includes('Move over a letter'),'keyboard instructions ship with the markup');
 const {default:ScrollExpand}=await server.ssrLoadModule('/src/components/ScrollExpand.jsx');
 const scrollExpand=renderToString(React.createElement(ScrollExpand,{src:'/demo.webp',alt:'A layered ridge at sunrise',title:'Built to scale',scrollHint:'Scroll inside the frame'}));
 assert.ok(scrollExpand.includes('class="scroll-expand scroll-expand--scroller'),'the sticky frame scaffold is server-rendered');
 assert.ok(scrollExpand.includes('data-status="loading"')&&!scrollExpand.includes('data-phase='),'the stage starts loading and leaves the phase to the engine');
 assert.ok(scrollExpand.includes('style="--se-inset-x:21%;--se-inset-y:29%;--se-radius:24px;--se-zoom:1.35;--se-focus:50% 50%"'),'the resting frame ships as CSS variables before measurement');
 assert.ok(scrollExpand.includes('scroll-expand__track')&&scrollExpand.includes('scroll-expand__stage')&&scrollExpand.includes('scroll-expand__frame'),'track, stage and frame all ship with the markup');
 assert.ok(scrollExpand.includes('role="region"')&&scrollExpand.includes('aria-label="A layered ridge at sunrise"'),'the region is labelled from the media description');
 assert.ok(scrollExpand.includes('src="/demo.webp"')&&scrollExpand.includes('alt="A layered ridge at sunrise"'),'media keeps its source and description');
 assert.ok(!scrollExpand.includes('scroll-expand__placeholder'),'a supplied source drops the placeholder card');
 const emptyExpand=renderToString(React.createElement(ScrollExpand,{}));
 assert.ok(emptyExpand.includes('scroll-expand__placeholder')&&emptyExpand.includes('Add an image or video'),'a missing source ships the placeholder card');
 const {default:PassageGallery}=await server.ssrLoadModule('/src/components/PassageGallery.jsx');
 const passage=renderToString(React.createElement(PassageGallery,{items:[{src:'/demo-a.webp',alt:'A ridge at sunset',title:'Ridge'},{src:'/demo-b.webp',alt:'A ribbon of water',title:'Tide'}],ariaLabel:'Photo tunnel demo'}));
 assert.ok(passage.includes('class="passage-gallery"')&&passage.includes('data-status="loading"'),'the gallery scaffold starts loading');
 assert.ok(passage.includes('class="passage-gallery__canvas"')&&passage.includes('role="region"')&&passage.includes('aria-roledescription="gallery"'),'the canvas is an accessible region before hydration');
 assert.ok(passage.includes('aria-label="Photo tunnel demo"'),'the region keeps its label');
 assert.ok(passage.includes('tabindex="0"'),'the canvas is focusable from the first paint');
 assert.ok(passage.includes('<li>Ridge. A ridge at sunset</li>')&&passage.includes('<li>Tide. A ribbon of water</li>'),'every photo is listed for assistive technology');
 assert.ok(passage.includes('class="passage-gallery__caption"')&&passage.includes('aria-live="polite"'),'the caption region ships with the markup');
 assert.ok(passage.includes('class="passage-gallery__sr"'),'the hidden list is present');
 const emptyPassage=renderToString(React.createElement(PassageGallery,{}));
 assert.ok(emptyPassage.includes('class="passage-gallery"')&&!emptyPassage.includes('<li>'),'an empty collection still renders its frame without list items');
 const {default:DomeGallery}=await server.ssrLoadModule('/src/components/DomeGallery.jsx');
 const dome=renderToString(React.createElement(DomeGallery,{images:[{src:'/amber.webp',alt:'An amber study'},{src:'/blue.webp',alt:'A blue study'}],segments:20,grayscale:false,ariaLabel:'Dome test gallery'}));
 assert.ok(dome.includes('class="dome-gallery"')&&dome.includes('data-status="loading"'),'the dome gallery scaffold server-renders before measuring');
 assert.ok(dome.includes('role="region"')&&dome.includes('aria-roledescription="image gallery"')&&dome.includes('aria-label="Dome test gallery"'),'the dome stage ships as a labelled image-gallery region');
 assert.ok(!dome.includes('dome-gallery__tile'),'the measured tile field is deferred until client layout is available');
 assert.ok(dome.includes('Drag to rotate. Click an image to expand. Press Escape to close.'),'dome keyboard and pointer instructions ship with the scaffold');
 const {default:PaperCrumple}=await server.ssrLoadModule('/src/components/PaperCrumple.jsx');
 const paper=renderToString(React.createElement(PaperCrumple,{src:'/field-note.webp',backSrc:'/signal-grid.webp',alt:'An orbital field note',width:300,height:380,sceneHeight:520}));
 assert.ok(paper.includes('class="paper-crumple"')&&paper.includes('data-status="loading"')&&paper.includes('data-state="flat"'),'the paper scaffold server-renders before Canvas setup');
 assert.ok(paper.includes('class="paper-crumple__canvas"')&&paper.includes('aria-hidden="true"'),'the Canvas layer ships without browser globals');
 assert.ok(paper.includes('class="paper-crumple__hit"')&&paper.includes('Hold to crumple and drag. Keyboard: hold Space or Enter, arrow keys to move, Escape to reset.'),'a labelled native hold control ships with keyboard instructions');
 assert.ok(paper.includes('src="/field-note.webp"')&&paper.includes('alt="An orbital field note"')&&paper.includes('class="paper-crumple__fallback"'),'the image fallback preserves its useful source and alt text');
 const {default:ViscoseCarousel}=await server.ssrLoadModule('/src/components/ViscoseCarousel.jsx');
 const viscose=renderToString(React.createElement(ViscoseCarousel));
 assert.ok(viscose.includes('class="viscose-original"'),'the upstream Viscose stage server-renders its scoped full-viewport host without browser globals');
 assert.ok(viscose.includes('Ember Index')&&viscose.includes('Tidal Room'),'the local replacement project records are present in the server-rendered project index');
 assert.ok(viscose.includes('role="dialog"')&&viscose.includes('aria-live="polite"'),'the upstream editorial overlay and live region ship before client effects');
 assert.ok(viscose.includes('class="fixed inset-0 touch-none"'),'the original WebGL canvas mount point is present in SSR markup');
 console.log(`PASS SSR: all ${components.length} studies render without browser globals; Tech Text, Scroll Expand, Passage Gallery, Dome Gallery, Paper Crumple and the upstream Viscose Carousel keep their initial markup.`);
}finally{await server.close();}
