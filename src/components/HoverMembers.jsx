'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './HoverMembers.css';

const EMPTY = [];
const EASE = 'cubic-bezier(.19,1,.22,1)';
const characters = text => typeof Intl.Segmenter === 'function'
  ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(part => part.segment)
  : Array.from(text);

function Word({ text, active, initial, isDefault, color, reduced, onExit }) {
  const element = useRef(null), first = useRef(true);
  const startPosition = useRef(initial ? 0 : isDefault ? -100 : 100);
  const letters = characters(String(text));
  useLayoutEffect(() => {
    const node = element.current, box = node.parentElement; let alive = true;
    const fit = () => {
      if (!alive || !node.offsetWidth) return;
      box.style.setProperty('--hm-fit', '1');
      const natural = node.offsetWidth;
      const scale = Math.min(1, box.clientWidth * .94 / natural);
      box.style.setProperty('--hm-fit', String(scale));
    };
    fit(); const observer = new ResizeObserver(fit); observer.observe(box);
    document.fonts?.ready.then(fit);
    return () => { alive = false; observer.disconnect(); };
  }, [text]);
  useLayoutEffect(() => {
    const nodes = [...element.current.children];
    const target = active ? 0 : isDefault ? -100 : 100;
    const instant = reduced || (first.current && initial);
    first.current = false;
    let alive = true;
    const animations = nodes.map((node, index) => {
      if (instant) { node.style.transform = `translateY(${target}%)`; return null; }
      const from = getComputedStyle(node).transform;
      const animation = node.animate([{ transform: from === 'none' ? 'translateY(0%)' : from }, { transform: `translateY(${target}%)` }], {
        duration: 800, delay: Math.abs(index - Math.floor(nodes.length / 2)) * 55, easing: EASE, fill: 'both',
      });
      return animation;
    });
    Promise.all(animations.map(animation => animation?.finished || Promise.resolve())).then(() => {
      if (!alive) return;
      nodes.forEach(node => { node.style.transform = `translateY(${target}%)`; });
      animations.forEach(animation => animation?.cancel());
      if (!active) onExit();
    }).catch(() => {});
    return () => {
      alive = false;
      // Preserve the current pose before canceling, so rapid reversals remain continuous.
      const poses = nodes.map(node => getComputedStyle(node).transform);
      nodes.forEach((node, index) => { node.style.transform = poses[index]; });
      animations.forEach(animation => animation?.cancel());
    };
  }, [active, text, reduced, initial, isDefault, onExit]);
  return <div className="hm-word" aria-hidden="true" style={{ color }} data-active={active} data-default={isDefault}>
    <div ref={element} className="hm-letters">{letters.map((letter, index) => <span key={index} style={{ transform: `translateY(${startPosition.current}%)` }}>{letter === ' ' ? '\u00a0' : letter}</span>)}</div>
  </div>;
}

function Portrait({ member, selected, ...events }) {
  const [failed, setFailed] = useState(null);
  return <button className="hm-profile" type="button" aria-label={member.name} aria-pressed={selected} {...events}>
    {member.image && failed !== member.image ? <img src={member.image} alt="" draggable="false" onError={() => setFailed(member.image)} style={{ objectPosition: member.objectPosition || 'center' }} />
      : <span className="hm-avatar-fallback" aria-hidden="true">{characters(String(member.name || '?')).slice(0,2).join('')}</span>}
  </button>;
}

/** Center-out type waves, flex-sized portraits, and a top-left-anchored pointer follower. */
export default function HoverMembers({
  teamMembers = EMPTY, defaultName = 'OUR TEAM', height = 720,
  backgroundColor = '#121212', textColor = '#ffffff', hoverTextColor = '#fb2c36', cursorColor = '#fb2c36',
  showCursor = true, onActiveChange, onMemberSelect, className = '', 'aria-label': ariaLabel = 'Team members',
}) {
  const root = useRef(null), strip = useRef(null), cursor = useRef(null);
  const initialDefault = useRef(true), lastPointer = useRef('mouse');
  useLayoutEffect(() => { initialDefault.current = false; }, []);
  const [active, setActive] = useState(null), [layers, setLayers] = useState(['default']);
  const [reduced, setReduced] = useState(false), [cursorVisible, setCursorVisible] = useState(false);
  const latest = useRef(null), keyRef = useRef('default'), keyboardMember = useRef(null), pointerInside = useRef(false);
  const frame = useRef(0), previousTime = useRef(0), point = useRef({ x: 0, y: 0 }), target = useRef({ x: 0, y: 0 });
  const help = useId();
  latest.current = { onActiveChange, onMemberSelect, teamMembers, reduced, showCursor };
  const choose = useCallback(index => {
    const key = index === null ? 'default' : index;
    if (key === keyRef.current) return;
    keyRef.current = key;
    setActive(index);
    // At most three visual layers, even when crossing the strip very quickly.
    setLayers(previous => previous.includes(key) ? previous : [...previous.slice(-2), key]);
    latest.current.onActiveChange?.(index, index === null ? null : latest.current.teamMembers[index]);
  }, []);
  const callbacks = useRef(new Map());
  const exitFor = key => {
    if (!callbacks.current.has(key)) callbacks.current.set(key, () => {
      if (keyRef.current !== key) setLayers(previous => previous.filter(value => value !== key));
    });
    return callbacks.current.get(key);
  };
  const paint = useCallback(() => {
    if (cursor.current) { cursor.current.style.setProperty('--hm-x', `${point.current.x}px`); cursor.current.style.setProperty('--hm-y', `${point.current.y}px`); }
  }, []);
  const follow = useCallback(now => {
    const dt = previousTime.current ? Math.min(64, now - previousTime.current) : 16.67;
    previousTime.current = now;
    const amount = 1 - Math.exp(-dt / 218);
    point.current.x += (target.current.x - point.current.x) * amount;
    point.current.y += (target.current.y - point.current.y) * amount;
    paint();
    if (Math.abs(target.current.x - point.current.x) + Math.abs(target.current.y - point.current.y) > .05) frame.current = requestAnimationFrame(follow);
    else { point.current = { ...target.current }; paint(); frame.current = 0; previousTime.current = 0; }
  }, [paint]);
  const move = event => {
    if (event.pointerType === 'touch' || !latest.current.showCursor || latest.current.reduced) return;
    const bounds = strip.current.getBoundingClientRect();
    target.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    setCursorVisible(true);
    if (!frame.current) frame.current = requestAnimationFrame(follow);
  };
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(query.matches);
      if (query.matches) { cancelAnimationFrame(frame.current); frame.current = 0; previousTime.current = 0; setCursorVisible(false); }
    };
    update(); query.addEventListener('change', update);
    return () => { query.removeEventListener('change', update); cancelAnimationFrame(frame.current); };
  }, []);
  useLayoutEffect(() => {
    if (active !== null && !teamMembers[active]) { keyboardMember.current = null; choose(null); }
    // Bound callback storage when collections are replaced with smaller ones.
    for (const key of callbacks.current.keys()) if (key !== 'default' && key >= teamMembers.length) callbacks.current.delete(key);
  }, [teamMembers, active, choose]);
  useEffect(() => {
    if (!showCursor) { cancelAnimationFrame(frame.current); frame.current = 0; previousTime.current = 0; setCursorVisible(false); }
  }, [showCursor]);
  const leave = () => {
    pointerInside.current = false; setCursorVisible(false);
    choose(keyboardMember.current);
  };
  const reset = () => { keyboardMember.current = null; choose(null); setCursorVisible(false); };
  return <section ref={root} className={`hover-members ${className}`} aria-label={ariaLabel} aria-describedby={help}
    data-active-index={active === null ? '' : active} data-reduced-motion={reduced}
    style={{ height: typeof height === 'string' ? height : Math.max(320, Math.min(1200, Number(height) || 720)), backgroundColor, '--hm-default': textColor, '--hm-hover': hoverTextColor, '--hm-cursor': cursorColor }}
    onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); reset(); } }}
    onPointerDown={event => { lastPointer.current = event.pointerType; if (event.pointerType === 'touch') setCursorVisible(false); if (!event.target.closest('.hm-strip')) reset(); }}>
    <h2 className="hm-sr-only" aria-live="polite">{active === null ? defaultName : teamMembers[active]?.name || defaultName}</h2>
    <div ref={strip} className="hm-strip" role="group" aria-label="Choose a member"
      onPointerEnter={event => { if (event.pointerType !== 'touch') pointerInside.current = true; }}
      onPointerMove={move} onPointerLeave={event => { if (event.pointerType !== 'touch') leave(); }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) { keyboardMember.current = null; if (!pointerInside.current) choose(null); } }}>
      {teamMembers.map((member, index) => <Portrait key={member.id ?? index} member={member} selected={index === active}
        onPointerEnter={event => { if (event.pointerType !== 'touch') choose(index); }}
        onFocus={event => { if (event.currentTarget.matches(':focus-visible')) { keyboardMember.current = index; choose(index); } }}
        onClick={event => {
          const next = active === index && event.detail !== 0 && lastPointer.current === 'touch' ? null : index;
          choose(next); latest.current.onMemberSelect?.(index, member);
        }}
        onKeyDown={event => {
          const nodes = [...strip.current.querySelectorAll('.hm-profile')]; let next;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % nodes.length;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + nodes.length) % nodes.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = nodes.length - 1;
          if (next !== undefined) { event.preventDefault(); keyboardMember.current = next; nodes[next]?.focus(); choose(next); }
        }} />)}
      <div ref={cursor} className="hm-cursor" aria-hidden="true" data-visible={showCursor && cursorVisible && !reduced}>
        <span className="hm-cursor-disc"><svg viewBox="0 0 22 22" width="20" height="20" fill="currentColor"><path d="M1 16 5 20 14 9 18 13 21 0 8 4 12 8Z" /></svg></span>
      </div>
    </div>
    <div className="hm-text-window">{layers.map(key => {
      const isDefault = key === 'default', text = isDefault ? defaultName : teamMembers[key]?.name;
      return text == null ? null : <Word key={key} text={text} active={key === (active === null ? 'default' : active)}
        initial={isDefault && initialDefault.current} isDefault={isDefault} color={isDefault ? textColor : hoverTextColor} reduced={reduced} onExit={exitFor(key)} />;
    })}</div>
    <p id={help} className="hm-sr-only">Hover, focus, or tap a portrait to reveal a name. Arrow keys browse members. Escape or tapping the empty background restores the heading.</p>
  </section>;
}
