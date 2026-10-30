import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpLeft } from 'lucide-react';
import RadialPopOut from '../components/RadialPopOut';
import { radialHero, radialItems } from '../library/radialPopOutItems';
export default function RadialPopOutPreview() {
  const [query] = useSearchParams();
  const [open, setOpen] = useState(query.get('defaultOpen') === 'true');
  const number = (name, fallback) => query.has(name) && Number.isFinite(Number(query.get(name))) ? Number(query.get(name)) : fallback;
  return <div className="ms-radial-preview">
    {!query.has('embed') && <a className="ms-back-to-docs" href="/components/radial-pop-out"><ArrowUpLeft size={15} /> Back to documentation</a>}
    <RadialPopOut hero={radialHero} items={radialItems.slice(0, Math.round(Math.max(3, Math.min(7, number('count', 7)))))}
      cardSize={number('cardSize', 200)} heroSize={number('heroSize', 280)} orbitRadius={number('orbitRadius', 210)}
      stagger={number('stagger', 25)} tilt={number('tilt', 10)} magnetic={number('magnetic', 0.36)}
      radius={number('radius', 16)} defaultOpen={query.get('defaultOpen') === 'true'} onOpenChange={setOpen} />
    <div className="ms-preview-controls"><span className="ms-radial-hint">{open ? 'Move across the cover · Esc to close' : 'Hover, focus, or tap the cover'}</span><div><span>004</span></div></div>
  </div>;
}
