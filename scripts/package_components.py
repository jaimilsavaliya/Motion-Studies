"""Build source archives for the documented components. Run after source changes."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import re
root = Path(__file__).resolve().parent.parent
output = root / 'public' / 'downloads'
output.mkdir(parents=True, exist_ok=True)
registry = (root / 'src' / 'library' / 'registry.js').read_text()
usage = re.search(r'  usage: `([\s\S]*?)`,', registry).group(1)
readme = '''# Scroll Zoom Reveal\n\nAn original React + CSS implementation of an inline-to-fullscreen scroll reveal.\n\n## Installation\n\n1. Copy src/components/ScrollZoomReveal.jsx and ScrollZoomReveal.css into your React project.\n2. Add your own media to public/. The demo video is not included in this source archive.\n3. Use src/Hero.jsx as a starting point. Media paths are examples; replace them with your assets.\n\nRequires React 18 or newer and a build tool supporting CSS imports. No animation dependencies.\n\nThe component uses window scroll; avoid overflow: hidden or auto on ancestors.\nThe default scrollDistance=200 makes a section that is 300 viewport heights tall.\n\nThe component includes a use client directive for Next.js App Router.\nFor Next.js Pages Router, move the CSS import to pages/_app.jsx.\n\n## Props\n\n- leading: text before the media (default: Above)\n- trailing: text after the media (default: the shoreline)\n- radius: initial corner radius in pixels (default: 24)\n- scrollDistance: positive scroll travel in viewport-height units (default: 200)\n- onProgress: optional callback receiving a value from 0 to 1\n- children: media element (required)\n\nReduced motion disables scroll interpolation but not the reveal itself.\nFor videos, provide a pause control and respect the user's autoplay preferences.\n\nOriginal implementation by Motion studies. No proprietary Planes code is included.\n'''
with ZipFile(output / 'scroll-zoom-reveal.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['ScrollZoomReveal.jsx', 'ScrollZoomReveal.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Hero.jsx', usage + '\n')
    archive.writestr('README.md', readme)
print('Packaged', output / 'scroll-zoom-reveal.zip')

# Eclipse is self-contained: its shader lives inside the JSX source.
eclipse_registry = registry.split("slug: 'eclipse'", 1)[1]
eclipse_usage = re.search(r'  usage: `([\s\S]*?)`,', eclipse_registry).group(1)
eclipse_pause = re.search(r'  pauseUsage: `([\s\S]*?)`,', eclipse_registry).group(1)
eclipse_readme = '''# Eclipse\n\nAn original procedural React + WebGL eclipse. No textures, Three.js, or animation packages.\n\n## Install\n\nCopy src/components/Eclipse.jsx and Eclipse.css next to each other in your React 18+ app.\nThe shader is embedded in Eclipse.jsx. Import the component using src/Hero.jsx as an example.\n\nThe parent needs position: relative and a non-zero height (e.g. 560px).\nEclipse fills the parent; put headings and controls after it. It is decorative and pointer-transparent.\n\n## Props\n\n- radius: 0.205. Fraction of the shorter container side, clamped 0.1–0.35.\n- intensity: 1. Corona brightness, clamped 0–2; stars are independent.\n- speed: 1. Time multiplier, clamped 0–3. Zero freezes drift, not pointer interaction.\n- color: #eef0ff. Six-digit hex corona tint.\n- interactive: true. Cursor-driven foreground disc, fixed corona, and opposite-edge exposure.\n- paused: false. Pause animation; changed props may still draw one frame.\n- pixelRatio: 1.5. Maximum render DPR, clamped 0.5–2, limited by device DPR.\n- className: optional root CSS class.\n\n## Accessibility and performance\n\nReduced-motion preference renders a still frame and disables pointer motion.\nUse the pause-control example for long-running decorative animation.\nThe loop stops when offscreen or when the browser tab is hidden.\nUse pixelRatio={1} to reduce GPU cost.\nA simpler static CSS glow appears when WebGL is unavailable or its context is lost.\nThe CSS fallback uses modern container-query units and color-mix().\n\nThe use client directive supports Next.js App Router. For Pages Router, move the CSS import\nfrom Eclipse.jsx into pages/_app.jsx.\n\nOriginal implementation inspired by https://useplanes.com/components/eclipse.\nNo proprietary Planes source is included. The props above belong to this implementation.\n'''
with ZipFile(output / 'eclipse.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['Eclipse.jsx', 'Eclipse.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Hero.jsx', eclipse_usage + '\n')
    archive.writestr('src/EclipseHero.jsx', eclipse_pause + '\n')
    archive.writestr('README.md', eclipse_readme)
print('Packaged', output / 'eclipse.zip')

hover_registry = registry.split("slug: 'hover-reveal'", 1)[1]
hover_usage = re.search(r'  usage: `([\s\S]*?)`,', hover_registry).group(1)
hover_team = re.search(r'  teamUsage: `([\s\S]*?)`,', hover_registry).group(1)
hover_readme = '''# Hover Reveal\n\nAn original React image index inspired by the public visual reference.\n\n## Installation\n\n1. Copy src/components/HoverReveal.jsx and HoverReveal.css into your React 18+ project.\n2. Add your own images and update the src fields in the example. No reference images are included.\n3. Import and render the component. It needs no positioned parent or fixed height.\n\nUses React, CSS container queries, and the native Web Animations API. No extra animation packages.\n\n## Props\n\n- items: array of { name, src, alt?, objectPosition? }. Default: [].\n- label: header above the index. Default: Protocols. Empty string hides it.\n- initialIndex: initially selected index. Default: 0; read only on mount, clamped to array bounds.\n- duration: crossfade duration in ms. Default: 770; clamped to 0–2500. Zoom settles over about 1.82x this duration.\n- zoom: entry scale. Default: 1.4; clamped to 1–1.8.\n- parallax: maximum pointer displacement per axis in px. Default: 9; clamped to 0–20.\n- drift: enable slow 8px vertical float. Default: true.\n- radius: outer corner radius in px. Default: 18; clamped to 0–40.\n- theme: dark or light. Default: dark.\n- onActiveChange: optional callback (index, item), fired on a selection change, not initial mount.\n- className: optional root CSS class.\n\n## Interaction and accessibility\n\nHover, focus, or tap a native button to select an image. The last selection persists on pointer exit.\nArrow keys move through the list; Home and End jump to its ends.\nA polite live region announces the selected name. Supply descriptive alt text.\nReduced-motion preference removes all image motion, fades, and text skew.\nSet drift={false} and parallax={0} to remove continuous image movement for everyone.\n\nImages load up front; use a small curated list and compressed assets. Failed images have a named fallback.\nCSS container queries stack the layout below roughly 768px.\n\nNext.js App Router: use the component as-is; it includes use client.\nNext.js Pages Router: move the CSS import to pages/_app.jsx.\n\nVisual reference: https://useplanes.com/components/hover-reveal\nNo proprietary Planes source is included. Demo image paths are examples; supply your own media.\n'''
with ZipFile(output / 'hover-reveal.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['HoverReveal.jsx', 'HoverReveal.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/ProjectIndex.jsx', hover_usage + '\n')
    archive.writestr('src/Team.jsx', hover_team + '\n')
    archive.writestr('README.md', hover_readme)
print('Packaged', output / 'hover-reveal.zip')

radial_registry = registry.split("slug: 'radial-pop-out'", 1)[1]
radial_usage = re.search(r'  usage: `([\s\S]*?)`,', radial_registry).group(1)
radial_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', radial_registry).group(1)
radial_readme = '''# Radial Pop-out\n\nA React hero card with a spring-driven ring of related images.\nOriginal implementation inspired by https://useplanes.com/components/radial-pop-out.\nNo proprietary Planes source is included.\n\n## Installation\n\nCopy src/components/RadialPopOut.jsx and RadialPopOut.css next to each other in your React 18+ project.\nNo motion library or utility CSS framework is required. The component uses the native Web Animations API.\nReplace the sample image paths with your own assets. Reference images are not included in this archive.\n\nThe component reserves a square stage in normal flow and scales it down to available width.\nAt defaults its full-size stage is 820px, hero 280px, satellites 200px, and orbit radius 210px.\n\n## Props\n\nhero: { src, alt?, objectPosition? }\nitems: array of the same image shape, with optional rotation (-30 to 30 degrees). Default [].\nheroSize: 280px; clamped 80–400.\ncardSize: 200px; clamped 60–280.\norbitRadius: 210px; clamped 60–380.\nstagger: 25ms; clamped 0–100.\ntilt: 10 degrees; clamped 0–20.\nmagnetic: 0.36; clamped 0–0.5.\nradius: 16px corner radius; clamped 0–48.\ndefaultOpen: false; read on mount only.\nonOpenChange: optional callback receiving a boolean, not called on initial mount.\nclassName: optional root CSS class.\n\nHover/focus the native button to expand; click/tap/Enter/Space toggles. Escape collapses.\nPointer exit closes a hover-only reveal. Toggled-open views also close on blur/outside pointer press.\nSatellite images are visual previews, not links. Provide useful alt text.\nReduced-motion preference disables the animation, stagger, and hero tracking.\nMissing or failed images have a named fallback. With no related images, the hero is static and disabled.\n\nNext.js App Router can use the included use client component directly.\nFor Pages Router, move the CSS import to pages/_app.jsx.\n'''
with ZipFile(output / 'radial-pop-out.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['RadialPopOut.jsx', 'RadialPopOut.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Collection.jsx', radial_usage + '\n')
    archive.writestr('src/ProductCollection.jsx', radial_example + '\n')
    archive.writestr('README.md', radial_readme)
print('Packaged', output / 'radial-pop-out.zip')

cylinder_registry = registry.split("slug: 'text-cylinder'", 1)[1]
cylinder_usage = re.search(r'  usage: `([\s\S]*?)`,', cylinder_registry).group(1)
cylinder_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', cylinder_registry).group(1)
cylinder_readme = '''# Text Cylinder\n\nAn independent React + CSS implementation inspired by https://useplanes.com/components/text-cylinder.\nNo proprietary Planes source is included.\n\n## Install\n\nCopy TextCylinder.jsx and TextCylinder.css from src/components/ into the same folder in your React 18+ project.\nNo motion library, Tailwind, or WebGL renderer is required. A small canvas is used only to measure glyphs.\nThe visible typography is regular DOM text using CSS 3D transforms.\n\nReplace sample image paths with your own appropriately licensed images. Demo media is not included.\nThe default stage is 16:10, or 4:5 on small viewports. For a full-height hero, pass a className with\nheight: 100svh; aspect-ratio: auto. Keep the bundled system font so glyph measurements remain accurate.\n\n## Props\n\nslides: array of { src, lines: [title, subtitle?], color?, label?, alt?, objectPosition? }; default [].\nspeed: 18 degrees/second; -60 to 60. Negative reverses direction. Zero freezes rotation.\nfontScale: .24 of component height; .12 to .4, minimum 24px type.\nimageWidth: 22%; 12 to 45.\nmobileImageWidth: 46%; 30 to 75, used below 640px container width.\nduration: 700ms image reveal; 200 to 1500. Text crossfade lasts up to 450ms.\ninitialIndex: 0; read on mount, wrapped to slide count.\npaused: false; externally freezes rotation but not slide navigation.\nshowControls: true; supply your own pause control if false.\ntheme: dark or light; default dark.\nonSlideChange: optional (index, slide) callback, not called on mount.\nclassName: optional CSS class.\n\nClick/tap/Enter/Space advances. Arrow keys browse while the photo button is focused.\nRepeated decorative text is aria-hidden; a live region announces the selected slide.\nReduced motion freezes rotation and disables wipes/crossfades. Offscreen rotation is suspended.\nSlides do not advance automatically. Rapid clicks keep at most two photo/text layers.\nEmpty slides show a placeholder; failed images show a named fallback.\n\nTitle rendering uses at most two lines, 100 characters per line, and eight phrase repetitions.\nModern browsers need ResizeObserver, IntersectionObserver, CSS 3D transforms, and container queries.\nNext.js App Router supports the included use client directive. For Pages Router, move the CSS import\nto pages/_app.jsx.\n'''
with ZipFile(output / 'text-cylinder.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['TextCylinder.jsx', 'TextCylinder.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/TravelStories.jsx', cylinder_usage + '\n')
    archive.writestr('src/SelectedWork.jsx', cylinder_example + '\n')
    archive.writestr('README.md', cylinder_readme)
print('Packaged', output / 'text-cylinder.zip')

bento_registry = registry.split("slug: 'bento-grid'", 1)[1]
bento_usage = re.search(r'  usage: `([\s\S]*?)`,', bento_registry).group(1)
bento_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', bento_registry).group(1)
bento_readme = '''# Bento Grid\n\nAn independent React implementation inspired by https://useplanes.com/components/bento-grid.\nNo proprietary Planes source is included.\n\n## Install\nCopy BentoGrid.jsx and BentoGrid.css from src/components into the same directory in your React 18+ project.\nRequires react and react-dom, CSS Grid, ResizeObserver, native dialog, and the Web Animations API.\nNo animation package or utility CSS framework is required.\n\nSupply your own appropriately licensed images. Demo photos are not in this archive.\nUse the PhotoStories and SelectedWork examples as starting points.\n\n## Props\nitems: array of { id, src, title, alt?, eyebrow?, description?, colSpan?, rowSpan?, objectPosition?, credit?, creditHref? }.\ndescription accepts text or React content. IDs should be unique.\nColumn spans are limited to the available columns; row spans are clamped to 1–3. Both default to 1.\nCredit URLs support http(s), root-relative paths, or hash links.\ncolumns: 4; clamped 1–6, at most 2 below 640px container width.\ngap: 12px; clamped 0–32.\nrowHeight: 220px; clamped 100–400.\nmobileRowHeight: 150px; clamped 80–300.\nradius: 12px; clamped 0–40. Expanded photo corners are 16px.\nsidebarWidth: 400px; clamped 280–520 and capped at 48% of viewport width.\nduration: 700ms expansion/return; clamped 250–1200.\ntheme: dark (default) or light.\nonActiveChange: optional (index, item) callback, receiving null, null when closed.\nclassName: optional root class; use for your max-width.\n\nBelow a 768px viewport the details stack beneath the image. The description panel scrolls independently.\nThe modal is portalled to document.body. Native dialog keeps the background inert; body scrolling is locked.\nAn iframe preview confines its modal to that iframe.\n\nTiles support Enter/Space. Arrow keys browse without wrapping; Previous/Next disable at the ends.\nEscape, Close, or clicking the backdrop dismisses. Focus returns to the selected tile.\nReduced motion disables hover zoom, expansion, and fades. Missing images show a named fallback.\nEmpty arrays display a placeholder. Resizing an open dialog settles its layout immediately.\n\nNext.js App Router supports the included use client directive. With Pages Router, move the CSS import\nto pages/_app.jsx.\n'''
with ZipFile(output / 'bento-grid.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['BentoGrid.jsx', 'BentoGrid.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/PhotoStories.jsx', bento_usage + '\n')
    archive.writestr('src/SelectedWork.jsx', bento_example + '\n')
    archive.writestr('README.md', bento_readme)
print('Packaged', output / 'bento-grid.zip')

parallax_registry = registry.split("slug: 'parallax-carousel'", 1)[1]
parallax_usage = re.search(r'  usage: `([\s\S]*?)`,', parallax_registry).group(1)
parallax_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', parallax_registry).group(1)
parallax_readme = '''# Parallax Carousel\n\nIndependent React + CSS implementation inspired by https://useplanes.com/components/parallax-carousel.\nNo proprietary Planes source is included.\n\nCopy ParallaxCarousel.jsx and ParallaxCarousel.css into the same folder in your React 18+ project.\nNo carousel, motion, or utility CSS package is required. Modern browsers need ResizeObserver,\nIntersectionObserver, pointer capture, and CSS masks.\nReplace sample image paths with your own appropriately licensed media. Demo images are not included.\n\n## Props\nimages: array of { src, alt?, objectPosition? }; default [].\ncardWidth: 320px; clamped 120–600.\ncardHeight: 600px; clamped 160–800.\ngap: 12px; clamped 0–48.\nparallax: 60px max image shift; clamped 0–160.\nspeed: 34px/s; clamped -160–160. Positive moves left, negative moves right.\nradius: 12px; clamped 0–48.\nfade: 80px edge mask; clamped 0–160 and at most one third of container width.\nmobileScale: .62; clamped .4–1, applied below 640px container width to sizes, gap, and parallax.\nautoPlay: true.\npauseOnHover: true.\npaused: false; external autoplay pause, manual movement remains enabled.\nshowControls: true; provide another pause control when false.\nshowDots: false; requires showControls.\nonIndexChange: optional callback with nearest-center image index when it changes.\nclassName: optional root class.\n\nThe strip is cardHeight + 24px tall. Leave about 50px below for the absolute-positioned controls.\nCards are free-dragging, not snapping. A drag release coasts briefly; hover smoothly pauses autoplay.\nMouse wheel and vertical touch scrolling are not intercepted.\nKeyboard: focus the strip, use Left/Right, Home/End, or Space. Keyboard focus pauses autoplay.\nNavigation controls and dots are additions to the public reference demo for accessibility.\nReduced motion removes autoplay, image drift, and inertia; manual button movements become instant.\nOffscreen and hidden-tab loops stop. Extra image sets are aria-hidden. Empty and single-image arrays\nare supported; failed images have an alt-text fallback.\n\nNext.js App Router supports the included use client directive. With Pages Router, move the CSS import\nto pages/_app.jsx.\n'''
with ZipFile(output / 'parallax-carousel.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['ParallaxCarousel.jsx', 'ParallaxCarousel.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/TravelGallery.jsx', parallax_usage + '\n')
    archive.writestr('src/ProductGallery.jsx', parallax_example + '\n')
    archive.writestr('README.md', parallax_readme)
print('Packaged', output / 'parallax-carousel.zip')

focus_registry = registry.split("slug: 'focus-scale-carousel'", 1)[1]
focus_usage = re.search(r'  usage: `([\s\S]*?)`,', focus_registry).group(1)
focus_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', focus_registry).group(1)
focus_readme = '''# Focus Scale Carousel\n\nAn independent React implementation inspired by https://useplanes.com/components/focus-scale-carousel.\nNo proprietary Planes source is included.\n\nCopy FocusScaleCarousel.jsx and FocusScaleCarousel.css into the same folder in your React 18+ project.\nRequires modern browser ResizeObserver, IntersectionObserver, pointer capture, and the Web Animations API.\nNo carousel framework or animation package is required.\n\nReplace sample image paths with your own appropriately licensed assets. Reference photos are not included.\n\n## Props\nitems: array of { src, title, collection?, alt?, objectPosition? }; default [].\ncardWidth: 320px; clamped 120–500.\ncardHeight: 430px; clamped 160–700.\ngap: 14px; clamped 0–40.\nneighborScale: .37; clamped .2–.8.\nscaleDecay: .78; clamped .5–.95.\nsideCount: 6; clamped 1–8.\nduration: 850ms; clamped 200–1600.\nautoPlay: 4000ms; zero disables, positive values clamped 1000–15000.\nmobileScale: .55 below 640px container width; clamped .35–1.\nradius: 2px; clamped 0–30.\nshowFrame: true.\nshowControls: true; supply a pause control when false.\npaused: false; external autoplay pause without disabling manual navigation.\ninitialIndex: 0; read on mount, wrapped to the item count.\nonIndexChange: optional (index, item) callback for selection changes, not initial mount.\nclassName: optional root class.\n\nStage height is cardHeight + 88px at desktop defaults. Leave about 50px beneath it for the controls.\nClick a neighbouring frame to select it. Swipe horizontally to advance roughly one item per 50px,\nscaled on mobile and capped to sideCount steps. Short/cancelled gestures settle back.\nKeyboard: focus the gallery, then Left/Right, Home/End, or Space. Selection loops.\nOur implementation adds Previous/Pause/Next controls to the public reference presentation.\nHover, keyboard focus, and dragging pause autoplay. Hidden/offscreen views suspend autoplay too.\nReduced motion disables autoplay and animation but retains navigation.\nDuplicate visual cards are hidden from screen readers. Empty arrays and single items are supported.\nFailed images have a title/alt fallback.\n\nNext.js App Router supports the included use client directive. For Pages Router, move the CSS import\nto pages/_app.jsx.\n'''
with ZipFile(output / 'focus-scale-carousel.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['FocusScaleCarousel.jsx', 'FocusScaleCarousel.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/PhotoCollection.jsx', focus_usage + '\n')
    archive.writestr('src/Lookbook.jsx', focus_example + '\n')
    archive.writestr('README.md', focus_readme)
print('Packaged', output / 'focus-scale-carousel.zip')

elastic_registry = registry.split("slug: 'elastic-carousel'", 1)[1]
elastic_usage = re.search(r'  usage: `([\s\S]*?)`,', elastic_registry).group(1)
elastic_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', elastic_registry).group(1)
elastic_readme = '''# Elastic Carousel\n\nIndependent React + WebGL implementation inspired by https://useplanes.com/components/elastic-carousel.\nNo proprietary Planes source or shaders are included. The renderer and shaders here are original.\n\nCopy ElasticCarousel.jsx and ElasticCarousel.css into the same directory in your React 18+ project.\nNo Three.js, carousel framework, or animation package is required.\nModern browsers need ResizeObserver, IntersectionObserver, pointer capture, and WebGL for full effects.\nA DOM-based gallery remains available without WebGL or after a texture/context failure.\n\nSupply your own appropriately licensed images. Demo imagery is not included in the archive.\nLocal images work directly; remote texture images must allow anonymous cross-origin access.\n\n## Props\nitems: array of { src, title, alt? }; default []. Images are center-cropped.\nheight: 560px; clamped 280–800, scaled to 60% below 640px container width.\nstretch: 1; clamped 0–2. Zero disables the mesh deformation.\nblur: 1; clamped 0–2. Zero disables directional motion blur.\ngap: 16px; clamped 4–40, scaled down on mobile.\nintro: true; left-to-right thumbnail scale/fade, a held strip, then blurred expansion. False starts expanded.\ninitialIndex: middle item by default; clamped to the collection, read on mount.\npixelRatio: 1.5; clamped .5–2, capped at device DPR.\nshowControls: true; Previous/Next controls and a short hint.\nonIndexChange: optional (index, item) callback as the centered image changes.\nonOpenChange: optional (open) callback for the isolated-image state.\nclassName: optional root class.\n\nDrag horizontally, release to snap to the nearest image. Selection loops. Click an off-center image\nto select it; click the centered image to isolate it. Close or Escape returns to the reel.\nThis is an in-place state, not a modal or page navigation. No timed slide autoplay is used.\nKeyboard: Left/Right browse; Enter/Space on the stage toggles the isolated view.\nVertical touch and wheel scrolling remain available.\nReduced motion skips the entrance, smoothing, and velocity effects.\nIdle, offscreen, and hidden-tab rendering stops. Context loss uses the simpler DOM fallback;\nrestoration rebuilds the WebGL renderer. Failed images have a named placeholder.\n\nNext.js App Router supports the included use client directive. With Pages Router, move the CSS import\nto pages/_app.jsx.\n'''
with ZipFile(output / 'elastic-carousel.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['ElasticCarousel.jsx', 'ElasticCarousel.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/ImageReel.jsx', elastic_usage + '\n')
    archive.writestr('src/ArchitectureGallery.jsx', elastic_example + '\n')
    archive.writestr('README.md', elastic_readme)
print('Packaged', output / 'elastic-carousel.zip')

wheel_registry = registry.split("slug: 'image-wheel'", 1)[1]
wheel_usage = re.search(r'  usage: `([\s\S]*?)`,', wheel_registry).group(1)
wheel_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', wheel_registry).group(1)
wheel_readme = '''# Image Wheel

Independent React implementation inspired by the publicly rendered Image Wheel at
https://useplanes.com/components/image-wheel. No proprietary source is included.

Copy src/components/ImageWheel.jsx and ImageWheel.css together into a React 18+ app.
No animation library, WebGL, or carousel package is needed. Modern browsers require
ResizeObserver, IntersectionObserver, requestAnimationFrame, and pointer capture.

Supply images as { src, alt } objects, with descriptive alt text used for button labels.
Images are center-cropped into square rounded frames. Local and remote images work;
no WebGL CORS permissions are needed. Supply your own properly licensed assets.
Reference demo photographs are not included in this archive.

## Props
images=[]: collection of { src, alt }.
cardSize=190: unscaled square size, clamped 60–360px.
radius=420: horizontal arc radius, clamped 120–800px. Demo uses 430px.
height=520: unscaled stage height, clamped 200–800px.
angle=24: angular spacing, clamped 12–60 degrees.
blur=9: depth blur strength, clamped 0–18. Zero disables blur.
tilt=1: card rotation strength, clamped 0–2. Zero keeps cards upright.
initialIndex=0: clamped initial image, read on mount.
showControls=false: optional Previous/Next buttons and counter.
onIndexChange(index,image): called as the nearest centered image changes.
onSelect(index,image): called when an already-centered card is activated.
className: extra class for the full-width stage.

## Interaction
Drag horizontally to turn the wheel; release to snap to the nearest image.
Click a side card to center it. Clicking the centered card only calls onSelect.
No automatic playback, looping, wheel-scroll interception, or built-in lightbox.
The first and last images are navigation bounds.
Tab to the current image; Left/Right browse; Home/End jump to the endpoints.
Enter/Space activates a card. Vertical touch scrolling remains available.

The entire composition scales to its container, including stage height. Depth blur
is static: neighbouring images remain soft at rest while the front image is sharp.
Reduced motion skips the spring, retaining the depth styling. Rendering stops when
settled, offscreen, or in a hidden tab. Failed images display descriptive fallback text.

Next.js App Router supports the included use client directive. For Pages Router,
move the CSS import into pages/_app.jsx.
'''
with ZipFile(output / 'image-wheel.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['ImageWheel.jsx', 'ImageWheel.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/PhotoWheel.jsx', wheel_usage + '\n')
    archive.writestr('src/ProjectPicker.jsx', wheel_example + '\n')
    archive.writestr('README.md', wheel_readme)
print('Packaged', output / 'image-wheel.zip')

garden_registry = registry.split("slug: 'type-garden'", 1)[1]
garden_usage = re.search(r'  usage: `([\s\S]*?)`,', garden_registry).group(1)
garden_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', garden_registry).group(1)
garden_readme = '''# Type Garden

A React botanical typography playground and poster editor.
Flower geometry, animation, and export code are original. No proprietary reference source is included.
Bodoni Moda is an open-licensed font substitute, distributed with its SIL Open Font License.

## Install
Copy TypeGarden.jsx, TypeGarden.css, and the adjacent type-garden font folder into your React 18+ app.
Keep the relative paths intact. There are no additional npm dependencies. The drawing engine uses
Canvas 2D and Path2D, with ResizeObserver/IntersectionObserver and standard browser font APIs.
Type mode supports desktop input, paste, mobile keyboards, and composition events.

## Interaction
Click the canvas and type to grow. Letters re-center smoothly; stems trace first, then leaves
unfold, buds open with a settling overshoot, and fine petal lines draw in. Spaces cut connecting
vines; Backspace retracts and folds the deleted plant;
Enter clears Type mode. Poster mode has its own editable words, Regrow, seven loop presets,
and ten palettes. The whole design fits its container. Poster controls move below the canvas
on narrow containers. Input is scoped: this component does not intercept document-wide keys.

## Props
initialText="": words on mount. Poster uses "in bloom" when empty initially.
initialMode="type": "type" or "poster".
initialPalette="Rose noir": one of the ten palette names exported as gardenPalettes.
initialMotion="breathe": breathe, grow, typed, gust, reach, scatter, visitor.
height=720: number (400–1200px) or CSS value such as "100svh".
fontSize=240: maximum type size (60–360px); posters use 80% in their 1080px design space.
density=1: secondary bloom density (0–2); zero keeps the main flowers.
seed=23: deterministic geometry seed (0–999999).
maxLength=80: grapheme limit (1–160).
exportSize=1080: square poster export size (256–1080px). Type stills use the stage size.
exportFps=30: animation export frame rate (6–30).
autoFocus=false: focus the typing input on mount; avoid stealing focus in larger pages.
onTextChange(text): user edit/clear callback.
onExport({format,blob}): called after downloading an export; not called for clipboard copy.
className="": additional root class.
Initial props are read on mount; remount to reset the editor. Size/density/seed props update live.

## Exports
All rendering and encoding happen locally in the browser. PNG captures a still; SVG embeds the font
and vector paths. Clipboard copies the SVG code (secure context and clipboard permission required).
Poster PNG frames are numbered and stored in a ZIP without an external archive library.
Video uses MediaRecorder and canvas.captureStream: MP4 if supported, otherwise explicitly labeled
WebM. When video is unavailable, export PNG frames instead. Video records in real time; keep the
page visible until it finishes. Progress and cancellation are provided. Lower resolution/frame rate
reduces ZIP size and memory use. The component does not promise sample-accurate video timestamps;
browser encoding and scheduling can affect the resulting container frame rate.

Reduced motion makes the live artwork static, while explicitly requested animation exports remain
animated. Offscreen/hidden-tab live rendering pauses. No simulated user presence, donation UI,
collaboration backend, external image service, or analytics is included.

Next.js App Router supports the use client directive. With Pages Router, move the stylesheet import
to pages/_app.jsx. Retain the font directory and font license when redistributing.
'''
with ZipFile(output / 'type-garden.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['TypeGarden.jsx', 'TypeGarden.css', 'type-garden/BodoniModa.ttf', 'type-garden/OFL.txt']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/ArtPlayground.jsx', garden_usage + '\n')
    archive.writestr('src/PosterStudio.jsx', garden_example + '\n')
    archive.writestr('README.md', garden_readme)
print('Packaged', output / 'type-garden.zip')

shutter_registry = registry.split("slug: 'shutter-gallery'", 1)[1]
shutter_usage = re.search(r'  usage: `([\s\S]*?)`,', shutter_registry).group(1)
shutter_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', shutter_registry).group(1)
shutter_readme = '''# Shutter Gallery

Independent React + CSS implementation. No proprietary component source or animation library.
Copy src/components/ShutterGallery.jsx and ShutterGallery.css into your React 18+ application.
Replace the example image paths with your own appropriately licensed images. Demo photos are excluded.
Requires modern CSS container query units, ResizeObserver, and CSS individual transforms.

## API
items: array of {src, alt, title?, subtitle?, objectPosition?}; default [].
height: 480px (clamped 240–1000); demo uses 520px.
gap: 12px (clamped 0–32), halved below 576px container width.
expandedGrow: 12.6 (clamped 2–24); other panels have flex weight 1.
defaultOpen: null or zero-based initial index, read on mount.
open: controlled zero-based index or null. Omit for uncontrolled behavior.
onOpenChange: optional callback receiving a requested index or null.
aria-label: accessible group name, default Image gallery.
className: optional additional root class.
Invalid indices render all shutters closed. Empty collections and failed images have fallbacks.

Hover/focus peeks; click, Enter, or Space toggles a panel. Escape closes without moving focus.
Tab visits every shutter. Arrow keys follow the layout; Home/End focus the first/last panel.
Touch opens on the first tap without a sticky hover. Controlled parents must update open.
The image stays gallery-sized behind each panel, with an independent 1.08-to-1 unzoom.
Below 576px container width (not viewport width), the strip becomes vertical.
Reduced motion snaps layout, shade and image; captions use a short opacity-only fade.
No autoplay, scrolling interception, remote runtime assets or animation dependencies.

The use client directive supports Next.js App Router. For Pages Router, move the CSS import
into pages/_app.jsx. Keep these files together when using Vite or other CSS-aware bundlers.
'''
with ZipFile(output / 'shutter-gallery.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['ShutterGallery.jsx', 'ShutterGallery.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Collection.jsx', shutter_usage + '\n')
    archive.writestr('src/ProjectGallery.jsx', shutter_example + '\n')
    archive.writestr('README.md', shutter_readme)
print('Packaged', output / 'shutter-gallery.zip')

polaroid_registry = registry.split("slug: 'polaroid-flip-card'", 1)[1]
# Decode the template-literal layer so example JS strings retain real newline escapes.
polaroid_usage = re.search(r'  usage: `([\s\S]*?)`,', polaroid_registry).group(1).replace(r'\\n', r'\n')
polaroid_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', polaroid_registry).group(1).replace(r'\\n', r'\n')
polaroid_readme = '''# Polaroid Flip Card

Independent React + CSS implementation; no proprietary component source or animation library.
Requires React 18+, CSS imports, modern 3D transforms and container query units.

Copy src/components/PolaroidFlipCard.jsx, PolaroidFlipCard.css and the entire
polaroid-flip-card/ font folder into your project. Keep Caveat.ttf and OFL.txt together.
Caveat is bundled under the SIL Open Font License. Retain the license when redistributing.
Demo photos are excluded; replace example image paths with your own licensed photography.

## Props
src: photograph URL. alt: descriptive text, default Photograph.
caption: short front caption. message: reverse note, preserving newlines. Both default empty.
width: 340px, clamped 160–640; max-width 100% of the container.
rotation: -3 degrees on the front, clamped -20–20; the reverse turns upright.
tilt: 14 degrees maximum horizontal pointer tilt (0–24), vertical tilt at 80%.
duration: 760ms for the flip, clamped 200–1600; pointer/outer rotation have separate timing.
theme: dark (default) or light. objectPosition: center (CSS object-position).
defaultFlipped: false, read on mount. flipped: optional controlled boolean.
onFlipChange: optional callback with the requested boolean; controlled parents must update flipped.
className: additional root class.

Click/tap, Enter, or Space toggles. Escape returns to the photograph. Hover only tilts/lifts;
it does not flip. Pointer exit resets tilt, highlight, and lift; touch has no sticky hover.
The button exposes aria-pressed and the note describes it on the reverse. Faces are hidden
from assistive technology when inactive. Long notes scroll, but short notes work best.
Reduced motion snaps sides and disables pointer tilt/lift/glare. No autoplay.
Leave room around the card for rotation and the small mid-flip enlargement.
The animation loop runs only while turning, cancels on unmount, and reverses from its current angle.
The photo has a fallback for failed loads. No remote font or media request is built into the component.

Next.js App Router supports the use client directive. For Pages Router, move the CSS import
into pages/_app.jsx. Keep the font directory relative to the stylesheet.
'''
with ZipFile(output / 'polaroid-flip-card.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['PolaroidFlipCard.jsx', 'PolaroidFlipCard.css', 'polaroid-flip-card/Caveat.ttf', 'polaroid-flip-card/OFL.txt']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Memory.jsx', polaroid_usage + '\n')
    archive.writestr('src/GuestNote.jsx', polaroid_example + '\n')
    archive.writestr('README.md', polaroid_readme)
print('Packaged', output / 'polaroid-flip-card.zip')

tik_registry = registry.split("slug: 'tik-tik-color-list'", 1)[1]
tik_usage = re.search(r'  usage: `([\s\S]*?)`,', tik_registry).group(1)
tik_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', tik_registry).group(1)
tik_readme = '''# Tik Tik Color List

Independent React + CSS implementation. React 18+, CSS imports, ResizeObserver,
container queries and Pointer Events are required. No animation package or gated registry.
Copy TikTikColorList.jsx and .css plus the entire tik-tik-color-list/ font folder.
The bundled Inter font is under the SIL Open Font License; retain OFL.txt when redistributing.
Demo posters and sound are excluded. Add your own appropriately licensed media.

## API
projects: array of {id, name, badge, bgColor, image}; default [].
Optional project fields: date (default 01 sep), description (metadata), alt, objectPosition.
height: 720; numeric values clamp to 320–1200px, or supply CSS such as 100svh.
showPreview: true; previewSize: lg (400px), md (320px), sm (240px).
enableSound: false. With true, click or press a key inside the stage to unlock Web Audio.
soundSrc: optional licensed audio URL. Omit it to use a synthesized tick.
infiniteScroll: true; scrollThreshold: 1000px, bounded to one cycle and 0–5000px.
onActiveChange(index, project): active-project callback, including initial selection.
onSelect(index, project): row activation callback; no navigation is performed internally.
aria-label: Project archive. className: additional root class.

The stage owns its native scroll container. Down-scroll entry is at 70% of stage height;
up-scroll entry is at 65%, retaining the current selection until a boundary is crossed.
Repeated rows are bounded and recentered near edges. Finite mode adds leading/trailing
space so every row can be selected. One-item arrays automatically use finite mode.
The first visible row in infinite mode is the first project, while selection is at the
70% guide; the initially active item therefore depends on stage height.

Desktop type is 72px with 112px row cadence; below 768px container width it is 36px/80px.
The image and dates are hidden below 768px. The preview sits 40px from bottom/right.
Images switch in place; the preview position persists across selections.
Drag follows the pointer and coasts with exponential momentum. It is unconstrained;
Escape anywhere inside the stage or double-click restores the image to its corner.
Focus the image and use arrow keys to reposition it, Enter/Space to reset.
Arrow/Home/End/Page keys in the list navigate projects. Repeated copies are hidden
from assistive technology; the active collection cycle remains accessible.
Reduced motion disables fades, smooth scrolling and release momentum.
Empty arrays and image failures have visible fallbacks. Audio failures are non-blocking.
Choose background colors that maintain sufficient contrast with black text.

The use client directive supports Next.js App Router. For Pages Router, move the CSS
import into pages/_app.jsx. Keep the font directory relative to the stylesheet.
'''
with ZipFile(output / 'tik-tik-color-list.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['TikTikColorList.jsx', 'TikTikColorList.css', 'tik-tik-color-list/InterVariable.woff2', 'tik-tik-color-list/OFL.txt']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Archive.jsx', tik_usage + '\n')
    archive.writestr('src/Portfolio.jsx', tik_example + '\n')
    archive.writestr('README.md', tik_readme)
print('Packaged', output / 'tik-tik-color-list.zip')

members_registry = registry.split("slug: 'hover-members'", 1)[1]
members_usage = re.search(r'  usage: `([\s\S]*?)`,', members_registry).group(1)
members_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', members_registry).group(1)
members_readme = '''# Hover Members

Independent React implementation. Requires React 18+, a CSS-aware bundler, Web Animations,
ResizeObserver, CSS container queries/units and modern Pointer Events. No motion packages.
Copy HoverMembers.jsx, HoverMembers.css and the entire hover-members/ font directory.
Thunder Black LC is included unmodified. Its original License.pdf permits personal and
commercial project use, prohibits modifying the font without the designer's permission,
and retains all other rights with the designer. Retain this license with the font.
Demo imagery is excluded. Supply your own appropriately licensed portraits.

## API
teamMembers: [] by default; each member has name and image, optional id and objectPosition.
Additional metadata is passed through to callbacks. Use stable ids when reordering data.
defaultName: OUR TEAM. Short headings work best; long text shrinks to fit.
height: 720px; numbers clamp to 320–1200, or supply a definite CSS height such as 100svh.
backgroundColor: #121212. textColor: #ffffff. hoverTextColor and cursorColor: #fb2c36.
showCursor: true. Pointer follower is hidden for touch and reduced motion.
onActiveChange(index, member): called on interaction changes, not initial mount.
  Both arguments are null when returning to the default heading.
onMemberSelect(index, member): click/tap/Enter/Space callback; no automatic navigation.
aria-label: Team members. className: optional additional root class.
Override the CSS custom property --hm-font-family to use another licensed typeface.

Portraits occupy 60px squares and grow to 120px over 200ms, reflowing their neighbors.
The portrait strip sits at 10% of stage height; it wraps on small containers.
Type is 28% of container width inside a 22%-wide-height clipping window, with long names fitted.
The center letter starts first (right-hand center for even lengths); each outward step
waits 55ms. Letter travel is 800ms with cubic-bezier(.19,1,.22,1).
The default heading exits upward. Member names arrive from below and exit downward.
Interrupted transitions continue from their current pose; only three visual layers are retained.
A 120px circle follows the pointer with a time-based lag and top-left anchoring.

Tab/focus reveals names. Arrow/Home/End keys browse members. Enter/Space activate callbacks.
Escape restores the heading. Touch taps toggle a member; tapping the blank background resets.
Reduced motion snaps lettering/portrait size and hides the follower. Missing images show
initials, empty arrays retain the default heading, and a single live heading exposes the
current text to assistive technology. Animated duplicates are aria-hidden.

The use client directive supports Next.js App Router. For Pages Router, move the CSS
import to pages/_app.jsx. Keep the font folder beside the stylesheet.
'''
with ZipFile(output / 'hover-members.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['HoverMembers.jsx', 'HoverMembers.css', 'hover-members/Thunder-BlackLC.otf', 'hover-members/License.pdf']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Team.jsx', members_usage + '\n')
    archive.writestr('src/Studio.jsx', members_example + '\n')
    archive.writestr('README.md', members_readme)
print('Packaged', output / 'hover-members.zip')

canvas_registry = registry.split("slug: 'infinite-canvas'", 1)[1]
canvas_usage = re.search(r'  usage: `([\s\S]*?)`,', canvas_registry).group(1)
canvas_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', canvas_registry).group(1)
canvas_readme = '''# Infinite Canvas

Independent React + CSS implementation. React 18+, CSS imports, ResizeObserver,
Pointer Events and CSS container query units are required. No motion package or paid registry.
Copy src/components/InfiniteCanvas.jsx and InfiniteCanvas.css into your project.
Demo images are excluded. Supply your own appropriately licensed media.

## API
images: optional array of URLs or {src, alt, id?, objectPosition?}. Overrides path generation.
imageRootPath: empty by default; otherwise generates sequential img1.png, img2.png, etc.
numberOfImages: 15, bounded 0–200, used only with imageRootPath.
imageSize: auto; 15% of component width at >=1024px, 45% below.
  Numbers mean pixels; CSS lengths are supported. vw units resolve against component width.
gap: 5vw, also used as tile padding; adjoining tiles therefore have a double-width gap.
columns: 5, bounded 1–12 and the number of images. Incomplete final rows repeat as-is.
height: 720; numbers clamp 240–1200px, or use a definite CSS height such as 100svh.
backgroundColor: #f5f4f3. borderRadius: 24, clamped 0–64px.
showControls: false; enable to show an interaction hint and Reset view button.
aria-label: Infinite image canvas. className: additional root class.

Images use object-fit:contain, preserving the full picture in each square cell.
The default showcase uses 15 images and five columns. Sizing is container-relative.
Image size is bounded below by max(24px, stage width/40, stage height/40), above by 2400px.
Gaps are bounded to 0–1200px. These limits keep tiny configurations from exploding the DOM.
Empty collections show an empty state; failed images have a fallback.

Wheel input moves one-for-one; mouse/touch dragging has a 2x gain. Input updates an
accumulated target with a 1500ms quintic ease-out. Release adds no extra velocity.
Pointer hover alone does nothing. The animation loop stops once settled and coordinates
are periodically rebased. A bounded bank of tiles covers both axes at every phase,
including tall mobile viewports. Resize preserves the current tile phase.

Input is captured only inside the stage. Shift-wheel pans horizontally; Ctrl/Command-wheel
and pinch zoom remain available to the browser. Pointer capture handles drags leaving the
stage and cancellation. Arrow keys move by one cell/gap; Page Up/Down pan 85% of stage
height. Home or Escape resets the origin. Tab leaves the canvas normally.
Reduced motion snaps to the target without easing. Only one copy of each image is exposed
to assistive technology; repeated tiles are aria-hidden. Supply descriptive alt text.

The use client directive supports Next.js App Router. With Pages Router move the CSS import
into pages/_app.jsx. No remote runtime asset or external service is built into the component.
'''
with ZipFile(output / 'infinite-canvas.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['InfiniteCanvas.jsx', 'InfiniteCanvas.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Collection.jsx', canvas_usage + '\n')
    archive.writestr('src/ImageArchive.jsx', canvas_example + '\n')
    archive.writestr('README.md', canvas_readme)
print('Packaged', output / 'infinite-canvas.zip')

drag_registry = registry.split("slug: 'drag-elements'", 1)[1]
drag_usage = re.search(r'  usage: `([\s\S]*?)`,', drag_registry).group(1)
drag_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', drag_registry).group(1)
drag_readme = '''# Drag Elements

Independent React + CSS implementation. React 18+, Pointer Events, ResizeObserver
and a CSS-capable bundler. No animation dependency, external service or paid registry.
Copy DragElements.jsx and DragElements.css into src/components.
MemoryBoard.jsx and BoundedLabels.jsx are self-contained examples without remote assets.
Demo photographs and the showcase font are intentionally excluded; bring licensed media.

## API
children: each direct child receives an independent, absolute-positioned wrapper.
  Give dynamic children stable keys. Child transforms/rotation stay intact.
height: 500 by default; pixels or a definite CSS height. style can override this.
style/className: root presentation. Padding controls the initial stack origin.
dragElastic: 0.5. Number 0–1, boolean (true=0.35/false=0), or per-side
  {left,right,top,bottom}. Omitted sides in an object use zero.
dragConstraints: defaults to the own container's inner bounds. Accepts an element ref
  or {left,right,top,bottom} translation limits relative to each starting position.
  Omitted object edges are unbounded. Oversized items pan between aligned edges.
dragMomentum: true. Photo examples disable it; label examples enable it.
dragTransition: {bounceStiffness:200,bounceDamping:300}; also supports power (0.8),
  timeConstant (750ms), restDelta (10px) and restSpeed (10px/s). Only these options
  are implemented; this is not a drop-in replacement for an animation-package API.
dragPropagation: true; false stops pointer-down propagation to ancestor wrappers.
selectedOnTop: true; selection/focus promotes a child above its siblings.
onDragEnd(index,{x,y}): once after a moved gesture, with release coordinates before settling.
aria-label: Draggable elements. Child aria-label/alt supplies the wrapper name.

Both release modes spring back from an elastic boundary. Momentum=false does not
coast inside the bounds. The default return is intentionally slow and overdamped.
Rotated child corners may escape the wrapper bounds. To clip elastic overshoot,
set overflow:hidden on an enclosing stage. Put your transforms on the child itself.

Keyboard: Tab to an item, arrows move 20px, Shift+arrows 80px, Home/Escape reset.
Reduced motion clamps immediately and disables release inertia. Native inputs,
editable content, media controls and data-drag-ignore descendants do not initiate
movement. Buttons can opt out with data-drag-ignore. Link taps still work, but actual
drags suppress accidental clicks. Use draggable={false} on images/videos. Pointer
capture handles outside release; cancellation and lost capture stop the gesture.
Resize clamps positions. Stable keys preserve positions on rerender/removal.
The animation loop runs only while something is settling. Listeners, observers
and the loop are cleaned up when unmounted. Each wrapper remains keyboard focusable.

Next.js App Router is supported by the use client directive. With Pages Router,
move the CSS import into pages/_app.jsx. The core inherits your font and colors.
'''
with ZipFile(output / 'drag-elements.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['DragElements.jsx', 'DragElements.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/MemoryBoard.jsx', drag_usage + '\n')
    archive.writestr('src/BoundedLabels.jsx', drag_example + '\n')
    archive.writestr('README.md', drag_readme)
print('Packaged', output / 'drag-elements.zip')

marquee_registry = registry.split("slug: 'marquee-along-svg-path'", 1)[1]
marquee_usage = re.search(r'  usage: `([\s\S]*?)`,', marquee_registry).group(1)
marquee_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', marquee_registry).group(1)
marquee_readme = '''# Marquee Along SVG Path

Independent React + CSS implementation. React 18+, CSS motion paths, Pointer Events,
ResizeObserver and IntersectionObserver. No animation dependency or remote media.
Copy src/components/MarqueeAlongSvgPath.jsx and .css into your project.
FlowingWords.jsx and ScrollRibbon.jsx are asset-free examples. Demo artwork is excluded.

Required props: children and path (an SVG d string).
viewBox defaults to 0 0 100 100; set it to your path coordinate bounds.
width/height default to 100%; give the root or its parent a definite height.
responsive=false uses native coordinates. True scales the complete plane including
children, with preserveAspectRatio='xMidYMid meet'. Min/Mid/Max, slice and none work.
Nonzero viewBox origins are translated. Resize preserves animation progress.
showPath=false shows a dashed guide when true; pathId defaults to a generated ID.

baseVelocity=5 percentage points per second, bounded -100..100.
direction=normal (or reverse). repeat=3, bounded 1..20.
easing is an optional function mapping wrapped progress 0..1 to 0..1.
slowdownOnHover=false, slowDownFactor=0.3, bounded 0..1.
slowDownSpringConfig={damping:50,stiffness:400}; mass is also supported.
useScrollVelocity=false, scrollAwareDirection=false.
scrollContainer accepts an element or ref; a null ref falls back to window.
scrollSpringConfig has the same spring defaults. Speed gains 5x base speed per
1000px/s of smoothed absolute scroll velocity; direction can follow the scroll sign.
draggable=false, grabCursor=false. Horizontal drag moves the whole ribbon.
dragSensitivity=0.2 percentage points per viewport pixel, bounded 0..2.
dragVelocityDecay=0.96 (per 60Hz frame, converted to elapsed-time decay).
  Zero disables release coasting; values are bounded 0..0.999.
dragAwareDirection=false; true keeps the latest drag direction for base travel.
enableRollingZIndex=true, zIndexBase=1, zIndexRange=10.
cssVariableInterpolation=[]: objects {property,from,to} interpolate unitless numeric
  CSS properties or custom variables against eased progress. Use CSS calc() for lengths.
paused=false externally stops autoplay; showControls=false adds Pause/Resume and Reset.
className/style customize the root; aria-label names the region.

Use stable child keys and put size/style/transforms on the children, not .msp-item.
Images should set draggable={false}. Repeated content must avoid unique DOM IDs.
On open paths, elements wrap from the final point to the first; hide this with endpoints
outside an overflow:hidden stage. Closed paths can loop seamlessly. Increasing repeat
reduces spacing; it does not extend the path. Native offset-rotate follows its tangent.

Tab to the root pauses animation. Left/Right move 2%, Shift moves 10%, Home/Escape reset,
Space toggles pause; Tab leaves normally. Reduced motion stops autoplay/inertia but keeps
manual movement. First copies retain accessible children; duplicates are aria-hidden
and their interactive descendants have tabindex=-1. Input/media opt-outs can use
 data-drag-ignore. Native form controls do not initiate dragging. Actual drags suppress
accidental link navigation. Vertical touch scrolling is not blocked. Pointer cancellation
and capture outside the stage are supported. Animation stops offscreen, while hidden,
or when paused; all observers/listeners/frames are cleaned up on unmount.

The public showcase explicitly uses velocity=8, repeat=2, dragSensitivity=0.1 and
responsive=true. Its hover artwork enlargement is demo styling, not core behavior.
Next.js App Router is supported by use client. Pages Router should import CSS in _app.jsx.
'''
with ZipFile(output / 'marquee-along-svg-path.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['MarqueeAlongSvgPath.jsx', 'MarqueeAlongSvgPath.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/FlowingWords.jsx', marquee_usage + '\n')
    archive.writestr('src/ScrollRibbon.jsx', marquee_example + '\n')
    archive.writestr('README.md', marquee_readme)
print('Packaged', output / 'marquee-along-svg-path.zip')

gradient_registry = registry.split("slug: 'gradient-ascii'", 1)[1]
gradient_usage = re.search(r'  usage: `([\s\S]*?)`,', gradient_registry).group(1)
gradient_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', gradient_registry).group(1)
gradient_readme = '''# Gradient ASCII

An independent React + WebGL implementation of an animated ASCII light field.
No third-party component source, fonts, images or rendering libraries are bundled.

## Install
Copy src/components/GradientASCII.jsx and GradientASCII.css into a React 18+ app.
Use AsciiHero.jsx or LightWash.jsx as a starting point. The component includes a
use client directive. In Next.js Pages Router, move the CSS import to _app.jsx.

Give the parent an explicit height. Use a relative parent and absolute component
for a background layer, with real HTML text and controls above it. The output is
transparent: choose a dark parent by default, or a pale one with lightMode.
The canvas is decorative/aria-hidden, not an accessible replacement for copy.

## Props (defaults)
colors: ['#1e3fd8','#f6f8ff','#a5d8ff','#38bdf8']; 2–8 valid CSS colors.
shape: 'horizon'; also 'pinch', 'rise', 'eclipse'.
characters: ' =+xX0S8#@'; ordered dim to bright, up to 128 Unicode code points.
  Empty string hides glyphs. A leading space supplies negative space.
cellSize: 18 CSS pixels; bounded 8–80, cell width = .62 * height.
density: .8, glyphOpacity: .85, gradientOpacity: .9; bounded 0–1.
  Zero density removes characters, zero gradient opacity leaves glyphs alone.
glow: .2 (0–1.5), depthOfField: 0 (0–1), flicker: .2 (0–1).
softness: .5 (0–1), scale: 1 (.4–2.5), flow: .5 (0–2).
speed: 1 (0–5); zero stops shape drift, not glyph flicker/interaction effects.
grain: .08 (0–.4), variation: 0 (-10000–10000).
mouseInteraction: true; pointer motion leaves a short-lived scramble trail.
scrambleRadius: .1 (.01–.5), relative to parent height.
clickEffect: 'wave'; 'burst' creates a local patch, 'none' disables clicks.
intro: true; source-led reveal and glyph decoding over 2.8 seconds.
lightMode: false; darker glyphs on a light parent. Does not change the page theme.
fontFamily: system monospace stack. Use an already-loaded font if desired.
dpr: current device ratio, capped at 2; optional cap .5–2.
paused: false; freezes all clocks and pointer effects. Initially paused shows
  a fully revealed field. Pausing during the reveal freezes its current state.
className/style: container presentation.

## Behavior and resilience
The renderer uses one draw call and a generated 512x384 glyph atlas. No remote
assets are requested. Render size is capped at eight million pixels and GPU limits.
Reduced motion skips the intro and renders a static field, without cursor effects.
Hidden tabs and offscreen backgrounds suspend frames and preserve animation time.
Observer/listener/RAF/GPU resources are cleaned up on unmount. Props update the
same renderer; loaded fonts refresh the atlas. A static blue gradient matching
the selected shape appears if WebGL is unavailable or its context is lost;
restoring the context initializes a new renderer. The fallback is not ASCII.

The canvas ignores pointer events and observes its parent without preventing
native actions. Links, buttons, form fields, contenteditable and data-ascii-ignore
regions are excluded from effects. Touch moves never create hover trails; taps
can trigger click effects, and vertical scrolling remains native. At most twelve
trail samples and four simultaneous clicks are retained.

Invalid numbers/colors/shapes are bounded or replaced with safe defaults. No
component-level theme toggle or library theme dependency is included.
'''
with ZipFile(output / 'gradient-ascii.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['GradientASCII.jsx', 'GradientASCII.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/AsciiHero.jsx', gradient_usage + '\n')
    archive.writestr('src/LightWash.jsx', gradient_example + '\n')
    archive.writestr('README.md', gradient_readme)
print('Packaged', output / 'gradient-ascii.zip')

flex_registry = registry.split("slug: 'flex-carousel'", 1)[1]
flex_usage = re.search(r'  usage: `([\s\S]*?)`,', flex_registry).group(1)
flex_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', flex_registry).group(1)
flex_readme = '''# Flex Carousel

An independent React + native WebGL infinite image gallery with a continuous
lens deformation, inertial navigation and inline click-to-focus. No third-party
component source or renderer package is bundled.

## Install
Copy src/components/FlexCarousel.jsx and FlexCarousel.css into a React 18+ project.
Supply your own image paths in FlexGallery.jsx, or pass projects to PortfolioGallery.
The showcase photographs are not included. No ogl, Three.js or motion package is needed.
Next.js App Router is supported with use client. For Pages Router, move the CSS
import to _app.jsx. Set an explicit parent height, e.g. 540px; the gallery fills it.

## Props
items=[]: up to 50 {src,alt?,title?,subtitle?,id?} objects. Use stable IDs and
  descriptive alt text. Natural fit uses loaded image dimensions. Empty arrays
  show a message, failed/CORS-blocked images show a named placeholder.
preset='liquid': liquid, ribbon, vortex, arch. Explicit lens props override it.
intro='rise': rise, bloom, spin, deal, none. An independent 1.5-second entrance
  after images settle; first input skips it. A new component mount replays it.
fit='natural': natural, portrait (3:4), square, landscape (4:3).
cardHeight=.5: fraction of stage height, .15–.85. gap=12, radius=0: 0–80px.
lensWidth/lensHeight: .2–1.6 and .2–2, relative to stage width; preset defaults.
tilt: -180–180 degrees. roundness: 0–1 (rounded rectangle to ellipse).
bend: 0–.9. reach: .05–.9. curl: twist, rise, fall. All default to preset values.
dispersion: 0–1.5, preset default. liquid: 0–1.5, default 0 in every preset.
followCursor=false: softly follow the pointer, returning on exit.
squeeze=.2: movement-dependent scale reduction, 0–.6.
focusOnClick=true: side-card clicks center first; selecting the centered image
  focuses it. Other images part/fade; bend relaxes and the image grows or fits
  within 86% of stage width. Click, drag, wheel, Escape or navigation closes it.
autoplay=false, interval=4: advance one image every 1–30 seconds.
  Pauses on hover, focus, interaction, inline focus, hidden/offscreen and reduced motion.
captions=true: title, subtitle and rolling counter below the row.
captureWheel=true: vertical wheel navigation. Horizontal/Shift-wheel always works.
onChange(index,item): emitted on a different centered item; not on initial load.
onSelect(index,item): selecting the centered item, even with focusOnClick=false.
initialIndex=0: initial item, clamped, read on first load.
showControls=false: Previous/Next, a Close button in focus, and Pause/Play if autoplay.
paused=false: pause autoplay externally; manual input still works.
pixelRatio=1.5: cap .5–2, additionally bounded by GPU limits and 8M render pixels.
className/style/aria-label: root styling and accessible carousel name.

Preset lens values:
liquid: width .74, height 1.18, tilt 62, roundness 1, bend .34, reach .38,
  curl twist, dispersion .45.
ribbon: width .8, height .8, tilt 0, roundness 1, bend .34, reach .34,
  curl twist, dispersion .4.
vortex: width .7, height .95, tilt 30, roundness 1, bend .46, reach .3,
  curl twist, dispersion .5.
arch: width .8, height .8, tilt 0, roundness 1, bend .3, reach .36,
  curl rise, dispersion .4.

## Input and accessibility
Focus the region, then use Left/Right, Home/End, Enter/Space and Escape. Cards
also have named native buttons for assistive navigation. The canvas is decorative;
titles/counters are hidden from assistive technology and a polite live region
announces the centered image. Inline focus does not lock the page or trap focus.
Horizontal touch drags use capture only after intent is clear. Vertical touch
scrolling and Ctrl/Meta wheel zoom remain native. Add data-flex-ignore to custom
controls. Turn captureWheel off if vertical scrolling should stay with the page.

Reduced motion skips intro, inertia, cursor following and autoplay; manual
navigation and inline focus settle immediately. Idle/offscreen/hidden galleries
stop rendering. Resize keeps the current item and its relative scroll position.
Without WebGL, or while a context is lost, a straight DOM gallery retains the
navigation/focus controls. Restoration rebuilds the WebGL textures and mesh.

The original mesh uses 40x12 subdivisions per visible image, with shared stage
coordinates for the lens. Only nearby repeated images are drawn. Textures are
bounded to 1100px on their longest edge. Use compressed images on a host allowing
cross-origin texture access. Image loads time out to a placeholder after 12 seconds.
Listeners, observers, pending image handlers, GPU resources, animation frames and
autoplay timers are released on unmount. The renderer is an independent visual
approximation, not a redistribution of the reference implementation.
'''
with ZipFile(output / 'flex-carousel.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['FlexCarousel.jsx', 'FlexCarousel.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/FlexGallery.jsx', flex_usage + '\n')
    archive.writestr('src/PortfolioGallery.jsx', flex_example + '\n')
    archive.writestr('README.md', flex_readme)
print('Packaged', output / 'flex-carousel.zip')

# Dither Veil is independent and self-contained; demonstration media stays in the app.
veil_registry = registry.split("slug: 'dither-veil'", 1)[1]
veil_usage = re.search(r'  usage: `([\s\S]*?)`,', veil_registry).group(1)
veil_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', veil_registry).group(1)
veil_readme = '''# Dither Veil

An independently written React image reveal using Canvas 2D and native WebGL.
No renderer package, copied reference code, remote font or bundled image is required.

## Install

Copy DitherVeil.jsx and DitherVeil.css from src/components/ into a React 18+ project.
Use VeiledImage.jsx or ReverseVeil.jsx as a starting point. Give the parent an explicit
height (e.g. 600px). The component fills the parent; add rounding and overflow:hidden there.
Supply your own appropriately licensed image. Demo media is not included in this archive.

Same-origin images and image data URLs work without extra server setup. Remote image hosts
must allow anonymous CORS requests so the image can be processed and uploaded to WebGL.
Use compressed raster images; use a still frame for animated media.

Next.js App Router supports the included use client directive. For Pages Router, move the
CSS import into pages/_app.jsx. All browser work is deferred until mount; the component is
safe to render on the server with a loading placeholder.

## Props

- src: image source, default ''. Empty sources display a placeholder.
- alt: accessible image description, default 'Interactive dithered image'.
- fit: contain (default) or cover. Contain adds ink-colored space; cover center-crops.
- pattern: floyd (default), bayer, noise, atkinson or lines.
- palette: duotone (default) or rgb. Duotone uses a print-like 1.5-power luminance curve
  before contrast/brightness and maps the result between ink and paper. RGB quantizes
  each original channel independently. Revealed original colors are never adjusted.
- pixelSize: 2. Target CSS cell size, bounded 1–20. Budget limits may increase it.
- levels: 2. Tones per channel, rounded and bounded 2–8.
- inkColor: '#120f17'. Dark duotone and contain background color.
- paperColor: '#f4f1ea'. Light duotone color. RGB mode does not use the duotone ramp.
- contrast: 1.15. Pre-dither contrast, bounded 0–3.
- brightness: 0. Pre-dither tone/channel offset, bounded -1–1.
- revealRadius: 200. Manual/wandering radius in CSS px, bounded 0–1000.
  Zero hides these windows; click ripples are independent.
- softness: 0.6. Dissolving fraction of the radius, bounded 0–1. Zero gives a hard edge.
- linger: 1. Trail lifetime in seconds, bounded 0–5. Zero disables the trail.
- rimColor: '#a78bfa'. Color of cells along the transition edge.
- rim: 0. Colored-cell band thickness, bounded 0–1. Zero hides it.
- reverse: false. Start with the original and reveal dither instead.
- wander: false. Drift a reveal window while there is no manual pointer/keyboard window.
- clickBurst: true. Click, tap, Enter or Space sends an expanding reveal ring.
- paused: false. Hold the last autonomous wandering position. Manual reveals, lingering
  trails and short click ripples still work. Provide a pause control when enabling wander.
- pixelRatio: 1.5. Maximum rendering DPR, bounded 0.5–2 and the device's DPR.
- className: ''. Additional root class.
- style: optional root inline styles.

Colors accept canvas-compatible CSS colors and render as opaque RGB.
Invalid numeric values and unknown enum values fall back to documented defaults.

## Dithering and rendering

Floyd–Steinberg and Atkinson are genuine serpentine error-diffusion passes, performed only
when image, dimensions, pixel size, palette or tonal settings change. Bayer is a conventional
8x8 ordered threshold matrix. Noise uses a deterministic progressive farthest-point tile
on a periodic 32x32 domain; lines use diagonal engraving bands. The reveal edge uses an
ordered cell threshold, not a blur applied to the original image.

A small Canvas field holds the union of radial windows. One WebGL draw composites the
original, cached dither and this field. Trails retain at most 32 sampled positions, and
at most four overlapping click rings are retained. Dither processing is bounded to roughly
600,000 cells and rendering to four million pixels and a maximum 4096px/GPU texture side.
For exceptionally large frames the effective CSS cell size increases to stay within budget.
An active reveal stays sharp at the configured render DPR, not at the dither resolution.

## Input and accessibility

Move the pointer or touch the image to reveal. The region is named by alt and has concise
screen-reader instructions. Tab to the image, then use arrows (24px) or Shift+arrows (64px).
Home recenters. Enter/Space ripples if enabled. Escape clears all windows and suspends
wandering until another interaction or wandering/pause setting change. Focus is never trapped.
Vertical touch scrolling, mouse wheels and browser zoom remain native.

Reduced-motion preference preserves immediate direct reveals but removes trails, click
ripples and wandering. Idle frames stop; hidden tabs and offscreen instances suspend rendering
and clear manual interactions. Pause wandering freezes its last position rather than blanking it.

No WebGL, a shader failure or a lost context switches to an interactive Canvas 2D renderer
with the same patterns and reveal behavior. Restoring the context rebuilds GPU resources.
If image processing cannot access pixels, an ordinary image is shown when it can load, with
an explanatory note. Broken sources show a named placeholder; image requests have a 12s timeout.
Frames, observers, event listeners, in-flight image handlers, timers and GPU resources are
cleaned up on unmount. Dynamic source changes invalidate stale load callbacks.

Independent implementation of the public visual interaction at
https://reactbits.dev/animations/dither-veil. No React Bits source is redistributed.
'''
with ZipFile(output / 'dither-veil.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['DitherVeil.jsx', 'DitherVeil.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/VeiledImage.jsx', veil_usage + '\n')
    archive.writestr('src/ReverseVeil.jsx', veil_example + '\n')
    archive.writestr('README.md', veil_readme)
print('Packaged', output / 'dither-veil.zip')

# Scroll Expand packages the reusable core only; the demo media is generated in-house.
expand_registry = registry.split("slug: 'scroll-expand'", 1)[1]
expand_usage = re.search(r'  usage: `([\s\S]*?)`,', expand_registry).group(1)
expand_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', expand_registry).group(1)
expand_readme = '''# Scroll Expand

An independently implemented React component that expands a small media frame to full
bleed as the reader scrolls. No scroll library, animation package or copied reference
source is included, and the reusable core ships without any media assets.

## Install

Copy src/components/ScrollExpand.jsx and ScrollExpand.css into a React 18+ app, then use
src/MediaStage.jsx or src/PinnedStage.jsx as a starting point.

Give the component a definite height. In the default scroller mode it fills its parent
(height:100%), so wrap it in a section with an explicit height such as 520px or 100vh.
When the parent cannot define one, pass stageHeight. The component measures that height
and adds the expansion length and hold to build its own scroll track.

Set useWindowScroll to drive the same expansion from the page scroll instead. The section
is then content-sized: the sticky stage keeps the frame pinned while the track provides
the expansion distance, and the section releases once the hold ends.

## Props

- src: ''. Image or video URL. An empty source renders a labelled placeholder and skips
  the scroll listeners entirely.
- mediaType: 'image' | 'video', default 'image'. Video is muted, looping and inline, and
  pauses while reduced motion is set or the section is offscreen.
- poster: ''. Poster frame shown while a video loads.
- alt: ''. Alt text for the media and the accessible name of the region.
- title: ''. Headline held over the frame at rest; it lifts and fades as the frame opens.
- scrollHint: ''. Cue under the resting frame; fades out as soon as scrolling starts.
- startWidth / startHeight: 42 / 58. Resting frame size as a percentage of the stage,
  each bounded 10-100.
- startRadius / endRadius: 24 / 0. Corner radius in px at rest and at full bleed,
  bounded 0-48.
- mediaZoom: 1.35. Media scale at rest, bounded 1-2.5, easing back to 1 as the frame opens.
- scrollDistance: 1.2. Expansion length in multiples of the stage height, bounded 0.4-3.
- holdDistance: 0.35. Extra pinned scroll at full bleed, bounded 0-1.5 stage heights.
- smoothing: 0.1. Follow time in seconds, bounded 0-0.4. Zero locks the frame to the
  scrollbar; the frame always converges instead of drifting behind.
- overlayScrim: 0.45. Gradient scrim strength, bounded 0-1.
- useWindowScroll: false. Pin to the page scroll rather than the component scroller.
- enabled: true. When false the frame rests at its start size, listeners are removed and
  the track collapses.
- focusPoint: '50% 50%'. object-position used when the media is cropped.
- stageHeight: 0. Fixed stage height in px. Zero derives it from the parent height in
  scroller mode, or 64vh capped at 640px in page-scroll mode.
- onProgress: called with { progress, target, phase } when the smoothed value moves or
  the phase changes. Phases: rest, expanding, open, complete, static, placeholder.
- children: overlay content revealed at full bleed. Direct children receive heading and
  body styling; override it with your own classes.
- className, style: root class and inline styles, including inherited color.

## Accessibility and performance

Reduced motion removes smoothing and stops looping video while the scroll mapping stays
available. Offscreen sections and hidden tabs stop measuring and pause playback. The
scroller is focusable and labelled, the region is described by its scroll hint, and the
scrim is hidden from assistive technology. Every listener, observer, animation frame and
media handler is released on unmount, including StrictMode effect replay.

Preview-only controls (the progress readout and reset button in this site) are not part
of the component. The study\'s demo media is generated in-house and is intentionally not
included in this archive; add your own assets and descriptions.

Independent interpretation of the public visual reference at
https://reactbits.dev/animations/scroll-expand. No React Bits source is redistributed.
'''
with ZipFile(output / 'scroll-expand.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['ScrollExpand.jsx', 'ScrollExpand.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/MediaStage.jsx', expand_usage + '\n')
    archive.writestr('src/PinnedStage.jsx', expand_example + '\n')
    archive.writestr('README.md', expand_readme)
print('Packaged', output / 'scroll-expand.zip')

# Passage Gallery packages the reusable core only; the demo scene collection is
# generated in-house and is intentionally excluded from the archive.
passage_registry = registry.split("slug: 'passage-gallery'", 1)[1]
passage_usage = re.search(r'  usage: `([\s\S]*?)`,', passage_registry).group(1)
passage_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', passage_registry).group(1)
passage_readme = '''# Passage Gallery

An independently implemented React component that draws an endless corridor of photos on
a canvas 2D context and glides the camera through it. No 3D library, animation package,
shader or copied reference source is included, and the reusable core ships without any
image assets.

## Install

Copy src/components/PassageGallery.jsx and PassageGallery.css into a React 18+ app, then
use src/Hero.jsx or src/Archive.jsx as a starting point. The gallery fills its parent and
keeps a 420px minimum height, so give the parent a definite height, such as 100vh.

Photos are passed as items. Each entry takes a src, an alt and an optional title, which
is used by the caption. Remote images must allow cross-origin loading, because their
pixels are drawn into the canvas; add crossOrigin support or host them yourself.

## Props

- items: { src, alt, title? }[]. Photos placed across the four corridor faces. Without
  items, the gallery still renders its grid and any accent tiles.
- colors: ["#5227FF", "#FF9FFC"]. The two ends of the gradient used for accent tiles.
- backgroundColor: "#0a0a0a". Colour of the walls and of the distance the tunnel fades
  into. Grid lines adapt to its luminance, and "transparent" shows the page behind.
- lanes: 5. Horizontal tiles across the floor and ceiling, bounded 2-12. The wall-row
  count is stepped rather than equal to the horizontal count: 1-5 maps to 2 rows, 6-7
  to 3, 8-9 to 4, 10-11 to 5 and 12 to 6. Every tile remains square.
- gap: 0.1. Space between tiles as a fraction of a lane, bounded 0-0.4.
- radius: 0.06. Corner rounding as a fraction of the tile, bounded 0-1.
- photoFill: 0.3. Share of cells holding a photo, bounded 0-1.
- accentFill: 0.06. Share of cells holding a gradient accent, bounded 0-1.
- lineOpacity: 0.12. Opacity of the hairline grid, bounded 0-0.6. 0 removes it.
- fog: 1. How quickly the tunnel fades into the background with distance, bounded 0.2-3.
  Lower values keep colour deeper into the corridor.
- speed: 0.6. Cruising rate, bounded -2 to 4. It advances about 0.72 lanes per second
  for every unit; negative values travel backwards and 0 stays still.
- boost: 10. Speed multiplier while the pointer is held down, bounded 1-20.
- blur: 1. Strength of the motion smear at high speed, bounded 0-3.
- look: 1. How far the camera turns and shifts toward the pointer, bounded 0-3.
- fov: 72. Vertical field of view in degrees, bounded 40-100.
- hover: 1. Photo-only centre growth and brightening under the pointer, bounded 0-2.
- focusOnClick: true. Clicking a photo brings it out of the wall to full view; clicking
  again or pressing Escape puts it back.
- captions: true. Title and position of the opened photo, announced politely.
- wheel: true. Scroll to travel. Scrolling while a photo is open puts it back and moves
  on. Set false to leave page scrolling untouched.
- interactive: true. Pointer look, dragging, holding and clicking.
- seed: 0. Changes which cells hold photos and accents.
- paused: false. Stops cruising while dragging, holding and the keyboard keep working.
- dpr: 2. Maximum device pixel ratio for the backing store, bounded 0.5-3.
- ariaLabel: accessible description of the gallery and how to use it.
- onFocusChange: called with the opened item and its index, or null and -1.
- ref: imperative controls. close() puts an opened photo back, travel(cells) pushes the
  camera, and reset() returns to the entrance.
- children: centred over the tunnel and still interactive.
- className, style: root class and inline styles.

## How it works

Each frame the camera's travel position advances by the effective speed, the pointer adds
a smoothed yaw, pitch and lateral offset, and the tile ring in front of the camera is
projected with a plain perspective divide and painted back to front with distance fog.
Which cells hold photos, accents or nothing is a hash of the cell, face and seed, so a
corridor tile keeps its content as you pass it. The tile under the pointer is found by
projecting the visible tiles and testing the point against each quad, nearest first, so
there is no picking buffer. Photos on angled quads are drawn as a fan of triangles with
overlapping edges so the seams cannot show.

Motion blur at speed redraws the same frame at small depth offsets with reduced coverage
rather than running a post-processing pass.

## Accessibility and performance

The canvas is a focusable region described by ariaLabel, with a visually hidden list of
every photo. Arrow keys travel a cell, Page Up and Page Down jump a lane, Home returns to
the entrance, Enter opens the nearest photo and Escape puts it back. Reduced-motion users
never cruise, drag or smear, and offscreen instances and hidden tabs stop their animation
frame. Every listener, observer, frame and image handler is released on unmount, including
StrictMode effect replay. The backing store is capped by dpr and the current device ratio.

The demo scene collection in the study is generated in-house (
`scripts/passage-gallery-scenes.py`) and is intentionally not included in this
archive; add your own photos and descriptions.

Geometry notes measured against the reference: cells are one lane deep and tiles are
one-lane squares. The horizontal count is `lanes`; vertical wall rows follow the
stepped 1-5→2, 6-7→3, 8-9→4, 10-11→5, 12→6 mapping. The fills are weighted
(photoFill^0.62) and empty tiles stay black; hover grows a photo about its centre by
8% per unit and brightens it 29%; the visible depth is 27 / fog lanes.

Independent interpretation of the public visual reference at
https://pro.reactbits.dev/docs/components/passage-gallery. No React Bits source is
redistributed.
'''
with ZipFile(output / 'passage-gallery.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['PassageGallery.jsx', 'PassageGallery.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Hero.jsx', passage_usage + '\n')
    archive.writestr('src/Archive.jsx', passage_example + '\n')
    archive.writestr('README.md', passage_readme)
print('Packaged', output / 'passage-gallery.zip')

# Dome Gallery packages the reusable core only; the local demo scenes are generated
# in-house and deliberately stay outside the source archive.
dome_registry = registry.split("slug: 'dome-gallery'", 1)[1]
dome_usage = re.search(r'  usage: `([\s\S]*?)`,', dome_registry).group(1)
dome_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', dome_registry).group(1)
dome_readme = '''# Dome Gallery

An independently implemented React image gallery that arranges a compact set of images
across a dense, draggable hemisphere. It uses ordinary React, scoped CSS and native
Pointer Events — no 3D engine, gesture package or copied reference source. The archive
contains no demo photographs or remote assets.

## Install

Copy `src/components/DomeGallery.jsx` and `DomeGallery.css` into a React 18+ app, then
render it inside a parent with a definite height. `src/Hero.jsx` and
`src/ArchiveDome.jsx` are starting points. A 420px-or-taller parent gives the full dome
enough room, though the component also scales down for smaller embedded panels.

Pass image strings or objects with `src` and a useful `alt`. The supplied collection is
intentionally repeated over the surface, so a small, well-described image set produces
a full field. When no valid images are passed, the component uses self-contained abstract
fallback artwork rather than fetching a resource.

## Props

- `images`: `(string | { src: string, alt?: string })[]`, default built-in abstract
  studies. Source images repeated across the dome.
- `fit`: `0.5`, bounded `0.1–2`. Scales the radius derived from the chosen container
  dimension.
- `fitBasis`: `'auto' | 'min' | 'max' | 'width' | 'height'`, default `'auto'`. The
  dimension used by `fit`; auto and min select the smaller side.
- `minRadius`: `600`, bounded `80–4000`. Lower radius limit in pixels.
- `maxRadius`: `Infinity`. Optional upper radius limit; finite values are constrained
  between minRadius and 8000px.
- `padFactor`: `0.25`, bounded `0–0.48`. Padding allowance before the radius is fitted.
- `overlayBlurColor`: `'#120F17'`. Colour behind and around the soft edge veil.
- `maxVerticalRotationDeg`: `5`, bounded `0–30`. Vertical drag limit; zero creates a
  horizontal-only view.
- `dragSensitivity`: `20`, bounded `2–100`. Pixels per degree; a larger number feels
  slower.
- `enlargeTransitionMs`: `300`, bounded `0–1600`. Open/close transition duration.
- `segments`: `35`, bounded `12–64`. Horizontal density of the repeated field.
- `dragDampening`: `2`, bounded `0–5`. Inertia settling strength after release.
- `openedImageWidth`, `openedImageHeight`: `'400px'`. CSS size strings or numbers for
  the enlarged frame.
- `imageBorderRadius`, `openedImageBorderRadius`: `'30px'`. CSS radii for closed and
  enlarged images.
- `grayscale`: `true`. Set false to keep source image colours.
- `ariaLabel`: `'Dome image gallery'`. Accessible name for the interactive gallery.
- `className`, `style`: optional root styling hooks.
- `ref`: imperative `reset()`, `close()` and `rotate(x, y)` controls.

## Interaction, accessibility and performance

Drag the gallery or use Left/Right arrow keys to turn it. Click a visible image to bring
it forward; Escape or clicking the backdrop closes it. Each available tile is a native
button with an accessible label, while the stage is a labelled, focusable image-gallery
region. The selected image is a modal dialog with its own descriptive alt text.

The projection is recalculated from the stage size with ResizeObserver. Inertia uses one
requestAnimationFrame loop only while it has velocity, and is cancelled on reset or
unmount. The component preserves direct manipulation under reduced motion but removes
open/close animation timing. It server-renders the stage scaffold without accessing
browser globals.

Independent interpretation of the publicly observable interaction at
https://reactbits.dev/components/dome-gallery. No React Bits source or demo media is
redistributed.
'''
with ZipFile(output / 'dome-gallery.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['DomeGallery.jsx', 'DomeGallery.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Hero.jsx', dome_usage + '\n')
    archive.writestr('src/ArchiveDome.jsx', dome_example + '\n')
    archive.writestr('README.md', dome_readme)
print('Packaged', output / 'dome-gallery.zip')

# Paper Crumple packages the standalone Canvas 2D core; demo textures stay local to the site.
paper_registry = registry.split("slug: 'paper-crumple'", 1)[1]
paper_usage = re.search(r'  usage: `([\s\S]*?)`,', paper_registry).group(1)
paper_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', paper_registry).group(1)
paper_readme = '''# Paper Crumple

An independently implemented React + Canvas 2D paper interaction. Hold an image to gather
it into a lit, seeded polygonal paper wad; drag while holding, then choose whether release
restores the page, leaves it crumpled, or keeps a faint network of creases. No 3D renderer,
physics engine, gesture package, copied reference source, demo image or remote API is in
this archive.

## Install

Copy `src/components/PaperCrumple.jsx` and `PaperCrumple.css` into a React 18+ app, then
use `src/FieldNote.jsx` or `src/CrumpledArchive.jsx` as a starting point. Pass an image
URL in `src`, useful alternative text, and leave enough parent height for the sheet to move.
The default scene is 360px tall; `style={{ height: ... }}` overrides `sceneHeight`.

The Canvas 2D API draws the supplied image. Use same-origin files or a remote image server
that sends CORS headers. If an image or canvas context is unavailable, the original image
remains as an ordinary fallback and `onError` receives the error.

## Props

- `src`: required image URL for the front of the sheet; PNG transparency is preserved.
- `alt`: `'Crumplable image'`; fallback description and accessible control name.
- `backSrc`: `''`; optional image for reverse-facing fold facets.
- `width` / `height`: `312` / `312`; unfolded pixels, each scaled down to leave a 24px
  stage inset and bounded 80–1600 / 80–1800.
- `sceneHeight`: `360`; stage height, bounded 180–1400. Inline style height wins.
- `imageFit`: `'contain'` (or `'cover'`); image fitting in the material texture.
- `releaseBehavior`: `'restore'` (or `'stay'`, `'creased'`).
- `crumpleAmount`: `0.85`, bounded 0–1; held compression.
- `crumpleDuration` / `releaseDuration`: `0.55` / `0.4` seconds, bounded 0–4. Zero is
  immediate.
- `foldCount`: `6`, bounded 3–16; seeded crease-guide count.
- `foldSharpness`: `0.6`, bounded 0–1; rounded-to-angular facet blend.
- `wrinkleDepth`: `0.65`, bounded 0–2; compression/facet relief.
- `creaseStrength`: `0.18`, bounded 0–1; residual lines when releaseBehavior is creased.
- `paperColor`: `'#f4f0e8'`; fallback/unprinted paper colour.
- `roughness` / `paperTexture`: `0.92` / `0.08`, each bounded 0–1; matte shadow and fine
  grain strength.
- `lightIntensity` / `lightAngle`: `1.8` / `-35`; fold facet lighting, bounded 0–4 and
  -180–180 degrees.
- `shadow`: true and `shadowOpacity`: `0.16`, bounded 0–1.
- `draggable`: true; direct manipulation while held.
- `dragRotation`: `10`, bounded 0–30 degrees; tilt during drag.
- `dragRadius`: `180`, bounded 0–600; maximum resting offset per axis.
- `returnToOrigin`: true; restore/creased modes return to center. Stay preserves offset.
- `rotation`: `0`, bounded -180–180 degrees; initial flat-page rotation.
- `seed`: `7`, bounded 0–9999; repeatable crease/facet/grain arrangement.
- `detail`: `64`, bounded 32–96; visual facet density.
- `disabled`: false; finishes interaction and prevents pointer/keyboard controls.
- `resetKey`: `0`; changing it immediately clears position, crumple and residual creases.
- `onStateChange`: lifecycle callback for holding, flat, crumpled, creased and releasing.
- `onError`: image/canvas error callback.
- `className`, `style`: optional root hooks.
- `ref`: optional `reset()` and `release()` helpers.

## Interaction, accessibility and performance

The visible sheet has a native button control. Pointer press begins the hold; pointer capture
keeps dragging reliable. Space or Enter holds, arrow keys move the sheet (Shift moves 24px),
and Escape resets it. Direct manipulation remains available under reduced motion, but
settling becomes immediate. All animation happens in one requestAnimationFrame loop and
stops at rest; observers, pointer capture and frames are cleared on unmount.

The component server-renders a labelled hold control and a normal image fallback without
accessing browser globals. Canvas visual output is hidden from assistive technology so the
image description is not duplicated.

Independent interpretation of the publicly observable interaction at
https://reactbits.dev/micro/paper-crumple. No React Bits source or demo media is
redistributed.
'''
with ZipFile(output / 'paper-crumple.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['PaperCrumple.jsx', 'PaperCrumple.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/FieldNote.jsx', paper_usage + '\n')
    archive.writestr('src/CrumpledArchive.jsx', paper_example + '\n')
    archive.writestr('README.md', paper_readme)
print('Packaged', output / 'paper-crumple.zip')

# Viscose Carousel integrates the upstream MIT-licensed renderer. The original
# source relies on support modules, shader code, and local project media, so the archive
# deliberately ships the complete adapted source tree and required notices.
viscose_registry = registry.split("slug: 'viscose-carousel'", 1)[1]
viscose_usage = re.search(r'  usage: `([\s\S]*?)`,', viscose_registry).group(1)
viscose_readme = """# Viscose Carousel

This archive integrates the original **Viscose Carousel** source by **Yousuf Soomro**.
Copyright © 2026 Yousuf Soomro. It is released under the MIT License; retain the included
`licenses/Viscose-MIT-LICENSE.txt` and `THIRD_PARTY_NOTICES.md` when redistributing.

- Upstream: https://github.com/Yousuf-developer/Viscose-carousel
- Integration changes: Vite-compatible imports, component-scoped stage CSS, system-font
defaults, locally generated replacement art, and a reduced backing resolution only when a
software WebGL renderer is detected.

## Important asset boundary

The upstream MIT license covers source code, not the upstream `public/` files. This archive
**does not include** upstream project imagery, video, PP Neue Montreal, Satoshi, or Geist files.
`public/viscose-original/` instead contains original local placeholder WebP artwork generated for
this integration. Replace it with your own appropriately licensed art before production use.

## Install

```sh
npm install three gsap lil-gui
```

Copy the complete `src/components/` subtree and `public/viscose-original/` folder in this archive.
Do not separate `ViscoseCarousel.jsx` from its `viscose-carousel/ring/` or
`viscose-carousel/shaders/` directories: they are source imports, not optional examples.

Render `<ViscoseCarousel />` on a dedicated full-viewport route. The original source owns a
fixed stage and opens project stories as a scrollable layer over its ring; it is deliberately
not a prop-configured inline carousel.

```jsx
'use client';

import ViscoseCarousel from './components/ViscoseCarousel';
import './components/ViscoseCarousel.css';

export default function SelectedWork() {
  return <ViscoseCarousel />;
}
```

## Customise project content

Edit `src/components/viscose-carousel/ring/projects.js` and replace the records, project copy,
media rows, insight rows, and matching local files. Card images are loaded from
`/viscose-original/`; phone-sized copies are read from `/viscose-original/sm/`.

The renderer uses Three.js, GLSL, and GSAP. It starts from one seed card, waits for its atlas,
forms a looping ring, responds to drag/wheel input, and expands a selected front card into an
editorial project view. In a Vite development build, append `?gui=1` to the route or press `G`
to open the upstream tuning panel. The dynamic dev panel is omitted from production builds.

## Performance and compatibility

WebGL is required for the intended visual result. The upstream device-pixel-ratio cap is retained
on hardware-rendered browsers. A software renderer is detected and gets a reduced backing store
so the original entrance remains responsive in remote previews and virtual machines. Use
compressed local images in real projects; the atlas and open-page textures are sized from the
viewport and GPU texture limits.

## Notices

`shaders/planeShaders.js` retains the included simplex-noise notice for Ashima Arts and Stefan
Gustavson under MIT. See `THIRD_PARTY_NOTICES.md` for the complete provenance and asset boundary.
"""
with ZipFile(output / 'viscose-carousel.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['ViscoseCarousel.jsx', 'ViscoseCarousel.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    for source in sorted((root / 'src' / 'components' / 'viscose-carousel').rglob('*')):
        if source.is_file():
            archive.write(source, source.relative_to(root).as_posix())
    for source in sorted((root / 'public' / 'viscose-original').rglob('*')):
        if source.is_file():
            archive.write(source, source.relative_to(root).as_posix())
    archive.writestr('src/SelectedWork.jsx', viscose_usage + '\n')
    archive.writestr('package.json', '{\n  "dependencies": {\n    "gsap": "^3.15.0",\n    "lil-gui": "^0.21.0",\n    "three": "^0.185.1"\n  }\n}\n')
    archive.writestr('README.md', viscose_readme)
print('Packaged', output / 'viscose-carousel.zip')

# Shared preview framing corrections (Drag Elements, Marquee) stay documented above.

tech_registry = registry.split("slug: 'tech-text'", 1)[1]
tech_usage = re.search(r'  usage: `([\s\S]*?)`,', tech_registry).group(1)
tech_example = re.search(r'  exampleUsage: `([\s\S]*?)`,', tech_registry).group(1)
tech_readme = '''# Tech Text

An independently implemented React + Canvas 2D interactive wordmark. No renderer,
font-parser, animation package, remote API, image asset or copied reference source.

## Install

Copy src/components/TechText.jsx and TechText.css into a React 18+ app. Use Wordmark.jsx
or MeasuredWordmark.jsx as a starting point. Give the parent an explicit height, e.g.
480px, and choose its background/text color. The core is transparent and fills its parent.

Use any font already loaded in your app, or leave fontFamily empty to inherit. The demo
uses local OFL-licensed Geist/Geist Mono fonts; they are intentionally NOT included here.
The Mono preset falls back to the system monospace font when Geist Mono is unavailable.
No font or other media is fetched by the reusable component itself.

Next.js App Router supports the included use client directive. With Pages Router, move
the component CSS import into pages/_app.jsx. Browser work begins only after mount;
server rendering includes readable text until the canvas is ready.

## Props

- text: 'Tech Text'. Single-line text, limited to 96 graphemes. Line breaks become spaces.
- fontFamily: ''. Inherit the parent, or supply a loaded CSS font-family string.
- fontWeight: 600; bounded 100–900. Available weights depend on the loaded font.
- fontSize: 150; maximum CSS size, bounded 12–640. Shrinks to fit the width and at most
  48% of the stage height, leaving room for letter movement and labels.
- letterSpacing: -0.05; extra spacing in em, bounded -0.1–0.3. Kerning is included.
- align: center (default), left or right, within responsive stage gutters.
- color: currentColor. Fill, outline and original-position ghost color.
- accentColor: currentColor. Frames, handles, connector, labels, specks and guides.
- reveal: letter (default), area or off. Area blends fill into outline within a circular
  pointer lens; letter outlines one active glyph. Off leaves normal letters solid.
  Original-position ghost outlines during drag/kick are independent of this setting.
- reach: 200; area radius in CSS px, bounded 0–800. Letter mode ignores it.
- softness: 0.7; soft fraction of the area edge, bounded 0–1. Zero is a hard circle.
- dashLength / dashGap: 4 / 2 CSS px; bounded 0.5–32 / 0–24.
- lineStyle: dashed (default) or solid. Applies to cached glyph contours.
- strokeWidth: 1.5 CSS px; bounded 0.25–8.
- specks: 15; integer 0–64. Blinking squares around the active letter. Zero hides them.
  Assemble entrance particles are independent of this setting.
- selection: true. Gliding frame, corner handles and drag connector.
- labels: true. Letter/ink dimensions, or drag offsets with positive Y upward.
- draggable: true. Drag letters off the baseline, then spring back on release.
- bounce: 0.4; bounded 0–1. Zero gives a non-overshooting drag return.
- clickKick: true. Click or Enter kicks a letter and sends diminishing delayed impulses
  to up to six neighboring positions on each side. Dragging does not trigger a click kick.
- intro: none (default), type, assemble or metrics. Starts after font loading and visibility.
  Type reserves the final layout, outlining then filling letters in sequence. Assemble
  brings pixels into each glyph. Metrics draws font rules then fills horizontal zones.
  A pointer press or keyboard input skips an entrance. Changing text/intro restarts it.
- introDuration: 2 seconds; bounded 0.2–8. Hidden/offscreen/paused time is excluded.
- guides: false. Cap-height, x-height, baseline and descender rules when a letter is active.
  The Metrics entrance draws these rules temporarily even if guides is false.
- sweep: true. Autonomous reveal when pointer and keyboard input are away.
- speed: 1; idle sweep multiplier, bounded 0–5. Zero holds the sweep but does not stop specks.
- paused: false. Hold sweep, blinking and entrance progress. Manual input still works and
  user-initiated return springs may finish. Provide a pause control for decorative motion.
- pixelRatio: 1.5; capped to 0.5–2 and device DPR, three million pixels and a 4096px side.
- className: ''. Additional root class.
- style: optional root inline CSS.

Exported techTextPresets contains vector, lens, mono and serif configurations. Spread a
preset into the component; explicit following props override it. There is no preset prop.
Presets do not include text, color or a background, and do not load fonts.

## Interaction and accessibility

The wordmark is one named keyboard region, with stable text and a separate polite
announcement for keyboard selection. Canvas visuals are hidden from assistive technology.
Arrow keys select a letter; Home/End select the first/last non-space grapheme. Enter kicks.
Space picks up a letter; arrows move it by 8px, Shift+arrows by 24px, and Space/Enter releases.
Escape restores the baseline and suspends automatic sweeping until the next interaction
or sweep/pause setting change. A focus ring appears for keyboard use, never pointer dragging.

On touch, start a drag horizontally. Vertical swipes remain native page scrolling; pointer
cancellation returns the letter. Wheels and browser zoom are not intercepted. Pointer capture
is released on up/cancel/loss, setting changes, hiding, offscreen movement and unmount.

Reduced motion skips entrances, idle sweeps, blinking and click kicks. Direct inspection and
manual dragging remain available, with immediate return on release. No continuous animation
is scheduled for a quiet instance. Offscreen instances and hidden tabs suspend frames.

## Rendering and limits

The component rasterizes each distinct grapheme in the chosen font, follows directed pixel
boundary edges into closed contours, and simplifies the paths. Cached Path2D contours support
real dash/gap/stroke controls. Color changes do not need to retrace glyphs; font, text, size,
spacing and fit changes do. Font loading is observed, with a two-second fallback to an
available font, and late font loads rebuild measurements. Intro particles are capped to
roughly 2400 samples across the wordmark; glyph raster masks are capped at 750,000 pixels.

Best for short, single-line left-to-right Latin-like wordmarks. Grapheme segmentation keeps
combining characters/emoji together when Intl.Segmenter is available. Contextual joining,
ligatures and color glyph rendering can differ because each grapheme moves independently.
This is not a paragraph layout engine, editable text field or font-file exporter.

Canvas/Path2D unavailable: a readable responsive text fallback remains. The canvas background
is transparent; meaningful copy and headings should stay in normal HTML around the component.
Frames, font timers/callbacks, pointer capture, observers and event listeners are cleaned up on
unmount, including StrictMode effect replay. No remote resources are required by this source.

Independent interpretation of the public visual reference at
https://reactbits.dev/text-animations/tech-text. No React Bits source is redistributed.
'''
with ZipFile(output / 'tech-text.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['TechText.jsx', 'TechText.css']:
        archive.write(root / 'src' / 'components' / name, f'src/components/{name}')
    archive.writestr('src/Wordmark.jsx', tech_usage + '\n')
    archive.writestr('src/MeasuredWordmark.jsx', tech_example + '\n')
    archive.writestr('README.md', tech_readme)
print('Packaged', output / 'tech-text.zip')
