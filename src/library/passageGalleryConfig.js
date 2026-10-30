import {passageGalleryPresets} from '../components/PassageGallery';

// Demo scene collection, generated in-house for this study. The reusable component
// ships without any media; these files exist only to populate the playground.
export const passageGalleryScenes=[
 ['amber-crest','Amber crest','/passage-gallery/scenes/amber-crest.webp','An amber disc sinking behind layered violet ridges'],
 ['violet-fold','Violet fold','/passage-gallery/scenes/violet-fold.webp','Folded violet planes rising from a blush ground'],
 ['tidal-band','Tidal band','/passage-gallery/scenes/tidal-band.webp','A dark teal ribbon and a gold line sweeping across mint'],
 ['rose-shutter','Rose shutter','/passage-gallery/scenes/rose-shutter.webp','Rose slats cutting across a pink field with a gold disc'],
 ['copper-arc','Copper arc','/passage-gallery/scenes/copper-arc.webp','A copper ring floating over a pale blue ground'],
 ['plum-wave','Plum wave','/passage-gallery/scenes/plum-wave.webp','A plum wave and a pink crest on cream'],
 ['coral-steps','Coral steps','/passage-gallery/scenes/coral-steps.webp','Stepped coral and amber planes on a sky ground'],
 ['ice-bloom','Ice bloom','/passage-gallery/scenes/ice-bloom.webp','A white bloom glowing over a cold blue field']
];
// The requested order is honoured, so a query can choose how the corridor flows.
export function passageGalleryItems(selected){
 const keys=Array.isArray(selected)&&selected.length?selected:passageGalleryScenes.map(([key])=>key);
 return keys.map(key=>passageGalleryScenes.find(([name])=>name===key)).filter(Boolean).map(([,title,src,alt])=>({src,alt,title}));
}
export const passageGalleryDefaults={preset:'passage',scenes:passageGalleryScenes.map(([key])=>key),colors:['#5227FF','#FF9FFC'],backgroundColor:'#0a0a0a',ariaLabel:'Photo tunnel. Scroll or drag to travel, hold to speed up, click a photo to view it.',...passageGalleryPresets.passage,lanes:5,gap:.1,radius:.06,photoFill:.3,accentFill:.06,lineOpacity:.12,fog:1,speed:.6,boost:10,blur:1,look:1,fov:72,hover:1,focusOnClick:true,captions:true,wheel:true,interactive:true,seed:0,paused:false,dpr:2};
// Bounds mirror the documented controls, so the docs sliders sweep the same range.
export const passageGalleryRanges=[
 ['lanes','Lanes',2,12,1,''],
 ['gap','Gap',0,.4,.01,''],
 ['radius','Radius',0,1,.01,''],
 ['photoFill','Photo fill',0,1,.01,''],
 ['accentFill','Accent fill',0,.6,.01,''],
 ['lineOpacity','Line opacity',0,.6,.01,''],
 ['fog','Fog',.2,3,.05,''],
 ['speed','Speed',-2,4,.1,'cells/s'],
 ['boost','Boost',1,20,.5,'×'],
 ['blur','Blur',0,3,.05,''],
 ['look','Look',0,3,.05,''],
 ['fov','Field of view',40,100,1,'°'],
 ['hover','Hover',0,2,.05,''],
 ['seed','Seed',0,20,1,''],
 ['dpr','Max pixel ratio',.5,3,.5,'×']
];
export const passageGallerySwitches=[['focusOnClick','Focus on click'],['captions','Captions'],['wheel','Wheel'],['interactive','Interactive'],['paused','Paused']];
export const passageGalleryTargets=[['lanes','Lanes'],['shot','Add a scene'],['inline','Add a custom window'],['windowRoot','Add to the window']];
export function parsePassageGalleryQuery(query){
 const preset=Object.hasOwn(passageGalleryPresets,query.get('preset'))?query.get('preset'):'passage';
 const c={...passageGalleryDefaults,...passageGalleryPresets[preset],preset};
 for(const[key,,min,max]of passageGalleryRanges)if(query.has(key)&&query.get(key).trim()!==''){const n=Number(query.get(key));if(Number.isFinite(n))c[key]=Math.max(min,Math.min(max,n));}
 for(const[key]of passageGallerySwitches)if(query.has(key))c[key]=query.get(key)==='true';
 if(query.has('scenes')){
  const wanted=[...new Set(query.get('scenes').split(',').map(value=>value.trim()).filter(value=>passageGalleryScenes.some(([key])=>key===value)))];
  if(wanted.length)c.scenes=wanted;
 }
 const colors=query.getAll('color').map(value=>value.trim()).filter(value=>/^#[0-9a-f]{6}$/i.test(value));
 if(colors.length)c.colors=colors.length>1?colors.slice(0,2):[colors[0],c.colors[1]];
 if(/^#[0-9a-f]{6}$/i.test(query.get('background')||''))c.backgroundColor=query.get('background');
 else if(query.get('background')==='transparent')c.backgroundColor='transparent';
 if(query.has('ariaLabel'))c.ariaLabel=query.get('ariaLabel').slice(0,240);
 return c;
}
export function passageGalleryUsage(config){
 const items=passageGalleryItems(config.scenes);
 const preview=items.slice(0,2).map(({src,alt,title})=>`    { src: '${src}', alt: '${alt}', title: '${title}' }`).join(',\n');
 const values={lanes:config.lanes,gap:config.gap,radius:config.radius,photoFill:config.photoFill,accentFill:config.accentFill,lineOpacity:config.lineOpacity,fog:config.fog,speed:config.speed,boost:config.boost,blur:config.blur,look:config.look,fov:config.fov,hover:config.hover,seed:config.seed,focusOnClick:config.focusOnClick,captions:config.captions,wheel:config.wheel,interactive:config.interactive,paused:config.paused};
 const lines=Object.entries(values).map(([key,value])=>`      ${key}={${JSON.stringify(value)}}`).join('\n');
 return `'use client';

import PassageGallery from './components/PassageGallery';

const photos = [
${preview},
];

export default function Hero() {
  return (
    <div style={{ height: '100vh' }}>
      <PassageGallery
        items={photos}
        colors={[${config.colors.map(color=>`'${color}'`).join(', ')}]}
        backgroundColor="${config.backgroundColor}"
${lines}
        onFocusChange={(item, index) => console.log(item?.title ?? null, index)}
      >
        <h1>Walk the corridor</h1>
        <p>Hold to speed up. Click a photo to bring it forward.</p>
      </PassageGallery>
    </div>
  );
}`;
}
