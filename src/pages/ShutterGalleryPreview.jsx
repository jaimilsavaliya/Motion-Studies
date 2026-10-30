import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ShutterGallery from '../components/ShutterGallery';
import { shutterGalleryItems } from '../library/shutterGalleryItems';

export default function ShutterGalleryPreview() {
  const [query] = useSearchParams();
  const num = (key, fallback) => { const n = Number(query.get(key) ?? fallback); return Number.isFinite(n) ? n : fallback; };
  useEffect(() => { document.title = 'Shutter Gallery — Live preview'; }, []);
  return <main className="ms-shutter-preview">
    <ShutterGallery key={query.toString()} items={shutterGalleryItems}
      height={num('height', 520)} gap={num('gap', 12)} expandedGrow={num('expandedGrow', 12.6)}
      defaultOpen={num('defaultOpen', -1)} />
    {!query.has('embed') && <a className="ms-shutter-back" href="/components/shutter-gallery">↖ Back to component</a>}
  </main>;
}
