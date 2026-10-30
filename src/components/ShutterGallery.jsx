'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './ShutterGallery.css';

const clamp = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;

/** Independent, dependency-free image shutters. Image dimensions follow the gallery, not each panel. */
export default function ShutterGallery({
  items = [], height = 480, gap = 12, expandedGrow = 12.6,
  defaultOpen = null, open, onOpenChange, className = '',
  'aria-label': ariaLabel = 'Image gallery',
}) {
  const root = useRef(null);
  const buttons = useRef([]);
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const [vertical, setVertical] = useState(false);
  const controlled = open !== undefined;
  const value = controlled ? open : internal;
  const selected = Number.isInteger(value) && value >= 0 && value < items.length ? value : null;
  const peek = hovered ?? focused;

  useEffect(() => {
    const node = root.current;
    const measure = () => setVertical(node.getBoundingClientRect().width < 576);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (internal !== null && (!Number.isInteger(internal) || internal >= items.length || internal < 0)) setInternal(null);
  }, [items.length, internal]);

  const request = next => {
    if (!controlled) setInternal(next);
    if (next !== selected) onOpenChange?.(next);
  };
  const onKeyDown = event => {
    if (event.key === 'Escape') {
      request(null); setHovered(null); setFocused(null);
      event.preventDefault();
      return;
    }
    const index = buttons.current.indexOf(event.target);
    if (index < 0 || !items.length) return;
    let next;
    if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = (index + 1) % items.length;
    if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next !== undefined) { event.preventDefault(); buttons.current[next]?.focus(); }
  };

  return <div ref={root} className={`shutter-gallery ${className}`} role="group" aria-label={ariaLabel}
    data-vertical={vertical} data-open={selected ?? ''} onKeyDown={onKeyDown}
    style={{ height: clamp(height, 480, 240, 1000), '--sg-gap': `${clamp(gap, 12, 0, 32)}px` }}>
    {!items.length && <p className="sg-empty">No images to display</p>}
    {items.map((item, index) => {
      const expanded = selected === index;
      const peeking = peek === index && !expanded;
      const title = item.title || item.alt || `Image ${index + 1}`;
      return <button key={`${item.src}-${index}`} ref={node => { buttons.current[index] = node; }}
        type="button" className="sg-panel" data-index={index} data-peek={peeking}
        aria-expanded={expanded} aria-label={title}
        aria-describedby={expanded && item.subtitle ? `${id}-${index}` : undefined}
        style={{ flexGrow: expanded ? clamp(expandedGrow, 12.6, 2, 24) : peeking ? (selected === null ? 1.35 : 1.6) : 1 }}
        onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(index); }}
        onPointerLeave={() => setHovered(null)}
        onPointerDown={event => { if (event.pointerType !== 'mouse') { setHovered(null); setFocused(null); } }}
        onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setFocused(index); }}
        onBlur={() => setFocused(null)}
        onClick={() => request(expanded ? null : index)}>
        <ShutterImage src={item.src} alt={item.alt || title} objectPosition={item.objectPosition} />
        <span className="sg-shade" aria-hidden="true" />
        <span className="sg-label" aria-hidden="true">{title}</span>
        <span className="sg-caption" aria-hidden={!expanded}>
          <span className="sg-title">{title}</span>
          {item.subtitle && <span id={`${id}-${index}`} className="sg-subtitle">{item.subtitle}</span>}
        </span>
      </button>;
    })}
  </div>;
}

function ShutterImage({ src, alt, objectPosition }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed || !src ? <span className="sg-fallback" role="img" aria-label={alt}><span>Image unavailable</span></span>
    : <img className="sg-image" src={src} alt={alt} draggable="false" decoding="async"
      style={{ objectPosition }} onError={() => setFailed(true)} />;
}
