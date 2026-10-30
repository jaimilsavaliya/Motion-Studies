import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 640, height: 448 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  window.__eclipseUniforms = {};
  const names = new WeakMap();
  const proto = WebGLRenderingContext.prototype;
  const get = proto.getUniformLocation;
  proto.getUniformLocation = function (program, name) {
    const location = get.call(this, program, name);
    if (location) names.set(location, name);
    return location;
  };
  for (const method of ['uniform1f', 'uniform2f']) {
    const original = proto[method];
    proto[method] = function (location, ...values) {
      window.__eclipseUniforms[names.get(location)] = values;
      return original.call(this, location, ...values);
    };
  }
});
try {
  await page.goto(`${process.env.TEST_URL || 'http://localhost:5173'}/preview/eclipse?embed=1&speed=0`, { waitUntil: 'networkidle' });
  await page.locator('canvas.is-ready').waitFor();
  for (const [label, x, y] of [['center', 320, 224], ['right', 608, 224], ['left', 32, 224], ['top', 320, 32], ['bottom', 320, 416], ['diagonal', 608, 32]]) {
    await page.mouse.move(x, y);
    const target = [(x - 320) / 448, (224 - y) / 448];
    await page.waitForFunction(([x, y]) => {
      const u = window.__eclipseUniforms;
      return u.pointerActive?.[0] > .995 && Math.abs(u.pointer[0] - x) < .002 && Math.abs(u.pointer[1] - y) < .002;
    }, target, { timeout: 20000 });
    const uniforms = await page.evaluate(() => window.__eclipseUniforms);
    assert.equal(uniforms.time[0], 0, 'speed=0 should freeze idle time, not cursor response');
    assert.ok(uniforms.pointerActive[0] <= 1);
    console.log(`PASS: ${label} — normalized two-axis pointer reaches the correct target`);
  }
  await page.mouse.move(-10, -10);
  await page.waitForFunction(() => window.__eclipseUniforms.pointerActive[0] < .002, null, { timeout: 20000 });
  console.log('PASS: pointer exit eases back to idle');
  await page.goto(`${process.env.TEST_URL || 'http://localhost:5173'}/preview/eclipse?embed=1&speed=0&interactive=false`, { waitUntil: 'networkidle' });
  await page.locator('canvas.is-ready').waitFor();
  await page.mouse.move(600, 32);
  assert.equal(await page.evaluate(() => window.__eclipseUniforms.pointerActive[0]), 0);
  assert.deepEqual(errors, []);
  console.log('PASS: interaction can be disabled; no browser errors');
} finally { await browser.close(); }
