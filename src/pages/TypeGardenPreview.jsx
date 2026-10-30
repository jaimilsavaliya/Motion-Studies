import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import TypeGarden from '../components/TypeGarden';
export default function TypeGardenPreview(){
  const [query]=useSearchParams();
  const num=(key,value)=>{const n=Number(query.get(key)??value);return Number.isFinite(n)?n:value;};
  useEffect(()=>{document.title='Type Garden — Live preview';},[]);
  return <main className="ms-garden-preview"><TypeGarden key={query.toString()} height="100svh" initialText={query.get('initialText')||''} initialMode={query.get('initialMode')||'type'} initialPalette={query.get('initialPalette')||'Rose noir'} initialMotion={query.get('initialMotion')||'breathe'} fontSize={num('fontSize',240)} density={num('density',1)} seed={num('seed',23)} maxLength={num('maxLength',80)} exportSize={num('exportSize',1080)} exportFps={num('exportFps',30)} autoFocus={!query.has('embed')} /></main>;
}
