import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FocusScaleCarousel from '../components/FocusScaleCarousel';
import { focusScaleItems } from '../library/focusScaleItems';
export default function FocusScaleCarouselPreview() {
  const [query] = useSearchParams();
  const num = (key, fallback) => { const n = Number(query.get(key) ?? fallback); return Number.isFinite(n) ? n : fallback; };
  useEffect(() => { document.title = 'Focus Scale Carousel — Live preview'; }, []);
  return <main className="ms-focus-preview"><FocusScaleCarousel items={focusScaleItems} cardWidth={num('cardWidth',320)} cardHeight={num('cardHeight',430)} gap={num('gap',14)} neighborScale={num('neighborScale',.37)} scaleDecay={num('scaleDecay',.78)} sideCount={num('sideCount',6)} duration={num('duration',850)} autoPlay={num('autoPlay',4000)} mobileScale={num('mobileScale',.55)} radius={num('radius',2)} showFrame={query.get('showFrame') !== 'false'} paused={query.get('paused') === 'true'} />
  {!query.has('embed') && <a className="ms-focus-back" href="/components/focus-scale-carousel">↖ Back to component</a>}</main>;
}
