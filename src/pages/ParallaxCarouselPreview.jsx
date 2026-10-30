import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ParallaxCarousel from '../components/ParallaxCarousel';
import { parallaxCarouselImages } from '../library/parallaxCarouselImages';
export default function ParallaxCarouselPreview() {
  const [query] = useSearchParams();
  const num = (key, fallback) => { const value = Number(query.get(key) ?? fallback); return Number.isFinite(value) ? value : fallback; };
  useEffect(() => { document.title = 'Parallax Carousel — Live preview'; }, []);
  return <main className="ms-parallax-preview">
    <ParallaxCarousel images={parallaxCarouselImages} cardWidth={num('cardWidth', 320)} cardHeight={num('cardHeight', 600)} gap={num('gap', 12)} parallax={num('parallax', 60)} speed={num('speed', 34)} radius={num('radius', 12)} fade={num('fade', 80)} mobileScale={num('mobileScale', .62)} autoPlay={query.get('autoPlay') !== 'false'} pauseOnHover={query.get('pauseOnHover') !== 'false'} paused={query.get('paused') === 'true'} showDots={query.get('showDots') === 'true'} />
    {!query.has('embed') && <a className="ms-parallax-back" href="/components/parallax-carousel">↖ Back to component</a>}
  </main>;
}
