'use client';

import { Children, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './MarqueeAlongSvgPath.css';
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const finite = (n, fallback) => Number.isFinite(Number(n)) ? Number(n) : fallback;
const wrap = n => ((n % 100) + 100) % 100;
const DEFAULT_SPRING = { damping: 50, stiffness: 400 };
function stepSpring(spring, target, seconds, config) {
  const stiffness = clamp(finite(config?.stiffness, 400), 1, 1000), damping = clamp(finite(config?.damping, 50), 1, 150);
  const mass = clamp(finite(config?.mass, 1), .5, 10), steps = Math.ceil(seconds * 120), dt = seconds / (steps || 1);
  for (let i = 0; i < steps; i++) { spring.v += ((target - spring.p) * stiffness - spring.v * damping) / mass * dt; spring.p += spring.v * dt; }
  if (Math.abs(target - spring.p) < .0001 && Math.abs(spring.v) < .001) { spring.p = target; spring.v = 0; }
}
function parseBox(value) {
  const parts = String(value).trim().split(/[\s,]+/).map(Number);
  return parts.length === 4 && parts.every(Number.isFinite) && parts[2] > 0 && parts[3] > 0 ? parts : [0, 0, 100, 100];
}

/** Native CSS motion paths + a single animation loop. No animation dependencies. */
export default function MarqueeAlongSvgPath({
  children, path, pathId, viewBox = '0 0 100 100', preserveAspectRatio = 'xMidYMid meet',
  width = '100%', height = '100%', responsive = false, showPath = false,
  baseVelocity = 5, direction = 'normal', repeat = 3, easing,
  slowdownOnHover = false, slowDownFactor = .3, slowDownSpringConfig = DEFAULT_SPRING,
  useScrollVelocity = false, scrollAwareDirection = false, scrollSpringConfig = DEFAULT_SPRING, scrollContainer,
  draggable = false, dragSensitivity = .2, dragVelocityDecay = .96, dragAwareDirection = false, grabCursor = false,
  enableRollingZIndex = true, zIndexBase = 1, zIndexRange = 10, cssVariableInterpolation = [],
  paused = false, showControls = false, className = '', style, 'aria-label': label = 'Marquee along an SVG path',
}) {
  const root = useRef(null), plane = useRef(null), track = useRef(null), nodes = useRef([]), svgPath = useRef(null);
  const config = useRef(null), wake = useRef(() => {}), pointer = useRef(null), suppress = useRef(false);
  const state = useRef({ phase: 0, sign: direction === 'reverse' ? -1 : 1, frame: 0, last: 0, visible: true, reduced: false, focus: false, hover: false, dragVelocity: 0, scrollTarget: 0, scrollTime: 0, hoverSpring: { p: 1, v: 0 }, scrollSpring: { p: 0, v: 0 } });
  const [userPaused, setUserPaused] = useState(false), [valid, setValid] = useState(true);
  const generatedId = useId(), help = `${generatedId}-help`, list = Children.toArray(children);
  const copies = clamp(Math.floor(finite(repeat, 3)), 1, 20), total = list.length * copies;
  const box = parseBox(viewBox), offsetPath = `path(${JSON.stringify(path || '')})`;
  config.current = { total, valid, paused: paused || userPaused, baseVelocity: clamp(finite(baseVelocity, 5), -100, 100), easing, slowdownOnHover, slowDownFactor: clamp(finite(slowDownFactor, .3), 0, 1), slowDownSpringConfig, useScrollVelocity, scrollAwareDirection, scrollSpringConfig, draggable, dragSensitivity: clamp(finite(dragSensitivity, .2), 0, 2), dragVelocityDecay: clamp(finite(dragVelocityDecay, .96), 0, .999), dragAwareDirection, enableRollingZIndex, zIndexBase: finite(zIndexBase, 1), zIndexRange: finite(zIndexRange, 10), cssVariableInterpolation };
  const paint = useCallback(() => {
    const c = config.current, s = state.current;
    root.current.dataset.phase = String(s.phase);
    nodes.current.forEach(node => {
      if (!node) return;
      const position = wrap(s.phase + Number(node.dataset.position));
      let progress = position / 100;
      if (typeof c.easing === 'function') { try { progress = clamp(finite(c.easing(progress), progress), 0, 1); } catch { /* Invalid user easing falls back to linear. */ } }
      node.style.offsetDistance = `${progress * 100}%`;
      node.style.zIndex = c.enableRollingZIndex ? String(Math.floor(c.zIndexBase + progress * c.zIndexRange)) : '';
      for (const entry of c.cssVariableInterpolation || []) {
        if (typeof entry?.property !== 'string' || !Number.isFinite(entry.from) || !Number.isFinite(entry.to)) continue;
        const property = entry.property.startsWith('--') ? entry.property : entry.property.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
        node.style.setProperty(property, String(entry.from + (entry.to - entry.from) * progress));
      }
    });
  }, []);
  useLayoutEffect(() => {
    const supported = Boolean(path) && CSS.supports('offset-path', offsetPath);
    let length = 0; if (supported) { try { length = svgPath.current.getTotalLength(); } catch { /* Invalid paths show a static message. */ } }
    setValid(supported && length > 0);
  }, [path, offsetPath]);
  useLayoutEffect(() => {
    const layout = () => {
      const [minX, minY, w, h] = parseBox(viewBox), element = root.current;
      let sx = 1, sy = 1, x = 0, y = 0;
      if (responsive) {
        sx = element.clientWidth / w; sy = element.clientHeight / h;
        if (preserveAspectRatio !== 'none') {
          sx = sy = preserveAspectRatio.includes('slice') ? Math.max(sx, sy) : Math.min(sx, sy);
          x = (element.clientWidth - w * sx) * (preserveAspectRatio.includes('xMin') ? 0 : preserveAspectRatio.includes('xMax') ? 1 : .5);
          y = (element.clientHeight - h * sy) * (preserveAspectRatio.includes('YMin') ? 0 : preserveAspectRatio.includes('YMax') ? 1 : .5);
        }
      }
      plane.current.style.transform = `translate(${x}px, ${y}px) scale(${sx}, ${sy})`;
      track.current.style.transform = `translate(${-minX}px, ${-minY}px)`;
      element.dataset.scale = String(sx);
    };
    const observer = new ResizeObserver(layout); observer.observe(root.current); layout();
    return () => observer.disconnect();
  }, [viewBox, responsive, preserveAspectRatio]);
  useLayoutEffect(() => {
    nodes.current.length = total;
    for (const node of nodes.current) if (node?.dataset.copy !== '0') node?.querySelectorAll('a,button,input,select,textarea,[tabindex],[contenteditable]').forEach(element => element.setAttribute('tabindex', '-1'));
    paint();
    wake.current();
  });
  useEffect(() => { state.current.sign = direction === 'reverse' ? -1 : 1; wake.current(); }, [direction]);
  useEffect(() => {
    // Remove numeric interpolations when the configuration changes.
    paint();
    const properties = (cssVariableInterpolation || []).map(entry => entry.property).filter(property => typeof property === 'string');
    return () => { for (const node of nodes.current) for (const property of properties) node?.style.removeProperty(property.startsWith('--') ? property : property.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)); };
  }, [cssVariableInterpolation]);
  useEffect(() => {
    const s = state.current;
    const canRun = () => { const c = config.current; return c.valid && c.total > 0 && !c.paused && !s.focus && !s.reduced && s.visible && !document.hidden && !pointer.current; };
    const stop = () => { cancelAnimationFrame(s.frame); s.frame = 0; s.last = 0; if (root.current) root.current.dataset.moving = 'false'; };
    const tick = now => {
      s.frame = 0;
      if (!canRun()) { stop(); return; }
      const c = config.current, dt = s.last ? Math.min(.05, (now - s.last) / 1000) : 1 / 60; s.last = now;
      stepSpring(s.hoverSpring, s.hover && c.slowdownOnHover ? c.slowDownFactor : 1, dt, c.slowDownSpringConfig);
      if (now - s.scrollTime > 100) s.scrollTarget = 0;
      stepSpring(s.scrollSpring, c.useScrollVelocity ? s.scrollTarget : 0, dt, c.scrollSpringConfig);
      let move = s.sign * c.baseVelocity * s.hoverSpring.p * (1 + (c.useScrollVelocity ? Math.abs(s.scrollSpring.p) / 200 : 0)) * dt;
      if (Math.abs(s.dragVelocity) > .01) {
        if (c.dragVelocityDecay === 0) s.dragVelocity = 0;
        else { const lambda = -60 * Math.log(c.dragVelocityDecay), factor = Math.exp(-lambda * dt); move += s.dragVelocity * (1 - factor) / lambda; s.dragVelocity *= factor; }
      } else s.dragVelocity = 0;
      s.phase = wrap(s.phase + move); paint();
      const active = Math.abs(c.baseVelocity * s.hoverSpring.p) > .00001 || Math.abs(s.dragVelocity) > .01 || Math.abs(s.scrollSpring.p) > .01 || Math.abs(s.hoverSpring.p - (s.hover && c.slowdownOnHover ? c.slowDownFactor : 1)) > .001;
      root.current.dataset.moving = String(active);
      if (active) s.frame = requestAnimationFrame(tick); else s.last = 0;
    };
    wake.current = () => { if (!canRun()) stop(); else if (!s.frame) { s.last = 0; s.frame = requestAnimationFrame(tick); } };
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => { s.reduced = media.matches; if (s.reduced) s.dragVelocity = 0; root.current.dataset.reducedMotion = String(s.reduced); wake.current(); };
    const visibility = () => wake.current();
    const observer = new IntersectionObserver(entries => { s.visible = entries[0].isIntersecting; wake.current(); }); observer.observe(root.current);
    media.addEventListener('change', preference); document.addEventListener('visibilitychange', visibility); preference();
    const move = event => {
      const g = pointer.current; if (!g || event.pointerId !== g.id) return;
      const dx = event.clientX - g.startX, dy = event.clientY - g.startY;
      if (!g.moved && Math.hypot(dx, dy) < 3) return;
      if (!g.moved) { root.current.setPointerCapture(g.id); g.moved = true; }
      suppress.current = true;
      const c = config.current; s.phase = wrap(g.phase + dx * c.dragSensitivity); paint();
      const now = performance.now(); g.samples.push({ x: event.clientX, time: now }); g.samples = g.samples.filter(sample => now - sample.time < 100).slice(-10);
      if (c.dragAwareDirection && dx !== 0) s.sign = Math.sign(event.clientX - g.lastX) || s.sign;
      g.lastX = event.clientX;
    };
    const end = event => {
      const g = pointer.current; if (!g || event.pointerId !== g.id) return;
      pointer.current = null; root.current.dataset.dragging = 'false';
      if (root.current.hasPointerCapture(g.id)) root.current.releasePointerCapture(g.id);
      const first = g.samples[0], last = g.samples.at(-1), c = config.current;
      if (g.moved && event.type === 'pointerup' && !s.reduced && !c.paused && last.time > first.time && performance.now() - last.time < 100) s.dragVelocity = clamp((last.x - first.x) / (last.time - first.time) * 1000 * c.dragSensitivity, -500, 500);
      wake.current();
    };
    const blur = () => { if (pointer.current) end({ pointerId: pointer.current.id, type: 'pointercancel' }); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end); window.addEventListener('lostpointercapture', end); window.addEventListener('blur', blur);
    return () => { stop(); observer.disconnect(); media.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); window.removeEventListener('lostpointercapture', end); window.removeEventListener('blur', blur); pointer.current = null; wake.current = () => {}; };
  }, [paint]);
  useEffect(() => {
    if (!useScrollVelocity) return;
    const target = scrollContainer && 'current' in scrollContainer ? scrollContainer.current || window : scrollContainer || window;
    if (!target.addEventListener) return;
    let previous = target === window ? scrollY : target.scrollTop, last = performance.now();
    const scroll = () => {
      const now = performance.now(), position = target === window ? scrollY : target.scrollTop;
      if (position === previous) return;
      const velocity = clamp((position - previous) / Math.max(16, now - last) * 1000, -4000, 4000);
      const s = state.current; s.scrollTarget = velocity; s.scrollTime = now;
      if (config.current.scrollAwareDirection && velocity && !pointer.current) s.sign = Math.sign(velocity);
      previous = position; last = now; wake.current();
    };
    target.addEventListener('scroll', scroll, { passive: true }); return () => target.removeEventListener('scroll', scroll);
  }, [useScrollVelocity, scrollContainer]);
  useEffect(() => { wake.current(); }, [paused, userPaused, valid, total, baseVelocity, slowdownOnHover, slowDownFactor]);
  const reset = () => { state.current.phase = 0; state.current.dragVelocity = 0; paint(); };
  return <div ref={root} className={`marquee-svg-path ${className}`} style={{ width, height, ...style }} tabIndex={0} role="region" aria-label={label} aria-describedby={help}
    data-draggable={draggable} data-grab={draggable && grabCursor} data-paused={paused || userPaused}
    onPointerEnter={event => { if (event.pointerType !== 'touch') { state.current.hover = true; wake.current(); } }} onPointerLeave={() => { state.current.hover = false; wake.current(); }}
    onPointerDown={event => {
      suppress.current = false;
      if (!draggable || !event.isPrimary || event.button !== 0 || pointer.current || !valid || !total || event.target.closest('button,input,textarea,select,[contenteditable=true],[data-drag-ignore],video[controls],audio[controls]')) return;
      if (!event.target.closest('a')) event.preventDefault();
      const now = performance.now(); pointer.current = { id: event.pointerId, phase: state.current.phase, startX: event.clientX, startY: event.clientY, lastX: event.clientX, moved: false, samples: [{ x: event.clientX, time: now }] };
      state.current.dragVelocity = 0; root.current.dataset.dragging = 'true'; wake.current();
    }} onDragStart={event => event.preventDefault()}
    onClickCapture={event => { const blocked = suppress.current; suppress.current = false; if (blocked && event.detail > 0) { event.preventDefault(); event.stopPropagation(); } }}
    onFocusCapture={event => { state.current.focus = event.target.matches(':focus-visible'); wake.current(); }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) { state.current.focus = false; wake.current(); } }}
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (['ArrowLeft','ArrowRight','Home','Escape',' '].includes(event.key)) {
        event.preventDefault(); state.current.focus = true; state.current.dragVelocity = 0; wake.current();
        const g = pointer.current; if (g) { pointer.current = null; root.current.dataset.dragging = 'false'; if (root.current.hasPointerCapture(g.id)) root.current.releasePointerCapture(g.id); }
        if (event.key === ' ') setUserPaused(value => !value);
        else if (event.key === 'Home' || event.key === 'Escape') reset();
        else { state.current.phase = wrap(state.current.phase + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 10 : 2)); paint(); }
      }
    }}>
    <div ref={plane} className="msp-plane" style={{ width: box[2], height: box[3] }}>
      <div ref={track} className="msp-track" style={{ width: box[2], height: box[3] }}>
        <svg className="msp-guide" width={box[2]} height={box[3]} viewBox={`0 0 ${box[2]} ${box[3]}`} preserveAspectRatio={preserveAspectRatio} aria-hidden="true"><path ref={svgPath} id={pathId || `${generatedId}-path`} d={path || ''} fill="none" stroke={showPath ? 'currentColor' : 'none'} strokeWidth="1.5" strokeDasharray="5 5"/></svg>
        {valid && list.flatMap((child, index) => Array.from({ length: copies }, (_, copy) => <div key={`${child?.key ?? index}-${copy}`} className="msp-item" ref={node => { nodes.current[index * copies + copy] = node; }}
          data-position={(index + copy * list.length) * 100 / total} data-copy={copy} aria-hidden={copy > 0 ? true : undefined}
          style={{ offsetPath, offsetDistance: `${(index + copy * list.length) * 100 / total}%` }}>{child}</div>))}
      </div>
    </div>
    {(!valid || !total) && <p className="msp-empty">{!valid ? 'Provide a valid SVG path.' : 'Add elements to the marquee.'}</p>}
    {showControls && <div className="msp-controls" data-drag-ignore><button type="button" disabled={paused} onClick={() => setUserPaused(value => !value)} aria-label={paused || userPaused ? 'Resume marquee' : 'Pause marquee'}>{paused || userPaused ? 'Resume' : 'Pause'}</button><button type="button" onClick={reset}>Reset</button></div>}
    <span id={help} className="msp-sr-only">Use left and right arrow keys to move along the path; Shift increases the step. Home resets. Space toggles pause. Animation pauses during keyboard focus and with reduced motion.</span>
  </div>;
}
