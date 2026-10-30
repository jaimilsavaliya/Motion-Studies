import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Download, Expand, FileCode2, Info, Monitor, RotateCcw, SlidersHorizontal, Smartphone } from 'lucide-react';
import { getComponent } from '../library/registry';
import CodeBlock from '../library/CodeBlock';
import { polaroidDemo } from '../library/polaroidDemo';

const defaults = { width: 340, rotation: -3, tilt: 14, duration: 760, theme: 'dark', defaultFlipped: false, caption: polaroidDemo.caption, message: polaroidDemo.message };
export default function PolaroidFlipCardPage() {
  const component = getComponent('polaroid-flip-card');
  const [tab, setTab] = useState('Preview');
  const [device, setDevice] = useState('desktop');
  const [settings, setSettings] = useState(false);
  const [config, setConfig] = useState(defaults);
  const [previewConfig, setPreviewConfig] = useState(defaults);
  const [previewKey, setPreviewKey] = useState(0);
  useEffect(() => { document.title = 'Polaroid Flip Card — Motion studies'; }, []);
  useEffect(() => { const timer = setTimeout(() => setPreviewConfig(config), 200); return () => clearTimeout(timer); }, [config]);
  const update = (key, value) => setConfig(previous => ({ ...previous, [key]: value }));
  const fullPreview = `/preview/polaroid-flip-card?${new URLSearchParams(previewConfig)}`;
  const usage = `import PolaroidFlipCard from './components/PolaroidFlipCard';

export default function Memory() {
  return <PolaroidFlipCard
    src="/photos/sakura.jpg" alt="Cherry blossoms in bloom"
    caption=${JSON.stringify(config.caption)}
    message={${JSON.stringify(config.message)}}
    width={${config.width}} rotation={${config.rotation}}
    tilt={${config.tilt}} duration={${config.duration}}
    theme="${config.theme}" defaultFlipped={${config.defaultFlipped}}
  />;
}`;
  const reset = () => { setConfig(defaults); setPreviewConfig(defaults); setPreviewKey(value => value + 1); };
  const showTab = value => { setTab(value); document.getElementById('playground').scrollIntoView({ behavior: 'smooth' }); };
  return <div className="ms-doc-layout"><article className="ms-component-doc">
    <div className="ms-breadcrumb"><Link to="/components">Components</Link><ChevronRight size={12} /><span>Media</span><ChevronRight size={12} /><span>Polaroid Flip Card</span></div>
    <div className="ms-detail-heading"><div><div className="ms-page-eyebrow">STUDY 013 <span className="ms-eyebrow-rule" /> MEDIA</div><h1>Polaroid Flip Card</h1></div><span className="ms-new-badge"><span className="ms-small-dot" /> New</span></div>
    <p className="ms-detail-description">{component.description}</p><div className="ms-detail-tags"><span><span className="ms-react-symbol">⚛</span> React</span><span>3D paper flip</span><span>React + CSS</span><span>No animation dependencies</span></div>
    <section id="playground" className="ms-playground polaroid-playground"><div className="ms-playground-tabs"><div role="tablist" aria-label="Component preview and source">{['Preview', 'Usage', 'Component', 'CSS'].map(name => <button key={name} id={`tab-${name}`} aria-controls="playground-panel" role="tab" aria-selected={tab === name} onClick={() => setTab(name)} className={tab === name ? 'active' : ''}>{name}</button>)}</div><a href={fullPreview} target="_blank" rel="noreferrer" className="ms-icon-button" aria-label="Open full-screen preview" title="Open full-screen preview"><Expand size={15} /></a></div>
    <div id="playground-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      {tab === 'Preview' ? <><div className="ms-preview-toolbar"><span><span className="ms-small-dot" /> LIVE POLAROID FLIP CARD</span><div><div className="ms-device-switch"><button className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview" title="Desktop preview"><Monitor size={14} /></button><button className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview" title="Mobile preview"><Smartphone size={14} /></button></div><span className="ms-toolbar-divider" /><button className="ms-icon-button" onClick={() => setPreviewKey(value => value + 1)} aria-label="Restart preview" title="Restart preview"><RotateCcw size={14} /></button></div></div><div className={`ms-iframe-wrap ${device}`}><iframe key={previewKey} src={`${fullPreview}&embed=1`} title="Polaroid Flip Card interactive preview" loading="eager" /></div><div className="ms-playground-bottom"><span>Move to tilt. Click or tap to turn the memory over.</span><button onClick={() => setSettings(!settings)} aria-expanded={settings}><SlidersHorizontal size={13} /> Customize <ChevronDown size={12} className={settings ? 'rotated' : ''} /></button></div></> : <CodeBlock code={tab === 'Usage' ? usage : tab === 'Component' ? component.source : component.css} filename={tab === 'Usage' ? 'Memory.jsx' : tab === 'Component' ? component.filename : component.cssFilename} language={tab === 'CSS' ? 'css' : 'jsx'} />}
    </div>
    {settings && <div className="ms-customize"><div className="ms-customize-heading"><span>Make it yours</span><button onClick={reset}><RotateCcw size={11} /> Reset</button></div><div className="ms-customize-grid">
      {[
        ['width', 'Card width', 200, 460, 10, 'px'], ['rotation', 'Resting rotation', -12, 12, 1, '°'],
        ['tilt', 'Pointer tilt', 0, 24, 1, '°'], ['duration', 'Flip duration', 200, 1600, 20, 'ms'],
      ].map(([key, label, min, max, step, unit]) => <label key={key}>{label}<span>{config[key]}{unit}</span><input aria-label={label} type="range" min={min} max={max} step={step} value={config[key]} onChange={event => update(key, Number(event.target.value))} /></label>)}
      <label>Paper theme<select aria-label="Paper theme" value={config.theme} onChange={event => update('theme', event.target.value)}><option value="dark">Dark paper</option><option value="light">White paper</option></select></label>
      <label>Front caption<input aria-label="Front caption" value={config.caption} maxLength={60} onChange={event => update('caption', event.target.value)} /></label>
      <label>Handwritten note<textarea aria-label="Handwritten note" value={config.message} maxLength={1000} onChange={event => update('message', event.target.value)} /></label>
      <label className="ms-switch-label">Start on the back<button type="button" className="ms-toggle" role="switch" aria-label="Start on the back" aria-checked={config.defaultFlipped} onClick={() => update('defaultFlipped', !config.defaultFlipped)}><span /></button></label>
      <p>Changes restart the preview and update Usage. The handwriting font is bundled in the source download, together with its license.</p>
    </div></div>}
    </section>
    <div className="ms-implementation-note"><Check size={14} /><span>Independent React + CSS. No animation dependency.</span><a href="/downloads/polaroid-flip-card.zip" download>Download files <Download size={13} /></a></div>
    <section className="ms-doc-section" id="installation"><div className="ms-doc-section-title"><h2>Installation</h2><span>01</span></div><p>React, CSS, and a locally bundled handwriting font. No animation package.</p><div className="ms-steps"><div className="ms-step"><span>1</span><div><h3>Download the component and font</h3><p>The source ZIP includes the component, stylesheet, Caveat font, and its OFL license. Keep the font directory alongside the component. The <button className="ms-inline-button" onClick={() => showTab('Component')}>Component</button> and <button className="ms-inline-button" onClick={() => showTab('CSS')}>CSS</button> tabs let you inspect the source.</p><CodeBlock code={'src/\n└── components/\n    ├── PolaroidFlipCard.jsx\n    ├── PolaroidFlipCard.css\n    └── polaroid-flip-card/\n        ├── Caveat.ttf\n        └── OFL.txt'} filename="Project structure" language="text" compact /></div></div><div className="ms-step"><span>2</span><div><h3>Add a photograph and a note</h3><p>Supply src and descriptive alt text, a short caption, and a message. The photograph is square-cropped; objectPosition adjusts its focal point. Newlines in the note are preserved.</p></div></div><div className="ms-step"><span>3</span><div><h3>Leave a little breathing room</h3><p>The card scales down to its container. Leave space for its rotation, hover lift, and small mid-flip enlargement. Avoid clipping ancestors or filters on the 3D wrappers.</p></div></div></div></section>
    <section className="ms-doc-section" id="usage"><div className="ms-doc-section-title"><h2>Usage</h2><span>02</span></div><p>Move the pointer across the photo to tilt it in two axes. Click, tap, Enter, or Space turns it over; activate it again to return. The reverse settles upright so the note is easy to read.</p><CodeBlock code={component.usage} filename="Memory.jsx" /><div className="ms-info-callout"><Info size={16} /><div><strong>Your photo, your story</strong><p>The demo photograph is locally hosted, but excluded from the download. Supply your own appropriately licensed image. Caveat is bundled under the SIL Open Font License; retain OFL.txt when redistributing.</p></div></div></section>
    <section className="ms-doc-section" id="props"><div className="ms-doc-section-title"><h2>Props</h2><span>03</span></div><p>The API below describes our independent implementation.</p><div className="ms-table-wrap"><table><thead><tr><th>Prop</th><th>Type / Default</th><th>Description</th></tr></thead><tbody>{component.props.map(([prop, type, value, description]) => <tr key={prop}><td><code>{prop}</code></td><td><span className="ms-type">{type}</span><code className="ms-default">{value}</code></td><td>{description}</td></tr>)}</tbody></table></div></section>
    <section className="ms-doc-section" id="examples"><div className="ms-doc-section-title"><h2>A personal note</h2><span>04</span></div><p>Use flipped and onFlipChange when an external control or the rest of your page should own the visible side.</p><CodeBlock code={component.exampleUsage} filename="GuestNote.jsx" /></section>
    <section className="ms-doc-section" id="notes"><div className="ms-doc-section-title"><h2>Good to know</h2><span>05</span></div><div className="ms-notes-grid"><div><h3>A little paper depth</h3><p>Four thin layers between front and back remain visible edge-on. The card enlarges slightly midway through the turn, while its shadow narrows and softens. Front and back have hidden backfaces, so the note never reads in reverse.</p></div><div><h3>Pointer-led light</h3><p>A moving highlight and two-axis tilt follow the pointer. The card lifts six pixels on hover, then eases home on exit. Touch does not pick up a sticky hover state. There is no autoplay or hover-triggered flip.</p></div><div><h3>Native interaction</h3><p>A single native button supports Tab, Enter, and Space. aria-pressed exposes the side, and the note describes the button when visible. Escape returns to the photograph. Rapid flips reverse from the current angle, without a timer queue.</p></div><div><h3>A calmer alternative</h3><p>Reduced motion snaps between sides and disables pointer tilt, lift, and glare. The font and image need no remote service. Long notes scroll inside the reverse; short notes work best. For Next.js Pages Router, move the CSS import into pages/_app.jsx.</p></div></div></section>
    <section className="ms-doc-section" id="use-cases"><div className="ms-doc-section-title"><h2>Made for moments like these</h2><span>06</span></div><div className="ms-use-cases">{component.useCases.map(([title, text], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>
    <div className="ms-doc-end"><span>Original implementation. Demo imagery from the public visual reference.</span><a href="https://useplanes.com/components/polaroid-flip-card" target="_blank" rel="noreferrer">View reference <ArrowUpRight size={12} /></a></div><Link className="ms-back-collection" to="/components"><div><span className="ms-page-eyebrow">KEEP EXPLORING</span><h3>Back to the collection</h3></div><ArrowRight size={20} /></Link>
  </article><aside className="ms-toc"><span className="ms-nav-label">ON THIS PAGE</span>{[['playground', 'Playground'], ['installation', 'Installation'], ['usage', 'Usage'], ['props', 'Props'], ['examples', 'A personal note'], ['notes', 'Good to know'], ['use-cases', 'Use cases']].map(([id, text]) => <a href={`#${id}`} key={id}>{text}</a>)}<div className="ms-toc-note"><FileCode2 size={18} /><p>One photograph.<br />Two sides of a story.</p><a href="/downloads/polaroid-flip-card.zip" download>Get the source <Download size={12} /></a></div></aside></div>;
}
