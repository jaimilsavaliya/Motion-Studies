'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './PolaroidFlipCard.css';

const bounded = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
// Independent easing fitted to observed motion, not the reference implementation.
function flipEase(x) {
  let low = 0, high = 1;
  for (let i = 0; i < 16; i++) {
    const t = (low + high) / 2, u = 1 - t;
    if (3 * u * u * t * .359 + t * t * t < x) low = t;
    else high = t;
  }
  const t = (low + high) / 2, u = 1 - t;
  return 3 * u * u * t * .672 + 3 * u * t * t + t * t * t;
}

export default function PolaroidFlipCard({
  src, alt = 'Photograph', caption = '', message = '', width = 340,
  rotation = -3, tilt = 14, duration = 760, theme = 'dark',
  defaultFlipped = false, flipped, onFlipChange, className = '', objectPosition = 'center',
}) {
  const card = useRef(null);
  const angle = useRef((flipped ?? defaultFlipped) ? 180 : 0);
  const [internal, setInternal] = useState(Boolean(defaultFlipped));
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const noteId = useId();
  const controlled = flipped !== undefined;
  const showingBack = controlled ? Boolean(flipped) : internal;
  const turnTime = bounded(duration, 760, 200, 1600);
  const tiltAmount = bounded(tilt, 14, 0, 24);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => setFailed(false), [src]);
  useEffect(() => {
    let frame;
    const node = card.current, from = angle.current, to = showingBack ? 180 : 0;
    const paint = value => {
      angle.current = value;
      const radians = value * Math.PI / 180;
      node.style.setProperty('--pf-turn', `${value}deg`);
      node.style.setProperty('--pf-flight', Math.abs(Math.sin(radians)));
      node.style.setProperty('--pf-stretch', .12 + .88 * Math.abs(Math.cos(radians)));
    };
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches || from === to) {
      paint(to); return undefined;
    }
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / turnTime);
      paint(t === 1 ? to : from + (to - from) * flipEase(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [showingBack, turnTime, reduced]);

  const resetPointer = () => {
    const node = card.current;
    node.dataset.hover = 'false';
    node.style.setProperty('--pf-x', 0); node.style.setProperty('--pf-y', 0);
  };
  const movePointer = event => {
    if (event.pointerType !== 'mouse' || reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = bounded((event.clientX - rect.left) / rect.width * 2 - 1, 0, -1, 1);
    const y = bounded((event.clientY - rect.top) / rect.height * 2 - 1, 0, -1, 1);
    const node = card.current;
    node.dataset.hover = 'true';
    node.style.setProperty('--pf-x', x); node.style.setProperty('--pf-y', y);
  };
  const request = next => {
    if (next === showingBack) return;
    if (!controlled) setInternal(next);
    onFlipChange?.(next);
  };
  return <button ref={card} type="button"
    className={`polaroid-flip-card ${className}`} data-theme={theme === 'light' ? 'light' : 'dark'}
    data-flipped={showingBack} aria-pressed={showingBack} aria-label={alt || 'Photograph'}
    aria-describedby={showingBack && message ? noteId : undefined}
    style={{ '--pf-turn': `${angle.current}deg`, width: bounded(width, 340, 160, 640), '--pf-rest-rotation': `${bounded(rotation, -3, -20, 20)}deg`, '--pf-tilt': `${tiltAmount}deg` }}
    onPointerEnter={movePointer} onPointerMove={movePointer} onPointerLeave={resetPointer} onPointerCancel={resetPointer}
    onPointerDown={event => { if (event.pointerType !== 'mouse') resetPointer(); }}
    onClick={() => request(!showingBack)}
    onKeyDown={event => { if (event.key === 'Escape' && showingBack) { event.preventDefault(); request(false); } }}>
    <span className="pf-shadow" aria-hidden="true" />
    <span className="pf-tilt"><span className="pf-turn">
      {[-.45, -.15, .15, .45].map(depth => <span key={depth} className="pf-edge" aria-hidden="true" style={{ transform: `translateZ(${depth}cqw)` }} />)}
      <span className="pf-face pf-front" aria-hidden={showingBack}>
        <span className="pf-photo">
          {failed || !src ? <span className="pf-fallback" role="img" aria-label={alt}>Image unavailable</span>
            : <img src={src} alt={alt} draggable="false" style={{ objectPosition }} onError={() => setFailed(true)} />}
        </span>
        <span className="pf-caption">{caption}</span>
        <span className="pf-glare" aria-hidden="true" />
      </span>
      <span className="pf-face pf-back" aria-hidden={!showingBack}>
        <span id={noteId} className="pf-note">{message}</span>
        <span className="pf-glare" aria-hidden="true" />
      </span>
    </span></span>
  </button>;
}
