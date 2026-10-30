import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,Check,ChevronRight,Download,Expand,FileCode2,Info,Monitor,RotateCcw,Smartphone} from 'lucide-react';
import {getComponent} from '../library/registry';
import CodeBlock from '../library/CodeBlock';
import projectsSource from '../components/viscose-carousel/ring/projects.js?raw';
import noticesSource from '../components/viscose-carousel/THIRD_PARTY_NOTICES.md?raw';
import './ViscoseCarouselPage.css';

const structure=`src/
└── components/
    ├── ViscoseCarousel.jsx
    ├── ViscoseCarousel.css
    └── viscose-carousel/
        ├── ring/
        ├── shaders/
        ├── licenses/
        └── THIRD_PARTY_NOTICES.md
public/
└── viscose-original/
    └── study-01.webp … study-18.webp`;

const install=`npm install three gsap lil-gui`;

export default function ViscoseCarouselPage(){
 const component=getComponent('viscose-carousel');
 const [tab,setTab]=useState('Preview');
 const [device,setDevice]=useState('desktop');
 const [version,setVersion]=useState(0);
 useEffect(()=>{document.title='Viscose Carousel — Motion studies';},[]);
 if(!component)return null;
 const preview='/preview/viscose-carousel';
 const tabCode={
  Usage:component.usage,
  'Core renderer':component.source,
  'Stage CSS':component.css,
  'Project data':projectsSource,
  Notices:noticesSource,
 };
 const selectTab=name=>{setTab(name);document.getElementById('playground')?.scrollIntoView({behavior:'smooth'});};
 return <div className="ms-doc-layout"><article className="ms-component-doc">
  <div className="ms-breadcrumb"><Link to="/components">Components</Link><ChevronRight size={12}/><span>Carousels</span><ChevronRight size={12}/><span>Viscose Carousel</span></div>
  <div className="ms-detail-heading"><div><div className="ms-page-eyebrow">STUDY 027 <span className="ms-eyebrow-rule"/> CAROUSELS</div><h1>Viscose Carousel</h1></div><span className="ms-new-badge"><span className="ms-small-dot"/> Original source</span></div>
  <p className="ms-detail-description">{component.description}</p>
  <div className="ms-detail-tags"><span><span className="ms-react-symbol">⚛</span> React</span><span>Three.js + GLSL</span><span>GSAP</span><span>Full-screen WebGL</span></div>

  <section id="playground" className="ms-playground viscose-playground">
   <div className="ms-playground-tabs"><div role="tablist" aria-label="Viscose source and preview">{['Preview','Usage','Core renderer','Stage CSS','Project data','Notices'].map(name=><button key={name} id={`tab-${name}`} aria-controls="playground-panel" role="tab" aria-selected={tab===name} className={tab===name?'active':''} onClick={()=>selectTab(name)}>{name}</button>)}</div><a href={preview} target="_blank" rel="noreferrer" className="ms-icon-button" aria-label="Open original implementation in a full-screen preview"><Expand size={15}/></a></div>
   <div id="playground-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
    {tab==='Preview'?<>
     <div className="ms-preview-toolbar"><span><span className="ms-small-dot"/> UPSTREAM WEBGL RUNTIME</span><div><div className="ms-device-switch"><button className={device==='desktop'?'active':''} onClick={()=>setDevice('desktop')} aria-label="Desktop preview"><Monitor size={14}/></button><button className={device==='mobile'?'active':''} onClick={()=>setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={14}/></button></div><span className="ms-toolbar-divider"/><button className="ms-icon-button" onClick={()=>setVersion(value=>value+1)} aria-label="Restart upstream preview"><RotateCcw size={14}/></button></div></div>
     <div className={`ms-iframe-wrap ${device} viscose-iframe-wrap`}><iframe key={version} src={`${preview}?embed=1`} title="Original Viscose Carousel interactive preview" loading="eager"/></div>
     <div className="ms-playground-bottom"><span>Wait for the seed to form, then drag or wheel the ring. Select a settled front card to open its story.</span><a href={`${preview}?gui=1`} target="_blank" rel="noreferrer">Open runtime <Expand size={12}/></a></div>
    </>:<CodeBlock code={tabCode[tab]} filename={tab==='Usage'?'SelectedWork.jsx':tab==='Core renderer'?component.filename:tab==='Stage CSS'?component.cssFilename:tab==='Project data'?'ring/projects.js':'THIRD_PARTY_NOTICES.md'} language={tab==='Stage CSS'?'css':tab==='Notices'?'markdown':'jsx'}/>} 
   </div>
  </section>

  <div className="ms-implementation-note"><Check size={14}/><span>Adapted directly from the MIT-licensed upstream Viscose Carousel source by Yousuf Soomro; Vite paths, scoped CSS, system fonts, and local replacement artwork only.</span><a href="/downloads/viscose-carousel.zip" download>Download files <Download size={13}/></a></div>

  <section className="ms-doc-section" id="installation"><div className="ms-doc-section-title"><h2>Installation</h2><span>01</span></div><p>This is the upstream full-screen experience, not a container-sized carousel API. Copy the archive intact and mount it on a dedicated route or a view that owns the viewport.</p><div className="ms-steps">
   <div className="ms-step"><span>1</span><div><h3>Install the renderer dependencies</h3><CodeBlock code={install} filename="Terminal" language="bash" compact/></div></div>
   <div className="ms-step"><span>2</span><div><h3>Keep the supporting modules together</h3><p>The renderer imports its ring, shader, notice, and asset files relatively. Copy the complete source tree rather than only the top-level JSX file.</p><CodeBlock code={structure} filename="Project structure" language="text" compact/></div></div>
   <div className="ms-step"><span>3</span><div><h3>Use it as a full-viewport stage</h3><p>Import the component and its stylesheet, then render <code>&lt;ViscoseCarousel /&gt;</code> on a dedicated page. The original stage deliberately uses fixed positioning and owns its scrolling project view.</p></div></div>
  </div><div className="ms-info-callout"><Info size={17}/><div><strong>Source integration, not an imitation</strong><p>The 4,000-line WebGL runtime, ring modules, shaders, GSAP timelines, and project-opening behavior are the original upstream implementation. Only host-environment and asset restrictions were adapted.</p></div></div></section>

  <section className="ms-doc-section" id="data"><div className="ms-doc-section-title"><h2>Project data and artwork</h2><span>02</span></div><p>The upstream runtime gets its content from <code>ring/projects.js</code>. Edit that local file to change names, facts, project copy, media entries, and insights; place matching media under <code>public/viscose-original/</code>.</p><CodeBlock code={component.exampleUsage} filename="ring/projects.js" language="jsx"/><div className="ms-notes-grid"><div><h3>Local placeholder artwork</h3><p>The included abstract SVG studies are new local replacement media. They keep the renderer working while deliberately avoiding the upstream project photos and clips.</p></div><div><h3>Media permissions</h3><p>Use imagery and video you are allowed to redistribute. The upstream repository’s <code>public/</code> media is explicitly outside its source-code license and is not included here.</p></div><div><h3>Fonts</h3><p>This integration uses system font fallbacks. PP Neue Montreal and the upstream bundled font files are not copied or required.</p></div></div></section>

  <section className="ms-doc-section" id="runtime"><div className="ms-doc-section-title"><h2>Runtime notes</h2><span>03</span></div><div className="ms-notes-grid"><div><h3>Original interaction model</h3><p>The scene begins from a seed, fans into the project ring, responds to drag and wheel movement, snaps a project forward, then grows a selected frame into a scrolling editorial view.</p></div><div><h3>WebGL and motion</h3><p>Three.js draws the liquid card field and text treatment; GSAP drives the entrance, selection, and open/close timelines. A browser with WebGL support is required for the intended result.</p></div><div><h3>Development panel</h3><p>In a development build, append <code>?gui=1</code> to the runtime URL or press <kbd>G</kbd> to inspect the upstream tuning panel. It is omitted from production builds.</p></div><div><h3>Fit and performance</h3><p>The source caps device pixel ratio and packs images into atlases. Use compressed, appropriately sized project media when replacing the compact local SVG studies.</p></div><div><h3>Licensing</h3><p>Retain the included MIT license and third-party notices when redistributing. The shader also retains the simplex-noise MIT attribution for Ashima Arts and Stefan Gustavson.</p></div><div><h3>Scoped integration</h3><p>The supporting CSS is scoped to the Viscose host so its room colors and full-screen scene do not restyle the surrounding Motion Studies interface.</p></div></div></section>

  <section className="ms-doc-section" id="source"><div className="ms-doc-section-title"><h2>Attribution</h2><span>04</span></div><p><strong>Viscose Carousel</strong> was created by Yousuf Soomro and released under the MIT License. This library includes the original source code with narrowly documented integration changes.</p><div className="ms-info-callout"><FileCode2 size={17}/><div><strong>Required notice retained</strong><p>Download the archive for <code>Viscose-MIT-LICENSE.txt</code>, third-party notices, the original shader attribution, local media, and all ring support files.</p><p><a href="https://github.com/Yousuf-developer/Viscose-carousel" target="_blank" rel="noreferrer">View the upstream repository ↗</a></p></div></div></section>

  <div className="ms-doc-end"><span>Original Viscose Carousel source.</span><span>Local assets only; notices included.</span></div>
  <Link className="ms-back-collection" to="/components"><div><span className="ms-page-eyebrow">KEEP EXPLORING</span><h3>Back to the collection</h3></div><ArrowRight size={20}/></Link>
 </article><aside className="ms-toc"><span className="ms-nav-label">ON THIS PAGE</span>{[['playground','Playground'],['installation','Installation'],['data','Project data'],['runtime','Runtime notes'],['source','Attribution']].map(([id,label])=><a href={`#${id}`} key={id}>{label}</a>)}<div className="ms-toc-note"><FileCode2 size={18}/><p>Turn the ring.<br/>Open a story.</p><a href="/downloads/viscose-carousel.zip" download>Get the source <Download size={12}/></a></div></aside></div>;
}
