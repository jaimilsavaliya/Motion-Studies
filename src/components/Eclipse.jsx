'use client';

import { useEffect, useRef, useState } from 'react';
import './Eclipse.css';

const vertexShader = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// Original procedural shader. No textures, models, or animation packages.
const fragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float pointerActive;
uniform float time;
uniform float radius;
uniform float intensity;
uniform vec3 tint;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p) {
  float value = 0.0, amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(5.21, 1.37);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float size = min(resolution.x, resolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution) / size;
  // The sun/corona stay fixed. Only the foreground occluder follows the cursor.
  // Pointer coordinates use the shorter side, preserving the same gain on X/Y.
  vec2 cursorOffset = pointer * 0.03;
  float cursorDistance = length(cursorOffset);
  if (cursorDistance > 0.02) cursorOffset *= 0.02 / cursorDistance;
  vec2 idleOffset = vec2(sin(time * 0.32), sin(time * 0.23)) * 0.011;
  vec2 moon = mix(idleOffset, cursorOffset, pointerActive);
  float r = length(uv - moon);
  float edge = r - radius;
  float pixel = 1.0 / size;
  if (edge < -pixel * 2.0) {
    gl_FragColor = vec4(vec3(0.0015), 1.0);
    return;
  }

  vec2 direction = normalize(uv + vec2(0.000001));
  float angle = atan(uv.y, uv.x);
  float distanceFromSun = max(length(uv) - radius, 0.0);
  float scale = 0.205 / radius;
  float d = distanceFromSun * scale;
  float drift = time * 0.022;
  // Sampling a circle in noise space avoids a visible atan seam.
  float broad = fbm(direction * 5.0 + vec2(d * 0.7, drift));
  float streams = fbm(direction * 27.0 + vec2(d * 2.3, drift * 0.6));
  float strands = noise(direction * 180.0 + d * 1.2 + drift * 0.4);
  float fine = noise(direction * 680.0 + d * 3.0);
  float rayLength = 0.19 + broad * 0.23;
  float rays = exp(-d / rayLength) * (0.24 + streams * 0.30);
  rays *= 0.78 + strands * 0.25 + fine * 0.30;
  float halo = 0.19 * exp(-d * 9.0);
  float inner = 0.43 * exp(-d * 53.0);
  float rim = 0.8 * exp(-abs(length(uv) - radius) / max(pixel, 0.0011));

  // Reveal the opposite edge of the stationary sun, rather than orbiting a
  // time-driven flare. Both pointer axes control its direction and exposure.
  float separation = length(moon);
  vec2 exposedDirection = -moon / max(separation, 0.000001);
  float exposure = smoothstep(0.0025, 0.014, separation);
  vec2 flarePosition = exposedDirection * radius * 1.04;
  vec2 f = (uv - flarePosition) * scale;
  float flare = exposure * (4.0 * exp(-length(f) * 32.0) + 0.35 * exp(-length(f) * 10.0));
  float flareAngle = atan(f.y, f.x);
  float spikes = pow(abs(cos(flareAngle * 4.0 + 0.35)), 44.0);
  float diamond = exposure * spikes * 0.8 * exp(-length(f) * 5.0);
  float solarSurface = 1.0 - smoothstep(radius * 0.987 - pixel,
                                      radius * 0.987 + pixel, length(uv));
  float crescent = solarSurface * 1.3;
  // Subtle lens ghosts sit across the disc from the exposed light.
  float ghostA = 1.0 - smoothstep(0.038, 0.046,
                                length((uv + flarePosition * 1.55) * scale));
  float ghostB = 1.0 - smoothstep(0.047, 0.056,
                                length((uv + flarePosition * 2.05) * scale));
  float ghosts = exposure * (ghostA * 0.017 + ghostB * 0.013);
  float prominences = pow(max(0.0, sin(angle * 11.0 + 0.7) *
                       sin(angle * 7.0 - time * 0.08)), 12.0);
  float rose = prominences * exp(-d * 80.0) * 0.17;

  vec3 light = tint * (rays + halo + inner + rim + flare + diamond + crescent + ghosts);
  light += vec3(1.0, 0.32, 0.24) * rose;
  light *= intensity;
  float grain = (hash(gl_FragCoord.xy) - 0.5) * 0.048;
  light += grain * min(1.0, rays * 2.0);
  vec2 stars = floor(gl_FragCoord.xy / 2.0);
  float star = step(0.99965, hash(stars)) * 0.12;
  light += star * smoothstep(radius + 0.12, radius + 0.6, r);
  light *= 1.0 - smoothstep(0.6, 1.1, length(uv));
  float mask = smoothstep(-pixel, pixel, edge);
  light = mix(vec3(0.0015), light, mask);
  gl_FragColor = vec4(light, 1.0);
}
`;

const clamp = (value, min, max, fallback) =>
  Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
const colorToRGB = (hex) => {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#eef0ff';
  return [1, 3, 5].map(index => parseInt(normalized.slice(index, index + 2), 16) / 255);
};

/** Decorative, container-sized eclipse. Put it inside a positioned parent. */
export default function Eclipse({
  radius = 0.205,
  intensity = 1,
  speed = 1,
  color = '#eef0ff',
  interactive = true,
  paused = false,
  pixelRatio = 1.5,
  className = '',
}) {
  const root = useRef(null);
  const canvas = useRef(null);
  const redraw = useRef(null);
  const settings = useRef({});
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  settings.current = {
    radius: clamp(radius, 0.1, 0.35, 0.205),
    intensity: clamp(intensity, 0, 2, 1),
    speed: clamp(speed, 0, 3, 1),
    pixelRatio: clamp(pixelRatio, 0.5, 2, 1.5),
    color: colorToRGB(color), interactive, paused,
  };

  useEffect(() => {
    const element = canvas.current;
    let gl;
    try { gl = element.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }); }
    catch { return; }
    if (!gl) return;
    let program, buffer;
    const shaders = [];
    try {
      for (const [type, source] of [[gl.VERTEX_SHADER, vertexShader], [gl.FRAGMENT_SHADER, fragmentShader]]) {
        const shader = gl.createShader(type);
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader unavailable');
      }
      program = gl.createProgram();
      shaders.forEach(shader => gl.attachShader(program, shader));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('WebGL program unavailable');
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    } catch {
      shaders.forEach(shader => gl.deleteShader(shader));
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      setReady(false);
      return;
    }
    const uniforms = Object.fromEntries(['resolution', 'pointer', 'pointerActive', 'time', 'radius', 'intensity', 'tint']
      .map(name => [name, gl.getUniformLocation(program, name)]));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, elapsed = 0, last = 0, visible = true, disposed = false, firstFrame = true;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let active = 0, targetActive = 0;
    const resize = () => {
      const host = root.current;
      if (disposed || !host) return;
      const rect = host.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, settings.current.pixelRatio);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (element.width !== width || element.height !== height) {
        element.width = width;
        element.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    const draw = (now) => {
      frame = 0;
      if (disposed || gl.isContextLost()) return;
      const props = settings.current;
      const animate = !props.paused && !motion.matches && visible && !document.hidden;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (animate) elapsed += dt * props.speed;
      const follow = animate && props.interactive;
      if (animate) {
        // Match the reference's gentle cursor-follow and hover fade.
        x += (targetX - x) * 0.045;
        y += (targetY - y) * 0.045;
        active += ((follow ? targetActive : 0) - active) * 0.04;
      }
      resize();
      gl.uniform2f(uniforms.resolution, element.width, element.height);
      gl.uniform2f(uniforms.pointer, x, y);
      gl.uniform1f(uniforms.pointerActive, motion.matches || !props.interactive ? 0 : active);
      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform1f(uniforms.radius, props.radius);
      gl.uniform1f(uniforms.intensity, props.intensity);
      gl.uniform3fv(uniforms.tint, props.color);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (firstFrame) { setReady(true); firstFrame = false; }
      if (animate && (props.speed > 0 || props.interactive)) frame = requestAnimationFrame(draw);
    };
    const requestDraw = () => {
      if (disposed || gl.isContextLost()) return;
      if (!frame) { last = 0; frame = requestAnimationFrame(draw); }
    };
    redraw.current = requestDraw;
    const parent = root.current.parentElement;
    const onPointer = event => {
      const host = root.current;
      if (disposed || !host) return;
      const rect = host.getBoundingClientRect();
      const size = Math.max(1, Math.min(rect.width, rect.height));
      targetX = (event.clientX - rect.left - rect.width / 2) / size;
      targetY = (rect.height / 2 - (event.clientY - rect.top)) / size;
      targetActive = 1;
    };
    const onLeave = () => { targetActive = 0; };
    const onPointerUp = event => { if (event.pointerType !== 'mouse') onLeave(); };
    const onLost = event => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; setReady(false); };
    const onRestored = () => setRevision(value => value + 1);
    const observer = new ResizeObserver(requestDraw);
    observer.observe(root.current);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) requestDraw(); });
    intersection.observe(root.current);
    parent.addEventListener('pointerenter', onPointer, { passive: true });
    parent.addEventListener('pointermove', onPointer, { passive: true });
    parent.addEventListener('pointercancel', onLeave);
    parent.addEventListener('pointerup', onPointerUp);
    parent.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', requestDraw);
    motion.addEventListener('change', requestDraw);
    element.addEventListener('webglcontextlost', onLost);
    element.addEventListener('webglcontextrestored', onRestored);
    requestDraw();
    return () => {
      disposed = true;
      redraw.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      parent.removeEventListener('pointerenter', onPointer);
      parent.removeEventListener('pointermove', onPointer);
      parent.removeEventListener('pointercancel', onLeave);
      parent.removeEventListener('pointerup', onPointerUp);
      parent.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', requestDraw);
      motion.removeEventListener('change', requestDraw);
      element.removeEventListener('webglcontextlost', onLost);
      element.removeEventListener('webglcontextrestored', onRestored);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach(shader => gl.deleteShader(shader));
    };
  }, [revision]);

  useEffect(() => { redraw.current?.(); }, [radius, intensity, speed, color, interactive, paused, pixelRatio]);

  return <div ref={root} className={`eclipse ${className}`} aria-hidden="true"
    style={{ '--eclipse-size': settings.current.radius * 200, '--eclipse-color': /^#[0-9a-f]{6}$/i.test(color) ? color : '#eef0ff', '--eclipse-intensity': settings.current.intensity }}>
    <div className="eclipse__fallback" />
    <canvas ref={canvas} className={`eclipse__canvas${ready ? ' is-ready' : ''}`} />
  </div>;
}
