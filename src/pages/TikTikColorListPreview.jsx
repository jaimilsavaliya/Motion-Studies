import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TikTikColorList from '../components/TikTikColorList';
import { tikTikProjects } from '../library/tikTikProjects';
export default function TikTikColorListPreview() {
  const [query]=useSearchParams();
  const num=(key,fallback)=>{const n=Number(query.get(key)??fallback);return Number.isFinite(n)?n:fallback;};
  useEffect(()=>{document.title='Tik Tik Color List — Live preview';},[]);
  return <main className="ms-tik-preview">
    <TikTikColorList key={query.toString()} projects={tikTikProjects}
      height={query.has('height')?num('height',720):'100svh'} previewSize={query.get('previewSize')||'lg'}
      showPreview={query.get('showPreview')!=='false'} enableSound={query.get('enableSound')==='true'}
      soundSrc="/tik-tik-color-list/tick.wav" infiniteScroll={query.get('infiniteScroll')!=='false'}
      scrollThreshold={num('scrollThreshold',1000)} />
    {!query.has('embed')&&<a className="ms-tik-back" href="/components/tik-tik-color-list">↖ Back to component</a>}
  </main>;
}
