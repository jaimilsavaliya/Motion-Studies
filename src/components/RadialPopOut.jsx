'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './RadialPopOut.css';

const EMPTY = [];
const ROTATIONS = [5.41546, -6.50229, -2.6283, -7.08251, 6.18036, -6.26721, -0.188229];
const clamp = (value, min, max, fallback) => Number.isFinite(Number(value))
  ? Math.max(min, Math.min(max, Number(value))) : fallback;

function Photo({ image, fallback }) {
  const [failed, setFailed] = useState(false);
  return <div className="radial-pop-out__photo">
    {!image?.src || failed ? <span className="radial-pop-out__fallback" role="img" aria-label={image?.alt || fallback}>{image?.alt || fallback}</span>
      : <img src={image.src} alt={image.alt || fallback} draggable="false" decoding="async"
          style={{ objectPosition: image.objectPosition || 'center' }} onError={() => setFailed(true)} />}
  </div>;
}

/** A foreground hero card with a spring-driven, clockwise ring of related images. */
export default function RadialPopOut({
  hero,
  items = EMPTY,
  heroSize = 280,
  cardSize = 200,
  orbitRadius = 210,
  stagger = 25,
  tilt = 10,
  magnetic = 0.36,
  radius = 16,
  defaultOpen = false,
  onOpenChange,
  className = '',
}) {
  const entries = Array.isArray(items) ? items : EMPTY;
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [toggled, setToggled] = useState(defaultOpen);
  const [reduced, setReduced] = useState(false);
  const open = entries.length > 0 && (hovered || focused || toggled);
  const root = useRef(null), anchor = useRef(null), button = useRef(null);
  const cards = useRef([]), tiltTarget = useRef({ x: 0, y: 0 });
  const animateTilt = useRef(null), callback = useRef(onOpenChange);
  const previousOpen = useRef(open);
  callback.current = onOpenChange;
  const id = useId();
  const size = clamp(cardSize, 60, 280, 200);
  const heroWidth = clamp(heroSize, 80, 400, 280);
  const orbit = clamp(orbitRadius, 60, 380, 210);
  const delay = clamp(stagger, 0, 100, 25);
  const angle = clamp(tilt, 0, 20, 10);
  const magnet = clamp(magnetic, 0, 0.5, 0.36);
  const scene = Math.max((orbit + size) * 2, heroWidth + 40);
  const available = width || scene;
  const factor = Math.min(1, available / scene);
  const fittedCard = Math.max(1, Math.floor(size * factor));
  const fittedOrbit = orbit * fittedCard / size;
  const fittedHero = Math.min(available, Math.max(Math.min(150, heroWidth), Math.round(heroWidth * factor)));
  const fittedScene = Math.min(available, scene * fittedCard / size);
  const rotationKey = entries.map((item, index) => clamp(item.rotation, -30, 30, ROTATIONS[index % ROTATIONS.length])).join(',');

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(root.current);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => { observer.disconnect(); preference.removeEventListener('change', update); };
  }, []);

  useEffect(() => {
    if (open !== previousOpen.current) callback.current?.(open);
    previousOpen.current = open;
  }, [open]);

  useEffect(() => {
    const rotations = rotationKey.split(',').map(Number);
    const animations = [];
    cards.current.forEach((element, index) => {
      if (!element || index >= entries.length) return;
      const computed = getComputedStyle(element);
      const matrix = new DOMMatrixReadOnly(computed.transform);
      const start = { x: matrix.m41, y: matrix.m42, scale: Math.hypot(matrix.m11, matrix.m12), rotate: Math.atan2(matrix.m12, matrix.m11) * 180 / Math.PI, opacity: Number(computed.opacity) };
      element.getAnimations().forEach(animation => animation.cancel());
      const radians = -Math.PI / 2 + index * Math.PI * 2 / entries.length;
      const end = open
        ? { x: Math.cos(radians) * fittedOrbit, y: Math.sin(radians) * fittedOrbit, scale: 1, rotate: rotations[index], opacity: 1 }
        : { x: 0, y: 0, scale: 0.85, rotate: 0, opacity: 0 };
      const transform = value => `translate3d(${value.x}px, ${value.y}px, 0) scale(${value.scale}) rotate(${value.rotate}deg)`;
      const settle = () => { element.style.transform = open ? transform(end) : 'scale(0.6)'; element.style.opacity = String(end.opacity); };
      if (reduced || (!open && start.opacity === 0)) { settle(); return; }
      let frames;
      if (open) {
        // Spring: stiffness 300, damping 25, mass 1. Start at 12 o'clock.
        frames = Array.from({ length: 61 }, (_, step) => {
          const t = step / 60 * 0.7;
          const omega = Math.sqrt(300 - 12.5 * 12.5);
          const progress = step === 60 ? 1 : 1 - Math.exp(-12.5 * t) * (Math.cos(omega * t) + 12.5 / omega * Math.sin(omega * t));
          const value = Object.fromEntries(Object.keys(end).map(key => [key, start[key] + (end[key] - start[key]) * progress]));
          return { transform: transform(value), opacity: Math.min(1, Math.max(0, value.opacity)) };
        });
      } else frames = [{ transform: transform(start), opacity: start.opacity }, { transform: transform(end), opacity: 0 }];
      const animation = element.animate(frames, {
        duration: open ? 700 : 220,
        delay: open ? index * delay : 0,
        easing: open ? 'linear' : 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both',
      });
      animation.onfinish = () => { settle(); animation.cancel(); };
      animations.push(animation);
    });
    return () => {
      // Preserve the current pose when a hover is reversed mid-flight.
      animations.forEach(animation => {
        const element = animation.effect?.target;
        if (element) {
          const computed = getComputedStyle(element);
          element.style.transform = computed.transform;
          element.style.opacity = computed.opacity;
        }
        animation.cancel();
      });
    };
  }, [open, reduced, fittedOrbit, rotationKey, entries.length, delay]);

  useEffect(() => {
    let frame = 0, disposed = false, last = 0;
    let x = 0, y = 0;
    const draw = now => {
      frame = 0;
      if (disposed || !button.current) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const ease = 1 - Math.exp(-dt * 8);
      const target = reduced ? { x: 0, y: 0 } : tiltTarget.current;
      x += (target.x - x) * ease;
      y += (target.y - y) * ease;
      button.current.style.transform = reduced ? 'none' : `translate3d(${x * fittedHero / 2 * magnet}px, ${y * fittedHero / 2 * magnet}px, 0) rotateX(${-y * angle}deg) rotateY(${x * angle}deg)`;
      if (Math.abs(target.x - x) + Math.abs(target.y - y) > 0.0001) frame = requestAnimationFrame(draw);
    };
    animateTilt.current = () => { if (!disposed && !frame) { last = 0; frame = requestAnimationFrame(draw); } };
    animateTilt.current();
    return () => { disposed = true; cancelAnimationFrame(frame); animateTilt.current = null; };
  }, [fittedHero, angle, magnet, reduced]);

  const resetTilt = () => { tiltTarget.current = { x: 0, y: 0 }; animateTilt.current?.(); };
  const close = () => { setHovered(false); setFocused(false); setToggled(false); resetTilt(); };
  useEffect(() => {
    if (!open) return;
    const outside = event => { if (root.current && !root.current.contains(event.target)) { setHovered(false); setFocused(false); setToggled(false); tiltTarget.current = { x: 0, y: 0 }; animateTilt.current?.(); } };
    document.addEventListener('pointerdown', outside, { passive: true });
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const move = event => {
    if (event.pointerType === 'touch' || reduced || !anchor.current) return;
    const rect = anchor.current.getBoundingClientRect();
    tiltTarget.current = {
      x: clamp((event.clientX - rect.left - rect.width / 2) / (rect.width / 2), -1, 1, 0),
      y: clamp((event.clientY - rect.top - rect.height / 2) / (rect.height / 2), -1, 1, 0),
    };
    animateTilt.current?.();
  };

  return <div ref={root} className={`radial-pop-out ${className}`} data-open={open} style={{ '--rpo-radius': `${clamp(radius, 0, 48, 16)}px`, '--rpo-card-radius': `${clamp(radius, 0, 48, 16) * fittedCard / size}px` }}>
    <div className="radial-pop-out__scene" style={{ width: fittedScene, height: fittedScene }}>
      <div id={`${id}-collection`} role="list" aria-label="Related images" aria-hidden={!open}>
        {entries.map((item, index) => <div ref={node => { cards.current[index] = node; }} key={`${index}-${item.src}`}
          className="radial-pop-out__card" role="listitem" style={{ width: fittedCard, height: fittedCard, marginLeft: -fittedCard / 2, marginTop: -fittedCard / 2 }}>
          <Photo key={item.src} image={item} fallback={`Related image ${index + 1}`} />
        </div>)}
      </div>
      <div ref={anchor} className="radial-pop-out__anchor" style={{ width: fittedHero, height: fittedHero }}
        onPointerEnter={event => { if (event.pointerType !== 'touch') { setHovered(true); move(event); } }}
        onPointerMove={move} onPointerLeave={() => { setHovered(false); resetTilt(); }}>
        <button ref={button} type="button" className="radial-pop-out__hero" disabled={!entries.length}
          aria-label={`Explore ${hero?.alt || 'collection'}`} aria-expanded={open} aria-controls={`${id}-collection`}
          onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setFocused(true); }}
          onBlur={() => { setFocused(false); setToggled(false); resetTilt(); }}
          onClick={() => { setHovered(false); setFocused(false); setToggled(!open); }}
          onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close(); } }}>
          <Photo key={hero?.src} image={hero} fallback="Featured image" />
        </button>
      </div>
    </div>
  </div>;
}
