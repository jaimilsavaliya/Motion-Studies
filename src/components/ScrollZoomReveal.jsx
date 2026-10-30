'use client';

import { useEffect, useRef } from 'react';
import './ScrollZoomReveal.css';

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** A dependency-free, reversible scroll reveal. Children can be an image or video. */
export default function ScrollZoomReveal({
  leading = 'Above', trailing = 'the shoreline', radius = 24,
  scrollDistance = 200, onProgress, children,
}) {
  const section = useRef(null);
  const stage = useRef(null);
  const media = useRef(null);
  const before = useRef(null);
  const after = useRef(null);
  const callback = useRef(onProgress);
  callback.current = onProgress;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, current = 0, target = 0;
    let width = 0, height = 0;
    const paint = () => {
      const p = current;
      const mobile = width < 600;
      const initial = mobile ? 60 : 96;
      const w = initial + (width - initial) * p;
      const h = initial + (height - initial) * p;
      const center = width * (mobile ? 0.39 + 0.11 * p : 0.5);
      media.current.style.width = `${w}px`;
      media.current.style.height = `${h}px`;
      media.current.style.left = `${center}px`;
      media.current.style.borderRadius = `${radius * (1 - clamp((p - 0.72) / 0.28))}px`;
      const gap = mobile ? 12 : 26;
      before.current.style.right = `${width - center + w / 2 + gap}px`;
      after.current.style.left = `${center + w / 2 + gap}px`;
      const opacity = 1 - clamp(p / 0.42);
      before.current.style.opacity = opacity;
      after.current.style.opacity = opacity;
      callback.current?.(p);
    };
    const animate = () => {
      current = reduced.matches ? target : current + (target - current) * 0.13;
      if (Math.abs(target - current) < 0.0001) current = target;
      paint();
      if (current !== target) frame = requestAnimationFrame(animate);
      else frame = 0;
    };
    const update = () => {
      const rect = section.current.getBoundingClientRect();
      width = stage.current.clientWidth;
      height = stage.current.clientHeight;
      const travel = Math.max(1, section.current.offsetHeight - height);
      target = clamp(-rect.top / (travel * 0.88));
      if (!frame) frame = requestAnimationFrame(animate);
    };
    const observer = new ResizeObserver(update);
    observer.observe(stage.current);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [radius, scrollDistance]);

  return <section ref={section} className="zoom-reveal" style={{ height: `${100 + scrollDistance}svh` }} aria-label={`${leading} ${trailing}`}>
    <div ref={stage} className="zoom-reveal__stage">
      <h1 className="zoom-reveal__heading"><span ref={before} className="zoom-reveal__leading">{leading}</span><span ref={after} className="zoom-reveal__trailing">{trailing}</span></h1>
      <div ref={media} className="zoom-reveal__media" style={{ borderRadius: radius }}>{children}</div>
    </div>
  </section>;
}
