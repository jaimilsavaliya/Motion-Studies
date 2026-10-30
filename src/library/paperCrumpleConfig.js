import {paperCrumpleDefaults as coreDefaults} from '../components/PaperCrumple';

export const paperCrumpleScenes=[
 ['field-notes','Handwritten midnight note','/paper-crumple/scenes/field-notes.webp','An original handwritten note on warm white paper'],
 ['signal-grid','Reverse-side fragments','/paper-crumple/scenes/signal-grid.webp','A spare reverse page with handwritten fragments and fold marks']
];

export const paperCrumpleDefaults={
 scene:'field-notes',backScene:'signal-grid',
 width:312,height:312,sceneHeight:360,imageFit:'contain',releaseBehavior:'restore',
 crumpleAmount:.85,crumpleDuration:.55,releaseDuration:.4,foldCount:6,foldSharpness:.6,
 wrinkleDepth:.65,creaseStrength:.18,paperColor:'#f4f0e8',roughness:.92,paperTexture:.08,
 lightIntensity:1.8,lightAngle:-35,shadow:true,shadowOpacity:.16,draggable:true,dragRotation:10,
 dragRadius:180,returnToOrigin:true,rotation:0,seed:7,detail:64,disabled:false
};

export const paperCrumpleRanges=[
 ['width','Width',160,560,10,'px'],['height','Height',180,700,10,'px'],['sceneHeight','Scene height',320,760,20,'px'],
 ['crumpleAmount','Crumple amount',0,1,.01,''],['crumpleDuration','Hold duration',0,2,.05,'s'],['releaseDuration','Release duration',0,2,.05,'s'],
 ['creaseStrength','Crease strength',0,1,.01,''],['foldCount','Fold density',3,16,1,''],['foldSharpness','Fold sharpness',0,1,.05,''],
 ['wrinkleDepth','Wrinkle depth',0,2,.05,''],['paperTexture','Paper grain',0,1,.01,''],['roughness','Roughness',0,1,.01,''],
 ['lightIntensity','Light strength',0,4,.1,''],['lightAngle','Light angle',-180,180,1,'°'],['shadowOpacity','Shadow opacity',0,1,.01,''],
 ['dragRotation','Drag tilt',0,30,1,'°'],['dragRadius','Drop radius',0,400,10,'px'],['rotation','Rotation',-30,30,1,'°'],['seed','Fold seed',0,40,1,''],['detail','Mesh detail',32,96,1,'']
];

const selected=(key)=>paperCrumpleScenes.find(([name])=>name===key)||paperCrumpleScenes[0];
export function paperCrumpleSources(config){
 const [,title,src,alt]=selected(config.scene);
 const [,backTitle,backSrc]=selected(config.backScene);
 return{title,src,alt,backTitle,backSrc};
}

export function parsePaperCrumpleQuery(query){
 const config={...paperCrumpleDefaults};
 for(const [key,,min,max] of paperCrumpleRanges){
  if(!query.has(key)||query.get(key).trim()==='')continue;
  const value=Number(query.get(key));if(Number.isFinite(value))config[key]=Math.max(min,Math.min(max,value));
 }
 if(['cover','contain'].includes(query.get('imageFit')))config.imageFit=query.get('imageFit');
 if(['stay','restore','creased'].includes(query.get('releaseBehavior')))config.releaseBehavior=query.get('releaseBehavior');
 if(paperCrumpleScenes.some(([key])=>key===query.get('scene')))config.scene=query.get('scene');
 if(paperCrumpleScenes.some(([key])=>key===query.get('backScene')))config.backScene=query.get('backScene');
 for(const key of ['shadow','draggable','returnToOrigin','disabled'])if(query.has(key))config[key]=query.get(key)!=='false';
 if(query.has('paperColor')&&/^#[0-9a-f]{6}$/i.test(query.get('paperColor')))config.paperColor=query.get('paperColor');
 return config;
}

export function paperCrumpleUsage(config){
 const {src,backSrc,alt}=paperCrumpleSources(config);
 return `'use client';

import PaperCrumple from './components/PaperCrumple';

export default function FieldNote() {
  return (
    <PaperCrumple
      src="${src}"
      backSrc="${backSrc}"
      alt="${alt}"
      width={${config.width}}
      height={${config.height}}
      sceneHeight={${config.sceneHeight}}
      releaseBehavior="${config.releaseBehavior}"
      crumpleAmount={${config.crumpleAmount}}
      foldCount={${config.foldCount}}
      wrinkleDepth={${config.wrinkleDepth}}
      draggable={${config.draggable}}
    />
  );
}`;
}

export {coreDefaults};
