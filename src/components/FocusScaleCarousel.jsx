'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './FocusScaleCarousel.css';

const EMPTY = [];
const clamp = (value, min, max, fallback = min) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
const mod = (value, count) => ((value % count) + count) % count;
const spring = t => 1 - (1 + 10.5 * t) * Math.exp(-10.5 * t);

function Photo({ item, decorative }) {
  const [failed, setFailed] = useState(false);
  return item.src && !failed ? <img src={item.src} alt={decorative ? '' : item.alt || item.title || 'Gallery image'} draggable="false" style={{ objectPosition: item.objectPosition || 'center' }} onError={() => setFailed(true)} />
    : <span className="focus-scale__fallback" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : item.alt || item.title || 'Image unavailable'}>{item.title || 'Image unavailable'}</span>;
}

/** A centered photo with a diminishing, clickable row of neighbours. */
export default function FocusScaleCarousel({
  items = EMPTY,
  cardWidth = 320,
  cardHeight = 430,
  gap = 14,
  neighborScale = 0.37,
  scaleDecay = 0.78,
  sideCount = 6,
  duration = 850,
  autoPlay = 4000,
  mobileScale = 0.55,
  radius = 2,
  showFrame = true,
  showControls = true,
  paused = false,
  initialIndex = 0,
  onIndexChange,
  className = '',
}) {
  const entries = Array.isArray(items) ? items.filter(Boolean) : EMPTY;
  const count = entries.length;
  const [cursor, setCursor] = useState(() => Math.floor(clamp(initialIndex, 0, 1000000, 0)));
  const [width, setWidth] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [localPaused, setLocalPaused] = useState(false);
  const root = useRef(null);
  const cards = useRef(new Map());
  const animations = useRef([]);
  const prior = useRef(cursor);
  const cursorRef = useRef(cursor);
  const gesture = useRef(null);
  const ignoreClick = useRef(false);
  const resetClick = useRef(0);
  cursorRef.current = cursor;
  const factor = width > 0 && width < 640 ? clamp(mobileScale, .35, 1, .55) : 1;
  const w = Math.round(clamp(cardWidth, 120, 500, 320) * factor);
  const h = Math.round(clamp(cardHeight, 160, 700, 430) * factor);
  const spacing = Math.round(clamp(gap, 0, 40, 14) * factor);
  const small = clamp(neighborScale, .2, .8, .37);
  const decay = clamp(scaleDecay, .5, .95, .78);
  const sides = count > 1 ? Math.floor(clamp(sideCount, 1, 8, 6)) : 0;
  const milliseconds = clamp(duration, 200, 1600, 850);
  const interval = Number(autoPlay) > 0 ? clamp(autoPlay, 1000, 15000, 4000) : 0;
  const active = count ? mod(cursor, count) : 0;
  const current = entries[active];
  const labelSpace = Math.round(44 * factor);
  const pausedAuto = paused || localPaused || reduced || !interval || count < 2;
  const key = entries.map(item => item.src).join('|');

  const pose = slot => {
    const distance = Math.abs(slot);
    if (!distance) return { x: 0, scale: 1, opacity: 1 };
    const integerPose = d => {
      if (!d) return { x: 0, scale: 1, opacity: 1 };
      let x = w / 2, previousScale = 1;
      for (let i = 1; i <= d; i++) {
        const scale = small * Math.pow(decay, i - 1);
        x += i === 1 ? spacing + w * scale / 2 : w * previousScale / 2 + spacing + w * scale / 2;
        previousScale = scale;
      }
      return { x, scale: previousScale, opacity: Math.max(0, 1 - Math.max(0, d - 3) * .18) };
    };
    const lower = Math.floor(distance), blend = distance - lower;
    const a = integerPose(lower), b = integerPose(lower + 1);
    return { x: Math.sign(slot) * (a.x + (b.x - a.x) * blend), scale: a.scale + (b.scale - a.scale) * blend, opacity: a.opacity + (b.opacity - a.opacity) * blend };
  };
  const style = value => ({ transform: `translateX(${value.x}px) scale(${value.scale})`, opacity: String(value.opacity) });
  const freeze = () => {
    animations.current.forEach(({ element, animation }) => {
      const computed = getComputedStyle(element);
      element.style.transform = computed.transform;
      element.style.opacity = computed.opacity;
      animation.cancel();
    });
    animations.current = [];
  };

  useEffect(() => {
    const size = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    size.observe(root.current);
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    intersection.observe(root.current);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    const tab = () => setHidden(document.hidden);
    change(); tab(); media.addEventListener('change', change); document.addEventListener('visibilitychange', tab);
    return () => { size.disconnect(); intersection.disconnect(); media.removeEventListener('change', change); document.removeEventListener('visibilitychange', tab); clearTimeout(resetClick.current); };
  }, []);

  useLayoutEffect(() => {
    const changed = prior.current !== cursor;
    cards.current.forEach((element, logical) => {
      let from = pose(logical - prior.current);
      if (element.dataset.ready) {
        const computed = getComputedStyle(element);
        const matrix = new DOMMatrixReadOnly(computed.transform);
        from = { x: matrix.m41, scale: matrix.a, opacity: Number(computed.opacity) };
      }
      const to = pose(logical - cursor);
      Object.assign(element.style, style(to));
      element.dataset.ready = 'true';
      if (!reduced && changed && element.animate) {
        const frames = Array.from({ length: 61 }, (_, i) => {
          const p = i === 60 ? 1 : spring(i / 60 * .85);
          return style({ x: from.x + (to.x - from.x) * p, scale: from.scale + (to.scale - from.scale) * p, opacity: from.opacity + (to.opacity - from.opacity) * p });
        });
        const animation = element.animate(frames, { duration: milliseconds, easing: 'linear' });
        animations.current.push({ element, animation });
      }
    });
    prior.current = cursor;
    return freeze;
  }, [cursor, w, h, spacing, small, decay, sides, count, key, reduced, milliseconds]);

  const choose = logical => {
    if (count < 2 || logical === cursorRef.current) return;
    cursorRef.current = logical;
    setCursor(logical);
    onIndexChange?.(mod(logical, count), entries[mod(logical, count)]);
  };
  const latestChoose = useRef(choose);
  latestChoose.current = choose;
  useEffect(() => {
    if (pausedAuto || hovered || focused || dragging || !visible || hidden) return;
    const timer = setTimeout(() => latestChoose.current(cursorRef.current + 1), interval);
    return () => clearTimeout(timer);
  }, [pausedAuto, hovered, focused, dragging, visible, hidden, interval, cursor]);

  const endDrag = (event, cancelled = false) => {
    const drag = gesture.current;
    if (!drag || drag.id !== event.pointerId) return;
    gesture.current = null; setDragging(false);
    root.current.dataset.dragging = 'false';
    if (root.current.hasPointerCapture(event.pointerId)) root.current.releasePointerCapture(event.pointerId);
    if (drag.moved) {
      ignoreClick.current = true;
      clearTimeout(resetClick.current);
      resetClick.current = setTimeout(() => { ignoreClick.current = false; }, 0);
      const steps = cancelled ? 0 : Math.round((drag.x - event.clientX) / Math.max(24, 50 * factor));
      if (steps) choose(cursorRef.current + Math.max(-sides, Math.min(sides, steps)));
      else { // Settle a short or cancelled gesture without changing the selected item.
        cards.current.forEach((element, logical) => {
          const start = { transform: getComputedStyle(element).transform, opacity: getComputedStyle(element).opacity };
          const target = style(pose(logical - cursorRef.current));
          Object.assign(element.style, target);
          if (!reduced && element.animate) animations.current.push({ element, animation: element.animate([start, target], { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' }) });
        });
      }
    }
  };
  const offsets = [0, ...Array.from({ length: sides }, (_, i) => [i + 1, -i - 1]).flat()];
  const seen = new Set();
  return <section className={`focus-scale ${className}`} data-index={active} data-paused={pausedAuto} style={{ '--fs-width': `${w}px`, '--fs-height': `${h}px`, '--fs-label-space': `${labelSpace}px`, '--fs-radius': `${clamp(radius, 0, 30, 2)}px`, '--fs-frame-padding': `${Math.round(20 * factor)}px`, '--fs-corner': `${Math.round(12 * factor)}px`, '--fs-collection-size': `${Math.round(14 * factor)}px`, '--fs-title-size': `${Math.round(19 * factor)}px`, '--fs-label-top': `${Math.round(10 * factor)}px`, '--fs-label-bottom': `${Math.round(12 * factor)}px` }}>
    <div ref={root} className="focus-scale__stage" role="group" aria-roledescription="carousel" aria-label="Focus scale image gallery" tabIndex={0}
      onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true); }} onPointerLeave={() => setHovered(false)}
      onFocusCapture={event => setFocused(event.target.matches(':focus-visible'))} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); choose(cursorRef.current + (event.key === 'ArrowRight' ? 1 : -1)); }
        else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); choose(cursorRef.current - active + (event.key === 'End' ? count - 1 : 0)); }
        else if (event.code === 'Space' && event.target === root.current) { event.preventDefault(); setLocalPaused(value => !value); }
      }}
      onPointerDown={event => { if (event.button !== 0 || !event.isPrimary || count < 2) return; setDragging(true); gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }; }}
      onPointerMove={event => {
        const drag = gesture.current;
        if (!drag || drag.id !== event.pointerId) return;
        const delta = event.clientX - drag.x;
        if (!drag.moved && Math.abs(event.clientY - drag.y) > Math.abs(delta)) return;
        if (Math.abs(delta) > 5) {
          if (!drag.moved) { freeze(); root.current.setPointerCapture(event.pointerId); }
          drag.moved = true; root.current.dataset.dragging = 'true';
          const shift = Math.max(-sides, Math.min(sides, -delta / Math.max(24, 50 * factor)));
          cards.current.forEach((element, logical) => Object.assign(element.style, style(pose(logical - cursorRef.current - shift))));
        }
      }} onPointerUp={event => endDrag(event)} onPointerCancel={event => endDrag(event, true)}
      onClickCapture={event => { if (ignoreClick.current) { event.preventDefault(); event.stopPropagation(); } }}>
      {current ? <>
        <div className="focus-scale__collection"><span key={`${cursor}-${current.collection}`}>{current.collection}</span></div>
        {offsets.map(offset => {
          const logical = cursor + offset, itemIndex = mod(logical, count), item = entries[itemIndex];
          const duplicate = seen.has(itemIndex); seen.add(itemIndex);
          return <button key={logical} ref={element => { if (element) cards.current.set(logical, element); else cards.current.delete(logical); }} type="button" className="focus-scale__card" tabIndex={-1} aria-current={offset === 0 ? 'true' : undefined} aria-hidden={duplicate ? true : undefined} aria-label={offset === 0 ? `Selected: ${item.title || 'Image'}` : `Show ${item.title || `image ${itemIndex + 1}`}`} style={{ zIndex: 40 - Math.abs(offset) }} onClick={() => choose(logical)}>
            <Photo key={item.src} item={item} decorative={duplicate} />
          </button>;
        })}
        {showFrame && <div className="focus-scale__frame" aria-hidden="true"><i /><i /><i /><i /></div>}
        <div className="focus-scale__title"><span key={`${cursor}-${current.title}`}>{current.title}</span></div>
      </> : <p className="focus-scale__empty">Add items to start your collection.</p>}
    </div>
    {showControls && count > 0 && <div className="focus-scale__controls" onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <button type="button" aria-label="Previous image" disabled={count < 2} onClick={() => choose(cursorRef.current - 1)}>←</button>
      <button type="button" aria-label={pausedAuto ? 'Resume autoplay' : 'Pause autoplay'} disabled={paused || reduced || !interval || count < 2} onClick={() => setLocalPaused(value => !value)}>{reduced ? 'Reduced motion' : pausedAuto ? 'Play' : 'Pause'}</button>
      <button type="button" aria-label="Next image" disabled={count < 2} onClick={() => choose(cursorRef.current + 1)}>→</button>
      <span aria-hidden="true">{active + 1} / {count}</span>
    </div>}
    <span className="focus-scale__sr" aria-live={focused || pausedAuto ? 'polite' : 'off'} aria-atomic="true">{current ? `${active + 1} of ${count}. ${current.collection || ''}. ${current.title || ''}` : 'No images'}</span>
  </section>;
}
