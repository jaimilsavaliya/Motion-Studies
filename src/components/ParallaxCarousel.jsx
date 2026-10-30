'use client';

import { useEffect, useRef, useState } from 'react';
import './ParallaxCarousel.css';

const EMPTY = [];
const clamp = (value, min, max, fallback = min) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
const mod = (value, length) => ((value % length) + length) % length;

function Photo({ image, duplicate }) {
  const [failed, setFailed] = useState(false);
  return image.src && !failed
    ? <img src={image.src} alt={duplicate ? '' : image.alt || 'Gallery image'} draggable="false" decoding="async" style={{ objectPosition: image.objectPosition || 'center' }} onError={() => setFailed(true)} />
    : <span className="parallax-carousel__fallback" role={duplicate ? undefined : 'img'} aria-label={duplicate ? undefined : image.alt || 'Image unavailable'}>{image.alt || 'Image unavailable'}</span>;
}

/** A seamless, free-dragging image strip with position-based image parallax. */
export default function ParallaxCarousel({
  images = EMPTY,
  cardWidth = 320,
  cardHeight = 600,
  gap = 12,
  parallax = 60,
  speed = 34,
  radius = 12,
  fade = 80,
  mobileScale = 0.62,
  autoPlay = true,
  pauseOnHover = true,
  paused = false,
  showControls = true,
  showDots = false,
  onIndexChange,
  className = '',
}) {
  const entries = Array.isArray(images) ? images.filter(Boolean) : EMPTY;
  const count = entries.length;
  const [width, setWidth] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [localPaused, setLocalPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const root = useRef(null);
  const viewport = useRef(null);
  const track = useRef(null);
  const api = useRef({ move: () => {}, dragStart: () => {}, dragMove: () => {}, dragEnd: () => {} });
  const callback = useRef(onIndexChange);
  callback.current = onIndexChange;
  const motion = useRef({ position: 0, velocity: 0, autoVelocity: 0, target: null, drag: null, stride: 0, index: 0 });
  const factor = width > 0 && width < 640 ? clamp(mobileScale, 0.4, 1, 0.62) : 1;
  const w = Math.floor(clamp(cardWidth, 120, 600, 320) * factor);
  const h = Math.floor(clamp(cardHeight, 160, 800, 600) * factor);
  const spacing = Math.floor(clamp(gap, 0, 48, 12) * factor);
  const amount = reduced ? 0 : Math.floor(clamp(parallax, 0, 160, 60) * factor);
  const stride = w + spacing;
  const period = stride * count;
  const copies = count ? Math.max(3, Math.ceil(width / period) + 2) : 0;
  const stopped = paused || localPaused || reduced || !autoPlay;
  const speedValue = clamp(speed, -160, 160, 34);
  const imageKey = entries.map(image => image.src).join('|');

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(viewport.current);
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    intersection.observe(root.current);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => { observer.disconnect(); intersection.disconnect(); media.removeEventListener('change', update); };
  }, []);

  useEffect(() => {
    if (!count || !width) {
      api.current = { move: () => {}, dragStart: () => {}, dragMove: () => {}, dragEnd: () => {} };
      return;
    }
    const m = motion.current;
    if (m.stride && m.stride !== stride) {
      m.position = m.position / m.stride * stride;
      m.target = null; m.drag = null; m.velocity = 0;
    }
    m.stride = stride;
    if (reduced) { m.velocity = 0; m.autoVelocity = 0; }
    const cards = [...track.current.children];
    const offsets = cards.map(() => 0);
    let frame = 0, last = 0, lastWrapped = mod(m.position, period);
    const render = (dt = 1 / 60, instant = false) => {
      // Always keep one complete repeated set to the left; rightward dragging can never expose a blank edge.
      const position = mod(m.position, period);
      if (Math.abs(position - lastWrapped) > period / 2) instant = true;
      lastWrapped = position;
      track.current.style.transform = `translate3d(${-period - position}px,0,0)`;
      cards.forEach((card, i) => {
        const center = i * stride - period - position + w / 2;
        const target = amount * clamp((center - width / 2) / (width / 2), -1, 1, 0);
        offsets[i] = instant || reduced ? target : offsets[i] + (target - offsets[i]) * (1 - Math.exp(-6.32 * dt));
        const photo = card.firstElementChild;
        if (photo) photo.style.transform = `translate3d(${offsets[i]}px,0,0)`;
      });
      const next = mod(Math.floor((position + width / 2) / stride), count);
      if (m.index !== next) { m.index = next; setIndex(next); callback.current?.(next); }
    };
    const wake = () => { if (!frame && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); } };
    const tick = time => {
      frame = 0;
      if (!visible || document.hidden) return;
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 1 / 60;
      last = time;
      const autoplaySpeed = count > 1 && !stopped && !(pauseOnHover && hovered) && !focused && !m.drag ? speedValue : 0;
      m.autoVelocity += (autoplaySpeed - m.autoVelocity) * (1 - Math.exp(-6 * dt));
      if (Math.abs(m.autoVelocity) < 0.02) m.autoVelocity = 0;
      if (!m.drag) {
        if (m.target !== null) {
          const distance = m.target - m.position;
          m.position += reduced ? distance : distance * (1 - Math.exp(-9 * dt));
          if (Math.abs(distance) < 0.2 || reduced) { m.position = m.target; m.target = null; }
        } else {
          m.position += (m.autoVelocity + m.velocity) * dt;
          m.velocity *= Math.exp(-4.4 * dt);
          if (Math.abs(m.velocity) < 0.1) m.velocity = 0;
        }
      }
      render(dt);
      const unsettled = cards.some((_, i) => {
        const center = i * stride - period - mod(m.position, period) + w / 2;
        return Math.abs(amount * clamp((center - width / 2) / (width / 2), -1, 1, 0) - offsets[i]) > .05;
      });
      if (autoplaySpeed || m.autoVelocity || m.velocity || m.target !== null || unsettled) frame = requestAnimationFrame(tick);
    };
    api.current = {
      move: (step, replace = false) => {
        m.velocity = 0;
        m.target = (replace ? m.position : (m.target ?? m.position)) + step * stride;
        if (reduced) { m.position = m.target; m.target = null; render(0, true); }
        else wake();
      },
      dragStart: event => {
        if (event.button !== 0 || !event.isPrimary || count < 2) return;
        if (event.pointerType === 'mouse') event.preventDefault();
        viewport.current.setPointerCapture(event.pointerId);
        m.drag = { id: event.pointerId, x: event.clientX, time: performance.now(), velocity: 0 };
        m.target = null; m.velocity = 0; m.autoVelocity = 0;
        viewport.current.dataset.dragging = 'true';
      },
      dragMove: event => {
        if (!m.drag || m.drag.id !== event.pointerId) return;
        const now = performance.now();
        const dx = m.drag.x - event.clientX;
        m.position += dx;
        m.drag.velocity = clamp(dx / Math.max(8, now - m.drag.time) * 1000, -2200, 2200, 0);
        m.drag.x = event.clientX; m.drag.time = now;
        render(1 / 60, reduced); wake();
      },
      dragEnd: (event, cancelled = false) => {
        if (!m.drag || m.drag.id !== event.pointerId) return;
        m.velocity = !reduced && !cancelled && performance.now() - m.drag.time < 100 ? m.drag.velocity : 0;
        m.drag = null;
        viewport.current.dataset.dragging = 'false';
        if (viewport.current.hasPointerCapture(event.pointerId)) viewport.current.releasePointerCapture(event.pointerId);
        wake();
      },
    };
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; } else wake(); };
    document.addEventListener('visibilitychange', visibility);
    render(0, true); wake();
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', visibility); };
  }, [count, imageKey, copies, width, stride, period, w, amount, reduced, stopped, pauseOnHover, hovered, focused, visible, speedValue]);

  const active = count ? Math.min(index, count - 1) : 0;
  const goTo = next => {
    let distance = next - motion.current.index;
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
    api.current.move(distance, true);
  };
  return <section ref={root} className={`parallax-carousel ${className}`} aria-label="Parallax image carousel" aria-roledescription="carousel" data-index={active} data-paused={stopped}
    style={{ '--pc-width': `${w}px`, '--pc-height': `${h}px`, '--pc-gap': `${spacing}px`, '--pc-parallax': `${amount}px`, '--pc-radius': `${clamp(radius, 0, 48, 12)}px`, '--pc-fade': `${Math.min(width / 3, clamp(fade, 0, 160, 80))}px` }}>
    <div ref={viewport} className="parallax-carousel__viewport" tabIndex={0} aria-label="Drag to browse. Use Left and Right arrow keys to move, Space to pause."
      onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true); }} onPointerLeave={() => setHovered(false)}
      onFocus={event => setFocused(event.currentTarget.matches(':focus-visible'))} onBlur={() => setFocused(false)}
      onPointerDown={event => api.current.dragStart(event)} onPointerMove={event => api.current.dragMove(event)}
      onPointerUp={event => api.current.dragEnd(event)} onPointerCancel={event => api.current.dragEnd(event, true)}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); api.current.move(event.key === 'ArrowLeft' ? -1 : 1); }
        else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); goTo(event.key === 'Home' ? 0 : count - 1); }
        else if (event.code === 'Space') { event.preventDefault(); setLocalPaused(value => !value); }
      }}>
      <div ref={track} className="parallax-carousel__track" role="list" aria-label="Photographs">
        {Array.from({ length: copies }, (_, copy) => entries.map((image, i) => <div key={`${copy}-${i}`} className="parallax-carousel__card" role="listitem" aria-hidden={copy !== 1 ? true : undefined}>
          <Photo key={image.src} image={image} duplicate={copy !== 1} />
        </div>))}
      </div>
      {!count && <p className="parallax-carousel__empty">Add images to start your carousel.</p>}
    </div>
    {showControls && count > 0 && <div className="parallax-carousel__controls" onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <button type="button" aria-label="Previous image" disabled={count < 2} onClick={() => api.current.move(-1)}>←</button>
      <button type="button" aria-label={stopped ? 'Resume autoplay' : 'Pause autoplay'} disabled={paused || reduced || !autoPlay || count < 2 || speedValue === 0} onClick={() => setLocalPaused(value => !value)}>{reduced ? 'Reduced motion' : stopped ? 'Play' : 'Pause'}</button>
      <button type="button" aria-label="Next image" disabled={count < 2} onClick={() => api.current.move(1)}>→</button>
      <span aria-hidden="true">{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
      {showDots && <div className="parallax-carousel__dots">{entries.map((image, i) => <button key={i} type="button" aria-label={`Go to image ${i + 1}`} aria-current={active === i ? 'true' : undefined} onClick={() => goTo(i)} />)}</div>}
    </div>}
    <span className="parallax-carousel__sr" aria-live={focused || stopped ? 'polite' : 'off'} aria-atomic="true">{count ? `Image ${active + 1} of ${count}. ${entries[active]?.alt || ''}` : 'No images'}</span>
  </section>;
}
