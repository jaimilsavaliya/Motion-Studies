import DemoPreviewStage from '../library/DemoPreviewStage';
import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import DragElementsDemo from '../library/DragElementsDemo';
export default function DragElementsPreview(){
  const [query]=useSearchParams();const scene=query.get('scene')==='labels'?'labels':'photos';
  const numeric=(key,fallback,min,max)=>Math.max(min,Math.min(max,Number(query.get(key)??fallback)||fallback));
  useEffect(()=>{document.title='Drag Elements — Live preview';},[]);
  return <DemoPreviewStage className="ms-drag-preview" background="#fafafa">
    <DragElementsDemo fluid={query.has('embed')} key={query.toString()} scene={scene} height={numeric('height',530,320,900)}
      dragMomentum={query.has('dragMomentum')?query.get('dragMomentum')==='true':scene==='labels'}
      dragElastic={query.has('dragElastic')?Math.max(0,Math.min(1,Number(query.get('dragElastic'))||0)):.5}
      selectedOnTop={query.get('selectedOnTop')!=='false'} bounceStiffness={numeric('bounceStiffness',200,10,1000)} bounceDamping={numeric('bounceDamping',300,1,500)}/>
    {!query.has('embed')&&<a className="ms-drag-back" href="/components/drag-elements">↖ Back to component</a>}
  </DemoPreviewStage>;
}
