'use client';

import { Children, useCallback, useEffect, useId, useLayoutEffect, useRef } from 'react';
import './DragElements.css';

const DEFAULT_TRANSITION = { bounceStiffness: 200, bounceDamping: 300 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const elastic = (value, side) => value === true ? .35 : value === false ? 0 : typeof value === 'object' && value ? clamp(number(value[side], 0), 0, 1) : clamp(number(value, .5), 0, 1);
const resistance = (value, min, max, lower, upper) => value < min ? min + (value - min) * lower : value > max ? max + (value - max) * upper : value;

// Analytic spring integration stays stable even with the reference's unusually high damping.
function springStep(axis, dt, stiffness, damping) {
  const z = axis.p - axis.target, v = axis.v, discriminant = damping * damping - 4 * stiffness;
  let next, velocity;
  if (Math.abs(discriminant) < .001) {
    const r = -damping / 2, b = v - r * z, exp = Math.exp(r * dt);
    next = (z + b * dt) * exp; velocity = (b + r * (z + b * dt)) * exp;
  } else if (discriminant > 0) {
    const root = Math.sqrt(discriminant), r1 = (-damping + root) / 2, r2 = (-damping - root) / 2;
    const a = (v - r2 * z) / (r1 - r2), b = z - a, e1 = Math.exp(r1 * dt), e2 = Math.exp(r2 * dt);
    next = a * e1 + b * e2; velocity = r1 * a * e1 + r2 * b * e2;
  } else {
    const r = -damping / 2, w = Math.sqrt(-discriminant) / 2, b = (v - r * z) / w;
    const cos = Math.cos(w * dt), sin = Math.sin(w * dt), exp = Math.exp(r * dt);
    next = exp * (z * cos + b * sin); velocity = r * next + exp * w * (-z * sin + b * cos);
  }
  axis.p = axis.target + next; axis.v = velocity;
}

/** Every direct child is an independent drag item; its own styling and rotation stay intact. */
export default function DragElements({
  children, dragElastic = .5, dragConstraints, dragMomentum = true, dragTransition = DEFAULT_TRANSITION,
  dragPropagation = true, selectedOnTop = true, height = 500, className = '', style,
  onDragEnd, 'aria-label': ariaLabel = 'Draggable elements',
}) {
  const root = useRef(null), items = useRef(new Map()), gesture = useRef(null), frame = useRef(0), lastTime = useRef(0), top = useRef(0);
  const settings = useRef(null), reduced = useRef(false), suppressClick = useRef(false), observed = useRef(null);
  const callbacks = useRef(new Map());
  const help = useId(), list = Children.toArray(children);
  settings.current = { dragElastic, dragConstraints, dragMomentum, dragTransition: dragTransition || DEFAULT_TRANSITION, dragPropagation, selectedOnTop, onDragEnd };
  const paint = useCallback(item => {
    item.node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    item.node.dataset.x = String(item.x); item.node.dataset.y = String(item.y);
  }, []);
  const boundsFor = useCallback(item => {
    const node = item.node, rect = node.getBoundingClientRect();
    const sx = rect.width / (node.offsetWidth || rect.width || 1) || 1;
    const sy = rect.height / (node.offsetHeight || rect.height || 1) || 1;
    const constraints = settings.current.dragConstraints;
    let minX, maxX, minY, maxY;
    if (constraints && !('current' in constraints)) {
      minX = constraints.left == null ? -Infinity : number(constraints.left, -Infinity);
      maxX = constraints.right == null ? Infinity : number(constraints.right, Infinity);
      minY = constraints.top == null ? -Infinity : number(constraints.top, -Infinity);
      maxY = constraints.bottom == null ? Infinity : number(constraints.bottom, Infinity);
    } else {
      const container = constraints?.current || root.current, area = container.getBoundingClientRect();
      const cx = area.width / (container.offsetWidth || area.width || 1), cy = area.height / (container.offsetHeight || area.height || 1);
      const left = area.left + container.clientLeft * cx, right = left + container.clientWidth * cx;
      const upper = area.top + container.clientTop * cy, lower = upper + container.clientHeight * cy;
      const baseX = rect.left - item.x * sx, baseY = rect.top - item.y * sy;
      minX = (left - baseX) / sx; maxX = (right - baseX - rect.width) / sx;
      minY = (upper - baseY) / sy; maxY = (lower - baseY - rect.height) / sy;
    }
    // An oversized item can pan between its two aligned edges rather than becoming unreachable.
    return { minX: Math.min(minX, maxX), maxX: Math.max(minX, maxX), minY: Math.min(minY, maxY), maxY: Math.max(minY, maxY), sx, sy };
  }, []);
  const tick = useCallback(now => {
    const dt = lastTime.current ? Math.min(.05, (now - lastTime.current) / 1000) : 1 / 60;
    lastTime.current = now; let running = false;
    const config = settings.current.dragTransition;
    const stiffness = clamp(number(config.bounceStiffness, 200), 1, 2000), damping = clamp(number(config.bounceDamping, 300), 1, 1000);
    const rest = clamp(number(config.restDelta, 10), .01, 30), speed = clamp(number(config.restSpeed, 10), .01, 100);
    for (const item of items.current.values()) {
      if (!item.motion) continue;
      for (const axis of item.motion) {
        if (axis.done) continue;
        if (axis.kind === 'inertia') {
          const decay = Math.exp(-dt / axis.tau);
          const previous = axis.p; axis.p = axis.target + (axis.p - axis.target) * decay;
          axis.v = (axis.p - previous) / dt;
          if (axis.p < axis.min || axis.p > axis.max) {
            axis.kind = 'spring'; axis.target = clamp(axis.p, axis.min, axis.max);
            if (!(axis.p < axis.min ? axis.lowerElastic : axis.upperElastic)) { axis.p = axis.target; axis.v = 0; axis.done = true; }
          }
        } else springStep(axis, dt, stiffness, damping);
        if (Math.abs(axis.p - axis.target) <= rest && Math.abs(axis.v) <= speed) { axis.p = axis.target; axis.v = 0; axis.done = true; }
      }
      item.x = item.motion[0].p; item.y = item.motion[1].p; paint(item);
      if (item.motion.every(axis => axis.done)) { item.motion = null; item.node.dataset.moving = 'false'; }
      else running = true;
    }
    if (running) frame.current = requestAnimationFrame(tick);
    else { frame.current = 0; lastTime.current = 0; }
  }, [paint]);
  const release = useCallback((item, vx, vy) => {
    const limits = boundsFor(item), config = settings.current.dragTransition;
    const tau = clamp(number(config.timeConstant, 750), 50, 3000) / 1000, power = clamp(number(config.power, .8), 0, 3);
    if (reduced.current) { item.x = clamp(item.x, limits.minX, limits.maxX); item.y = clamp(item.y, limits.minY, limits.maxY); paint(item); return; }
    item.motion = [[item.x, vx, limits.minX, limits.maxX], [item.y, vy, limits.minY, limits.maxY]].map(([p, v, min, max], index) => {
      const outside = p < min || p > max;
      return { p, v, min, max, tau, lowerElastic: elastic(settings.current.dragElastic, index ? 'top' : 'left'), upperElastic: elastic(settings.current.dragElastic, index ? 'bottom' : 'right'), kind: outside ? 'spring' : 'inertia', target: outside ? clamp(p, min, max) : p + v * power, done: !outside && Math.abs(v) < .01 };
    });
    item.node.dataset.moving = String(item.motion.some(axis => !axis.done));
    if (!frame.current && item.motion.some(axis => !axis.done)) frame.current = requestAnimationFrame(tick);
  }, [boundsFor, paint, tick]);
  const bringForward = useCallback(item => {
    if (settings.current.selectedOnTop) item.node.style.zIndex = String(++top.current);
  }, []);
  const start = (event, key) => {
    if (!settings.current.dragPropagation) event.stopPropagation();
    if (event.button !== 0 || !event.isPrimary || gesture.current) return;
    suppressClick.current = false;
    if (event.target.closest('input,textarea,select,[contenteditable=true],[data-drag-ignore],video[controls],audio[controls]')) return;
    const item = items.current.get(key); if (!item) return;
    item.motion = null; item.node.dataset.moving = 'false'; bringForward(item);
    item.node.dataset.pointerSelected = 'true';
    item.node.focus({ preventScroll: true }); suppressClick.current = false;
    const now = performance.now();
    gesture.current = { key, pointer: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, x: item.x, y: item.y, moved: false, samples: [{ x: item.x, y: item.y, time: now }], limits: boundsFor(item) };
    item.node.dataset.dragging = 'true';
  };
  useEffect(() => {
    const move = event => {
      const g = gesture.current; if (!g || g.pointer !== event.pointerId) return;
      const item = items.current.get(g.key); if (!item) return;
      const dx = (event.clientX - g.startX) / g.limits.sx, dy = (event.clientY - g.startY) / g.limits.sy;
      g.lastX = event.clientX; g.lastY = event.clientY;
      if (!g.moved && Math.hypot(dx, dy) < 3) return;
      if (!g.moved) item.node.setPointerCapture(event.pointerId);
      g.moved = true; suppressClick.current = true;
      const e = reduced.current ? 0 : settings.current.dragElastic;
      item.x = resistance(g.x + dx, g.limits.minX, g.limits.maxX, elastic(e, 'left'), elastic(e, 'right'));
      item.y = resistance(g.y + dy, g.limits.minY, g.limits.maxY, elastic(e, 'top'), elastic(e, 'bottom'));
      paint(item);
      const now = performance.now(); g.samples.push({ x: item.x, y: item.y, time: now });
      g.samples = g.samples.filter(sample => now - sample.time < 100).slice(-10);
    };
    const end = event => {
      const g = gesture.current; if (!g || g.pointer !== event.pointerId) return;
      const item = items.current.get(g.key); gesture.current = null;
      if (!item) return;
      item.node.dataset.dragging = 'false';
      if (item.node.hasPointerCapture(event.pointerId)) item.node.releasePointerCapture(event.pointerId);
      let vx = 0, vy = 0;
      const first = g.samples[0], last = g.samples.at(-1);
      if (g.moved && event.type === 'pointerup' && settings.current.dragMomentum && performance.now() - last.time < 100 && last.time > first.time) {
        const seconds = (last.time - first.time) / 1000;
        vx = clamp((last.x - first.x) / seconds, -4000, 4000); vy = clamp((last.y - first.y) / seconds, -4000, 4000);
      }
      release(item, vx, vy);
      if (g.moved) settings.current.onDragEnd?.(item.index, { x: item.x, y: item.y });
    };
    const cancel = () => { if (gesture.current) end({ pointerId: gesture.current.pointer, type: 'pointercancel' }); };
    window.addEventListener('blur', cancel); window.addEventListener('lostpointercapture', end);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => {
      reduced.current = media.matches;
      if (media.matches) for (const item of items.current.values()) { item.motion = null; item.node.dataset.moving = 'false'; const b = boundsFor(item); item.x = clamp(item.x, b.minX, b.maxX); item.y = clamp(item.y, b.minY, b.maxY); paint(item); }
    };
    preference(); media.addEventListener('change', preference);
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    return () => { window.removeEventListener('blur', cancel); window.removeEventListener('lostpointercapture', end); media.removeEventListener('change', preference); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); cancelAnimationFrame(frame.current); frame.current = 0; lastTime.current = 0; };
  }, [boundsFor, paint, release]);
  useLayoutEffect(() => {
    const resize = () => {
      for (const item of items.current.values()) {
        const b = boundsFor(item); item.x = clamp(item.x, b.minX, b.maxX); item.y = clamp(item.y, b.minY, b.maxY);
        item.motion = null; item.node.dataset.moving = 'false'; paint(item);
        const g = gesture.current;
        if (g?.key === item.key) { g.x = item.x; g.y = item.y; g.startX = g.lastX; g.startY = g.lastY; g.limits = b; }
      }
    };
    const observer = new ResizeObserver(resize); observed.current = observer; observer.observe(root.current);
    for (const item of items.current.values()) observer.observe(item.node);
    if (dragConstraints?.current) observer.observe(dragConstraints.current);
    resize();
    return () => { observer.disconnect(); observed.current = null; };
  }, [dragConstraints, boundsFor, paint]);
  // A parent DOM ref is attached after its child's layout effects on first mount.
  useEffect(() => {
    if (dragConstraints?.current) observed.current?.observe(dragConstraints.current);
  }, [dragConstraints]);
  useLayoutEffect(() => {
    const liveKeys = new Set(list.map((child, index) => child?.key ?? index));
    for (const key of callbacks.current.keys()) if (!liveKeys.has(key)) callbacks.current.delete(key);
    list.forEach((child, index) => { const item = items.current.get(child?.key ?? index); if (item) item.index = index; });
    top.current = Math.max(top.current, list.length);
    if (!selectedOnTop) for (const item of items.current.values()) item.node.style.zIndex = String(item.index);
  });
  return <div ref={root} className={`drag-elements ${className}`} role="region" aria-label={ariaLabel} style={{ height, ...style }}>
    {list.map((child, index) => {
      const key = child?.key ?? index;
      if (!callbacks.current.has(key)) callbacks.current.set(key, node => {
        if (node) { items.current.set(key, { key, node, index, x: 0, y: 0, motion: null }); observed.current?.observe(node); }
        else { const item = items.current.get(key); if (item) observed.current?.unobserve(item.node); items.current.delete(key); }
      });
      const name = child?.props?.['aria-label'] || child?.props?.alt || `Item ${index + 1}`;
      return <div key={key} className="de-item" role="group" aria-roledescription="draggable item" aria-label={name} aria-describedby={help} tabIndex={0}
        style={{ zIndex: index }} ref={callbacks.current.get(key)} onPointerDown={event => start(event, key)} onDragStart={event => event.preventDefault()}
        onClickCapture={event => { const suppress = suppressClick.current; suppressClick.current = false; if (suppress && event.detail > 0) { event.preventDefault(); event.stopPropagation(); } }}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return;
          delete event.currentTarget.dataset.pointerSelected;
          const item = items.current.get(key), b = boundsFor(item), amount = event.shiftKey ? 80 : 20;
          const delta = { ArrowLeft: [-amount, 0], ArrowRight: [amount, 0], ArrowUp: [0, -amount], ArrowDown: [0, amount] }[event.key];
          if (delta || event.key === 'Escape' || event.key === 'Home') {
            event.preventDefault();
            const g = gesture.current;
            if (g?.key === key) { gesture.current = null; item.node.dataset.dragging = 'false'; if (item.node.hasPointerCapture(g.pointer)) item.node.releasePointerCapture(g.pointer); }
            item.motion = null; item.node.dataset.moving = 'false'; bringForward(item);
            item.x = clamp(delta ? item.x + delta[0] : 0, b.minX, b.maxX); item.y = clamp(delta ? item.y + delta[1] : 0, b.minY, b.maxY); paint(item);
          }
        }} onBlur={event => { if (event.target === event.currentTarget) delete event.currentTarget.dataset.pointerSelected; }} onFocus={event => { if (event.currentTarget === event.target && event.currentTarget.matches(':focus-visible')) bringForward(items.current.get(key)); }}>
        {child}
      </div>;
    })}
    <span id={help} className="de-sr-only">Drag to move. When the item is focused, arrow keys move it, Shift increases the step, and Home or Escape restores its starting position. Tab moves to the next item.</span>
  </div>;
}
