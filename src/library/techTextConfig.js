import {techTextPresets} from '../components/TechText';
export const techTextDefaults={preset:'vector',text:'Tech Text',...techTextPresets.vector,fontSize:150,align:'center',color:'#ffffff',accentColor:'#ffffff',selection:true,draggable:true,clickKick:true,sweep:true,speed:1,paused:false,pixelRatio:1.5,height:480};
export const techTextRanges=[['height','Stage height',280,800,10,'px'],['fontSize','Font size',60,320,5,'px'],['fontWeight','Font weight',300,900,50,''],['letterSpacing','Letter spacing',-.1,.2,.01,'em'],['introDuration','Intro duration',.6,4,.1,'s'],['reach','Reach',80,400,5,'px'],['softness','Softness',0,1,.05,''],['speed','Sweep speed',.2,3,.1,''],['bounce','Bounce',0,.9,.05,''],['dashLength','Dash length',2,16,1,'px'],['dashGap','Dash gap',2,12,1,'px'],['strokeWidth','Stroke width',.5,4,.25,'px'],['specks','Specks',0,48,1,''],['pixelRatio','Pixel ratio cap',.5,2,.25,'']];
export const techTextSwitches=[['clickKick','Click kick'],['draggable','Draggable'],['sweep','Idle sweep'],['selection','Selection frame'],['labels','Labels'],['guides','Font guides'],['paused','Pause motion']];
export const techTextFonts=[['','Inherit'],['"Geist Mono", ui-monospace, monospace','Geist Mono'],['Georgia, "Times New Roman", serif','Serif'],['Arial, sans-serif','Arial'],['ui-monospace, monospace','System mono']];
export function parseTechTextQuery(query){
 const preset=Object.hasOwn(techTextPresets,query.get('preset'))?query.get('preset'):'vector';const c={...techTextDefaults,...techTextPresets[preset],preset};
 for(const[key,,min,max]of techTextRanges)if(query.has(key)&&query.get(key).trim()!==''){const n=Number(query.get(key));if(Number.isFinite(n))c[key]=Math.max(min,Math.min(max,n));}c.specks=Math.round(c.specks);
 for(const[key]of techTextSwitches)if(query.has(key))c[key]=query.get(key)==='true';
 for(const[key,options]of Object.entries({align:['left','center','right'],reveal:['letter','area','off'],lineStyle:['dashed','solid'],intro:['none','type','assemble','metrics']}))if(options.includes(query.get(key)))c[key]=query.get(key);
 for(const key of['color','accentColor'])if(/^#[0-9a-f]{6}$/i.test(query.get(key)||''))c[key]=query.get(key);
 if(query.has('text'))c.text=query.get('text').slice(0,384);if(query.has('fontFamily'))c.fontFamily=query.get('fontFamily').slice(0,300);
 return c;
}
export function techTextUsage(config){
 const values={...config};delete values.preset;delete values.height;delete values.paused;
 const lines=Object.entries(values).map(([key,value])=>`        ${key}={${JSON.stringify(value)}}`).join('\n');
 return `'use client';\n\nimport {useState} from 'react';\nimport TechText from './components/TechText';\n\nexport default function Wordmark() {\n  const [paused,setPaused]=useState(${!!config.paused});\n  return <section>\n    <div style={{height:${config.height},background:'#120f17',color:'#fff',borderRadius:16,overflow:'hidden'}}>\n      <TechText\n${lines}\n        paused={paused}\n      />\n    </div>\n    <button onClick={()=>setPaused(value=>!value)}>\n      {paused?'Resume motion':'Pause motion'}\n    </button>\n  </section>;\n}`;
}
