'use client';

import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './InfiniteCanvas.css';

const clamp = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
const wrap = (value, period) => period ? -(((-value % period) + period) % period) : 0;
const relativeLength = value => typeof value === 'number' ? Math.max(0, value) : String(value).replace(/vw\b/g, 'cqw');

function CanvasImage({ image }) {
  const [failed, setFailed] = useState(null);
  return <div className="ic-cell">
    {image.src && failed !== image.src
      ? <img src={image.src} alt={image.alt} draggable="false" style={{ objectPosition: image.objectPosition || 'center' }} onError={() => setFailed(image.src)} />
      : <div className="ic-image-fallback" role="img" aria-label={image.alt || 'Image unavailable'}><span>Image unavailable</span></div>}
  </div>;
}

/** A periodic image plane, with input accumulation and an interruptible 1.5s quintic ease-out. */
export default function InfiniteCanvas({
  images, imageRootPath = '', numberOfImages = 15, imageSize = 'auto', gap = '5vw', columns = 5,
  height = 720, backgroundColor = '#f5f4f3', borderRadius = 24, showControls = false,
  className = '', 'aria-label': ariaLabel = 'Infinite image canvas',
}) {
  const root = useRef(null), plane = useRef(null), sizeProbe = useRef(null), gapProbe = useRef(null);
  const frame = useRef(0), drag = useRef(null), motion = useRef({ x: 0, y: 0, fromX: 0, fromY: 0, targetX: 0, targetY: 0, start: 0 });
  const geometry = useRef(null), reduced = useRef(false), wake = useRef(null);
  const [view, setView] = useState({ width: 0, height: 0, size: 1, gap: 0 });
  const entries = useMemo(() => {
    const list = Array.isArray(images) ? images : imageRootPath
      ? Array.from({ length: clamp(numberOfImages, 0, 200, 15) }, (_, index) => ({ src: `${imageRootPath.replace(/\/$/, '')}/img${index + 1}.png`, alt: `Image ${index + 1}` })) : [];
    return list.map((image, index) => typeof image === 'string' ? { src: image, alt: `Image ${index + 1}` } : { ...image, alt: image.alt || `Image ${index + 1}` });
  }, [images, imageRootPath, numberOfImages]);
  const help = useId();
  const count = entries.length;
  const cols = Math.min(Math.max(1, count), Math.floor(clamp(columns, 1, 12, 5)));
  const rows = Math.max(1, Math.ceil(count / cols));
  const tileWidth = cols * view.size + (cols + 1) * view.gap;
  const tileHeight = rows * view.size + (rows + 1) * view.gap;
  const copiesX = view.width && count ? Math.ceil(view.width / tileWidth) + 1 : 0;
  const copiesY = view.height && count ? Math.ceil(view.height / tileHeight) + 1 : 0;

  const paint = useCallback(() => {
    const g = geometry.current, m = motion.current;
    if (!g || !plane.current) return;
    const x = wrap(m.x, g.width), y = wrap(m.y, g.height);
    plane.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    root.current.dataset.x = String(Math.round(x * 1000) / 1000);
    root.current.dataset.y = String(Math.round(y * 1000) / 1000);
  }, []);
  const tick = useCallback(now => {
    const m = motion.current, g = geometry.current;
    if (!g) { frame.current = 0; return; }
    const progress = reduced.current ? 1 : Math.min(1, Math.max(0, (now - m.start) / 1500));
    const eased = 1 - (1 - progress) ** 5;
    m.x = m.fromX + (m.targetX - m.fromX) * eased;
    m.y = m.fromY + (m.targetY - m.fromY) * eased;
    if (progress >= 1) {
      // Rebase after settling to avoid accumulating large coordinates in long sessions.
      m.x = m.targetX = wrap(m.targetX, g.width); m.y = m.targetY = wrap(m.targetY, g.height);
      frame.current = 0; root.current.dataset.moving = 'false';
    } else frame.current = requestAnimationFrame(tick);
    paint();
  }, [paint]);
  const moveBy = useCallback((dx, dy, reset = false) => {
    if (!geometry.current?.count) return;
    const m = motion.current;
    m.fromX = m.x; m.fromY = m.y;
    m.targetX = reset ? 0 : m.targetX + dx; m.targetY = reset ? 0 : m.targetY + dy;
    m.start = performance.now();
    cancelAnimationFrame(frame.current); frame.current = 0;
    root.current.dataset.moving = 'true';
    if (reduced.current) tick(m.start + 1500); else frame.current = requestAnimationFrame(tick);
  }, [tick]);
  wake.current = moveBy;

  useLayoutEffect(() => {
    const node = root.current;
    const measure = () => {
      const width = node.clientWidth, height = node.clientHeight;
      // A small lower bound keeps even tiny configured tiles from creating an enormous DOM.
      const size = clamp(sizeProbe.current.getBoundingClientRect().width, Math.max(24, width / 40, height / 40), 2400, 216);
      const spacing = clamp(gapProbe.current.getBoundingClientRect().width, 0, 1200, width * .05);
      setView(previous => previous.width === width && previous.height === height && previous.size === size && previous.gap === spacing ? previous : { width, height, size, gap: spacing });
    };
    measure(); const observer = new ResizeObserver(measure);
    observer.observe(node); observer.observe(sizeProbe.current); observer.observe(gapProbe.current);
    return () => observer.disconnect();
  }, [imageSize, gap]);
  useLayoutEffect(() => {
    if (!view.width || !view.height) return;
    cancelAnimationFrame(frame.current); frame.current = 0;
    const old = geometry.current, m = motion.current;
    if (old) {
      m.x = wrap(m.x, old.width) / old.width * tileWidth;
      m.y = wrap(m.y, old.height) / old.height * tileHeight;
    }
    m.fromX = m.targetX = m.x; m.fromY = m.targetY = m.y;
    geometry.current = { width: tileWidth, height: tileHeight, count, step: view.size + view.gap, stageHeight: view.height };
    root.current.dataset.moving = 'false'; paint();
  }, [tileWidth, tileHeight, count, view.width, view.height, view.size, view.gap, paint]);
  useLayoutEffect(() => {
    const node = root.current, query = matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = () => {
      reduced.current = query.matches; node.dataset.reducedMotion = String(query.matches);
      if (query.matches && frame.current) { cancelAnimationFrame(frame.current); frame.current = 0; tick(motion.current.start + 1500); }
    };
    const wheel = event => {
      if (event.ctrlKey || event.metaKey || !geometry.current?.count) return;
      event.preventDefault();
      const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientHeight : 1;
      let dx = event.deltaX * factor, dy = event.deltaY * factor;
      if (event.shiftKey && dx === 0) { dx = dy; dy = 0; }
      wake.current(-dx, -dy);
    };
    applyPreference(); query.addEventListener('change', applyPreference); node.addEventListener('wheel', wheel, { passive: false });
    return () => { query.removeEventListener('change', applyPreference); node.removeEventListener('wheel', wheel); cancelAnimationFrame(frame.current); };
  }, [tick]);

  const endDrag = event => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null; root.current.dataset.dragging = 'false';
    if (root.current.hasPointerCapture(event.pointerId)) root.current.releasePointerCapture(event.pointerId);
    // Release does not add velocity: the existing ease simply finishes its accumulated target.
  };
  return <section ref={root} className={`infinite-canvas ${className}`} role="region" aria-label={ariaLabel} aria-describedby={help} tabIndex={0}
    style={{ height: typeof height === 'string' ? height : clamp(height, 240, 1200, 720), backgroundColor, borderRadius: clamp(borderRadius, 0, 64, 24) }}
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary || !count || event.target.closest('button')) return;
      if (event.pointerType !== 'touch') event.preventDefault();
      root.current.focus({ preventScroll: true }); root.current.setPointerCapture(event.pointerId);
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; root.current.dataset.dragging = 'true';
    }}
    onPointerMove={event => {
      const state = drag.current; if (!state || state.id !== event.pointerId) return;
      moveBy((event.clientX - state.x) * 2, (event.clientY - state.y) * 2);
      state.x = event.clientX; state.y = event.clientY;
    }}
    onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
    onKeyDown={event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('button')) return;
      const g = geometry.current; if (!g?.count) return;
      const moves = { ArrowRight: [-g.step, 0], ArrowLeft: [g.step, 0], ArrowDown: [0, -g.step], ArrowUp: [0, g.step], PageDown: [0, -g.stageHeight * .85], PageUp: [0, g.stageHeight * .85] };
      if (moves[event.key]) { event.preventDefault(); moveBy(...moves[event.key]); }
      if (event.key === 'Home' || event.key === 'Escape') { event.preventDefault(); moveBy(0, 0, true); }
    }}>
    <span ref={sizeProbe} className="ic-probe ic-size-probe" aria-hidden="true" style={{ width: imageSize === 'auto' ? undefined : relativeLength(imageSize) }} />
    <span ref={gapProbe} className="ic-probe ic-gap-probe" aria-hidden="true" style={{ width: relativeLength(gap) }} />
    {!count ? <p className="ic-empty">Add images to explore the canvas.</p> : <div ref={plane} className="ic-plane" style={{ gridTemplateColumns: `repeat(${copiesX}, ${tileWidth}px)`, '--ic-size': `${view.size}px`, '--ic-gap': `${view.gap}px` }}>
      {Array.from({ length: copiesX * copiesY }, (_, copy) => <div key={copy} className="ic-tile" aria-hidden={copy !== 0} style={{ gridTemplateColumns: `repeat(${cols}, var(--ic-size))`, width: tileWidth, height: tileHeight }}>
        {entries.map((image, index) => <CanvasImage key={`${image.id ?? index}-${image.src}`} image={image} />)}
      </div>)}
    </div>}
    {showControls && <div className="ic-controls"><span>Drag or scroll to explore</span><button type="button" onClick={() => moveBy(0, 0, true)} disabled={!count}>Reset view <span aria-hidden="true">↺</span></button></div>}
    <p id={help} className="ic-sr-only">Drag or scroll in any direction. When focused, use arrow keys to pan, Page Up and Page Down for larger moves, and Home or Escape to reset. Tab leaves the canvas.</p>
  </section>;
}
