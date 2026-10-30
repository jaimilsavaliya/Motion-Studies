export const ditherVeilDemo={src:'/dither-veil/iridescence.webp',alt:'An iridescent sculptural head, looking upward',source:'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop'};
export const ditherVeilDefaults={src:ditherVeilDemo.src,alt:ditherVeilDemo.alt,fit:'contain',pattern:'floyd',palette:'duotone',pixelSize:2,levels:2,inkColor:'#120f17',paperColor:'#f4f1ea',contrast:1.15,brightness:0,revealRadius:200,softness:.6,linger:1,rimColor:'#a78bfa',rim:0,reverse:false,wander:false,clickBurst:true,paused:false,pixelRatio:1.5,height:600};
export const ditherVeilPatterns=[['floyd','Floyd–Steinberg'],['bayer','Bayer'],['noise','Blue-noise stipple'],['atkinson','Atkinson'],['lines','Engraving lines']];
export const ditherVeilRanges=[['height','Stage height',320,900,10,'px'],['pixelSize','Pixel size',1,10,1,'px'],['levels','Levels',2,6,1,''],['contrast','Contrast',.5,2,.05,''],['brightness','Brightness',-.4,.4,.02,''],['revealRadius','Reveal radius',40,300,5,'px'],['softness','Softness',0,1,.05,''],['linger','Linger',0,4,.1,'s'],['rim','Rim',0,.6,.02,''],['pixelRatio','Pixel ratio cap',.5,2,.25,'']];
export const ditherVeilSwitches=[['reverse','Reverse'],['wander','Wander'],['clickBurst','Click burst'],['paused','Pause wandering']];
export function parseDitherVeilQuery(query){
 const config={...ditherVeilDefaults};
 for(const [key,,min,max] of ditherVeilRanges)if(query.has(key)&&query.get(key).trim()!==''){const n=Number(query.get(key));if(Number.isFinite(n))config[key]=Math.max(min,Math.min(max,n));}
 config.levels=Math.round(config.levels);
 for(const [key] of ditherVeilSwitches)if(query.has(key))config[key]=query.get(key)==='true';
 for(const [key,values] of Object.entries({fit:['contain','cover'],pattern:ditherVeilPatterns.map(p=>p[0]),palette:['duotone','rgb']}))if(values.includes(query.get(key)))config[key]=query.get(key);
 for(const key of ['inkColor','paperColor','rimColor'])if(/^#[0-9a-f]{6}$/i.test(query.get(key)||''))config[key]=query.get(key);
 if(query.has('src')){const src=query.get('src').trim();if(src===''||/^(https?:\/\/|\/(?!\/)|data:image\/)/i.test(src))config.src=src.slice(0,1000000);}
 if(query.has('alt'))config.alt=query.get('alt').slice(0,500);
 return config;
}
export function ditherVeilUsage(config){
 const values={...config};delete values.height;
 if(values.src===ditherVeilDemo.src)values.src='/photos/sculpture.jpg';
 const lines=Object.entries(values).filter(([key])=>key!=='paused').map(([key,value])=>`        ${key}={${JSON.stringify(value)}}`).join('\n');
 return `'use client';\n\nimport {useState} from 'react';\nimport DitherVeil from './components/DitherVeil';\n\n// Supply your own image. Remote hosts must permit CORS.\nexport default function VeiledImage() {\n  const [paused,setPaused]=useState(${!!config.paused});\n  return <section>\n    <div style={{height:${config.height},overflow:'hidden',borderRadius:16}}>\n      <DitherVeil\n${lines}\n        paused={paused}\n      />\n    </div>\n    ${config.wander?'<button onClick={()=>setPaused(value=>!value)}>{paused?\'Resume wandering\':\'Pause wandering\'}</button>':'{/* If you enable wander, provide a pause control using setPaused. */}'}\n  </section>;\n}`;
}
