import {flexCarouselPresets} from '../components/FlexCarousel';
export const flexCarouselDefaults={preset:'liquid',...flexCarouselPresets.liquid,intro:'rise',fit:'natural',cardHeight:.5,gap:12,radius:0,squeeze:.2,focusOnClick:true,autoplay:false,interval:4,captions:true,captureWheel:true,showControls:false,paused:false,pixelRatio:1.5,initialIndex:0,height:540};
export const flexCarouselRanges=[
 ['height','Stage height',320,900,10,'px'],['cardHeight','Card height',.15,.85,.05,''],['gap','Gap',0,80,1,'px'],['radius','Corner radius',0,80,1,'px'],
 ['lensWidth','Lens width',.2,1.6,.02,''],['lensHeight','Lens height',.2,2,.02,''],['tilt','Tilt',-180,180,1,'°'],['roundness','Roundness',0,1,.05,''],
 ['bend','Bend',0,.9,.02,''],['reach','Reach',.05,.9,.01,''],['dispersion','Dispersion',0,1.5,.05,''],['liquid','Liquid movement',0,1.5,.05,''],
 ['squeeze','Velocity squeeze',0,.6,.05,''],['interval','Autoplay interval',1,30,1,'s'],['pixelRatio','Pixel ratio cap',.5,2,.25,''],['initialIndex','Initial image',0,11,1,''],
];
export const flexCarouselSwitches=[['followCursor','Follow cursor'],['focusOnClick','Focus on click'],['autoplay','Autoplay'],['captions','Captions'],['captureWheel','Capture vertical wheel'],['showControls','Show navigation'],['paused','Pause autoplay']];
export function parseFlexCarouselQuery(query){
 const preset=Object.hasOwn(flexCarouselPresets,query.get('preset'))?query.get('preset'):'liquid';
 const config={...flexCarouselDefaults,preset,...flexCarouselPresets[preset]};
 for(const [key,,min,max] of flexCarouselRanges){if(query.has(key)){const n=Number(query.get(key));if(Number.isFinite(n))config[key]=Math.max(min,Math.min(max,n));}}
 for(const [key] of flexCarouselSwitches)if(query.has(key))config[key]=query.get(key)==='true';
 for(const [key,values] of Object.entries({intro:['rise','bloom','spin','deal','none'],fit:['natural','portrait','square','landscape'],curl:['twist','rise','fall']}))if(values.includes(query.get(key)))config[key]=query.get(key);
 return config;
}
export function flexCarouselUsage(config){
 const lines=Object.entries(config).filter(([key])=>key!=='height').map(([key,value])=>`      ${key}={${JSON.stringify(value)}}`).join('\n');
 return `import FlexCarousel from './components/FlexCarousel';\n\n// Replace these paths with your own images.\nconst items = [\n  { src: '/photos/sculpture.jpg', title: 'Iridescence', alt: 'An iridescent sculpture' },\n  { src: '/photos/studio.jpg', title: 'White Room', alt: 'A portrait in a white studio' },\n  { src: '/photos/chrome.jpg', title: 'Liquid Metal', alt: 'Reflective chrome surfaces' },\n];\n\nexport default function FlexGallery() {\n  return <div style={{ height: ${config.height}, overflow: 'hidden', borderRadius: 16 }}>\n    <FlexCarousel items={items}\n${lines}\n    />\n  </div>;\n}`;
}
