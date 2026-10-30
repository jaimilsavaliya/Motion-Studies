import ScrollExpandPage from './ScrollExpandPage';
import PassageGalleryPage from './PassageGalleryPage';
import DomeGalleryPage from './DomeGalleryPage';
import PaperCrumplePage from './PaperCrumplePage';
import ViscoseCarouselPage from './ViscoseCarouselPage';
import TechTextPage from './TechTextPage';
import DitherVeilPage from './DitherVeilPage';
import FlexCarouselPage from './FlexCarouselPage';
import GradientASCIIPage from './GradientASCIIPage';
import MarqueeAlongSvgPathPage from './MarqueeAlongSvgPathPage';
import DragElementsPage from './DragElementsPage';
import InfiniteCanvasPage from './InfiniteCanvasPage';
import HoverMembersPage from './HoverMembersPage';
import TikTikColorListPage from './TikTikColorListPage';
import PolaroidFlipCardPage from './PolaroidFlipCardPage';
import ShutterGalleryPage from './ShutterGalleryPage';
import TypeGardenPage from './TypeGardenPage';
import ImageWheelPage from './ImageWheelPage';
import ElasticCarouselPage from './ElasticCarouselPage';
import FocusScaleCarouselPage from './FocusScaleCarouselPage';
import ParallaxCarouselPage from './ParallaxCarouselPage';
import BentoGridPage from './BentoGridPage';
import TextCylinderPage from './TextCylinderPage';
import RadialPopOutPage from './RadialPopOutPage';
import HoverRevealPage from './HoverRevealPage';
import EclipsePage from './EclipsePage';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Download, Expand, ExternalLink, FileCode2, Info, Monitor, RotateCcw, SlidersHorizontal, Smartphone } from 'lucide-react';
import { getComponent } from '../library/registry';
import CodeBlock from '../library/CodeBlock';
import NotFound from './NotFound';

export default function ComponentPage() {
  const { slug } = useParams();
  return slug === 'viscose-carousel' ? <ViscoseCarouselPage /> : slug === 'paper-crumple' ? <PaperCrumplePage /> : slug === 'dome-gallery' ? <DomeGalleryPage /> : slug === 'passage-gallery' ? <PassageGalleryPage /> : slug === 'scroll-expand' ? <ScrollExpandPage /> : slug === 'tech-text' ? <TechTextPage /> : slug === 'dither-veil' ? <DitherVeilPage /> : slug === 'flex-carousel' ? <FlexCarouselPage /> : slug === 'gradient-ascii' ? <GradientASCIIPage /> : slug === 'marquee-along-svg-path' ? <MarqueeAlongSvgPathPage /> : slug === 'drag-elements' ? <DragElementsPage /> : slug === 'infinite-canvas' ? <InfiniteCanvasPage /> : slug === 'hover-members' ? <HoverMembersPage /> : slug === 'tik-tik-color-list' ? <TikTikColorListPage /> : slug === 'polaroid-flip-card' ? <PolaroidFlipCardPage /> : slug === 'shutter-gallery' ? <ShutterGalleryPage /> : slug === 'type-garden' ? <TypeGardenPage /> : slug === 'image-wheel' ? <ImageWheelPage /> : slug === 'elastic-carousel' ? <ElasticCarouselPage /> : slug === 'focus-scale-carousel' ? <FocusScaleCarouselPage /> : slug === 'parallax-carousel' ? <ParallaxCarouselPage /> : slug === 'bento-grid' ? <BentoGridPage /> : slug === 'text-cylinder' ? <TextCylinderPage /> : slug === 'radial-pop-out' ? <RadialPopOutPage /> : slug === 'hover-reveal' ? <HoverRevealPage /> : slug === 'eclipse' ? <EclipsePage /> : <ScrollZoomPage />;
}

function ScrollZoomPage() {
  const { slug } = useParams();
  const component = getComponent(slug);
  const [tab, setTab] = useState('Preview');
  const [device, setDevice] = useState('desktop');
  const [settings, setSettings] = useState(false);
  const [radius, setRadius] = useState(24);
  const [distance, setDistance] = useState(200);
  const [media, setMedia] = useState('video');
  const [leading, setLeading] = useState('Above');
  const [trailing, setTrailing] = useState('the shoreline');
  const [previewKey, setPreviewKey] = useState(0);
  useEffect(() => { setTab('Preview'); document.title = component ? `${component.name} — Motion studies` : 'Component not found'; }, [slug, component]);
  if (!component) return <NotFound />;
  const preview = `/preview/${slug}?${new URLSearchParams({ embed: '1', radius, distance, media, leading, trailing })}`;
  const changedUsage = component.usage.replace('leading="Above"', `leading={${JSON.stringify(leading)}}`).replace('trailing="the shoreline"', `trailing={${JSON.stringify(trailing)}}`).replace('radius={24}', `radius={${radius}}`).replace('scrollDistance={200}', `scrollDistance={${distance}}`);
  const usage = media === 'image' ? changedUsage.replace(/<video[\s\S]*?\/>/, '<img\n        src="/coast-poster.jpg"\n        alt="Waves breaking on a rocky shoreline"\n      />') : changedUsage;
  const reset = () => { setRadius(24); setDistance(200); setMedia('video'); setLeading('Above'); setTrailing('the shoreline'); setPreviewKey(v => v + 1); };
  return <div className="ms-doc-layout"><article className="ms-component-doc">
    <div className="ms-breadcrumb"><Link to="/components">Components</Link><ChevronRight size={12} /><span>{component.category}</span><ChevronRight size={12} /><span>{component.name}</span></div>
    <div className="ms-detail-heading"><div><div className="ms-page-eyebrow">STUDY {component.number} <span className="ms-eyebrow-rule" /> {component.category.toUpperCase()}</div><h1>{component.name}</h1></div><span className="ms-new-badge"><span className="ms-small-dot" /> New</span></div>
    <p className="ms-detail-description">{component.description}</p><div className="ms-detail-tags"><span><span className="ms-react-symbol">⚛</span> React</span><span>CSS</span><span>Responsive</span><span>No animation dependencies</span></div>
    <section id="playground" className="ms-playground"><div className="ms-playground-tabs"><div role="tablist" aria-label="Component preview and source">{['Preview', 'Usage', 'Component', 'CSS'].map(t => <button key={t} id={`tab-${t}`} aria-controls="playground-panel" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''}>{t}</button>)}</div><a href={`/preview/${slug}`} target="_blank" rel="noreferrer" className="ms-icon-button" aria-label="Open full-screen preview" title="Open full-screen preview"><Expand size={15} /></a></div>
    <div id="playground-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
    {tab === 'Preview' ? <><div className="ms-preview-toolbar"><span><span className="ms-small-dot" /> LIVE PLAYGROUND</span><div><div className="ms-device-switch"><button className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview" title="Desktop preview"><Monitor size={14} /></button><button className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview" title="Mobile preview"><Smartphone size={14} /></button></div><span className="ms-toolbar-divider" /><button className="ms-icon-button" onClick={() => setPreviewKey(v => v + 1)} aria-label="Restart preview" title="Restart preview"><RotateCcw size={14} /></button></div></div><div className={`ms-iframe-wrap ${device}`}><iframe key={previewKey} src={preview} title={`${component.name} interactive preview`} loading="eager" /></div><div className="ms-playground-bottom"><span>Scroll within the preview to interact.</span><button onClick={() => setSettings(!settings)} aria-expanded={settings}><SlidersHorizontal size={13} /> Customize <ChevronDown size={12} className={settings ? 'rotated' : ''} /></button></div></> : <CodeBlock code={tab === 'Usage' ? usage : tab === 'Component' ? component.source : component.css} filename={tab === 'Usage' ? 'Hero.jsx' : tab === 'Component' ? component.filename : component.cssFilename} language={tab === 'CSS' ? 'css' : 'jsx'} />}
    </div>
    {settings && <div className="ms-customize"><div className="ms-customize-heading"><span>Make it yours</span><button onClick={reset}><RotateCcw size={11} /> Reset</button></div><div className="ms-customize-grid"><label>Leading text<input value={leading} maxLength="18" onChange={e => setLeading(e.target.value)} /></label><label>Trailing text<input value={trailing} maxLength="24" onChange={e => setTrailing(e.target.value)} /></label><label>Corner radius <span>{radius}px</span><input type="range" min="0" max="48" value={radius} onChange={e => setRadius(Number(e.target.value))} /></label><label>Scroll distance <span>{distance}vh</span><input type="range" min="100" max="400" step="25" value={distance} onChange={e => setDistance(Number(e.target.value))} /></label><label>Media type<select value={media} onChange={e => setMedia(e.target.value)}><option value="video">Video</option><option value="image">Image</option></select></label><p>Changes update the preview and the Usage tab. Copy your configuration when it feels right.</p></div></div>}
    </section>
    <div className="ms-implementation-note"><Check size={14} /><span>Plain React + CSS. No additional animation packages.</span><a href={`/downloads/${slug}.zip`} download>Download files <Download size={13} /></a></div>
    <section className="ms-doc-section" id="installation"><div className="ms-doc-section-title"><h2>Installation</h2><span>01</span></div><p>Copy the component into your project. You own the source, so there’s no registry or extra package to configure.</p><div className="ms-steps"><div className="ms-step"><span>1</span><div><h3>Add the component files</h3><p>Save the <button className="ms-inline-button" onClick={() => { setTab('Component'); document.getElementById('playground').scrollIntoView({ behavior: 'smooth' }); }}>Component</button> and <button className="ms-inline-button" onClick={() => { setTab('CSS'); document.getElementById('playground').scrollIntoView({ behavior: 'smooth' }); }}>CSS</button> tabs next to each other, or download both files above.</p><CodeBlock code={`src/\n└── components/\n    ├── ${component.filename}\n    └── ${component.cssFilename}`} filename="Project structure" language="text" compact /></div></div><div className="ms-step"><span>2</span><div><h3>Add your media</h3><p>Place your video and optional poster in your public folder. The example uses <code>/coast.mp4</code> and <code>/coast-poster.jpg</code>. You can use any image or video URL you control.</p></div></div><div className="ms-step"><span>3</span><div><h3>Import and render</h3><p>Use the example below in a page with normal window scrolling. The component handles the scroll tracking and sticky layout.</p></div></div></div></section>
    <section className="ms-doc-section" id="usage"><div className="ms-doc-section-title"><h2>Usage</h2><span>02</span></div><p>Pass your media as a child and keep headline fragments short. All other props are optional.</p><CodeBlock code={component.usage} filename="Hero.jsx" /><div className="ms-info-callout"><Info size={16} /><div><strong>Using Next.js?</strong><p>The component includes a <code>"use client"</code> directive. For the App Router, copy it as-is. For the Pages Router, import the CSS in <code>pages/_app.jsx</code> instead of the component.</p></div></div></section>
    <section className="ms-doc-section" id="props"><div className="ms-doc-section-title"><h2>Props</h2><span>03</span></div><p>A few controls, plenty of room to make it yours.</p><div className="ms-table-wrap"><table><thead><tr><th>Prop</th><th>Type / Default</th><th>Description</th></tr></thead><tbody>{component.props.map(([prop, type, defaultValue, description]) => <tr key={prop}><td><code>{prop}</code></td><td><span className="ms-type">{type}</span><code className="ms-default">{defaultValue}</code></td><td>{description}</td></tr>)}</tbody></table></div></section>
    <section className="ms-doc-section" id="examples"><div className="ms-doc-section-title"><h2>Working with images</h2><span>04</span></div><p>No video? The same interaction works with an image. Include useful alt text so the visual has context for everyone.</p><CodeBlock code={component.imageUsage} filename="ImageReveal.jsx" /></section>
    <section className="ms-doc-section" id="notes"><div className="ms-doc-section-title"><h2>Good to know</h2><span>05</span></div><div className="ms-notes-grid"><div><h3>Give it room to scroll</h3><p>The default section is 300 viewport heights: one sticky screen plus 200 units of scroll travel. Avoid ancestors with <code>overflow: hidden</code> or <code>overflow: auto</code>; this changes the sticky scroll container.</p></div><div><h3>Respect motion preferences</h3><p>Reduced-motion preference removes interpolated scroll smoothing. The reveal still follows scroll. Our preview also pauses video by default for these users; apply that preference to your own video’s autoplay behavior.</p></div><div><h3>Make media accessible</h3><p>Use descriptive alt text for images, an accessible label for decorative videos, and captions for spoken content. For autoplaying media, provide a pause control in your page.</p></div><div><h3>Keep it lightweight</h3><p>Compress video, supply a poster, and use <code>muted</code> with <code>playsInline</code> for mobile playback. The reveal itself doesn’t require an animation library.</p></div></div></section>
    <section className="ms-doc-section" id="use-cases"><div className="ms-doc-section-title"><h2>Made for moments like these</h2><span>06</span></div><div className="ms-use-cases">{component.useCases.map(([title, text], i) => <div key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>
    <div className="ms-doc-end"><span>Original implementation inspired by the public visual reference.</span><a href="https://useplanes.com/components/scroll-zoom-reveal" target="_blank" rel="noreferrer">View reference <ArrowUpRight size={12} /></a></div><Link className="ms-back-collection" to="/components"><div><span className="ms-page-eyebrow">KEEP EXPLORING</span><h3>Back to the collection</h3></div><ArrowRight size={20} /></Link>
  </article><aside className="ms-toc"><span className="ms-nav-label">ON THIS PAGE</span>{[['playground', 'Playground'], ['installation', 'Installation'], ['usage', 'Usage'], ['props', 'Props'], ['examples', 'Image example'], ['notes', 'Good to know'], ['use-cases', 'Use cases']].map(([id, text]) => <a href={`#${id}`} key={id}>{text}</a>)}<div className="ms-toc-note"><FileCode2 size={18} /><p>Not a black box.<br />Just code you can own.</p><a href={`/downloads/${slug}.zip`} download>Get the source <Download size={12} /></a></div></aside></div>;
}
