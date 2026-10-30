export const gradientAsciiPresets={
  Atmosphere:['#1e3fd8','#f6f8ff','#a5d8ff','#38bdf8'],
  Ember:['#792315','#ff6437','#ffd2a0','#fff2db'],
  Orchid:['#48177b','#9855e8','#eabaff','#fff0ff'],
  Meadow:['#0a4a43','#29b894','#acf0be','#e8ffc4'],
};
export const gradientAsciiCharacters={Letters:' =+xX0S8#@',Symbols:' .:-=+*#%@',Binary:' 01',Blocks:' ░▒▓█'};
export const gradientAsciiRanges=[
 ['cellSize','Cell size',8,40,1,'px'],['density','Density',0,1,.05,''],
 ['glyphOpacity','Glyph opacity',0,1,.05,''],['gradientOpacity','Gradient opacity',0,1,.05,''],
 ['glow','Glow',0,1.5,.05,''],['depthOfField','Depth of field',0,1,.05,''],
 ['flicker','Flicker',0,1,.05,''],['softness','Softness',0,1,.05,''],
 ['scale','Scale',.4,2.5,.1,''],['flow','Flow',0,2,.1,''],['speed','Speed',0,5,.1,''],
 ['grain','Grain',0,.4,.01,''],['variation','Variation',0,100,1,''],['scrambleRadius','Scramble radius',.01,.5,.01,''],
 ['dpr','Pixel ratio cap',.5,2,.25,''],
];
export const gradientAsciiDefaults={colors:gradientAsciiPresets.Atmosphere,shape:'horizon',characters:gradientAsciiCharacters.Letters,
 cellSize:18,density:.8,glyphOpacity:.85,gradientOpacity:.9,glow:.2,depthOfField:0,flicker:.2,softness:.5,
 scale:1,flow:.5,speed:1,grain:.08,variation:0,mouseInteraction:true,scrambleRadius:.1,clickEffect:'wave',intro:true,lightMode:false,
 fontFamily:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',dpr:1.5,paused:false,showContent:false};
export function gradientAsciiQuery(config){const params=new URLSearchParams();for(const [key,value] of Object.entries(config))params.set(key,key==='colors'?value.join(','):String(value));return params.toString();}
export function parseGradientAsciiQuery(query){
 const config={...gradientAsciiDefaults};
 for(const [key,,min,max] of gradientAsciiRanges){if(query.has(key)){const n=Number(query.get(key));if(Number.isFinite(n))config[key]=Math.max(min,Math.min(max,n));}}
 for(const key of ['mouseInteraction','intro','lightMode','paused','showContent'])if(query.has(key))config[key]=query.get(key)==='true';
 if(['horizon','pinch','rise','eclipse'].includes(query.get('shape')))config.shape=query.get('shape');
 if(['wave','burst','none'].includes(query.get('clickEffect')))config.clickEffect=query.get('clickEffect');
 if(query.has('colors')){const list=query.get('colors').split(',').filter(c=>/^#[0-9a-f]{6}$/i.test(c)).slice(0,8);if(list.length>=2)config.colors=list;}
 if(query.has('characters'))config.characters=Array.from(query.get('characters')).slice(0,128).join('');
 if(query.has('fontFamily')&&query.get('fontFamily').trim())config.fontFamily=query.get('fontFamily').slice(0,200);
 return config;
}
export function gradientAsciiUsage(config){
 const props=Object.entries(config).filter(([key])=>!['showContent','paused'].includes(key)).map(([key,value])=>{
  if(Array.isArray(value))return `        ${key}={${JSON.stringify(value)}}`;
  if(typeof value==='string')return `        ${key}={${JSON.stringify(value)}}`;
  return `        ${key}={${value}}`;
 }).join('\n');
 return `import { useState } from 'react';\nimport GradientASCII from './components/GradientASCII';\n\nexport default function AsciiHero() {\n  const [paused, setPaused] = useState(${config.paused});\n  return (\n    <section style={{ position: 'relative', height: 620, overflow: 'hidden',\n      background: '${config.lightMode?'#f5f7fb':'#101016'}', color: '${config.lightMode?'#172033':'#fff'}' }}>\n      <GradientASCII\n${props}\n        paused={paused}\n        style={{ position: 'absolute', inset: 0 }}\n      />\n      <div style={{ position: 'relative', padding: 32, paddingTop: 400 }}>\n        <h1>A little light. A lot of character.</h1>\n        <button onClick={() => setPaused(value => !value)}>\n          {paused ? 'Resume animation' : 'Pause animation'}\n        </button>\n      </div>\n    </section>\n  );\n}`;
}
