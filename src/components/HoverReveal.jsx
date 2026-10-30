'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './HoverReveal.css';

const EMPTY_ITEMS = [];
const clamp = (value, min, max, fallback) => Number.isFinite(Number(value))
  ? Math.max(min, Math.min(max, Number(value))) : fallback;
const indexIn = (index, length) => length ? Math.round(clamp(index, 0, length - 1, 0)) : 0;

/** An editorial image index. Hover, focus, or tap a name to reveal its image. */
export default function HoverReveal({
  items = EMPTY_ITEMS,
  label = 'Protocols',
  initialIndex = 0,
  duration = 770,
  zoom = 1.4,
  parallax = 9,
  drift = true,
  radius = 18,
  theme = 'dark',
  onActiveChange,
  className = '',
}) {
  const entries = Array.isArray(items) ? items : EMPTY_ITEMS;
  const [selected, setSelected] = useState(() => indexIn(initialIndex, entries.length));
  const active = indexIn(selected, entries.length);
  const [failed, setFailed] = useState({});
  const [reduced, setReduced] = useState(false);
  const root = useRef(null), motionLayer = useRef(null);
  const images = useRef([]), buttons = useRef([]), shown = useRef(-1);
  const requested = useRef(active);
  const present = useRef(null);
  const callback = useRef(onActiveChange);
  callback.current = onActiveChange;
  requested.current = active;
  const id = useId();
  const milliseconds = clamp(duration, 0, 2500, 770);
  const scale = clamp(zoom, 1, 1.8, 1.4);
  const movement = clamp(parallax, 0, 20, 9);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const animations = new Set();
    let disposed = false;
    const run = (element, frames, options, finalStyle) => {
      const animation = element.animate(frames, options);
      animations.add(animation);
      animation.onfinish = () => {
        if (!disposed) Object.assign(element.style, finalStyle);
        animations.delete(animation);
        animation.cancel();
      };
    };
    present.current = (index, force = false) => {
      const incoming = images.current[index];
      if (!incoming || !incoming.complete || !incoming.naturalWidth) return;
      if (shown.current === index && !force) return;
      const instant = shown.current < 0 || reduced || milliseconds === 0;
      for (const [i, element] of images.current.entries()) {
        if (!element) continue;
        const computed = getComputedStyle(element);
        const opacity = Number(computed.opacity);
        const transform = computed.transform;
        element.getAnimations().forEach(animation => {
          animations.delete(animation);
          animation.cancel();
        });
        element.style.opacity = instant ? (i === index ? '1' : '0') : String(opacity);
        element.style.transform = instant ? 'scale(1)' : transform;
        if (instant) continue;
        if (i === index || opacity > 0) {
          run(element, [{ opacity }, { opacity: i === index ? 1 : 0 }], {
            duration: milliseconds, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both',
          }, { opacity: i === index ? '1' : '0' });
        }
      }
      if (!instant && scale > 1) {
        // An overdamped spring from the reference's 1.4× entry scale to rest.
        // Sampling it avoids adding a motion library to the component.
        const frames = Array.from({ length: 85 }, (_, step) => {
          const t = step / 84 * 1.4;
          const decay = (22.718 * Math.exp(-5.282 * t) - 5.282 * Math.exp(-22.718 * t)) / 17.436;
          return { transform: `scale(${step === 84 ? 1 : 1 + (scale - 1) * decay})` };
        });
        run(incoming, frames, { duration: milliseconds * 1.4 / 0.77, easing: 'linear', fill: 'both' }, { transform: 'scale(1)' });
      }
      shown.current = index;
    };
    shown.current = -1;
    present.current(requested.current, true);
    return () => {
      disposed = true;
      present.current = null;
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
  }, [entries, milliseconds, scale, reduced]);

  useEffect(() => { present.current?.(active); }, [active]);

  useEffect(() => {
    const host = root.current;
    if (!host || !entries.length) return;
    let frame = 0, disposed = false, visible = true;
    let targetX = 0, targetY = 0, x = 0, y = 0, last = 0, elapsed = 0;
    const draw = now => {
      frame = 0;
      if (disposed || !motionLayer.current) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const running = visible && !document.hidden && !reduced;
      if (running) elapsed += dt;
      const ease = 1 - Math.exp(-dt * 8);
      x += ((reduced ? 0 : targetX) - x) * ease;
      y += ((reduced ? 0 : targetY) - y) * ease;
      const floatY = drift && !reduced ? -Math.sin(elapsed * 0.7) * 8 : 0;
      motionLayer.current.style.transform = reduced ? 'none' : `translate3d(${x}px, ${y + floatY}px, 0)`;
      if (running && (drift || Math.abs(x - targetX) + Math.abs(y - targetY) > 0.01)) frame = requestAnimationFrame(draw);
    };
    const request = () => { if (!disposed && !frame) { last = 0; frame = requestAnimationFrame(draw); } };
    const pointer = event => {
      if (event.pointerType === 'touch' || reduced) return;
      const rect = host.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * movement * 2;
      targetY = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * movement * 2;
      targetX = Math.max(-movement, Math.min(movement, targetX));
      targetY = Math.max(-movement, Math.min(movement, targetY));
      request();
    };
    const leave = () => { targetX = 0; targetY = 0; request(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) request(); });
    observer.observe(host);
    host.addEventListener('pointermove', pointer, { passive: true });
    host.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', request);
    request();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener('pointermove', pointer);
      host.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', request);
    };
  }, [movement, drift, reduced, entries.length]);

  const select = index => {
    if (index === requested.current) return;
    requested.current = index;
    setSelected(index);
    callback.current?.(index, entries[index]);
  };
  const navigate = (event, index) => {
    const count = entries.length;
    const next = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (index + 1) % count
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? (index - 1 + count) % count
      : event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : null;
    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus();
    select(next);
  };
  const current = entries[active];
  return <section ref={root} className={`hover-reveal ${className}`} data-theme={theme === 'light' ? 'light' : 'dark'}
    aria-label={label || 'Image index'} style={{ '--hr-radius': `${clamp(radius, 0, 40, 18)}px` }}>
    {!current ? <div className="hover-reveal__empty">Add an item to start the reveal.</div> : <div className="hover-reveal__layout">
      <div className="hover-reveal__media" id={`${id}-image`} aria-label={current.alt || current.name} role="img">
        <div ref={motionLayer} className="hover-reveal__motion" aria-hidden="true">
          {entries.map((item, index) => <img key={`${index}-${item.src}`} ref={node => { images.current[index] = node; }}
            src={item.src} alt="" className="hover-reveal__image" draggable="false" decoding="async"
            style={{ objectPosition: item.objectPosition || 'center' }}
            onLoad={() => {
              setFailed(previous => previous[index] ? { ...previous, [index]: false } : previous);
              if (requested.current === index) present.current?.(index, shown.current < 0);
            }}
            onError={() => setFailed(previous => ({ ...previous, [index]: true }))} />)}
        </div>
        {failed[active] && <div className="hover-reveal__unavailable"><span>{current.name}</span><small>Image unavailable</small></div>}
      </div>
      <div className="hover-reveal__index">
        {label && <p className="hover-reveal__label">{label}</p>}
        <ul className="hover-reveal__list">
          {entries.map((item, index) => <li key={`${index}-${item.src}`}>
            <button type="button" ref={node => { buttons.current[index] = node; }}
              aria-label={`${String(index + 1).padStart(2, '0')} ${item.name}`}
              aria-current={index === active ? 'true' : undefined} aria-controls={`${id}-image`}
              onPointerEnter={event => { if (event.pointerType !== 'touch') select(index); }}
              onFocus={() => select(index)} onClick={() => select(index)} onKeyDown={event => navigate(event, index)}>
              <span className="hover-reveal__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span className="hover-reveal__name">{item.name}</span>
            </button>
          </li>)}
        </ul>
        <span className="hover-reveal__sr" aria-live="polite" aria-atomic="true">Showing {current.name}</span>
      </div>
    </div>}
  </section>;
}
