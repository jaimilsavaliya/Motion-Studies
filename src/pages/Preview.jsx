import ScrollExpandPreview from './ScrollExpandPreview';
import PassageGalleryPreview from './PassageGalleryPreview';
import DomeGalleryPreview from './DomeGalleryPreview';
import PaperCrumplePreview from './PaperCrumplePreview';
import ViscoseCarouselPreview from './ViscoseCarouselPreview';
import TechTextPreview from './TechTextPreview';
import DitherVeilPreview from './DitherVeilPreview';
import FlexCarouselPreview from './FlexCarouselPreview';
import GradientASCIIPreview from './GradientASCIIPreview';
import MarqueeAlongSvgPathPreview from './MarqueeAlongSvgPathPreview';
import DragElementsPreview from './DragElementsPreview';
import InfiniteCanvasPreview from './InfiniteCanvasPreview';
import HoverMembersPreview from './HoverMembersPreview';
import TikTikColorListPreview from './TikTikColorListPreview';
import PolaroidFlipCardPreview from './PolaroidFlipCardPreview';
import ShutterGalleryPreview from './ShutterGalleryPreview';
import TypeGardenPreview from './TypeGardenPreview';
import ImageWheelPreview from './ImageWheelPreview';
import ElasticCarouselPreview from './ElasticCarouselPreview';
import FocusScaleCarouselPreview from './FocusScaleCarouselPreview';
import ParallaxCarouselPreview from './ParallaxCarouselPreview';
import BentoGridPreview from './BentoGridPreview';
import TextCylinderPreview from './TextCylinderPreview';
import RadialPopOutPreview from './RadialPopOutPreview';
import HoverRevealPreview from './HoverRevealPreview';
import EclipsePreview from './EclipsePreview';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpLeft, Pause, Play, RotateCcw } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import ScrollZoomReveal from '../components/ScrollZoomReveal';
import { getComponent } from '../library/registry';

export default function Preview() {
  const { slug } = useParams();
  return slug === 'viscose-carousel' ? <ViscoseCarouselPreview /> : slug === 'paper-crumple' ? <PaperCrumplePreview /> : slug === 'dome-gallery' ? <DomeGalleryPreview /> : slug === 'passage-gallery' ? <PassageGalleryPreview /> : slug === 'scroll-expand' ? <ScrollExpandPreview /> : slug === 'tech-text' ? <TechTextPreview /> : slug === 'dither-veil' ? <DitherVeilPreview /> : slug === 'flex-carousel' ? <FlexCarouselPreview /> : slug === 'gradient-ascii' ? <GradientASCIIPreview /> : slug === 'marquee-along-svg-path' ? <MarqueeAlongSvgPathPreview /> : slug === 'drag-elements' ? <DragElementsPreview /> : slug === 'infinite-canvas' ? <InfiniteCanvasPreview /> : slug === 'hover-members' ? <HoverMembersPreview /> : slug === 'tik-tik-color-list' ? <TikTikColorListPreview /> : slug === 'polaroid-flip-card' ? <PolaroidFlipCardPreview /> : slug === 'shutter-gallery' ? <ShutterGalleryPreview /> : slug === 'type-garden' ? <TypeGardenPreview /> : slug === 'image-wheel' ? <ImageWheelPreview /> : slug === 'elastic-carousel' ? <ElasticCarouselPreview /> : slug === 'focus-scale-carousel' ? <FocusScaleCarouselPreview /> : slug === 'parallax-carousel' ? <ParallaxCarouselPreview /> : slug === 'bento-grid' ? <BentoGridPreview /> : slug === 'text-cylinder' ? <TextCylinderPreview /> : slug === 'radial-pop-out' ? <RadialPopOutPreview /> : slug === 'hover-reveal' ? <HoverRevealPreview /> : slug === 'eclipse' ? <EclipsePreview /> : <ScrollPreview />;
}

function ScrollPreview() {
  const { slug } = useParams();
  const [query] = useSearchParams();
  const embedded = query.has('embed');
  const radius = Math.max(0, Math.min(48, Number(query.get('radius') ?? 24)));
  const distance = Math.max(100, Math.min(400, Number(query.get('distance') ?? 200)));
  const leading = query.get('leading') ?? 'Above';
  const trailing = query.get('trailing') ?? 'the shoreline';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(reduced);
  const video = useRef(null);
  const image = query.get('media') === 'image';
  useEffect(() => { window.scrollTo(0, 0); }, [query.toString()]);
  if (!getComponent(slug)) return <div className="preview-not-found">Component not found. <a href="/components">Back to library</a></div>;
  const replay = () => window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  const toggleVideo = () => {
    if (video.current.paused) video.current.play().then(() => setPaused(false)).catch(() => {});
    else { video.current.pause(); setPaused(true); }
  };
  return <div className="ms-standalone-preview">
    {!embedded && <a className="ms-back-to-docs" href={`/components/${slug}`}><ArrowUpLeft size={15} /> Back to documentation</a>}
    <ScrollZoomReveal leading={leading} trailing={trailing} radius={radius} scrollDistance={distance} onProgress={setProgress}>
      {image ? <img src="/coast-poster.jpg" alt="Waves breaking on a rocky shoreline, viewed from above" /> : <video ref={video} src="/coast.mp4" poster="/coast-poster.jpg" autoPlay={!reduced} muted loop playsInline aria-label="Ocean waves breaking on a rocky shoreline" />}
    </ScrollZoomReveal>
    <div className="ms-preview-controls"><button onClick={progress > .98 ? replay : () => window.scrollBy({ top: window.innerHeight * .7, behavior: reduced ? 'instant' : 'smooth' })}>{progress > .98 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}<span>{progress > .98 ? 'Scroll back to shrink' : 'Scroll inside to explore'}</span></button><div>{!image && <button onClick={toggleVideo} aria-label={paused ? 'Play video' : 'Pause video'}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}<button onClick={replay} aria-label="Replay animation"><RotateCcw size={14} /></button><span>{String(Math.round(progress * 100)).padStart(3, '0')}%</span></div></div>
    <div className="ms-preview-progress" style={{ transform: `scaleX(${progress})` }} />
  </div>;
}
