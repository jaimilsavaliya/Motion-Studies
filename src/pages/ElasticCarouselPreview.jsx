import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ElasticCarousel from '../components/ElasticCarousel';
import { elasticCarouselItems } from '../library/elasticCarouselItems';
export default function ElasticCarouselPreview() {
  const [query] = useSearchParams();
  const num = (key, fallback) => { const n = Number(query.get(key) ?? fallback); return Number.isFinite(n) ? n : fallback; };
  useEffect(() => { document.title = 'Elastic Carousel — Live preview'; }, []);
  return <main className="ms-elastic-preview"><ElasticCarousel key={query.toString()} items={elasticCarouselItems} height={num('height',560)} stretch={num('stretch',1)} blur={num('blur',1)} gap={num('gap',16)} pixelRatio={num('pixelRatio',1.5)} intro={query.get('intro') !== 'false'} initialIndex={num('initialIndex',3)} />
    {!query.has('embed') && <a className="ms-elastic-back" href="/components/elastic-carousel">↖ Back to component</a>}
  </main>;
}
