'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './BentoGrid.css';

const EMPTY = [];
const clamp = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
const spring = t => 1 - Math.exp(-13 * t) * (Math.cos(Math.sqrt(51) * t) + 13 / Math.sqrt(51) * Math.sin(Math.sqrt(51) * t));
const safeURL = value => typeof value === 'string' && /^(https?:\/\/|\/(?!\/)|#)/i.test(value) ? value : undefined;

function Photo({ item }) {
  const [failed, setFailed] = useState(false);
  return item.src && !failed ? <img src={item.src} alt={item.alt || item.title || ''} draggable="false" style={{ objectPosition: item.objectPosition || 'center' }} onError={() => setFailed(true)} />
    : <span className="bento-grid__fallback" role="img" aria-label={item.alt || item.title || 'Image unavailable'}>{item.title || 'Image unavailable'}</span>;
}

function Arrow({ direction }) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{direction === 'close' ? <path d="m6 6 12 12M6 18 18 6" /> : direction === 'previous' ? <path d="m12 5-7 7 7 7M5 12h14" /> : <path d="m12 5 7 7-7 7M5 12h14" />}</svg>;
}

function Detail({ items, index, onNavigate, onDismiss, tiles, tileRadius, duration, sidebarWidth, theme, reduced }) {
  const dialog = useRef(null);
  const image = useRef(null);
  const panel = useRef(null);
  const backdrop = useRef(null);
  const closing = useRef(false);
  const animations = useRef([]);
  const titleId = useId();
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const item = items[index];
  const currentIndex = useRef(index);
  currentIndex.current = index;
  const mobile = viewport.width < 768;
  const side = Math.min(sidebarWidth, viewport.width * 0.48);
  const imageRect = mobile
    ? { x: 12, y: 12, width: Math.max(1, viewport.width - 24), height: Math.max(1, Math.round(viewport.height * 0.46)) }
    : { x: 24, y: 24, width: Math.max(1, viewport.width - side - 48), height: Math.max(1, viewport.height - 48) };
  const destination = useRef(imageRect);
  destination.current = imageRect;

  const animateRect = (from, to, fromRadius, toRadius, finish) => {
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    const frame = progress => ({
      transform: `translate(${from.x + (to.x - from.x) * progress}px, ${from.y + (to.y - from.y) * progress}px)`,
      width: `${Math.max(1, from.width + (to.width - from.width) * progress)}px`,
      height: `${Math.max(1, from.height + (to.height - from.height) * progress)}px`,
      borderRadius: `${Math.max(0, fromRadius + (toRadius - fromRadius) * progress)}px`,
    });
    Object.assign(image.current.style, frame(1));
    if (reduced || typeof image.current.animate !== 'function') { finish?.(); return; }
    const frames = Array.from({ length: 61 }, (_, i) => frame(i === 60 ? 1 : spring(i / 60 * 0.7)));
    const animation = image.current.animate(frames, { duration, easing: 'linear' });
    animations.current.push(animation);
    animation.onfinish = () => finish?.();
  };

  const dismiss = () => {
    if (closing.current) return;
    closing.current = true;
    const tile = tiles.current[currentIndex.current];
    const from = image.current.getBoundingClientRect();
    const to = tile?.getBoundingClientRect();
    const radius = parseFloat(getComputedStyle(image.current).borderRadius) || 16;
    if (!to || reduced) { onDismiss(); return; }
    animateRect(from, to, radius, tileRadius, onDismiss);
    if (panel.current.animate) {
      animations.current.push(panel.current.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: mobile ? 'translateY(24px)' : 'translateX(40px)' }], { duration: Math.min(duration, 220), fill: 'forwards', easing: 'ease-out' }));
      animations.current.push(backdrop.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: Math.min(duration, 300), fill: 'forwards' }));
    }
    dialog.current.dataset.closing = 'true';
  };
  const handlers = useRef({ dismiss, onNavigate });
  handlers.current = { dismiss, onNavigate };

  useLayoutEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    const start = tiles.current[index]?.getBoundingClientRect() || destination.current;
    animateRect(start, destination.current, tileRadius, 16);
    if (!reduced && panel.current.animate) {
      animations.current.push(panel.current.animate([{ opacity: 0, transform: mobile ? 'translateY(40px)' : 'translateX(40px)' }, { opacity: 1, transform: 'none' }], { duration: Math.min(duration, 500), delay: 80, fill: 'backwards', easing: 'cubic-bezier(.22,1,.36,1)' }));
      animations.current.push(backdrop.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.23,1,.32,1)' }));
    }
    const resize = () => {
      // A resize during an entrance settles immediately in the new layout.
      animations.current.forEach(animation => animation.cancel());
      if (closing.current) { onDismiss(); return; }
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    const cancel = event => { event.preventDefault(); handlers.current.dismiss(); };
    const keys = event => {
      if (closing.current) return;
      if (!event.target.closest('input,textarea,select,[contenteditable=true]') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); handlers.current.onNavigate(event.key === 'ArrowLeft' ? -1 : 1); }
      if (event.key === 'Tab') {
        const focusable = [...element.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')].filter(node => node.getClientRects().length && !node.closest('[inert]'));
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === element)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    element.addEventListener('cancel', cancel);
    element.addEventListener('keydown', keys);
    window.addEventListener('resize', resize);
    element.querySelector('[aria-label="Close"]')?.focus({ preventScroll: true });
    return () => {
      animations.current.forEach(animation => { animation.onfinish = null; animation.cancel(); });
      element.removeEventListener('cancel', cancel); element.removeEventListener('keydown', keys);
      window.removeEventListener('resize', resize);
      element.close();
      document.body.style.overflow = previousOverflow;
      const target = tiles.current[currentIndex.current];
      requestAnimationFrame(() => { if (target?.isConnected) target.focus({ preventScroll: true }); });
    };
    // The dialog is mounted once per opening; navigation uses refs, not a remount.
  }, []);

  useEffect(() => {
    if (reduced) animations.current.forEach(animation => animation.finish());
  }, [reduced]);

  return createPortal(<dialog ref={dialog} className="bento-grid__dialog" data-theme={theme} aria-labelledby={titleId}>
    <div ref={backdrop} className="bento-grid__backdrop" onClick={dismiss} aria-hidden="true" />
    <div ref={image} className="bento-grid__expanded" style={{ width: imageRect.width, height: imageRect.height, transform: `translate(${imageRect.x}px, ${imageRect.y}px)`, borderRadius: 16 }}>
      <div key={`${index}-${item.src}`} className="bento-grid__detail-photo"><Photo item={item} /></div>
    </div>
    <aside ref={panel} className="bento-grid__panel" style={mobile ? { top: imageRect.height + 24, width: '100%', bottom: 0, right: 0 } : { top: 0, bottom: 0, right: 0, width: side }}>
      <div className="bento-grid__controls"><div><button type="button" aria-label="Previous" disabled={index === 0} onClick={() => !closing.current && onNavigate(-1)}><Arrow direction="previous" /></button><button type="button" aria-label="Next" disabled={index === items.length - 1} onClick={() => !closing.current && onNavigate(1)}><Arrow direction="next" /></button></div><button type="button" aria-label="Close" onClick={dismiss}><Arrow direction="close" /></button></div>
      <div className="bento-grid__heading"><p>{item.eyebrow}</p><h2 id={titleId}>{item.title || `Image ${index + 1}`}</h2></div>
      <div key={index} className="bento-grid__description">{item.description}</div>
      {item.credit && <p className="bento-grid__credit">Photo by {safeURL(item.creditHref) ? <a href={safeURL(item.creditHref)} target="_blank" rel="noopener noreferrer">{item.credit}</a> : item.credit}</p>}
      <span className="bento-grid__sr" aria-live="polite" aria-atomic="true">{index + 1} of {items.length}. {item.title}</span>
    </aside>
  </dialog>, document.body);
}

/** A responsive image grid with a shared-image expansion and accessible detail dialog. */
export default function BentoGrid({ items = EMPTY, columns = 4, gap = 12, rowHeight = 220, mobileRowHeight = 150, radius = 12, sidebarWidth = 400, duration = 700, theme = 'dark', onActiveChange, className = '' }) {
  const entries = Array.isArray(items) ? items.filter(Boolean) : EMPTY;
  const [active, setActive] = useState(null);
  const [reduced, setReduced] = useState(false);
  const [width, setWidth] = useState(0);
  const root = useRef(null);
  const tiles = useRef([]);
  const count = Math.floor(clamp(columns, 1, 6, 4));
  const fittedColumns = width > 0 && width < 640 ? Math.min(count, 2) : count;
  const corners = clamp(radius, 0, 40, 12);
  const selected = active === null || !entries.length ? null : Math.min(active, entries.length - 1);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (!entries.length) setActive(null); }, [entries.length]);
  const choose = index => { setActive(index); onActiveChange?.(index, index === null ? null : entries[index]); };
  const navigate = step => { const next = Math.min(entries.length - 1, Math.max(0, selected + step)); if (next !== selected) choose(next); };
  return <div ref={root} className={`bento-grid ${className}`} data-theme={theme === 'light' ? 'light' : 'dark'} style={{ '--bento-columns': fittedColumns, '--bento-gap': `${clamp(gap, 0, 32, 12)}px`, '--bento-row': `${width > 0 && width < 640 ? clamp(mobileRowHeight, 80, 300, 150) : clamp(rowHeight, 100, 400, 220)}px`, '--bento-radius': `${corners}px` }}>
    {entries.map((item, index) => <button key={item.id || index} ref={element => { tiles.current[index] = element; }} type="button" className="bento-grid__tile" aria-label={item.title || `Image ${index + 1}`} aria-haspopup="dialog" onClick={() => choose(index)} style={{ gridColumn: `span ${Math.floor(clamp(item.colSpan, 1, fittedColumns, 1))}`, gridRow: `span ${Math.floor(clamp(item.rowSpan, 1, 3, 1))}`, visibility: selected === index ? 'hidden' : 'visible' }}>
      <Photo key={item.src} item={item} /><span className="bento-grid__caption"><span>{item.eyebrow}</span><strong>{item.title}</strong></span>
    </button>)}
    {!entries.length && <p className="bento-grid__empty">Add images to start your gallery.</p>}
    {selected !== null && <Detail items={entries} index={selected} onNavigate={navigate} onDismiss={() => choose(null)} tiles={tiles} tileRadius={corners} duration={clamp(duration, 250, 1200, 700)} sidebarWidth={clamp(sidebarWidth, 280, 520, 400)} theme={theme === 'light' ? 'light' : 'dark'} reduced={reduced} />}
  </div>;
}
