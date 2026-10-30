import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PolaroidFlipCard from '../components/PolaroidFlipCard';
import { polaroidDemo } from '../library/polaroidDemo';
export default function PolaroidFlipCardPreview() {
  const [query] = useSearchParams();
  const num = (key, fallback) => { const n=Number(query.get(key)??fallback); return Number.isFinite(n)?n:fallback; };
  const theme=query.get('theme')==='light'?'light':'dark';
  useEffect(()=>{ document.title='Polaroid Flip Card — Live preview'; },[]);
  return <main className="ms-polaroid-preview" data-theme={theme}>
    <PolaroidFlipCard key={query.toString()} {...polaroidDemo} caption={query.get('caption')??polaroidDemo.caption}
      message={query.get('message')??polaroidDemo.message} width={num('width',340)} rotation={num('rotation',-3)}
      tilt={num('tilt',14)} duration={num('duration',760)} theme={theme} defaultFlipped={query.get('defaultFlipped')==='true'} />
    {!query.has('embed')&&<a className="ms-polaroid-back" href="/components/polaroid-flip-card">↖ Back to component</a>}
  </main>;
}
