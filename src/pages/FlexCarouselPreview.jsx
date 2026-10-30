import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import FlexCarousel from '../components/FlexCarousel';
import {flexCarouselItems} from '../library/flexCarouselItems';
import {parseFlexCarouselQuery} from '../library/flexCarouselConfig';
import './FlexCarouselPreview.css';
export default function FlexCarouselPreview(){
 const [query]=useSearchParams();const config=parseFlexCarouselQuery(query);
 useEffect(()=>{document.title='Flex Carousel — Live preview';},[]);
 return <main className="ms-flex-carousel-preview">
  <FlexCarousel {...config} items={flexCarouselItems}/>
  {!query.has('embed')&&<a className="fxc-preview-back" href="/components/flex-carousel">↖ Back to component</a>}
 </main>;
}
