import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ImageWheel from '../components/ImageWheel';
import { imageWheelImages } from '../library/imageWheelImages';
export default function ImageWheelPreview() {
  const [query]=useSearchParams();
  const num=(key,fallback)=>{const value=Number(query.get(key)??fallback);return Number.isFinite(value)?value:fallback;};
  useEffect(()=>{document.title='Image Wheel — Live preview';},[]);
  return <main className="ms-wheel-preview"><ImageWheel images={imageWheelImages} cardSize={num('cardSize',190)} radius={num('radius',430)} height={num('height',520)} angle={num('angle',24)} blur={num('blur',9)} tilt={num('tilt',1)} initialIndex={num('initialIndex',0)} showControls={query.get('showControls')==='true'} />{!query.has('embed')&&<a className="ms-wheel-back" href="/components/image-wheel">↖ Back to component</a>}</main>;
}
