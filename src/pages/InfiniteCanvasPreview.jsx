import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import InfiniteCanvas from '../components/InfiniteCanvas';
import { canvasImages } from '../library/canvasImages';
export default function InfiniteCanvasPreview() {
  const [query]=useSearchParams();
  useEffect(()=>{document.title='Infinite Canvas — Live preview';},[]);
  const spacing=query.get('gap')??'5';
  return <main className="ms-canvas-preview">
    <InfiniteCanvas images={canvasImages} height={query.has('height')?Number(query.get('height')):'100svh'}
      imageSize={query.get('imageSize')||'auto'} gap={Number.isFinite(Number(spacing))?`${spacing}vw`:spacing}
      columns={Number(query.get('columns')??5)} backgroundColor={query.get('backgroundColor')||'#f5f4f3'}
      borderRadius={Number(query.get('borderRadius')??24)} showControls={query.get('showControls')==='true'} />
    {!query.has('embed')&&<a className="ms-canvas-back" href="/components/infinite-canvas">↖ Back to component</a>}
  </main>;
}
