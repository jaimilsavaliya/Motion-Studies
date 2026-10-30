'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './TextCylinder.css';

const EMPTY = [];
const clamp = (v, min, max, fallback) => Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : fallback;
const FONT = 'system-ui, sans-serif';

function makeRing(text, fontSize, width) {
  const phrase = `${String(text || 'Untitled').slice(0, 100).toUpperCase()}\u00a0\u00a0·\u00a0\u00a0`;
  const glyphs = typeof Intl.Segmenter === 'function'
    ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(phrase)].map(part => part.segment)
    : Array.from(phrase);
  const context = document.createElement('canvas').getContext('2d');
  if (context) context.font = `700 ${fontSize}px ${FONT}`;
  const widths = glyphs.map(char => Math.max(1, context?.measureText(char).width || fontSize * 0.6));
  const total = widths.reduce((a, b) => a + b, 0);
  const repetitions = Math.min(8, Math.max(1, Math.ceil(2 * Math.PI * Math.max(width * 0.35, fontSize * 2) / total)));
  const circumference = total * repetitions;
  let offset = 0;
  return {
    radius: circumference / (Math.PI * 2),
    glyphs: Array.from({ length: repetitions }, () => glyphs).flat().map((char, i) => {
      const size = widths[i % widths.length];
      const angle = -(offset + size / 2) / circumference * 360;
      offset += size;
      return { char, angle };
    }),
  };
}

function Cylinder({ slide, size, fontScale, angle, exiting }) {
  const lines = Array.isArray(slide.lines) ? slide.lines.slice(0, 2) : [slide.label || 'Untitled'];
  const lineKey = JSON.stringify(lines);
  const fontSize = Math.max(24, Math.round(size.height * fontScale));
  const rings = useMemo(() => size.width ? JSON.parse(lineKey).map(text => makeRing(text, fontSize, size.width)) : [], [lineKey, size.width, fontSize]);
  const perspective = Math.max(size.width * 0.56, ...rings.map(ring => ring.radius * 1.12));
  return <div className={`text-cylinder__type ${exiting ? 'is-outgoing' : 'is-incoming'}`} aria-hidden="true" style={{ color: slide.color || '#2f5fb3', fontSize, perspective }}>
    {rings.map((ring, row) => <div key={row} className="text-cylinder__ring" data-row={row} style={{ top: `calc(50% + ${(row - (rings.length - 1) / 2) * 0.95}em)`, transform: `rotateY(${row % 2 ? 37 - angle : angle}deg)` }}>
      {ring.glyphs.map(({ char, angle: rotation }, index) => <span key={index} style={{ transform: `translate(-50%, -50%) rotateY(${rotation}deg) translateZ(${-ring.radius}px)` }}>{char}</span>)}
    </div>)}
  </div>;
}

function Photo({ slide }) {
  const [failed, setFailed] = useState(false);
  return slide.src && !failed
    ? <img src={slide.src} alt={slide.alt || slide.lines?.join(' — ') || slide.label || 'Slide image'} draggable="false" style={{ objectPosition: slide.objectPosition || 'center' }} onError={() => setFailed(true)} />
    : <span className="text-cylinder__fallback" role="img" aria-label={slide.alt || slide.label || 'Image unavailable'}>{slide.label || 'Image unavailable'}</span>;
}

/** Two counter-rotating, individually measured text rings and a click-through portrait. */
export default function TextCylinder({
  slides = EMPTY,
  speed = 18,
  fontScale = 0.24,
  imageWidth = 22,
  mobileImageWidth = 46,
  duration = 700,
  initialIndex = 0,
  paused = false,
  showControls = true,
  theme = 'dark',
  onSlideChange,
  className = '',
}) {
  const entries = Array.isArray(slides) ? slides.filter(Boolean) : EMPTY;
  const [index, setIndex] = useState(() => Math.floor(clamp(initialIndex, 0, Number.MAX_SAFE_INTEGER, 0)));
  const [previous, setPrevious] = useState(null);
  const [localPaused, setLocalPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const root = useRef(null);
  const angle = useRef(0);
  const serial = useRef(0);
  const current = entries.length ? index % entries.length : 0;
  const slide = entries[current];
  const milliseconds = clamp(duration, 200, 1500, 700);
  const scale = clamp(fontScale, 0.12, 0.4, 0.24);
  const velocity = clamp(speed, -60, 60, 18);
  const stopped = paused || localPaused || reduced;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const element = root.current;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(old => old.width === width && old.height === height ? old : { width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (stopped || !visible || velocity === 0) return;
    let frame, last;
    const tick = time => {
      if (last !== undefined && !document.hidden) angle.current = (angle.current + Math.min(time - last, 64) * velocity / 1000) % 360;
      last = time;
      root.current?.querySelectorAll('.text-cylinder__ring').forEach(ring => {
        ring.style.transform = `rotateY(${Number(ring.dataset.row) % 2 ? 37 - angle.current : angle.current}deg)`;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stopped, visible, velocity]);
  useEffect(() => {
    if (!previous) return;
    if (reduced) { setPrevious(null); return; }
    const timer = setTimeout(() => setPrevious(null), milliseconds);
    return () => clearTimeout(timer);
  }, [previous, milliseconds, reduced]);
  // Warm the next image without retaining an unbounded image cache.
  useEffect(() => {
    if (entries.length > 1) {
      const image = new Image(); image.src = entries[(current + 1) % entries.length].src || '';
    }
  }, [current, entries.length, entries[(current + 1) % (entries.length || 1)]?.src]);

  const advance = (step = 1) => {
    if (entries.length < 2) return;
    const next = (current + step + entries.length) % entries.length;
    setPrevious(reduced ? null : { slide, id: ++serial.current });
    setIndex(next);
    onSlideChange?.(next, entries[next]);
  };
  const transitioning = !!previous && !reduced;
  return <section ref={root} className={`text-cylinder ${className}`} data-theme={theme === 'light' ? 'light' : 'dark'} data-index={current} data-paused={stopped} data-transitioning={transitioning} aria-label="Text cylinder gallery" aria-roledescription="carousel" style={{ '--tc-image-width': `${clamp(imageWidth, 12, 45, 22)}%`, '--tc-mobile-image-width': `${clamp(mobileImageWidth, 30, 75, 46)}%`, '--tc-duration': `${milliseconds}ms`, '--tc-fade': `${Math.min(milliseconds, 450)}ms` }}>
    {slide ? <>
      <div className="text-cylinder__typography" key={`${current}-${slide.src}-${serial.current}`}>
        {transitioning && <Cylinder slide={previous.slide} size={size} fontScale={scale} angle={angle.current} exiting />}
        <Cylinder slide={slide} size={size} fontScale={scale} angle={angle.current} />
      </div>
      <div className="text-cylinder__center">
        <button type="button" className="text-cylinder__photo" aria-label={`${entries.length > 1 ? 'Next slide' : 'Slide'}: ${slide.lines?.join(' — ') || slide.label || current + 1}`} aria-disabled={entries.length < 2} onClick={() => advance()} onKeyDown={event => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); advance(event.key === 'ArrowLeft' ? -1 : 1); }
        }}>
          <div className="text-cylinder__photos" key={`${current}-${slide.src}-${serial.current}`}>
            {transitioning && <div className="text-cylinder__image is-outgoing" aria-hidden="true"><Photo key={previous.slide.src} slide={previous.slide} /></div>}
            <div className="text-cylinder__image is-incoming"><Photo key={slide.src} slide={slide} /></div>
          </div>
        </button>
        <div className="text-cylinder__caption" style={{ color: slide.color || '#2f5fb3' }}><span>{String(current + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}</span><span>{slide.label}</span></div>
      </div>
      <span className="text-cylinder__sr" aria-live="polite" aria-atomic="true">{current + 1} of {entries.length}. {slide.lines?.join('. ')}. {slide.label}</span>
      {showControls && <div className="text-cylinder__controls"><button type="button" onClick={() => setLocalPaused(value => !value)} disabled={paused || reduced || velocity === 0} aria-label={stopped ? 'Resume rotation' : 'Pause rotation'}>{reduced ? 'Reduced motion' : stopped ? 'Play' : 'Pause'}</button><span>{entries.length > 1 ? 'Click the image to explore' : 'Single slide'}</span></div>}
    </> : <p className="text-cylinder__empty">Add slides to start your collection.</p>}
  </section>;
}
