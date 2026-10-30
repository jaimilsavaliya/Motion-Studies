import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,Check,ChevronDown,ChevronRight,Download,Expand,FileCode2,Info,Monitor,RotateCcw,SlidersHorizontal,Smartphone} from 'lucide-react';
import {getComponent} from '../library/registry';
import CodeBlock from '../library/CodeBlock';
import {passageGalleryPresets} from '../components/PassageGallery';
import {passageGalleryDefaults as defaults,passageGalleryRanges as ranges,passageGallerySwitches as switches,passageGalleryScenes as sceneOptions,passageGalleryUsage} from '../library/passageGalleryConfig';
import './PassageGalleryPage.css';
export default function PassageGalleryPage(){
 const component=getComponent('passage-gallery');
 const[tab,setTab]=useState('Preview'),[device,setDevice]=useState('desktop'),[settings,setSettings]=useState(false);
 const[config,setConfig]=useState(defaults),[live,setLive]=useState(defaults),[version,setVersion]=useState(0);
 useEffect(()=>{document.title='Passage Gallery — Motion studies';},[]);
 useEffect(()=>{const timer=setTimeout(()=>setLive(config),180);return()=>clearTimeout(timer);},[config]);
 const update=(key,value)=>setConfig(old=>({...old,[key]:value}));
 const params=()=>{const search=new URLSearchParams();
  for(const[key,value]of Object.entries(live)){
   if(key==='preset'&&value==='passage')continue;
   if(key==='ariaLabel'||key==='scenes'){
    if(key==='scenes'&&value.join(',')!==defaults.scenes.join(','))search.set('scenes',value.join(','));
    continue;
   }
   if(key==='colors'){search.append('color',value[0]);search.append('color',value[1]);continue;}
   if(value===defaults[key]&&key!=='backgroundColor')continue;
   search.set(key,String(value));
  }
  return search;};
 const preview=`/preview/passage-gallery?${params()}`,usage=passageGalleryUsage(config);
 const reset=()=>{setConfig(defaults);setLive(defaults);setVersion(v=>v+1);};
 const toggleScene=key=>update('scenes',config.scenes.includes(key)?config.scenes.filter(value=>value!==key):[...config.scenes,key]);
 const showTab=name=>{setTab(name);document.getElementById('playground').scrollIntoView({behavior:'smooth'});};
 return <div className="ms-doc-layout"><article className="ms-component-doc">
  <div className="ms-breadcrumb"><Link to="/components">Components</Link><ChevronRight size={12}/><span>Media</span><ChevronRight size={12}/><span>Passage Gallery</span></div>
  <div className="ms-detail-heading"><div><div className="ms-page-eyebrow">STUDY 024 <span className="ms-eyebrow-rule"/> MEDIA</div><h1>Passage Gallery</h1></div><span className="ms-new-badge"><span className="ms-small-dot"/> New</span></div>
  <p className="ms-detail-description">{component.description}</p><div className="ms-detail-tags"><span><span className="ms-react-symbol">⚛</span> React</span><span>Canvas 2D</span><span>Infinite tunnel</span><span>No 3D library</span></div>
  <section id="playground" className="ms-playground pg-playground">
   <div className="ms-playground-tabs"><div role="tablist" aria-label="Component preview and source">{['Preview','Usage','Component','CSS'].map(name=><button key={name} id={`tab-${name}`} aria-controls="playground-panel" role="tab" aria-selected={tab===name} className={tab===name?'active':''} onClick={()=>setTab(name)}>{name}</button>)}</div><a href={preview} target="_blank" rel="noreferrer" className="ms-icon-button" aria-label="Open full-screen preview"><Expand size={15}/></a></div>
   <div id="playground-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
    {tab==='Preview'?<><div className="ms-preview-toolbar"><span><span className="ms-small-dot"/> LIVE PASSAGE GALLERY</span><div><div className="ms-device-switch"><button className={device==='desktop'?'active':''} onClick={()=>setDevice('desktop')} aria-label="Desktop preview"><Monitor size={14}/></button><button className={device==='mobile'?'active':''} onClick={()=>setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={14}/></button></div><span className="ms-toolbar-divider"/><button className="ms-icon-button" onClick={()=>setVersion(v=>v+1)} aria-label="Restart preview"><RotateCcw size={14}/></button></div></div>
    <div className={`ms-iframe-wrap ${device}`}><iframe key={version} src={`${preview}&embed=1`} title="Passage Gallery interactive preview"/></div>
    <div className="ms-playground-bottom"><span>Move to look around, hold to speed up, click a photo to bring it forward.</span><button onClick={()=>setSettings(!settings)} aria-expanded={settings}><SlidersHorizontal size={13}/> Customize <ChevronDown size={12} className={settings?'rotated':''}/></button></div></>:<CodeBlock code={tab==='Usage'?usage:tab==='Component'?component.source:component.css} filename={tab==='Usage'?'Hero.jsx':tab==='Component'?component.filename:component.cssFilename} language={tab==='CSS'?'css':'jsx'}/>}
   </div>
   {settings&&<div className="ms-customize"><div className="ms-customize-heading"><span>Make it yours</span><button onClick={reset}><RotateCcw size={11}/> Reset</button></div><div className="ms-customize-grid">
    <label>Preset<select aria-label="Preset" value={config.preset} onChange={e=>setConfig(old=>({...old,preset:e.target.value,...passageGalleryPresets[e.target.value]}))}>{Object.keys(passageGalleryPresets).map(name=><option key={name} value={name}>{name[0].toUpperCase()+name.slice(1)}</option>)}</select></label>
    <label>Accent A<span className="ms-color-input"><input type="color" aria-label="Accent A" value={config.colors[0]} onChange={e=>update('colors',[e.target.value,config.colors[1]])}/><code>{config.colors[0]}</code></span></label>
    <label>Accent B<span className="ms-color-input"><input type="color" aria-label="Accent B" value={config.colors[1]} onChange={e=>update('colors',[config.colors[0],e.target.value])}/><code>{config.colors[1]}</code></span></label>
    <label>Background<span className="ms-color-input"><input type="color" aria-label="Background" value={config.backgroundColor==='transparent'?'#0a0a0a':config.backgroundColor} onChange={e=>update('backgroundColor',e.target.value)}/><code>{config.backgroundColor}</code></span></label>
    <label className="pg-scenes">Scenes<span>{config.scenes.length} of {sceneOptions.length}</span><div className="pg-scene-list">{sceneOptions.map(([key,title])=><button key={key} type="button" className={config.scenes.includes(key)?'active':''} aria-pressed={config.scenes.includes(key)} onClick={()=>toggleScene(key)}>{title}</button>)}</div></label>
    {ranges.map(([key,label,min,max,step,unit])=><label key={key}>{label}<span>{config[key]}{unit}</span><input aria-label={label} type="range" min={min} max={max} step={step} value={config[key]} onChange={e=>update(key,Number(e.target.value))}/></label>)}
    {switches.map(([key,label])=><label className="ms-switch-label" key={key}>{label}<button type="button" className="ms-toggle" role="switch" aria-label={label} aria-checked={config[key]} onClick={()=>update(key,!config[key])}><span/></button></label>)}
    <p>Presets only change how the corridor is built and how it moves; your scenes, accents and background stay put. Negative speed travels backwards, radius 0 keeps square tiles and 1 rounds them into ovals.</p>
   </div></div>}
  </section>
  <div className="ms-implementation-note"><Check size={14}/><span>Independent React implementation. Canvas 2D only — no 3D or animation library.</span><a href="/downloads/passage-gallery.zip" download>Download files <Download size={13}/></a></div>
  <section className="ms-doc-section" id="installation"><div className="ms-doc-section-title"><h2>Installation</h2><span>01</span></div><p>Copy two files into a React 18+ project. The reusable core ships without any images.</p><div className="ms-steps"><div className="ms-step"><span>1</span><div><h3>Add the component and styles</h3><p>Copy the <button className="ms-inline-button" onClick={()=>showTab('Component')}>Component</button> and <button className="ms-inline-button" onClick={()=>showTab('CSS')}>CSS</button> tabs, or download the source archive.</p><CodeBlock code={'src/\n└── components/\n    ├── PassageGallery.jsx\n    └── PassageGallery.css'} filename="Project structure" language="text" compact/></div></div><div className="ms-step"><span>2</span><div><h3>Give it a frame</h3><p>The gallery fills its parent and keeps a 420px minimum height. Set a definite height on the parent, such as <code>height:100vh</code> for a full-page hero.</p></div></div><div className="ms-step"><span>3</span><div><h3>Pass your own photos</h3><p>Each item takes <code>src</code>, <code>alt</code> and an optional <code>title</code> used by the caption. Remote images must allow cross-origin loading so their pixels can be drawn. The demo scenes in this study are generated in-house and excluded from the archive.</p></div></div></div><div className="ms-info-callout"><Info size={17}/><div><strong>One corridor, drawn by hand</strong><p>Every frame projects the tile grid with a plain perspective divide, paints it back to front, then projects and draws the open photo on top. There is no three.js, no shader and no reference source — this is an independent implementation of the public interaction.</p></div></div></section>
  <section className="ms-doc-section" id="usage"><div className="ms-doc-section-title"><h2>Usage</h2><span>02</span></div><p>Your current configuration, ready to paste into a page.</p><CodeBlock code={usage} filename="Hero.jsx" language="jsx"/></section>
  <section className="ms-doc-section" id="props"><div className="ms-doc-section-title"><h2>Props</h2><span>03</span></div><div className="ms-table-wrap"><table><thead><tr><th>Prop</th><th>Type / Default</th><th>Description</th></tr></thead><tbody>{component.props.map(([name,type,value,description])=><tr key={name}><td><code>{name}</code></td><td><span className="ms-type">{type}</span><span className="ms-default">{value}</span></td><td>{description}</td></tr>)}</tbody></table></div></section>
  <section className="ms-doc-section" id="examples"><div className="ms-doc-section-title"><h2>A headline over the corridor</h2><span>04</span></div><p>Children sit centred over the tunnel and stay interactive, which is enough for a hero.</p><CodeBlock code={component.exampleUsage} filename="Archive.jsx" language="jsx"/></section>
  <section className="ms-doc-section" id="notes"><div className="ms-doc-section-title"><h2>Good to know</h2><span>05</span></div><div className="ms-notes-grid">
   <div><h3>Deterministic corridor</h3><p>Which cell holds a photo, an accent or nothing is derived from a hash of the cell, the face and the seed. The same corridor tile always holds the same image, so the tunnel reads as a place instead of a slideshow.</p></div>
   <div><h3>Travel, then look</h3><p>The camera moves along the corridor on its own. The pointer adds a small yaw, pitch and lateral shift on top, which is why looking around never stops the motion.</p></div>
   <div><h3>Picking without a picking buffer</h3><p>The tile under the pointer is found by projecting the visible tiles and testing the point against each quad, nearest first. Nothing extra is rendered to hit-test.</p></div>
   <div><h3>Motion blur by layering</h3><p>At speed the same frame is drawn a few times with a small depth offset and reduced coverage, which is enough to smear the corridor without a post-processing pass.</p></div>
   <div><h3>Reduced motion and hidden tabs</h3><p>Reduced-motion users never cruise, drag or blow up the blur, but the tunnel stays browsable. Offscreen instances and hidden tabs stop their animation frame entirely.</p></div>
   <div><h3>Keyboard and screen readers</h3><p>The canvas is a labelled region in the tab order with a hidden list of every photo. Arrow keys travel a cell, Page Up/Down jump a lane, Home returns to the entrance, Enter opens the nearest photo and Escape puts it back.</p></div>
  </div></section>
  <section className="ms-doc-section" id="use-cases"><div className="ms-doc-section-title"><h2>Made for moments like these</h2><span>06</span></div><div className="ms-use-cases">{component.useCases.map(([title,text],index)=><div key={title}><span>0{index+1}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>
  <div className="ms-doc-end"><span>Independent implementation of the public visual reference.</span><a href="https://pro.reactbits.dev/docs/components/passage-gallery" target="_blank" rel="noreferrer">View reference <ArrowUpRight size={12}/></a></div><Link className="ms-back-collection" to="/components"><div><span className="ms-page-eyebrow">KEEP EXPLORING</span><h3>Back to the collection</h3></div><ArrowRight size={20}/></Link>
 </article><aside className="ms-toc"><span className="ms-nav-label">ON THIS PAGE</span>{[['playground','Playground'],['installation','Installation'],['usage','Usage'],['props','Props'],['examples','A headline over the corridor'],['notes','Good to know'],['use-cases','Use cases']].map(([id,label])=><a href={`#${id}`} key={id}>{label}</a>)}<div className="ms-toc-note"><FileCode2 size={18}/><p>Glide the<br/>corridor.</p><a href="/downloads/passage-gallery.zip" download>Get the source <Download size={12}/></a></div></aside></div>;
}
