import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BentoGrid from '../components/BentoGrid';
import { bentoGridItems } from '../library/bentoGridItems';
export default function BentoGridPreview() {
  const [query] = useSearchParams();
  const num = (key, fallback) => { const value = Number(query.get(key) ?? fallback); return Number.isFinite(value) ? value : fallback; };
  const theme=query.get('theme')==='light'?'light':'dark';
  useEffect(() => { document.title = 'Bento Grid — Live preview'; }, []);
  return <main className="ms-bento-preview" data-theme={theme}>
    <BentoGrid items={bentoGridItems} columns={num('columns', 4)} gap={num('gap', 12)} rowHeight={num('rowHeight', 220)} mobileRowHeight={num('mobileRowHeight', 150)} radius={num('radius', 12)} sidebarWidth={num('sidebarWidth', 400)} duration={num('duration', 700)} theme={theme} onActiveChange={index => { if (index !== null && query.has('embed')) window.parent.postMessage({ type: 'motion-studies:bento-open' }, window.location.origin); }} />
    {!query.has('embed') && <a className="ms-bento-back" href="/components/bento-grid">↖ Back to component</a>}
  </main>;
}
