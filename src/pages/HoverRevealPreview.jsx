import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpLeft } from 'lucide-react';
import HoverReveal from '../components/HoverReveal';
import { hoverRevealItems } from '../library/hoverRevealItems';

export default function HoverRevealPreview() {
  const [query] = useSearchParams();
  const [active, setActive] = useState(0);
  const numeric = (name, fallback) => query.has(name) && Number.isFinite(Number(query.get(name))) ? Number(query.get(name)) : fallback;
  const theme=query.get('theme')==='light'?'light':'dark';
  return <div className={`ms-hover-preview ${query.has('embed') ? 'embedded' : ''}`} data-theme={theme}>
    {!query.has('embed') && <a className="ms-hover-back" href="/components/hover-reveal"><ArrowUpLeft size={14} /> Back to documentation</a>}
    <HoverReveal label={query.get('label') ?? 'Protocols'} items={hoverRevealItems}
      duration={numeric('duration', 770)} zoom={numeric('zoom', 1.4)} parallax={numeric('parallax', 9)}
      drift={query.get('drift') !== 'false'} radius={numeric('radius', 18)} theme={theme}
      onActiveChange={index => setActive(index)} />
    {!query.has('embed') && <div className="ms-hover-preview-footer"><span>Hover, focus, or tap a name</span><span>{String(active + 1).padStart(2, '0')} / 05</span></div>}
  </div>;
}
