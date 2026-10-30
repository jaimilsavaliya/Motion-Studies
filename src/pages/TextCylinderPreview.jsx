import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpLeft } from 'lucide-react';
import TextCylinder from '../components/TextCylinder';
import { textCylinderSlides } from '../library/textCylinderSlides';

export default function TextCylinderPreview() {
  const [query] = useSearchParams();
  const theme=query.get('theme')==='light'?'light':'dark';
  const number = (name, fallback) => { const value = Number(query.get(name) ?? fallback); return Number.isFinite(value) ? value : fallback; };
  useEffect(() => { document.title = 'Text Cylinder — Live preview'; }, []);
  const first = { ...textCylinderSlides[0], lines: [query.get('headline') || 'Mount Fuji', query.get('subtitle') || 'Above the clouds'] };
  return <main className="text-cylinder-preview">
    <TextCylinder key={query.toString()} slides={[first, ...textCylinderSlides.slice(1)]} speed={number('speed', 18)} fontScale={number('fontScale', 0.24)} imageWidth={number('imageWidth', 22)} mobileImageWidth={number('mobileImageWidth', 46)} duration={number('duration', 700)} initialIndex={number('initialIndex', 0)} paused={query.get('paused') === 'true'} theme={theme} />
    {!query.has('embed') && <a className="tc-preview-back" href="/components/text-cylinder"><ArrowUpLeft size={13} /> Back to component</a>}
  </main>;
}
