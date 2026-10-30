import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, ChevronRight, Download, Expand, FileCode2, Info, Monitor, RotateCcw, SlidersHorizontal, Smartphone } from 'lucide-react';
import { getComponent } from '../library/registry';
import CodeBlock from '../library/CodeBlock';

const defaults = { height: 720, previewSize: 'lg', showPreview: true, enableSound: false, infiniteScroll: true, scrollThreshold: 1000 };
export default function TikTikColorListPage() {
  const component = getComponent('tik-tik-color-list');
  const [tab, setTab] = useState('Preview'), [device, setDevice] = useState('desktop');
  const [settings, setSettings] = useState(false), [config, setConfig] = useState(defaults);
  const [previewConfig, setPreviewConfig] = useState(defaults), [previewKey, setPreviewKey] = useState(0);
  useEffect(() => { document.title = 'Tik Tik Color List — Motion studies'; }, []);
  useEffect(() => { const timer = setTimeout(() => setPreviewConfig(config), 200); return () => clearTimeout(timer); }, [config]);
  const update = (key, value) => setConfig(previous => ({ ...previous, [key]: value }));
  const fullPreview = `/preview/tik-tik-color-list?${new URLSearchParams(previewConfig)}`;
  const usage = component.usage.replace('height={720}', `height={${config.height}}`)
    .replace('showPreview={true}', `showPreview={${config.showPreview}}`).replace('previewSize="lg"', `previewSize="${config.previewSize}"`)
    .replace('enableSound={false}', `enableSound={${config.enableSound}}`).replace('infiniteScroll={true}', `infiniteScroll={${config.infiniteScroll}}`)
    .replace('scrollThreshold={1000}', `scrollThreshold={${config.scrollThreshold}}`);
  const reset = () => { setConfig(defaults); setPreviewConfig(defaults); setPreviewKey(value => value + 1); };
  const showTab = value => { setTab(value); document.getElementById('playground').scrollIntoView({ behavior: 'smooth' }); };
  return <div className="ms-doc-layout"><article className="ms-component-doc">
    <div className="ms-breadcrumb"><Link to="/components">Components</Link><ChevronRight size={12} /><span>Interactions</span><ChevronRight size={12} /><span>Tik Tik Color List</span></div>
    <div className="ms-detail-heading"><div><div className="ms-page-eyebrow">STUDY 014 <span className="ms-eyebrow-rule" /> INTERACTIONS</div><h1>Tik Tik Color List</h1></div><span className="ms-new-badge"><span className="ms-small-dot" /> New</span></div>
    <p className="ms-detail-description">{component.description}</p><div className="ms-detail-tags"><span><span className="ms-react-symbol">⚛</span> React</span><span>Infinite archive</span><span>Drag momentum</span><span>No animation dependencies</span></div>
    <section id="playground" className="ms-playground tik-playground"><div className="ms-playground-tabs"><div role="tablist" aria-label="Component preview and source">{['Preview', 'Usage', 'Component', 'CSS'].map(name => <button key={name} id={`tab-${name}`} aria-controls="playground-panel" role="tab" aria-selected={tab === name} onClick={() => setTab(name)} className={tab === name ? 'active' : ''}>{name}</button>)}</div><a href={fullPreview} target="_blank" rel="noreferrer" className="ms-icon-button" aria-label="Open full-screen preview" title="Open full-screen preview"><Expand size={15} /></a></div>
    <div id="playground-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      {tab === 'Preview' ? <><div className="ms-preview-toolbar"><span><span className="ms-small-dot" /> LIVE COLOR ARCHIVE</span><div><div className="ms-device-switch"><button className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview" title="Desktop preview"><Monitor size={14} /></button><button className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview" title="Mobile preview"><Smartphone size={14} /></button></div><span className="ms-toolbar-divider" /><button className="ms-icon-button" onClick={() => setPreviewKey(value => value + 1)} aria-label="Restart preview" title="Restart preview"><RotateCcw size={14} /></button></div></div><div className={`ms-iframe-wrap ${device}`} style={{ height: previewConfig.height }}><iframe key={previewKey} src={`${fullPreview}&embed=1`} title="Tik Tik Color List interactive preview" loading="eager" /></div><div className="ms-playground-bottom"><span>Scroll the archive. Pick up the image. Keep going.</span><button onClick={() => setSettings(!settings)} aria-expanded={settings}><SlidersHorizontal size={13} /> Customize <ChevronDown size={12} className={settings ? 'rotated' : ''} /></button></div></> : <CodeBlock code={tab === 'Usage' ? usage : tab === 'Component' ? component.source : component.css} filename={tab === 'Usage' ? 'Archive.jsx' : tab === 'Component' ? component.filename : component.cssFilename} language={tab === 'CSS' ? 'css' : 'jsx'} />}
    </div>
    {settings && <div className="ms-customize"><div className="ms-customize-heading"><span>Make it yours</span><button onClick={reset}><RotateCcw size={11} /> Reset</button></div><div className="ms-customize-grid">
      <label>Preview size<select aria-label="Preview size" value={config.previewSize} onChange={e => update('previewSize', e.target.value)}><option value="sm">Small · 240px</option><option value="md">Medium · 320px</option><option value="lg">Large · 400px</option></select></label>
      <label>Stage height <span>{config.height}px</span><input type="range" aria-label="Stage height" min="400" max="1000" step="20" value={config.height} onChange={e => update('height', Number(e.target.value))} /></label>
      <label>Scroll buffer <span>{config.scrollThreshold}px</span><input type="range" aria-label="Scroll buffer" min="100" max="2000" step="100" value={config.scrollThreshold} onChange={e => update('scrollThreshold', Number(e.target.value))} /></label>
      {[['showPreview', 'Show image preview'], ['enableSound', 'Enable tick sound'], ['infiniteScroll', 'Infinite scrolling']].map(([key, title]) => <label className="ms-switch-label" key={key}>{title}<button type="button" className="ms-toggle" role="switch" aria-label={title} aria-checked={config[key]} onClick={() => update(key, !config[key])}><span /></button></label>)}
      <p>Changes update the live preview and Usage tab. Sound is off by default. After enabling it, click or press a key inside the preview to unlock audio, then scroll.</p>
    </div></div>}
    </section>
    <div className="ms-implementation-note"><Check size={14} /><span>React + CSS. Native scrolling and a bundled OFL font.</span><a href="/downloads/tik-tik-color-list.zip" download>Download files <Download size={13} /></a></div>
    <section className="ms-doc-section" id="installation"><div className="ms-doc-section-title"><h2>Installation</h2><span>01</span></div><p>Copy the component and keep its font folder alongside the stylesheet. No registry, animation package, or hosted font service is required.</p><div className="ms-steps">
      <div className="ms-step"><span>1</span><div><h3>Add the source and font</h3><p>Download the archive above, or copy the <button className="ms-inline-button" onClick={() => showTab('Component')}>Component</button> and <button className="ms-inline-button" onClick={() => showTab('CSS')}>CSS</button> tabs and add the bundled Inter font from the ZIP.</p><CodeBlock code={'src/\n└── components/\n    ├── TikTikColorList.jsx\n    ├── TikTikColorList.css\n    └── tik-tik-color-list/\n        ├── InterVariable.woff2\n        └── OFL.txt'} filename="Project structure" language="text" compact /></div></div>
      <div className="ms-step"><span>2</span><div><h3>Add your collection</h3><p>Give each project a name, category badge, background color and image URL. Use appropriately licensed imagery and sound. Demo posters and sound are not included in the source download. Keep the bundled font license when redistributing.</p></div></div>
      <div className="ms-step"><span>3</span><div><h3>Give it room</h3><p>The component owns its scroll area. Set a pixel height for a section, or use <code>height="100svh"</code> for a full-screen archive. The image is 400px square by default and disappears below 768px container width.</p></div></div>
    </div></section>
    <section className="ms-doc-section" id="usage"><div className="ms-doc-section-title"><h2>Usage</h2><span>02</span></div><p>The same project supplies the row, background and floating preview. Repeated rows are recycled internally; you only provide one copy of your data.</p><CodeBlock code={component.usage} filename="Archive.jsx" /><div className="ms-info-callout"><Info size={16} /><div><strong>The selection follows the scroll</strong><p>Scrolling down activates a row as its top crosses 70% of the stage; scrolling up uses a 65% return line. Reversing direction alone does not change the selection. Hover does not switch projects. Clicking a row or using the arrow keys moves it to that guide.</p></div></div></section>
    <section className="ms-doc-section" id="props"><div className="ms-doc-section-title"><h2>Props</h2><span>03</span></div><p>Control the collection, preview, scrolling and optional sound.</p><div className="ms-table-wrap"><table><thead><tr><th>Prop</th><th>Type / Default</th><th>Description</th></tr></thead><tbody>{component.props.map(([prop, type, defaultValue, description]) => <tr key={prop}><td><code>{prop}</code></td><td><code>{type}</code><span className="ms-prop-default">{defaultValue}</span></td><td>{description}</td></tr>)}</tbody></table></div><div className="ms-hover-item-type"><h3>Project data</h3><CodeBlock code={`const project = {
  id: 'fading-memories',
  name: 'Fading Memories',
  badge: 'Editorial Design',
  date: '01 sep',
  bgColor: '#10b981',
  image: '/posters/memories.webp',
  alt: 'Black and white editorial portrait',
  objectPosition: 'center',
  description: 'Optional metadata for your own project view',
};`} filename="Project.js" compact /></div></section>
    <section className="ms-doc-section" id="examples"><div className="ms-doc-section-title"><h2>Connect your archive</h2><span>04</span></div><p>Use the callbacks to connect a detail view or track the current project. Sound never starts until the archive receives a click or key press.</p><CodeBlock code={component.exampleUsage} filename="Portfolio.jsx" /></section>
    <section className="ms-doc-section" id="notes"><div className="ms-doc-section-title"><h2>Good to know</h2><span>05</span></div><div className="ms-notes-grid">
      <div><h3>One continuous rhythm</h3><p>Desktop rows use 72px type and a 112px cadence; mobile rows use 36px type and an 80px cadence. Inactive rows sit at 20% opacity. The active row fades in over 300ms while the background eases into its next color. The image switches in place without a slide or zoom.</p></div>
      <div><h3>Pick it up, let it drift</h3><p>The image follows your pointer directly and coasts after release, with no spring-back. Its position survives project changes. Escape or a double-click returns it to the corner. Focus the image and use the arrow keys to reposition it; Enter resets it.</p></div>
      <div><h3>Infinite, not ever-growing</h3><p>A bounded bank of repeated rows is recentered near its edges. Native wheel and touch scrolling remain native. Turning off infinite scrolling adds leading and trailing space so the first and last project can reach the selection guide. A single project uses finite mode automatically.</p></div>
      <div><h3>Sound, with permission</h3><p>Enable sound, then click or press a key inside the archive. Each project change can play a short tick. The reusable component synthesizes a tick unless you supply soundSrc; the showcase uses a local sample. No audio permission or loading failure blocks scrolling.</p></div>
      <div><h3>Keyboard and calmer motion</h3><p>Tab reaches the scroll region, active row and image. Arrow keys browse projects; Home, End and Page Up/Down navigate the collection. Repeated copies are hidden from assistive technology. Reduced motion removes fades, smooth navigation and post-drag momentum.</p></div>
      <div><h3>Bring your own visual language</h3><p>Inter is bundled under the SIL Open Font License as an open-font alternative. Replace it in the stylesheet if you have another licensed typeface. Choose background colors that keep black text legible. For Next.js Pages Router, move the CSS import to pages/_app.jsx.</p></div>
    </div></section>
    <section className="ms-doc-section" id="use-cases"><div className="ms-doc-section-title"><h2>Made for moments like these</h2><span>06</span></div><div className="ms-use-cases">{component.useCases.map(([title, text], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>
    <div className="ms-doc-end"><span>Independent implementation. No proprietary source or animation packages.</span></div><Link className="ms-back-collection" to="/components"><div><span className="ms-page-eyebrow">KEEP EXPLORING</span><h3>Back to the collection</h3></div><ArrowRight size={20} /></Link>
  </article><aside className="ms-toc"><span className="ms-nav-label">ON THIS PAGE</span>{[['playground', 'Playground'], ['installation', 'Installation'], ['usage', 'Usage'], ['props', 'Props'], ['examples', 'Connect your archive'], ['notes', 'Good to know'], ['use-cases', 'Use cases']].map(([id, text]) => <a href={`#${id}`} key={id}>{text}</a>)}<div className="ms-toc-note"><FileCode2 size={18} /><p>A new project.<br />A change of color.</p><a href="/downloads/tik-tik-color-list.zip" download>Get the source <Download size={12} /></a></div></aside></div>;
}
