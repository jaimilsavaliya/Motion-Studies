import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpLeft, MousePointer2, Pause, Play, RotateCcw } from 'lucide-react';
import Eclipse from '../components/Eclipse';

export default function EclipsePreview() {
  const [query] = useSearchParams();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [paused, setPaused] = useState(false);
  const [key, setKey] = useState(0);
  const embedded = query.has('embed');
  const numeric = (name, fallback) => Number.isFinite(Number(query.get(name))) && query.has(name) ? Number(query.get(name)) : fallback;
  const headline = query.get('headline') === 'true';
  return <div className="ms-eclipse-preview">
    <Eclipse key={key} radius={numeric('radius', 0.205)} intensity={numeric('intensity', 1)} speed={numeric('speed', 1)} color={query.get('color') || '#eef0ff'} interactive={query.get('interactive') !== 'false'} paused={paused} />
    {!embedded && <a className="ms-back-to-docs" href="/components/eclipse"><ArrowUpLeft size={15} /> Back to documentation</a>}
    {headline && <div className="ms-eclipse-headline"><span>A MOMENT OUTSIDE TIME</span><h1>Into the<br /><em>extraordinary.</em></h1></div>}
    <div className="ms-preview-controls"><span className="ms-eclipse-hint"><MousePointer2 size={12} />{reduced ? 'Reduced motion · still frame' : 'Move your cursor. Watch the light.'}</span><div><button onClick={() => setPaused(value => !value)} disabled={reduced} aria-label={paused ? 'Play eclipse' : 'Pause eclipse'} title={reduced ? 'Animation disabled by reduced-motion preference' : paused ? 'Play' : 'Pause'}>{paused || reduced ? <Play size={14} /> : <Pause size={14} />}</button><button onClick={() => { setKey(value => value + 1); setPaused(false); }} aria-label="Restart eclipse"><RotateCcw size={14} /></button><span>002</span></div></div>
  </div>;
}
