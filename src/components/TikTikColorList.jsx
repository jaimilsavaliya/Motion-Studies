'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './TikTikColorList.css';

const modulo = (value, count) => ((value % count) + count) % count;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const sizes = { sm: 240, md: 320, lg: 400 };

/** Independent native-scroll archive. Recycled repetitions keep the DOM bounded. */
export default function TikTikColorList({
  projects = [], height = 720, showPreview = true, previewSize = 'lg', enableSound = false,
  soundSrc, infiniteScroll = true, scrollThreshold = 1000, onActiveChange, onSelect,
  className = '', 'aria-label': ariaLabel = 'Project archive',
}) {
  const root = useRef(null), scroller = useRef(null), preview = useRef(null), rows = useRef([]);
  const count = projects.length, looping = infiniteScroll && count > 1;
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState(0);
  const [failedSource, setFailedSource] = useState(null);
  const [reduced, setReduced] = useState(false);
  const id = useId();
  const step = viewport.width < 768 ? 80 : 112;
  const cycle = count * step;
  const copies = looping ? Math.max(7, Math.ceil(viewport.height / Math.max(1, cycle)) * 2 + 5) : 1;
  const middle = looping ? Math.floor(copies / 2) * cycle : 0;
  const padding = looping ? 0 : viewport.height * .7;
  const currentIndex = count ? modulo(active, count) : -1;
  const current = projects[currentIndex];
  const lastTop = useRef(null), activeAbsolute = useRef(0);
  const currentRef = useRef(-1), pendingFocus = useRef(false), initialized = useRef(null);
  const scrollFrame = useRef(0), inertiaFrame = useRef(0);
  const position = useRef({ x: 0, y: 0 }), drag = useRef(null);
  const audio = useRef(null), soundBuffer = useRef(null), audioSource = useRef(null), lastTick = useRef(0);
  const latest = useRef(null);
  latest.current = { projects, count, looping, copies, step, cycle, middle, padding, height: viewport.height, scrollThreshold, onActiveChange, onSelect, enableSound, reduced };

  const playTick = useCallback(() => {
    const context = audio.current;
    if (!latest.current.enableSound || !context || context.state !== 'running' || performance.now() - lastTick.current < 45) return;
    lastTick.current = performance.now();
    const gain = context.createGain(); gain.connect(context.destination);
    const now = context.currentTime;
    if (soundBuffer.current) {
      const source = context.createBufferSource(); source.buffer = soundBuffer.current;
      gain.gain.value = .3; source.connect(gain); source.start(); source.onended = () => { source.disconnect(); gain.disconnect(); };
    } else {
      const oscillator = context.createOscillator(); oscillator.type = 'triangle'; oscillator.connect(gain);
      oscillator.frequency.setValueAtTime(1350, now); oscillator.frequency.exponentialRampToValueAtTime(350, now + .025);
      gain.gain.setValueAtTime(.045, now); gain.gain.exponentialRampToValueAtTime(.001, now + .03);
      oscillator.start(now); oscillator.stop(now + .035); oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }
  }, []);
  const unlockAudio = useCallback(() => {
    if (!latest.current.enableSound) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      if (!audio.current) audio.current = new Audio();
      audio.current.resume().catch(() => {});
    } catch { /* Playback is optional; input never depends on audio permission. */ }
  }, []);
  useEffect(() => {
    soundBuffer.current = null;
    if (!enableSound || !soundSrc) return undefined;
    const controller = new AbortController(); let alive = true;
    // Fetching a local sound does not play it. Decoding waits for an explicitly unlocked context.
    fetch(soundSrc, { signal: controller.signal }).then(r => { if (!r.ok) throw new Error('Sound unavailable'); return r.arrayBuffer(); })
      .then(bytes => { if (alive) audioSource.current = bytes; }).catch(() => {});
    return () => { alive = false; controller.abort(); audioSource.current = null; };
  }, [enableSound, soundSrc]);
  useEffect(() => {
    const node = root.current;
    const decode = () => {
      unlockAudio();
      if (audio.current && audioSource.current && !soundBuffer.current) {
        const context = audio.current, bytes = audioSource.current; audioSource.current = null;
        context.decodeAudioData(bytes.slice(0)).then(buffer => { if (audio.current === context) soundBuffer.current = buffer; }).catch(() => {});
      }
    };
    node.addEventListener('pointerdown', decode); node.addEventListener('keydown', decode);
    return () => { node.removeEventListener('pointerdown', decode); node.removeEventListener('keydown', decode); };
  }, [unlockAudio]);

  const update = useCallback(() => {
    const node = scroller.current, config = latest.current;
    if (!node || !config.count) return;
    let top = node.scrollTop;
    if (config.looping) {
      const buffer = Math.min(config.cycle, clamp(Number(config.scrollThreshold) || 0, 0, 5000));
      if (top < buffer || top > node.scrollHeight - node.clientHeight - buffer) {
        top = config.middle + modulo(top - config.middle, config.cycle);
        const shift = top - node.scrollTop;
        if (lastTop.current !== null) lastTop.current += shift;
        activeAbsolute.current += Math.round(shift / config.step);
        const focused = document.activeElement?.classList.contains('tik-row');
        if (focused && node.contains(document.activeElement)) pendingFocus.current = true;
        node.scrollTop = top;
      }
    }
    // Separate entry lines reproduce the small directional hysteresis: 70% down, 65% up.
    // Keep the current item until a boundary is crossed; merely reversing direction must not flash another image.
    const downIndex = value => Math.floor((value + config.height * .7 - config.padding - .001) / config.step);
    const upIndex = value => Math.ceil((value + config.height * .65 - config.padding + .001) / config.step);
    let next = activeAbsolute.current;
    if (lastTop.current === null) next = downIndex(top);
    else if (top > lastTop.current && downIndex(top) > downIndex(lastTop.current)) next = downIndex(top);
    else if (top < lastTop.current && upIndex(top) < upIndex(lastTop.current)) next = upIndex(top);
    const absolute = clamp(next, 0, config.copies * config.count - 1);
    lastTop.current = top; activeAbsolute.current = absolute;
    const index = modulo(absolute, config.count);
    setActive(absolute);
    if (index !== currentRef.current) {
      if (currentRef.current !== -1) playTick();
      currentRef.current = index;
      config.onActiveChange?.(index, config.projects[index]);
    }
  }, [playTick]);
  const onScroll = useCallback(() => {
    if (!scrollFrame.current) scrollFrame.current = requestAnimationFrame(() => { scrollFrame.current = 0; update(); });
  }, [update]);
  useLayoutEffect(() => {
    const node = root.current;
    const measure = () => setViewport(previous => previous.width === node.clientWidth && previous.height === node.clientHeight ? previous : { width: node.clientWidth, height: node.clientHeight });
    measure(); const observer = new ResizeObserver(measure); observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const node = scroller.current;
    if (!viewport.height) return;
    const before = initialized.current;
    let logical = 0;
    if (before && before.projects === projects && before.looping === looping) {
      logical = before.looping ? modulo(node.scrollTop - before.middle, before.cycle) / before.step : Math.max(0, node.scrollTop) / before.step;
    }
    node.scrollTop = looping ? middle + logical * step : logical * step;
    initialized.current = { projects, looping, middle, cycle, step };
    lastTop.current = null;
    if (!count) { currentRef.current = -1; setActive(0); } else update();
  }, [projects, count, looping, middle, cycle, step, viewport.height, update]);
  useLayoutEffect(() => {
    if (pendingFocus.current === true || pendingFocus.current === active) { rows.current[active]?.focus({ preventScroll: true }); pendingFocus.current = false; }
  }, [active]);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => { setReduced(query.matches); if (query.matches) cancelAnimationFrame(inertiaFrame.current); };
    apply(); query.addEventListener('change', apply); return () => query.removeEventListener('change', apply);
  }, []);
  useEffect(() => {
    if (currentIndex < 0 || count < 2) return;
    const neighbors = [projects[modulo(currentIndex - 1, count)], projects[modulo(currentIndex + 1, count)]];
    neighbors.forEach(project => { if (project.image) { const image = new Image(); image.src = project.image; } });
  }, [currentIndex, count, projects]);

  const paintPosition = () => { if (preview.current) preview.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`; };
  const resetPreview = () => { cancelAnimationFrame(inertiaFrame.current); drag.current = null; position.current = { x: 0, y: 0 }; paintPosition(); };
  const startDrag = event => {
    if (event.button !== 0) return;
    cancelAnimationFrame(inertiaFrame.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), vx: 0, vy: 0, moved: false };
    event.currentTarget.dataset.dragging = 'true';
  };
  const moveDrag = event => {
    const state = drag.current; if (!state || state.pointer !== event.pointerId) return;
    const now = performance.now(), dt = Math.max(8, now - state.time) / 1000;
    const dx = event.clientX - state.x, dy = event.clientY - state.y;
    position.current.x += dx; position.current.y += dy;
    state.vx = clamp(dx / dt, -2400, 2400); state.vy = clamp(dy / dt, -2400, 2400);
    state.moved ||= Math.abs(dx) + Math.abs(dy) > 2;
    state.x = event.clientX; state.y = event.clientY; state.time = now; paintPosition();
  };
  const endDrag = (event, cancelled = false) => {
    const state = drag.current; if (!state || state.pointer !== event.pointerId) return;
    drag.current = null; event.currentTarget.dataset.dragging = 'false';
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (cancelled || latest.current.reduced || !state.moved || performance.now() - state.time > 100) return;
    const start = performance.now(), origin = { ...position.current }, dx = state.vx * .8, dy = state.vy * .8;
    const tick = now => {
      const decay = Math.exp(-(now - start) / 750);
      position.current = { x: origin.x + dx * (1 - decay), y: origin.y + dy * (1 - decay) }; paintPosition();
      if (Math.max(Math.abs(dx), Math.abs(dy)) * decay > .4) inertiaFrame.current = requestAnimationFrame(tick);
    };
    inertiaFrame.current = requestAnimationFrame(tick);
  };
  useEffect(() => {
    if (!showPreview || viewport.width < 768 || !count) { cancelAnimationFrame(inertiaFrame.current); drag.current = null; }
  }, [showPreview, viewport.width, count]);
  useEffect(() => {
    const node = preview.current;
    if (!node) return undefined;
    const wheel = event => { event.preventDefault(); scroller.current.scrollTop += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.height : 1); };
    node.addEventListener('wheel', wheel, { passive: false });
    return () => node.removeEventListener('wheel', wheel);
  }, [showPreview, viewport.height, count]);
  useEffect(() => () => {
    cancelAnimationFrame(scrollFrame.current); cancelAnimationFrame(inertiaFrame.current);
    const context = audio.current; audio.current = null; context?.close().catch(() => {});
  }, []);

  const go = (absolute, focus = false) => {
    if (!count) return;
    let destination = absolute;
    if (looping && (destination < count || destination >= (copies - 1) * count)) destination = Math.floor(copies / 2) * count + modulo(destination, count);
    destination = clamp(destination, 0, copies * count - 1);
    if (focus) pendingFocus.current = destination === active ? false : destination;
    scroller.current.scrollTo({ top: destination * step + padding - viewport.height * .7 + 1, behavior: reduced ? 'instant' : 'smooth' });
    if (focus) rows.current[destination]?.focus({ preventScroll: true });
  };
  const keyDown = event => {
    if (event.key === 'Escape') { event.preventDefault(); resetPreview(); return; }
    if (event.target.closest('.tik-preview')) return;
    let destination;
    if (event.key === 'ArrowDown') destination = active + 1;
    if (event.key === 'ArrowUp') destination = active - 1;
    if (event.key === 'PageDown') destination = active + Math.max(1, Math.floor(viewport.height / step));
    if (event.key === 'PageUp') destination = active - Math.max(1, Math.floor(viewport.height / step));
    if (event.key === 'Home') destination = Math.floor(active / Math.max(1, count)) * count;
    if (event.key === 'End') destination = Math.floor(active / Math.max(1, count)) * count + count - 1;
    if (destination !== undefined) { event.preventDefault(); go(destination, true); }
  };
  const activeCycle = Math.floor(active / Math.max(1, count));
  return <section ref={root} className={`tik-tik-color-list ${className}`} role="region" aria-label={ariaLabel}
    aria-describedby={`${id}-help`} onKeyDown={keyDown} data-active-index={currentIndex}
    data-looping={looping} style={{ height: typeof height === 'string' ? height : clamp(Number(height) || 720, 320, 1200), backgroundColor: current?.bgColor || '#fff' }}>
    <div ref={scroller} className="tik-scroller" onScroll={onScroll} tabIndex={0} aria-label="Scroll projects">
      {!count ? <p className="tik-empty">No projects yet.</p> : <ul className="tik-list" style={{ paddingTop: padding, paddingBottom: looping ? 0 : viewport.height * .3 }}>
        {Array.from({ length: copies * count }, (_, absolute) => {
          const index = absolute % count, project = projects[index], selected = active === absolute;
          const accessible = Math.floor(absolute / count) === activeCycle;
          return <li key={`${absolute}-${project.id ?? index}`} aria-hidden={!accessible}>
            <button ref={node => { rows.current[absolute] = node; }} className="tik-row" type="button" tabIndex={selected ? 0 : -1}
              aria-current={selected ? 'true' : undefined} aria-label={`${project.name}, ${project.badge || 'Project'}`}
              data-index={index} data-absolute={absolute} onClick={() => { go(absolute); onSelect?.(index, project); }}>
              <span className="tik-name">{project.name}</span>
              {project.badge && <span className="tik-badge">{project.badge}</span>}
              <span className="tik-date">[{project.date || '01 sep'}]</span>
            </button>
          </li>;
        })}
      </ul>}
    </div>
    {showPreview && current && <button ref={preview} className="tik-preview" type="button"
      style={{ width: sizes[previewSize] || 400, height: sizes[previewSize] || 400 }}
      aria-label={`${current.name} image preview. Drag to reposition; Escape to reset.`}
      onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
      onPointerCancel={event => endDrag(event, true)} onLostPointerCapture={event => { if (drag.current) endDrag(event, true); }}
      onDoubleClick={resetPreview} onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); resetPreview(); }
        const direction = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[event.key];
        if (direction) { event.preventDefault(); cancelAnimationFrame(inertiaFrame.current); position.current.x += direction[0]; position.current.y += direction[1]; paintPosition(); }
      }}>
      {current.image && failedSource !== current.image ? <img src={current.image} alt={current.alt || current.name} draggable="false" style={{ objectPosition: current.objectPosition || 'center' }} onError={() => setFailedSource(current.image)} />
        : <span className="tik-image-fallback">{current.name}<small>Image unavailable</small></span>}
    </button>}
    <p id={`${id}-help`} className="tik-sr-only">Scroll to browse. Arrow keys move between projects. Drag the image to reposition it; Escape or double-click resets its position. Image preview is hidden below 768 pixels.</p>
  </section>;
}
