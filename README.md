# Motion studies

A source-first React component library with live playgrounds and copyable documentation. The collection currently contains **Scroll Zoom Reveal**, **Eclipse**, **Hover Reveal**, **Radial Pop-out**, **Text Cylinder**, **Bento Grid**, **Parallax Carousel**, **Focus Scale Carousel**, **Elastic Carousel**, **Image Wheel**, **Type Garden**, **Shutter Gallery**, **Polaroid Flip Card**, **Tik Tik Color List**, **Hover Members**, **Infinite Canvas**, **Drag Elements**, **Marquee Along SVG Path**, **Gradient ASCII**, **Flex Carousel**, **Dither Veil**, **Tech Text**, **Scroll Expand**, **Passage Gallery**, **Dome Gallery**, **Paper Crumple**, and **Viscose Carousel** — 26 original implementations inspired by public visual references, plus one direct MIT-licensed upstream Viscose Carousel integration. The Viscose source attribution, license, and third-party notices are retained; no proprietary or excluded upstream media/font files are used.

## Run the website

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

The dev server binds to `0.0.0.0` and accepts the hosted preview domain.

```sh
npm run build
npm run preview -- --port 5173
```

For deployment, serve `dist/` and configure an SPA fallback to `index.html` for client-side routes. The `dist/` directory and installed packages are generated; reinstall and rebuild after restoring the workspace.

## Pages

- `/` — library overview and featured collection
- `/components` — searchable, category-filtered collection
- `/components/scroll-zoom-reveal` — scroll reveal playground and documentation
- `/components/eclipse` — WebGL eclipse playground and documentation
- `/components/hover-reveal` — image index playground and documentation
- `/components/radial-pop-out` — spring-driven radial gallery playground and documentation
- `/components/text-cylinder` — rotating type and image slideshow playground and documentation
- `/components/bento-grid` — expanding image grid and detail-dialog playground and documentation
- `/components/parallax-carousel` — infinite drag/parallax carousel playground and documentation
- `/components/focus-scale-carousel` — centered focus-and-scale carousel playground and documentation
- `/components/elastic-carousel` — WebGL image reel, detail view, and documentation
- `/components/image-wheel` — shallow-arc image browser and documentation
- `/components/type-garden` — botanical typography and poster editor
- `/components/shutter-gallery` — responsive image shutters and documentation
- `/components/polaroid-flip-card` — tactile photo-to-note card and documentation
- `/components/tik-tik-color-list` — infinite color archive, playground and documentation
- `/components/hover-members` — portrait strip with center-out name waves and documentation
- `/components/marquee-along-svg-path` — flowing SVG-path marquee, playground and documentation
- `/components/drag-elements` — arbitrary-child drag playground and documentation
- `/components/infinite-canvas` — repeating two-axis image canvas and documentation
- `/components/gradient-ascii` — typographic gradient field and shader controls
- `/components/flex-carousel` — liquid-lens image gallery and documentation
- `/components/dither-veil` — dithered image reveal, five patterns and documentation
- `/components/tech-text` — interactive outlined wordmark, presets and documentation
- `/components/scroll-expand` — sticky scroll-driven frame expansion and documentation
- `/components/passage-gallery` — draggable tunnel gallery playground and documentation
- `/components/dome-gallery` — immersive dome image gallery playground and documentation
- `/components/paper-crumple` — hold-and-drag paper interaction playground and documentation
- `/components/viscose-carousel` — original upstream Viscose Carousel source integration, playground, and notices
- `/preview/gradient-ascii` — full-screen ASCII gradient
- `/preview/flex-carousel` — full-screen liquid gallery
- `/preview/dither-veil` — full-screen dither reveal
- `/preview/tech-text` — full-screen interactive wordmark
- `/preview/scroll-expand` — full-screen scroll-driven frame expansion
- `/preview/passage-gallery` — full-screen interactive photo tunnel
- `/preview/dome-gallery` — full-screen draggable dome gallery
- `/preview/paper-crumple` — full-screen crumplable paper interaction
- `/preview/viscose-carousel` — full-screen upstream Three.js project ring
- `/docs/introduction` — library approach and workflow
- `/docs/installation` — React setup, framework notes, and troubleshooting
- `/preview/scroll-zoom-reveal` — standalone scroll reveal preview
- `/preview/eclipse` — standalone WebGL eclipse preview
- `/preview/hover-reveal` — standalone hover/focus/touch image index
- `/preview/radial-pop-out` — standalone hover/focus/tap radial gallery
- `/preview/text-cylinder` — standalone counter-rotating typography and click-through slideshow
- `/preview/bento-grid` — standalone responsive photo grid and expanding detail view
- `/preview/parallax-carousel` — standalone looping parallax image strip
- `/preview/focus-scale-carousel` — standalone spring-driven focus carousel
- `/preview/elastic-carousel` — standalone elastic image reel
- `/preview/image-wheel` — standalone depth-of-field image wheel
- `/preview/type-garden` — standalone typing garden and animation exports
- `/preview/shutter-gallery` — standalone click-to-expand gallery
- `/preview/polaroid-flip-card` — standalone interactive Polaroid
- `/preview/tik-tik-color-list` — full-screen scrolling archive
- `/preview/hover-members` — full-screen team introduction
- `/preview/marquee-along-svg-path` — responsive artwork ribbon
- `/preview/drag-elements` — photo and momentum label demos
- `/preview/infinite-canvas` — full-screen image canvas
- `/showcase` — the original full-screen showcase, preserved

Unknown routes and component IDs display a helpful not-found page.

## Included features

- Responsive sidebar and mobile navigation
- Global search (`Ctrl+K` / `Cmd+K`)
- Dark and light themes with saved preference
- Live desktop/mobile component previews
- Scroll reveal customization: text, radius, scroll distance, and video/image mode
- Usage code synchronized to the playground settings
- Separate syntax-highlighted Usage, Component, and CSS tabs
- Copy controls and line wrapping
- Downloadable source archives
- Installation, prop tables, examples, accessibility and integration notes
- Reduced-motion-aware previews and video pause controls

## Source structure

```text
src/
  components/
    ScrollZoomReveal.jsx      # Reusable component; only React is required
    ScrollZoomReveal.css      # Scoped component styles
    Eclipse.jsx               # React + native WebGL; shader embedded
    Eclipse.css               # Positioning and static no-WebGL fallback
    HoverReveal.jsx           # Image-index selection and native animations
    HoverReveal.css           # Scoped styles and container-query layout
    PaperCrumple.jsx          # Canvas 2D hold/drag paper interaction
    PaperCrumple.css          # Scoped paper/fallback/accessibility styles
    ViscoseCarousel.jsx       # Upstream Viscose Carousel runtime, adapted for Vite
    ViscoseCarousel.css       # Scoped upstream stage CSS + utility declarations
    viscose-carousel/         # Upstream ring, shaders, MIT license, and notices
  library/
    registry.js               # Component metadata, docs data, raw source, examples
    Library.jsx               # Site shell, search, sidebar, catalog
    CodeBlock.jsx             # Syntax highlighting and clipboard controls
  pages/
    ComponentPage.jsx         # Component routing and scroll reveal docs
    EclipsePage.jsx           # Eclipse playground, props, and examples
    EclipsePreview.jsx        # Isolated WebGL preview and playback controls
    HoverRevealPage.jsx        # Hover Reveal docs and configuration
    HoverRevealPreview.jsx     # Isolated hover/focus/touch demo
    PaperCrumplePage.jsx       # Paper Crumple docs and material controls
    PaperCrumplePreview.jsx    # Isolated hold/drag paper preview
    ViscoseCarouselPage.jsx    # Upstream Viscose docs, licensing, and source tabs
    ViscoseCarouselPreview.jsx # Isolated upstream WebGL preview
    Preview.jsx               # Isolated preview route
    Docs.jsx                  # Getting-started documentation
    OriginalDemo.jsx          # Preserved original showcase
    NotFound.jsx
  library.css                 # Library themes and responsive layouts
  styles.css                  # Original showcase styles (lazy-loaded)
  main.jsx                    # App routes
public/
  coast.mp4
  coast-poster.jpg
  downloads/scroll-zoom-reveal.zip
  downloads/eclipse.zip
  downloads/hover-reveal.zip
  downloads/paper-crumple.zip
  downloads/viscose-carousel.zip
  paper-crumple/scenes/         # In-house handwritten front/reverse paper artwork
  hover-reveal/                # Public reference demo imagery
  viscose-original/             # Local replacement WebP project studies (not upstream media)
  eclipse-poster.webp          # Generated from our own shader
scripts/
  package_components.py       # Regenerate downloadable source
  smoke.mjs                   # Library/scroll-reveal regression tests
  eclipse-smoke.mjs           # WebGL, accessibility, fallback, and UI tests
  paper-crumple-smoke.mjs     # Canvas paper lifecycle, preview/docs/archive checks
```

## Adding another study

1. Implement the component and its scoped stylesheet in `src/components/`.
2. Add its metadata, source imports, usage example, and props to `src/library/registry.js`. The sidebar, search, categories, and counts derive from this registry.
3. Add the new interaction's preview renderer and controls to `Preview.jsx` and `ComponentPage.jsx`. Component routes currently delegate to the Scroll Zoom Reveal, Eclipse, or Hover Reveal documentation pages; add a dedicated page for different interaction-specific controls and notes.
4. Add the component's gallery visual in `Library.jsx`; the gallery currently uses the shoreline video for Scroll Zoom Reveal and an original shader-rendered poster plus live hover animation for Eclipse.
5. Write installation steps, accessibility notes, examples, and source attribution specific to the new component.
6. Extend `scripts/package_components.py` and generate the downloadable source archive.
7. Test desktop/mobile previews, keyboard controls, copy actions, and reduced-motion behavior.

## Reuse just the component

Copy `ScrollZoomReveal.jsx` and `ScrollZoomReveal.css` into your React project, or download them from its documentation page. No library-shell dependencies, Tailwind, or animation package are required. See the website's Usage and Props sections for examples.

The component listens to **window** scrolling. Avoid nested scrolling containers and ancestors with `overflow: hidden/auto`, which alter sticky positioning. At its defaults the section is 300 viewport heights tall: one screen plus 200vh of scroll travel. Keep headline fragments short.

The component includes a `use client` directive for Next.js App Router. In the Pages Router, move the global CSS import into `pages/_app.jsx`.

## Tests

With the server running:

```sh
npx playwright install chromium
npx playwright install-deps chromium  # Linux, if needed
node scripts/smoke.mjs
node scripts/eclipse-smoke.mjs
node scripts/eclipse-cursor-smoke.mjs
node scripts/hover-reveal-smoke.mjs
node scripts/radial-pop-out-smoke.mjs
node scripts/text-cylinder-smoke.mjs
node scripts/bento-grid-smoke.mjs
node scripts/parallax-carousel-smoke.mjs
node scripts/focus-scale-carousel-smoke.mjs
node scripts/elastic-carousel-smoke.mjs
node scripts/elastic-entrance-smoke.mjs
node scripts/image-wheel-smoke.mjs
node scripts/type-garden-smoke.mjs
node scripts/type-garden-growth-smoke.mjs
node scripts/shutter-gallery-smoke.mjs
node scripts/polaroid-flip-card-smoke.mjs
node scripts/tik-tik-color-list-smoke.mjs
node scripts/hover-members-smoke.mjs
node scripts/infinite-canvas-smoke.mjs
node scripts/drag-elements-smoke.mjs
node scripts/marquee-along-svg-path-smoke.mjs
node scripts/passage-gallery-smoke.mjs
node scripts/dome-gallery-smoke.mjs
node scripts/paper-crumple-smoke.mjs
node scripts/viscose-carousel-smoke.mjs
node scripts/catalog-smoke.mjs
node scripts/tech-text-smoke.mjs
node scripts/scroll-expand-smoke.mjs
node scripts/ssr-smoke.mjs
```

The smoke test covers search, filters, navigation, scroll expansion, replay, clipboard, source tabs, custom examples, downloads, mobile layout, themes, 404 handling, and reduced-motion video behavior. Set `TEST_URL` to test another server.

Regenerate the component download after source changes:

```sh
python3 scripts/package_components.py
```

## Media and fonts

Ocean footage: Pexels video 3571264, as used in the public reference demo.
https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4

The site includes a local copy and a derived poster for reliable playback. Source archives omit the media and instruct users to add their own assets. Typography uses DM Sans and IBM Plex Mono from Google Fonts with system fallbacks.

## Eclipse

Eclipse is a decorative, self-contained native WebGL 1 background. It requires no textures, Three.js, or animation packages. Copy `Eclipse.jsx` and `Eclipse.css` next to one another in a React 18+ project. Place `<Eclipse />` inside a parent with `position: relative` and a non-zero height. Put meaningful HTML content after it, above the canvas.

Its props include radius, intensity, speed, six-digit hex color, interactive two-axis disc movement, paused, maximum pixelRatio, and className. The documented props belong to this original implementation, not the reference site's API.

Reduced-motion preference disables drift and pointer motion. The animation loop pauses outside the viewport and in hidden tabs. Without WebGL, or during context loss, a simpler static CSS corona remains visible. Modern container-query units and color-mix are used for that fallback. Context restoration is handled automatically.

The Eclipse test covers rendering, configuration, copy/download, mobile layout, pause/resume, context loss/restoration, reduced motion, and no-WebGL fallback.

Visual reference: https://useplanes.com/components/eclipse

### Eclipse cursor matching

The corona is stationary while the foreground disc follows both pointer axes. Pointer coordinates are normalized by the shorter container side; displacement is limited radially, so diagonals do not overshoot. Hover exit fades back to idle drift. Exposure and the diamond-ring flare appear on the opposite edge of the moving disc, instead of orbiting on an independent timer. Cursor and hover easing use 0.045 and 0.04 interpolation per frame. The cursor smoke test checks six input directions, hover exit, disabled interaction, and response with speed zero.

## Hover Reveal

Hover Reveal recreates the two-column editorial image index at https://useplanes.com/components/hover-reveal. It uses React, scoped CSS, and the native Web Animations API—no animation package. It includes the measured 770ms crossfade with cubic-bezier(0.22,1,0.36,1), a 1.4x incoming zoom that settles to 1, active-label skew and tighter tracking, up to 9px of pointer displacement, and an 8px idle vertical float. The layout stacks in narrow containers.

Native buttons support hover, focus, touch/click, arrow keys, Home, and End. The last item stays selected on pointer exit. Reduced-motion preference removes image animations, pointer movement, drift, and text skew. A live region announces selection changes. Failed images display a named fallback; empty arrays display an empty state.

The playground controls label, light/dark theme, transition duration, entry zoom, pointer displacement, idle drift, and outer radius. Usage code updates with these settings. Component and CSS tabs contain the actual source files, and the download includes usage and team examples.

Demo imagery was fetched from the public reference's `/HoverReveal/` paths: blackframe.webp, novagrid.webp, ather.webp, phantom.webp, and obsedian.webp. These assets are used locally for the visual recreation, not included in the source archive. Supply your own appropriately licensed images for your project.

`node scripts/hover-reveal-smoke.mjs` verifies crossfade/zoom, rapid transitions, selection persistence, keyboard input, pointer range, reduced motion, playground-to-usage synchronization, copy/download, mobile/touch, and failed-image recovery.

## Radial Pop-out

Radial Pop-out recreates the visual interaction at https://useplanes.com/components/radial-pop-out. The 280px hero sits above seven 200px related photos on a 210px orbit. The opening animation samples an original spring implementation (stiffness 300, damping 25, mass 1), with 25ms between cards; closing uses a 220ms ease. The default settled geometry and rotations were checked against the visible reference. Hero movement combines cursor-proportional translation and 3D tilt.

Files: `src/components/RadialPopOut.jsx`, `RadialPopOut.css`, `src/pages/RadialPopOutPage.jsx`, `RadialPopOutPreview.jsx`, and demo data in `src/library/radialPopOutItems.js`.

The playground controls hero size, satellite size, orbit radius, stagger, tilt, magnetic movement, corner radius, image count, and initial expansion. Usage code reflects the chosen settings. The source archive at `public/downloads/radial-pop-out.zip` includes both source files, an installation README, and two examples, without demo media.

Hover/focus opens the gallery; tap, click, Enter, or Space toggles it; Escape closes it. Hover exit closes a hover-only expansion. Related images are visual previews, not links. Reduced motion presents the final arrangement instantly and disables hero motion. Narrow containers scale down the scene and cards, normally preserving a 150px hero target.

Demo images were fetched from the reference's public `/japan/` paths: japan.webp, fuji.webp, hakone.webp, kyoto.webp, osaka.webp, ramen.webp, sakura.webp, and shibuya.webp. They are local preview assets; use your own appropriately licensed images for reuse.

The radial smoke test verifies geometry, stagger, cursor response, interrupted transitions, hover exit, keyboard/touch controls, reduced motion, custom configuration, code copy, ZIP downloads, and mobile bounds.

## Text Cylinder

Study 005 recreates the public visual interaction at https://useplanes.com/components/text-cylinder. It uses measured DOM glyphs on two CSS 3D rings, rotating in opposite directions at 18 degrees/second. The 4:5 photo remains stationary. Clicking or tapping advances through four slides with an upward image wipe and a type crossfade, maintaining the current ring angle. No pointer tilt, scroll steering, or automatic slide changes are added.

Sources: `src/components/TextCylinder.jsx` and `TextCylinder.css`; documentation/playground in `src/pages/TextCylinderPage.jsx`; standalone preview in `TextCylinderPreview.jsx`; local demo data in `src/library/textCylinderSlides.js`.

The playground customizes first-slide text, rotation speed/direction, type scale, desktop/mobile photo width, reveal duration, starting slide, pause, and background theme. Usage code reflects the controls. The download contains both source files, two usage examples, and a README; it does not include reference images. The four demo images reuse the local public reference assets already in `public/radial-pop-out/`.

Keyboard support extends the photo button with Left/Right navigation, alongside Enter/Space activation. Repeated text is decorative to assistive technology; a live region announces each selected slide. A pause button is included. Reduced motion disables rotation and transitions. Rotation is suspended offscreen; hidden tabs do not advance the angle. Failed images have a fallback, and empty/single-slide arrays are supported.

At 1200×850, automated checks verify the photo at x468/y247.75 with a 264×330 frame, and the first glyph at −10.4919° on a 554.296px radius, matching the public reference measurements. The smoke test also covers opposing rotation, pause/resume, image reveal, rapid navigation, keyboard controls, reversed speed, reduced motion, playground/source/download, mobile touch, and image failure recovery.

## Bento Grid

Study 006 recreates the public interaction at https://useplanes.com/components/bento-grid. The grid uses normal CSS Grid placement with per-item column/row spans. Its lead tile expands from its measured bounds into a large image, using independently sampled spring keyframes, while a blurred backdrop and detail panel appear. Closing returns to the current tile. No paid registry or proprietary source was accessed.

Source: `src/components/BentoGrid.jsx` and `BentoGrid.css`. Documentation and live preview: `src/pages/BentoGridPage.jsx` and `BentoGridPreview.jsx`. Data and photographer credits: `src/library/bentoGridItems.js`.

The defaults match the measured desktop grid: four columns, 12px gaps, 220px rows, and 12px corners. The demo is 1024px wide. A 400px sidebar sits beside the expanded image, which has 24px viewport margins and 16px corners. Below 768px viewport width the details move below the image. Narrow grid containers use at most two columns and 150px rows.

A native dialog is portalled to the document body. It keeps the background inert, locks body scrolling, supports Escape and backdrop dismissal, and restores focus to the selected tile. Previous/Next and Left/Right keys stop at the ends. Reduced motion removes the animated expansion and hover zoom. Failed images have a named fallback. An iframe preview confines the modal to that iframe; the docs scroll the preview into view when opening a tile.

The playground controls columns, spacing, row heights, corners, sidebar width, transition duration, and theme. The source ZIP includes two component files, two examples, and installation/API notes, but no photos. The demo photos in `public/bento-grid/` come from the public reference's Unsplash URLs. Individual photographer credits and profile links are preserved; replace the photos with appropriately licensed assets for your own projects.

The Bento smoke test verifies layout, hover zoom, intermediate expansion, modal geometry, focus trapping/restoration, endpoint navigation, Escape/backdrop close, scroll lock, resizing an open dialog, reduced motion, custom settings, source copy/download, mobile touch, and image failure recovery.

## Parallax Carousel

Study 007 starts the Carousels category. It recreates the visible demo at https://useplanes.com/components/parallax-carousel as a continuous looping strip, not a snap-to-slide carousel. Cards move at 34px/s, ease to a stop on hover, follow dragging directly, and coast with exponential damping on release. Images drift up to 60px inside overscanned frames, based on distance from the viewport center. No wheel interception or pointer tilt is added.

Source: `src/components/ParallaxCarousel.jsx` and `ParallaxCarousel.css`; docs and preview: `src/pages/ParallaxCarouselPage.jsx` and `ParallaxCarouselPreview.jsx`; demo data: `src/library/parallaxCarouselImages.js`.

The desktop demo uses 320×600 cards with a 12px gap and corner radius, and an 80px edge mask. Below 640px container width, sizes/gap/parallax scale by .62, producing 198×372 cards, 7px spacing, and 37px image overscan. Repeated sets cover the viewport and wrap without exposing blank edges, including backward dragging.

The playground adjusts width, height, spacing, parallax, speed/direction, radius, edge fade, mobile scale, autoplay, hover pause, and optional dots. Usage reflects the selected values. Our implementation adds accessible Previous/Pause/Next controls and optional dots to the public demo. Keyboard focus pauses autoplay. Reduced motion removes autoplay, parallax, and inertia but retains direct dragging and instant keyboard/button navigation. Offscreen and hidden-tab loops stop.

The seven local demo images in `public/parallax-carousel/` were downloaded from the reference's public `/images/1.webp` through `/images/7.webp` URLs. They are excluded from the source ZIP; supply your own appropriately licensed images. The ZIP includes both source files, two examples, and API/install notes.

The smoke suite checks exact card geometry, autoplay speed, hover pause/resume, position-based image drift, inertia, keyboard navigation, wrapping, reduced motion, reversed speed, customization/dots/source/copy/download, mobile dimensions, and failed-image fallbacks.

## Focus Scale Carousel

Study 008 recreates the public presentation at https://useplanes.com/components/focus-scale-carousel. A full-size centered photo is flanked by progressively smaller cards. The nearest neighbour is scaled to .37 and each additional neighbour by .78, with consistent 14px edge-to-edge spacing. A fixed corner frame, collection caption above, and image title below complete the presentation.

Sources: `src/components/FocusScaleCarousel.jsx` and `FocusScaleCarousel.css`. Playground/docs and standalone route: `src/pages/FocusScaleCarouselPage.jsx` and `FocusScaleCarouselPreview.jsx`. Demo data: `src/library/focusScaleItems.js`.

The 850ms transition uses independently sampled critically damped spring keyframes. Clicking a side image selects that logical card. Swipes can select multiple items, approximately one per 50 desktop pixels (scaled on mobile and bounded by sideCount). Rapid navigation starts from the currently rendered pose rather than jumping to an old animation endpoint. Captions update with the selection.

Desktop reference geometry is matched at 1200×850: focused photo x440/y210, 320×430; first right neighbour x774, 118.4×159.1. Mobile geometry at 390×844 is x107/y303.5, 176×237, using .55 scaling. The default window has thirteen visual cards; duplicate image controls are hidden from assistive technology.

The playground configures focused dimensions, gap, neighbour scale, scale decay, side count, transition duration, autoplay interval, mobile scale, corners, and frame visibility. Usage tracks the configuration. Our implementation adds a Previous/Pause/Next row to the reference presentation. Hover, keyboard focus, dragging, and hidden/offscreen views pause autoplay. Reduced motion disables autoplay and transitions; keyboard and touch browsing remain available.

Demo images reuse the local public-reference assets in `public/parallax-carousel/`, with image 8.webp added from https://useplanes.com/images/8.webp. The source ZIP excludes demo imagery and contains the component, CSS, two examples, and API/install notes. Use your own appropriately licensed assets.

The Focus Scale smoke test covers measured layout, spring scaling, changing captions, side selection, keyboard looping, multi-step dragging, rapid changes, autoplay and hover pause, reduced motion, playground controls/source/copy/download, mobile tap/swipe, and failed-image fallback.

## Elastic Carousel

Study 009 independently recreates the public interaction at https://useplanes.com/components/elastic-carousel. A compact thumbnail entrance expands into a draggable, snapping reel. Velocity-driven mesh deformation and directional texture blur settle back to sharp rectangular images at rest. Clicking the centered photo isolates it; Close or Escape returns to the reel.

Files: `src/components/ElasticCarousel.jsx` and `ElasticCarousel.css`, documentation/playground in `src/pages/ElasticCarouselPage.jsx`, standalone in `ElasticCarouselPreview.jsx`, and demo data in `src/library/elasticCarouselItems.js`.

The self-contained renderer uses original WebGL vertex/fragment shaders, a subdivided image plane, and a nine-sample directional blur. No Three.js or proprietary reference shaders are used. WebGL/context/texture failures switch to a simpler functional DOM gallery. Context restoration rebuilds the renderer. Remote textures need CORS permission; local demo photos reuse `public/parallax-carousel/1.webp` through `8.webp`.

At the default 1200×850 preview the stage is 560px tall and the centered image is 224×336 at x488/y257, matching the measured reference geometry. On a 390×844 viewport the stage scales to 336px and the image is 152×202 at x119/y321. Titles and counters occupy the upper and lower fifths of the stage.

The playground adjusts stage height, stretch, blur, gap, starting image, pixel ratio, and the entrance. Keyboard and Previous/Next controls supplement dragging. Reduced motion removes the entrance, smoothing, and velocity effects. Vertical touch/wheel scrolling is not intercepted. The renderer stops when settled, offscreen, or in a hidden browser tab.

The source ZIP includes both component files, two examples, and API/install notes. Reference imagery is not included; use your own appropriately licensed assets. The Elastic smoke test covers WebGL rendering, geometry, reel/detail states, keyboard/Escape, drag blur and snapping, context loss/restoration, reduced motion, documentation/customization/copy/download, mobile tap/swipe, no-WebGL fallback, and failed-image handling.

### Elastic entrance correction

The thumbnail entrance now uses individually staggered scale/fade arrivals rather than displaying the entire strip immediately. For eight items it starts after a short lead-in, staggers by 110ms, holds the completed strip, and begins expanding around 2.05s into the ready/visible sequence. Expansion itself drives horizontal blur without requiring a drag; the title and counter appear with the expansion. Thumbnail geometry is 42⅔×64px with 8px gaps on desktop and 25.6×38.4px with 4.8px gaps on mobile. Image readiness gates the introduction; reduced motion and `intro={false}` bypass it.

`elastic-entrance-smoke.mjs` checks the individual arrivals, hold, sizing, delayed captions, expansion blur, and final sharp state with a controlled animation clock on desktop and mobile. Generated test captures are written to `test-artifacts/elastic-carousel/`.

## Image Wheel

Study 010 independently recreates the publicly rendered https://useplanes.com/components/image-wheel. Images travel on a shallow, bounded arc: the front card is sharp, neighbouring cards progressively shrink and blur, and cards behind the front half are hidden. Small deterministic rotations and vertical offsets reproduce the informal photographic arrangement. No proprietary component implementation was fetched.

Source: `src/components/ImageWheel.jsx` and `.css`. Documentation/playground: `src/pages/ImageWheelPage.jsx`. Standalone: `ImageWheelPreview.jsx`. Dataset: `src/library/imageWheelImages.js`, sharing the eight existing local demo photos in `public/parallax-carousel/`.

Defaults are 190px square cards, radius420, height520, angular spacing24°, depth blur9, tilt1, and initialIndex0. The reference-style demo uses radius430. At 1200px width the first image center is (600,387), with a −4.8° rotation. The composition scales proportionally below its fitted width: at 390px the unrotated card side is approximately70.8895px and the stage height194.013px. Desktop and mobile positions were measured against the public rendered DOM, not guessed from thumbnails.

Dragging follows an original near-critically damped spring and snaps to the nearest image. Navigation stops at the first and last image; there is no autoplay, infinite wrapping, or internal lightbox. Clicking a side card centers it; activating the centered card calls the optional onSelect callback. Left/Right browse; Home/End jump to the bounds. Optional Previous/Next controls are off by default to preserve the reference appearance. Reduced motion skips animation but retains static depth-of-field styling. Vertical touch and wheel scrolling are not intercepted. Idle/offscreen/hidden rendering stops.

The playground adjusts size, radius, height, angular spacing, depth blur, tilt, starting index, and controls. The source ZIP contains both component files, PhotoWheel and ProjectPicker examples, and install/API notes, but no demo photographs. Tests cover measured desktop/mobile geometry, depth blur, click and drag snapping, idle/hover behavior, keyboard focus and bounds, reduced motion, live configuration, source/copy/download, touch gestures, image errors, empty/single data, callbacks, and runtime image replacement.

## Type Garden

Study 011, in Typography, is a botanical typing playground and poster editor. Type mode starts with an empty canvas; characters sprout seeded roses, leaves, and curling stems around large serif lettering. Spaces break the connecting vines, Backspace withers deleted plants, and Enter clears. Input is scoped to an actual textarea, supporting paste, mobile keyboards, Unicode graphemes, and composition input without document-wide interception.

Poster mode keeps separate words and provides Regrow, ten palettes, and seven distinct loops: Breathe, Grow & wither, Typed, Gust, Reach, Scatter, and Visitor. Its desktop sidebar moves below the square artwork on narrow containers. The deterministic botanical paths and motion code are original, not the reference source. There is no simulated live presence or collaboration backend.

Files: `src/components/TypeGarden.jsx`, `TypeGarden.css`, and `type-garden/BodoniModa.ttf` with `OFL.txt`. Bodoni Moda is an open-licensed substitute for the reference font. It is bundled locally and embedded into SVG exports. Live drawing and raster export share the same Canvas 2D scene graph; SVG uses the same path geometry and text layout.

Exports are implemented, not placeholder buttons: PNG stills, self-contained SVG, clipboard SVG code, numbered PNG-frame ZIPs, and browser-native video. MediaRecorder chooses MP4 when supported and clearly labels WebM otherwise; unsupported browsers can still export frames. Video records in real time, with progress and cancellation. Keep the tab visible during recording; browser scheduling may affect final video timestamps. Export dimensions default to1080 square and frame rate30, with lower-cost options. All generation happens locally.

Reduced motion makes live artwork static; deliberately requested animated exports still animate. Live rendering pauses offscreen and in hidden tabs. The source download includes the renderer, CSS, open-licensed font, license, two examples, and installation/API notes, with no external graphics or animation dependencies. The dedicated smoke suite verifies typing/editing, palettes, motion presets, reduced motion/regrow, PNG dimensions, embedded SVG and escaping, ZIP structure, actual MP4 metadata, cancellation, clipboard, documentation/customization, source downloads, and touch/mobile layouts.

### Type Garden typing and growth correction

Public clock-controlled observations revealed that the original does not scale the entire plant from the character center. The revised renderer now draws stems along their actual curves first, unfolds leaves at their attachment points, delays buds until about460ms, lets their local scale overshoot and settle, then progressively draws the petal details from approximately700–1500ms. The precise geometry remains our original seeded drawing rather than the reference’s random flowers.

Existing letter positions, size, and caret now settle at12/s instead of snapping to the new centered layout after every edit. New lettering resolves promptly. Editing no longer clears the canvas between frames. Backspace retracts strokes and folds leaves/buds locally over280ms; it does not scale a whole detached plant. The same stroke-reveal data works in Canvas and exported SVG, and Type-mode snapshots retain the current growth/reflow state.

`type-garden-growth-smoke.mjs` uses a controlled clock on desktop and mobile to verify stem-first staging, no early flowers, bloom overshoot, delayed details, smooth append/delete re-centering, no blank edit frame, rapid typing, and reduced motion. The growth regression uses a controlled browser clock; generated export-test files are written to `test-artifacts/type-garden/`.

## Workspace hygiene

App source and runtime assets live in `src/` and `public/`. Reusable test and packaging scripts live in `scripts/`. Required image-wheel geometry fixtures are kept in `tests/fixtures/image-wheel/`. Smoke-test screenshots and sample exports go to the disposable `test-artifacts/` directory. One-off inspection scripts, old captures, and temporary exports have been removed.


## Shutter Gallery

Study 012 independently recreates the publicly rendered shutter interaction. Eight equal panels peek on hover/focus, expand on click/tap, and close on repeat activation or Escape. Images stay gallery-sized behind each moving panel: horizontal galleries use 100cqw image width; vertical galleries use 100cqh image height. No protected source or paid registry was accessed.

Files: `src/components/ShutterGallery.jsx` and `.css`, `src/pages/ShutterGalleryPage.jsx`, `ShutterGalleryPreview.jsx`, and `src/library/shutterGalleryItems.js`. Demo photos live locally in `public/shutter-gallery/`; they are excluded from `public/downloads/shutter-gallery.zip`. Supply appropriately licensed photos in your own project.

The default API height is 480px (520px in the demo). Below 576px **container** width, the gallery stacks vertically and halves its 12px gap. Flex weights are 1 at rest, 1.35 for a peek, 12.6 open, and 1.6 for peeking beside an open panel. Expansion runs 480ms; shading 400ms; an independent unzoom runs 980ms. Captions begin their 350ms reveal after 250ms. The easing is an independent approximation fitted to publicly observed motion, not the original spring implementation.

Pass `open` and `onOpenChange` for controlled selection, or `defaultOpen` for an initial uncontrolled index. Native buttons expose `aria-expanded`; keyboard focus peeks, Enter/Space toggles, Escape closes, and layout-aware arrows/Home/End move focus. Touch skips hover. Reduced motion snaps layout/image/shade and uses a short opacity-only caption fade. Empty arrays, invalid selection and failed images have fallbacks. No animation library or runtime remote media is required.

Run `node scripts/shutter-gallery-smoke.mjs` for desktop/mobile geometry, fixed crop, hover/open/switch/close, keyboard/touch, container breakpoint, reduced motion, controlled behavior, fallback and docs/download checks.


## Polaroid Flip Card

Study 013 independently recreates the publicly rendered photo-to-note interaction. A 340px card with an 88:107 aspect ratio rests at −3°, lifts 6px on pointer hover, and tilts in two axes (±14° horizontally, ±11.2° vertically). Clicking turns the card 180° over about 760ms while the outer rotation settles upright. The easing is an independent approximation fitted to visible motion, not the original implementation. No protected source or paid registry was accessed.

Four paper layers sit between faces at ±0.15/0.45cqw; faces sit at ±0.6cqw. Mid-flip scale follows 1 + 0.07 × |sin(angle)|. The shadow narrows edge-on, moves down and fades slightly in flight. A pointer-led overlay highlight reverses its horizontal direction on the back. The image uses a square crop, 5.5% paper padding, and a 7cqw handwritten caption; the reverse note uses 6.4cqw type.

Files: `src/components/PolaroidFlipCard.jsx` and `.css`, with the bundled Caveat font and OFL license under `src/components/polaroid-flip-card/`. Docs/playground: `src/pages/PolaroidFlipCardPage.jsx`. Standalone: `PolaroidFlipCardPreview.jsx`. Demo data: `src/library/polaroidDemo.js`; the cherry-blossom image reuses `public/radial-pop-out/sakura.webp`. No duplicate image download or runtime remote font is needed.

The source ZIP includes component/CSS/font/license and two examples, but excludes demo photography. Supply an appropriately licensed photo. Preserve the font license when redistributing. Copy the whole font folder alongside the stylesheet.

Native button interaction supports click/tap, Enter/Space, and Escape to return to the photo. aria-pressed exposes state; the reverse note describes the button when shown. Touch has no sticky hover. Reduced motion snaps the flip and disables tilt/lift/glare. Controlled `flipped`/`onFlipChange`, initial `defaultFlipped`, dark/light paper, crop positioning, missing-image fallback, and scrollable long notes are supported. Keep notes short and allow space around the rotated card.

`node scripts/polaroid-flip-card-smoke.mjs` checks reference-sized geometry, local assets, two-axis tilt, flip/scale/shadow staging, mid-turn interruption, keyboard/touch, responsive sizing, reduced motion, controlled state, missing images, long notes, customization, source tabs, and downloads.

## Tik Tik Color List

Study 014 is an independent scrolling archive implementation, built from publicly observable behavior rather than gated source. It has 72px desktop / 36px mobile typography, 112px / 80px row cadence, 20% inactive opacity, 300ms row fades, a 600ms color transition, and a 400px square preview with 24px corners and 40px edge insets. The bundled Inter font is an OFL alternative, not the reference’s proprietary typeface. The image is hidden below 768px container width.

Downward scrolling selects the last row whose top crossed 70% of the stage. Upward scrolling selects the last row that crossed the 65% return line. Reversing direction without crossing a new entry boundary preserves the current selection. The image swaps in place without a slide/zoom; its drag offset persists across projects. Dragging tracks the pointer directly, then uses a time-based exponential decay (750ms time constant, projected travel 0.8× release velocity). Escape, Enter on the focused image, or double-click restores the corner. The preview is intentionally unconstrained during a drag, with keyboard recovery.

`TikTikColorList.jsx` + `.css` and `tik-tik-color-list/InterVariable.woff2` + `OFL.txt` are the reusable source. `tikTikProjects.js` and the local WebP/sample files in `public/tik-tik-color-list/` are showcase data, excluded from the source ZIP. The package includes both usage examples and a README; no animation dependencies or remote runtime assets are built into the component.

The stage owns a native scroll container and recenters a bounded bank of repeated rows near its edges. `infiniteScroll=false` adds enough leading/trailing space to select every item; one-item collections automatically use that mode. Keyboard Arrow/Home/End/Page navigation is supported. Duplicate copies are hidden from assistive technology, with the active cycle exposed. Reduced motion removes color/opacity transitions, smooth keyboard navigation and drag momentum. Empty datasets and broken images have visible fallbacks.

Sound is off by default. With `enableSound`, a click or key press inside the stage unlocks Web Audio; each subsequent active-project change can tick. Optional `soundSrc` supplies a licensed sample; otherwise a short synthesized tick is used. Fetch/decode/autoplay failures do not block navigation. The showcase uses its local tick sample; it is not bundled in the reusable download.

`node scripts/tik-tik-color-list-smoke.mjs` checks forward/reverse selection thresholds, color and image synchronization, geometry, bounded bidirectional wrapping, drag and momentum, keyboard recovery, mobile and reduced motion, finite/empty/missing-media cases, audio opt-in, customization, downloads and browser errors.

## Hover Members

Study 015 implements a centered portrait strip with center-out name waves. The public rendered interaction was measured independently; no gated source was retrieved. Portrait buttons grow from 60px to 120px over 200ms, moving neighboring items through flex layout. Desktop images have 5px inset padding, mobile 2.5px. The strip is positioned at 10% of stage height and wraps within 90% of the container width.

Each glyph moves over 800ms with cubic-bezier(.19,1,.22,1), delayed by 55ms per step from floor(length/2). The default heading exits upward and returns from above; member names arrive from below and retreat downward. Native Web Animations preserve interrupted poses. Three visual layers at most are retained, and completed outgoing layers are removed. A 120px red arrow circle uses a time-based 218ms follow lag, anchored at its top-left in portrait-strip coordinates, with a separate scale entrance/exit.

The unmodified Thunder Black LC font comes from the commercially usable Thunder release, not the older personal-use-only webfont found on the visual reference. Its original License.pdf is bundled and must be retained. The font must not be modified without the designer's permission. Local showcase images are excluded from the source ZIP. `HoverMembers.jsx`, `.css`, the font/license directory, two usage examples and README are included in the download.

The component supports keyboard focus, Arrow/Home/End navigation, click callbacks, touch selection/toggle/reset, Escape, reduced motion, long text fitting, Unicode graphemes, missing-image initials and empty collections. The text is sized with container units so embedded and standalone layouts behave consistently. `node scripts/hover-members-smoke.mjs` exercises geometry, stagger/direction/interruption, cursor lag, sizing, keyboard/touch, accessibility, fallbacks, reduced motion, docs/customization and the download.

## Infinite Canvas

Study 016 is an independent periodic image plane based on publicly observed layout and motion. The default desktop composition is five columns of 15%-width square cells, 5%-width gaps and matching tile padding. At 1440×900 the first cell starts at (72,72), measures 216px, and repeats on a 1512×936px tile. Below 1024px container width, cells use 45% width; at 390px the cell/gap/tile values are 175.5/19.5/994.5×604.5px. Images use contain, not cover, and the stage has a 24px clipping radius over #f5f4f3.

Wheel deltas accumulate one-for-one. Drag and touch deltas use 2x gain. The currently rendered position eases to the accumulated target over 1500ms with `1 - (1 - t)^5`, retargeting continuously as input arrives. Hover alone does not move anything. Release adds no velocity: the existing tween simply finishes. One native requestAnimationFrame loop updates one transform and stops when settled. Position wraps at tile boundaries and rebases after settling to avoid long-session coordinate growth.

The bank of repeated tiles is sized to viewport coverage plus one extra tile on each axis, fixing blank-edge cases on tall mobile layouts and small collections without adding DOM nodes during panning. Width/height changes preserve the current periodic phase. The `images` array supports arbitrary URLs/alt text; `imageRootPath` and `numberOfImages` optionally generate sequential imgN.png URLs.

Keyboard arrows, Page Up/Down, Home/Escape reset, optional controls, pointer capture/cancellation, scoped wheel handling, reduced motion, empty arrays and broken images are supported. Ctrl/Command-wheel and pinch zoom are not suppressed. Repeated copies are aria-hidden. `InfiniteCanvas.jsx` and `.css`, two examples and a README form the reusable ZIP, excluding demo media. The first nine demo images reuse existing local assets; six additional optimized images live in `public/infinite-canvas/`.

`node scripts/infinite-canvas-smoke.mjs` checks reference geometry, easing samples, accumulated wheel distance, 2x drag/touch, no hover movement or release velocity, bidirectional wrapping, mobile coverage, resize, keyboard/reduced motion, fallback/empty/sequential data, scoped input, docs/customization/source and ZIP.


## Drag Elements

Study 017 reproduces the publicly observable photo stack and momentum label demos with an independent React/Pointer Events implementation. Six locally optimized photos sit at the 160px padding origin of a 660×530px stage. Child rotation is separate from wrapper translation. The label scene uses the same desktop origin, a teal stage and pink pills; below 768px its padding is 120px and type becomes 24px. The OFL-licensed Overused Grotesk showcase font and its original license live in src/library/drag-elements/.

The reusable DragElements component wraps arbitrary direct children and supports own-container, element-ref or per-edge translation constraints; numeric/boolean/per-side elasticity; front-on-selection; nested propagation; and optional release inertia. Defaults are elasticity 0.5, momentum true and a strongly damped spring (stiffness 200, damping 300). Photos disable momentum; labels enable it. The measured reference drag of −250px from a 160px origin yields −205px held translation and settles back to −160px. Inside bounds, momentum-disabled items stay where released, without hover tilt or scale.

Keyboard arrows move 20px (Shift 80px), Home/Escape reset, Tab leaves normally. Reduced motion disables overshoot and inertia. Native form/editable/media controls and data-drag-ignore descendants are excluded. Captured gestures support outside release, cancellation and interruption; dragged links do not accidentally activate. Resize remeasures bounds, stable keys retain positions, and the animation loop stops at rest. Constraint measurements use the unrotated wrapper; oversized items can pan between aligned edges. Buttons that should not initiate a drag can use data-drag-ignore.

The source ZIP includes the component, CSS, two runnable examples and README. Demo photos/font are excluded and are not runtime dependencies of the core. Run `node scripts/drag-elements-smoke.mjs` for geometry, stacking, elasticity, return, momentum, keyboard, touch, reduced motion, bounds/ref/resize, children, cleanup and docs/download checks.

## Catalog consistency

The catalog and sidebar counts derive from the full component registry. Cards are ordered newest first. Clicking All components clears active filters, including when revisiting the current route. A visible result count distinguishes filtered results from the collection total. Category controls wrap on mobile. The preview server uses a fixed port and no-store responses to avoid stale development pages. `node scripts/catalog-smoke.mjs` checks every registry entry, the newest cards and their previews/downloads, counts, filter resets, overview, reload and mobile layout.

Production previews run `npm run build` automatically through the `prepreview` lifecycle, so `npm run preview -- --port 5173 --strictPort` cannot silently serve a previous build. After source changes, restart a production preview to rebuild it; use `npm run dev` for live editing.

The three newest catalog thumbnails (Hover Members, Infinite Canvas and Drag Elements) live in `src/library/posters/` and are imported with Vite `?inline`. They ship as WebP data URLs in the application bundle rather than relying on separately served root-level poster files. The catalog smoke suite blocks those former image URLs and checks decoding on desktop, mobile and reload, plus the actual component-preview images.


## Marquee Along SVG Path

Study 018 independently recreates the publicly observed looping artwork ribbon: a 996×330 coordinate system, 26 evenly spaced tiles (13 artworks repeated twice), 56px native tile widths, a 660×530 clipped stage and 1.05x demo overscan. Base travel is 8 percentage points per second; 100 viewport pixels of horizontal dragging move the ribbon by 10 percentage points. Items rotate with the tangent, and showcase artwork enlarges to 1.5x on hover. The reusable core defaults to velocity 5, repeat 3 and drag sensitivity 0.2; those showcase overrides are explicit.

Native CSS offset-path/offset-distance and a single RAF loop handle arbitrary HTML children, wrapped progress, reverse direction, custom easing, rolling stacking, unitless numeric CSS interpolation, hover-speed springs, scroll-velocity springs and pointer release decay. Responsive geometry supports nonzero viewBox origins, meet/slice/none and SVG alignment. Resize preserves phase; open paths should put endpoints outside the clipped stage. The demo also includes wave and ellipse presets and an editable custom path.

Playback controls, keyboard arrows/Shift/Home/Escape/Space, keyboard-focus pause and reduced-motion static mode are supported. Repeated copies are aria-hidden with interactive descendants removed from tab order. Dragged links suppress accidental clicks; native controls and data-drag-ignore opt out. Vertical touch scrolling is retained. Animation stops when offscreen, hidden, paused or reduced-motion. Invalid paths and empty collections have explicit states. CSS motion-path support is required.

The showcase artwork is optimized and embedded from src/library/marquee-path; its catalog poster is embedded from src/library/posters. Neither requires separate remote image requests. Source ZIP contains JSX/CSS, two asset-free examples and README, not the demo media. `node scripts/marquee-along-svg-path-smoke.mjs` checks geometry, speed, repetition, wrapping, drag/coast/direction, hover slowdown, keyboard/reduced motion, mobile touch, resizing, scroll inputs, custom CSS/easing/viewBox, empty/invalid states, cleanup and docs/download integration.

Catalog thumbnails for studies 015–018 use a shared CatalogThumbnail frame. Critical positioning and contain sizing travel inline with the bundled image, preventing native-size overflow if poster-specific styles are unavailable. Empty outer poster margins are trimmed while preserving the artwork; 42px top/bottom bands keep labels and navigation clear. Catalog tests assert containment and label clearance across desktop, tablet and mobile.

### Embedded Drag Elements and Marquee preview sizing

The two embedded demos fill the playground's available width rather than retaining
its original 660px standalone cap. Shared local framing centers each stage with
equal side gutters and honors the configured height. Drag Elements centers its
photo/title composition independently of canvas width, stacking the caption beneath
the photos in narrow containers. Standalone reference demos and reusable component
APIs are unchanged. `scripts/preview-sizing-smoke.mjs` verifies wide, tablet and
phone layouts, device switches, custom heights, containment and retained drag state.

## Gradient ASCII

Study 019 is an independent native-WebGL interpretation of the public Gradient ASCII
visual reference. It uses original analytical light fields and a locally rasterized
monospace glyph atlas, not redistributed React Bits component source. The public
reference is https://reactbits.dev/backgrounds/gradient-ascii; its component license
restricts standalone component redistribution, so this archive contains our own renderer.

Horizon, Pinch, Rise and Eclipse fields share a configurable 2–8-color ramp. Brightness
selects characters from an ordered string, with independently adjustable gradient/glyph
opacity, density, cell size, glow, defocus, flicker, softness, scale, flow, speed, grain
and deterministic variation. A bounded pointer trail scrambles characters without
moving the field; clicks produce an expanding wave or a local burst. Interaction clocks
are independent of drift speed. Intro reveal/decoding runs for 2.8 seconds. Light mode
is an instance-level option for a light parent, not a reinstated shared preview toggle.

One WebGL draw call uses a generated 512×384 atlas (128 code points maximum). No font
or image downloads are made by the core. System monospace is the default; an already
available custom font can refresh the atlas on load. Rendering uses the device ratio
capped at two, GPU size limits and an eight-million-pixel budget; the demo defaults to
a 1.5 ratio cap. Invalid colors/numbers/fonts/shapes fall back or clamp safely.

The decorative canvas is aria-hidden and pointer-transparent. Events are observed on
the parent without preventing native scrolling, links or controls; interactive controls
and data-ascii-ignore regions opt out. Touch taps work without hover trails. Reduced
motion produces a settled static field. Pausing freezes all clocks; an initially paused
instance is fully revealed. Offscreen/hidden scenes stop requesting frames. Context
loss and unavailable WebGL show a static blue-gradient fallback, with automatic context
restoration; fallback shapes are approximate and do not contain ASCII glyphs. Every
listener, observer, animation frame, texture, buffer and shader program is cleaned up.

The full-width docs preview includes pause/restart, desktop/mobile sizing, all visual
controls, color editing, optional sample HTML content, synchronized Usage code and a
full-screen link. Study 019 is first in the 19-item catalog with an inline WebP poster
using the established contain/label-clearance frame. The source ZIP includes only the
self-contained JSX/CSS, two asset-free examples and README.

`node scripts/gradient-ascii-smoke.mjs` checks actual GPU pixels for all four shapes,
color/glyph controls and transparency, scrambling and both click effects; intro,
pause/reduced motion, prop updates without renderer remounts, resize/DPR, offscreen and
hidden suspension, invalid inputs, fallback/context recovery, native foreground controls,
touch scrolling, cleanup, documentation controls, source tabs and ZIP download. The
catalog test now covers all 19 entries; previous preview-size and interaction tests are
retained. The native shader/API are an independent approximation, not a pixel-identical
copy of the reference's rendering pipeline.

## Flex Carousel

Study 020 is an independent native-WebGL interpretation of the public gallery at
https://reactbits.dev/components/flex-carousel. The implementation was built from
the public preview, controls and documented behavior; no reference component or
shader source was fetched or redistributed. It uses no ogl or animation package.

The initial row contains twelve locally optimized demo photographs in the observed
order. Natural image aspect ratios, half-stage card height, 12px gaps, a flat
center and a tilted curved edge match the public composition. A shared analytical
lens deforms each 40×12 card mesh in stage coordinates, with continuous twist/rise/
fall displacement and edge-only RGB dispersion. The glass itself is not drawn.
Liquid, Ribbon, Vortex and Arch expose the observed preset values; numeric lens
props override them. The native optics and entrance curves are independent
approximations, not a pixel-identical reproduction of the reference pipeline.

Pointer drag and wheel input feed a bounded looping offset, velocity decay and
center snapping. Speed-dependent squeeze and optional liquid wobble relax at rest.
Cursor following is optional and returns to center on exit. A side-card click
centers it first; selecting the centered image parts/fades its neighbors, removes
the bend and fits it into a larger focused view. Focus is inline, not a modal.
Click, drag, wheel, navigation or Escape closes it. Titles, optional subtitles and
a rolling counter follow the active card; onChange/onSelect callbacks are exposed.

Rise, Bloom, Spin and Deal entrances run once after image loading; input skips them.
Autoplay advances by item and pauses on hover, focus, interaction, inline focus,
reduced motion, document hiding or offscreen visibility. Optional navigation includes
Pause/Play and Close controls. Reduced motion skips entrance/inertia/following and
settles manual navigation and focus immediately. Keyboard Left/Right/Home/End/
Enter/Space/Escape, named image buttons and a polite live region are supported.
Vertical touch scrolling and browser zoom remain native. Mouse-wheel capture can
be disabled independently from horizontal trackpad input.

Natural, Portrait, Square and Landscape fits are available. Source items default
to an empty array; the core accepts up to 50 and preserves the selected ID across
collection changes where possible. Failed/CORS-blocked images use named placeholders,
and loads time out after twelve seconds. Textures have a maximum 1100px long edge;
render dimensions are capped by pixel ratio, GPU limits and an eight-million-pixel
budget. Context loss/no WebGL uses a straight DOM gallery with working navigation
and focus. Restoration rebuilds the GPU resources. Idle scenes stop requesting
frames; timers, handlers, observers, image callbacks and GPU resources are released.

The documentation provides all lens/layout/input controls, synchronized Usage code,
full-screen and mobile previews, examples and a five-file source ZIP. Showcase
photos are local under public/flex-carousel and their public source URLs are in
src/library/flexCarouselItems.js; they are excluded from the reusable source archive.
The inline WebP catalog poster uses the shared contain/label-clearance frame.
Counts, search, sidebar, category filters and newest-first ordering include all 20
studies, and the earlier Drag Elements/Marquee sizing fixes are unchanged.

`node scripts/flex-carousel-smoke.mjs` checks actual GPU pixel changes, natural/fixed
geometry, preset overrides, continuous optics, click/keyboard focus, callbacks,
looping, wheel handling, pointer inertia/squeeze, intro cancellation, same-renderer
prop updates, resize, pointer-follow/recenter, autoplay pauses, idle/hidden/offscreen
suspension, reduced motion, context recovery, non-WebGL fallback, empty/broken/single
collections, touch/DPR/native scrolling, cleanup, docs controls, code and ZIP.

## Dither Veil

Study 021 is an independent implementation of the public interaction at
https://reactbits.dev/animations/dither-veil. Only the public preview, controls and
API were inspected; no reference component or shader source was fetched or copied.
The component uses React, Canvas 2D and native WebGL, with no renderer dependency.
Its processing and reveal algorithms are independent approximations, not a
pixel-identical reproduction of the reference implementation.

A static dithered image reveals its original colors under the pointer. The edge
dissolves through an ordered cell threshold; up to 32 sampled positions linger,
then knit back into the pattern. Optional colored transition cells, reverse mode,
autonomous wandering and up to four expanding click rings are supported. Contain
preserves the whole image on the ink color; cover center-crops. Original photo
colors stay unmodified by the tonal settings on the dither layer.

Five distinct algorithms are included: serpentine Floyd–Steinberg and Atkinson
error diffusion; ordered 8×8 Bayer; a progressive farthest-point threshold tile
for blue-noise-style stippling; and diagonal engraving bands. Duotone applies a
print-like 1.5-power luminance curve before contrast and brightness, then maps
between ink and paper. RGB independently quantizes the original three channels.
Levels, CSS pixel size, contrast, brightness and palette are configurable.

The processed image is cached until image, layout or tonal settings change. A
small Canvas mask field represents the union of manual, trail and ripple windows;
a single WebGL draw composites the original image, cached dither and mask. Pixel
ratio is capped at two/device DPR, rendering at four million pixels, and processing
at roughly 600,000 cells with a 4096px/GPU-side bound. Exceptionally large frames
use coarser cells to stay within budget. Idle scenes stop scheduling frames, and
hidden tabs/offscreen instances suspend rendering.

Arrow keys move the reveal by 24px (64px with Shift); Home recenters; Enter/Space
ripples; Escape clears the field and suspends wandering until the next interaction
or wander/pause change. The region has a descriptive accessible name and keyboard
instructions. Touch scrolling, wheel events and browser zoom remain native.
Reduced motion preserves direct reveals but disables trails, ripples and wandering.
A pause control holds the last wandering position; it does not disable manual input.

A Canvas 2D fallback preserves the dither and reveal when WebGL is unavailable or
its context is lost. Context restoration rebuilds GPU resources. Anonymous image
loads have a 12-second timeout and stale-callback protection. If pixel processing
is blocked by CORS, an ordinary image is shown when possible; empty or broken
sources display clear messages. Frames, observers, event listeners, image handlers,
timers and GPU allocations are released on unmount, including StrictMode remounts.

The documentation provides all visual controls, image source/description, responsive
and full-screen previews, synchronized Usage code, examples and a five-file source
ZIP. The demo image is locally optimized under public/dither-veil; its public source
URL is retained in src/library/ditherVeilConfig.js. Media is excluded from the reusable
archive. The catalog includes all 21 studies, newest-first, with a contained inline
WebP poster for Study 021. Existing native preview appearances and the earlier
Drag Elements/Marquee framing corrections remain unchanged.

`node scripts/dither-veil-smoke.mjs` checks actual GPU output for all five algorithms,
levels/palettes/colors/contrast/fit, reveal/rim/reverse/original-color preservation,
keyboard control, reduced motion, lingering decay, click ripples, wandering/pause,
visibility suspension, context loss/restoration, numeric limits, resizing, empty/
failed/CORS/data-URL/stale sources, StrictMode resource cleanup, the Canvas fallback,
high-DPR mobile touch/native scrolling, query validation, docs controls, generated
source/alt escaping, reset and downloadable ZIP. The catalog and previous regression
scripts remain available under scripts/.

Study 021 verification: the Dither Veil suite and 11 affected catalog/general,
preview-sizing, recent-component and standing-correction regression suites passed.
The production build and production catalog passed with 21 entries; all five
patterns were checked at desktop/mobile sizes in the production preview. Server
rendering without browser globals and all 21 source ZIPs were also verified.

## Tech Text

Study 022 is an independent implementation of the public interaction at
https://reactbits.dev/text-animations/tech-text. Only the public preview, controls,
presets and documented API were inspected; no reference component, shader, font
parser or path data was fetched or copied. The core is plain React and Canvas 2D.

Letters are drawn from the font the project already loads. Each glyph is rasterized
once into a small scratch canvas, its boundary is walked into directed edges and
reduced to closed, simplified Path2D contours — including inner counters — so dashes
and strokes follow real letterforms instead of text boxes. Paths are cached per
character and rebuilt when text, font, weight, spacing, alignment, size or pixel
ratio changes. Layout measures the whole word with normal kerning, places each glyph
from its measured prefix, and shrinks the requested size to the stage width and 48%
of its height. Text is single-line, capped at 96 graphemes, and line breaks become
spaces.

The pointer inspects a letter: its fill swaps for a dashed or solid outline, an
ink-bounds selection frame with corner handles and a measurement label follows it,
and blinking specks drift around the active glyph. Area reveal instead cuts a soft
circular lens out of the fills and returns the outline inside it; Off leaves letters
solid. Letters drag in two axes with a dashed ghost and connector at the original
position and a spring return, bounce controlling overshoot and offsets clamped
inside the stage. A click sends a diminishing kick through up to six neighbouring
letters. Frame, handles, connector, labels and specks use a separate accent color.

Optional entrances reserve the final layout: Type outlines and fills one letter at a
time, Assemble draws glyphs from sampled ink particles, and Metrics rules cap height,
x-height, baseline and descender before filling three horizontal zones. A press or
Escape skips an entrance. An idle sweep drifts a reveal point across the wordmark
with a pause control; its clock is independent of speed, so slowing the sweep to zero
holds the current position instead of resetting it. Pausing holds decorative motion
while a user-driven spring may still finish.

Arrow keys inspect letters (Home/End jump to the ends), Enter kicks, Space picks a
letter up and releases it, arrows reposition by 8px or 24px with Shift, and Escape
resets and suspends the sweep until the next interaction or settings change. The
group is named, describes its available interactions, and announces selection,
pickup and release; pointer inspection never draws a focus ring. Touch drags
horizontally while vertical swipes keep scrolling the page. Reduced motion skips
entrances, sweep, blinking and click kicks and returns dragged letters immediately.

The backing store is capped by device DPR, an optional pixelRatio prop, a three-
million-pixel budget and a 4096px side; per-glyph raster tracing is bounded to 2x
scale and 750,000 pixels. Observers, listeners, timers and frames are released on
unmount, including StrictMode remounts, and offscreen or hidden instances suspend
frames. Without Canvas 2D or Path2D the wordmark degrades to readable text, and if a
scratch raster cannot be read back letters still render as solid fills.

The documentation provides typography, reveal, entrance, interaction and color
controls, a preset menu, desktop/mobile previews, a full-screen link, usage code with
a pause button, component/CSS source tabs, an example, notes, use cases and a
five-file source ZIP. Geist and Geist Mono are bundled locally for the demo only,
with their OFL licenses, and are excluded from the reusable archive. The catalog
includes all 22 studies, newest-first, with a contained inline WebP poster for Study
022 captured without the preview-only pause control and with the label clear of the
cap height.

`node scripts/tech-text-smoke.mjs` mounts the component in a StrictMode host and
checks traced contours with counters, letter/area/off reveals, frame/labels/specks,
color plumbing, a settling selection frame, drag clamps and spring return, click
ripples with their distance falloff, keyboard inspection/pickup/kick, the speed-0
sweep freeze, pause/resume, Escape suspension, all three entrances with a fixed final
layout, text/alignment/fitting, typography swaps, prop guards, frame/observer/
listener/timer hygiene, unmount and remount, no-Canvas / no-Path2D / blocked-raster
fallbacks, preview presets and pause, query bounds, registry and documentation, the
source download, DPR capping with touch drag and native scrolling, and the mobile
documentation layout.

## Viscose Carousel

Study 027 integrates the original [Viscose Carousel](https://github.com/Yousuf-developer/Viscose-carousel)
source by Yousuf Soomro under its MIT License (Copyright © 2026 Yousuf Soomro). Unlike the other
independent studies in this library, this is a direct upstream source integration: the Three.js
renderer, GLSL shaders, ring modules, GSAP timelines, input behavior, project list, and expanded
editorial view are all retained and adapted for the Vite host.

Only host-environment changes were made: Vite-compatible paths, component-scoped CSS instead of
Next/Tailwind globals, system-font defaults, a software-WebGL backing-store safeguard, and local
replacement project media. The integration deliberately does **not** copy the upstream `public/`
artwork/video or PP Neue Montreal. It uses original local WebP studies in `public/viscose-original/`
instead. The same local files are included in `sm/` for the source's compact atlas path.

The renderer begins with a loading counter and a single textured seed. It then launches, fans a
curved ring of cards through a liquid field, displays the active project's editorial metadata, and
responds to wheel or drag input. Selecting the forward card opens the upstream scrolling project
view; its WebGL hero, project facts, insight row, next-work affordance, and close interaction are
part of the original runtime.

Project names, facts, copy, and media are intentionally local replacements in
`src/components/viscose-carousel/ring/projects.js`. Replace that file and the matching local media
with your own licensed content for production. The runtime is a fixed full-viewport experience,
not a prop-configured inline carousel; mount it on a dedicated route. It requires `three`, `gsap`,
and `lil-gui` (the GUI is dev-only). In a development build, append `?gui=1` or press `G` to expose
the upstream tuning panel.

The source archive includes the complete support tree, local replacement artwork, `Viscose-MIT-
LICENSE.txt`, and `THIRD_PARTY_NOTICES.md`. The original simplex-noise MIT attribution for Ashima
Arts and Stefan Gustavson remains in `planeShaders.js` and is called out in the notice. Retain all
applicable notices when redistributing.

`node scripts/viscose-carousel-smoke.mjs` verifies the upstream stage reaches its settled project
ring, responds to wheel and drag movement, opens and closes a project story, loads local media,
renders inside docs framing, ships attribution and support files in the ZIP, and preserves catalog
ordering and mobile bounds.

## Paper Crumple

Study 026 is an independent Canvas 2D interpretation of the publicly observable
interaction at https://reactbits.dev/micro/paper-crumple. The public preview and
published prop documentation informed the interaction; no React Bits source, demo image,
Three.js dependency, or upstream material/solver code is included.

A normal image begins as a paper sheet with a soft shadow. Holding it gathers the page
into a small seeded polygonal wad; the printed image is clipped through the folded shape,
with lit and shaded facets, roughness, grain, irregular perimeter, and crease guides
forming locally in Canvas 2D. The direct pointer path lets the held paper follow the
cursor within a configurable radius and tilt. Release either restores the flat sheet,
keeps the crumpled object in place, or unfolds back to the centre with a faint record of
its creases. Space/Enter gives keyboard users the same hold interaction, arrows reposition
the sheet, Shift makes larger moves, and Escape resets the material.

The reusable component implements the complete documented public surface: source/front and
back image, geometry and fit, all hold/release/fold/material/light/shadow controls, drag
rules, deterministic seed/detail, disabled/reset keys, callbacks, and root styling hooks.
It has no third-party rendering or gesture dependency. It uses a single requestAnimationFrame
loop only while the paper is moving, respects reduced-motion preferences by settling
immediately, cleans observer/pointer/frame resources on unmount, and sends image/canvas
errors to `onError` while retaining an ordinary image fallback. The in-house handwritten
front/reverse paper textures remain outside the reusable five-file archive.

The component page provides local face/back selection, release/fit modes, colour, twenty
numeric material and interaction controls, switches, restart/reset, mobile/desktop framing,
source tabs, and a standalone URL-configurable preview. The catalog lists all 27 studies,
newest-first, with a contained inline WebP poster built from the local paper artwork.

`node scripts/paper-crumple-smoke.mjs` mounts the core in an isolated StrictMode fixture
and checks canvas readiness, hold/crumple/release modes, direct dragging, keyboard controls,
prop guards, lifecycle callbacks, reset/disabled behavior, cleanup, standalone/embed query
handling, docs controls, archive contents, catalog ordering, SSR and browser errors.

## Dome Gallery

Study 025 is an independent React and CSS interpretation of the publicly observable
interaction at https://reactbits.dev/components/dome-gallery. Only the public rendered
behavior and documented prop surface informed the work; no React Bits source, remote
demo image, gesture dependency or 3D renderer is included.

A small collection of ordinary images repeats over a projected hemispheric field. Seven
latitude bands form a dense, depth-sorted surface: frames become larger and clearer near
the forward centre, then narrow, soften and fade at the perimeter. Native Pointer Events
turn the field horizontally and within a bounded vertical angle, with a damped inertial
release. Clicking a visible image keeps the dome in place under a coloured blur and
brings that source forward in a rounded modal frame. Escape or a backdrop click restores
the field. Arrow keys rotate the focused gallery, and every visible frame remains a
labelled native button.

The reusable component accepts the complete documented gallery surface: image sources,
fit/basis and radius limits, padding and overlay colour, vertical rotation, drag
sensitivity/dampening, density, enlargement timing, open/tile dimensions and radii, and
grayscale. Its `reset()`, `close()` and `rotate(x, y)` ref methods make embedded uses
straightforward. Input values are bounded defensively, observer and animation resources
are cleaned up on unmount, and the initial scaffold server-renders without browser-only
access. The downloadable archive contains only the reusable component, CSS, two examples
and its own README; its demo scene images are generated in-house and intentionally stay
outside the archive.

The component page adds scene selection, fit basis and overlay colour controls, all
numeric geometry/motion controls, editable open/tile CSS dimensions, grayscale, desktop
and mobile framing, restart/reset, source tabs and a standalone URL-configurable preview.
The catalog now lists all 27 studies, newest-first, with a contained inline WebP poster
of the local dome.

`node scripts/dome-gallery-smoke.mjs` mounts the core in an isolated StrictMode fixture
and checks projection density, radius/bounds, drag/inertia, keyboard turning, click/
Escape/modal behavior, grayscale and sizing options, cleanup, standalone/embed preview
query handling, the component page controls, archive contents, catalog ordering and
browser errors.

## Passage Gallery

Study 024 is an independent implementation of the public interaction at
https://pro.reactbits.dev/docs/components/passage-gallery. That reference is a paid
component: nothing was purchased, downloaded or copied, and only the public preview
and its documented prop table were observed. The core is plain React with scoped CSS
and one canvas 2D render loop — no three.js, no WebGL, no texture library.

A corridor of framed photos recedes along a tunnel built one lane deep. `lanes` is
the horizontal count across the floor and ceiling; the side-wall row count follows the
observed stepped section: horizontal 1–5 → 2 vertical rows, 6–7 → 3, 8–9 → 4, 10–11 →
5 and 12 → 6. Each face tile remains a one-lane square, so the passage becomes wider
without becoming equally tall. The grid uses the same rectangular ring and the live
root publishes the derived `data-vertical-lanes` value alongside its cell/tile counts.
Every cell is hashed once from `seed` and the cell index, so tile content — photo,
black tile, graded accent plane —
stays stable while the camera moves, and the fills are weighted (`photoFill^0.62`)
so the painted density matches the reference at 0.06, 0.3, 0.6 and 1, and photos only appear where the built-in or
supplied collection still has images to place. Depth is a single falloff,
`(1 − distance / seenLanes)^1.15` with `seenLanes = 27 / fog` (about 20 lanes at fog 1,
13 at fog 2), so the corridor stays readable deep into the distance and denser fog
shortens the passage instead of turning it into a vignette. Empty tiles stay black:
only photos and graded accent planes paint, which is what gives the reference its
alternating black-and-picture rhythm.

Cruising is autonomous: the corridor advances 0.72 lanes per second for every unit
of `speed`, negative values reverse and `0` parks the tunnel, while the pointer look
is a separate two-axis camera move (`yaw = −aimX × 0.16 × look`,
`pitch = −aimY × 0.12 × look`) with a small lateral shift. Hovering a photo grows it
about its own centre — 8% per unit of `hover`, brightened by 29% — so it swells across
its own gap instead of sliding off the wall, and plain tiles never react (both
measured against the reference). `boost`
multiplies travel while the pointer is held, with the drag and wheel impulses decaying
through an exponential momentum term, so `velocity` outlives the gesture and settles
instead of stopping dead. Motion blur is a back-to-front multi-pass render with the
trailing passes offset by the per-frame speed; the passes composite plainly, never
additively.

Clicking a photo opens it straight away into a centred frame at most 51% × 66% of the
canvas — the corridor stays visible behind a scrim that darkens toward the frame —
with the caption underneath naming the title and the position (`NN / NN`, tabular
figures). A second click, Escape or starting a scroll closes it
and resumes the cruise; scrolling while a photo is open closes it and moves on. The
`onFocusChange(item, index)` callback reports the opened item, or `null` and `-1`
when it closes, and the ref handle exposes `close()` and `travel(by)` for host
driven movement. Keyboard users can drive the focused canvas with the arrow keys,
PageUp/PageDown (±`lanes`), Home, Enter/Space (open the nearest photo) and Escape.

Props are guarded on the way in, on the same bounds as the documented controls:
`lanes` 2–12, `gap` 0–0.4, `radius` 0–1 (0 square, 1 circular), `photoFill` 0–1,
`accentFill` 0–0.6, `lineOpacity` 0–0.6, `fog` 0.2–3, `speed` −2–4, `boost` 1–20,
`blur` 0–3, `look` 0–3, `fov` 40–100 vertical degrees, `hover` 0–2, `seed` 0–20 and
`dpr` 0.5–3, and the pixel ratio is capped again when the canvas is sized. The grid lines adapt to the background colour
(including `transparent`), reduced-motion users never cruise and `paused` stops the
loop without tearing it down. The component server-renders its scaffold with the
canvas as a named region (`role="region"`, `aria-roledescription="gallery"`) and a
visually hidden list of every photo. Live values are published as datasets
(`data-status`, `data-phase`, `data-travel`, `data-speed`, `data-look`, `data-hover`,
`data-hover-photo`, `data-focus`, `data-caption`, `data-cells`,
`data-vertical-lanes`, `data-tiles`, `data-dpr`), frames/observers/listeners/timers are released on unmount under
StrictMode, and hidden tabs or offscreen instances suspend the loop.

The documentation provides preset, colour, background, scene and fifteen geometry,
motion and interaction controls, a desktop/mobile preview, a full-screen link, usage
code, component/CSS source tabs, an example, notes, use cases and a five-file source
ZIP. The eight demo scenes — square abstract artwork in the reference's dark, hard-edged
register, generated in-house by `test-artifacts` tooling and excluded from the
reusable archive. The catalog lists all 27
studies, newest-first, with a contained inline WebP poster captured from the tunnel.

Rendering keeps its own budget: rings draw back to front with sub-pixel tiles culled,
far photos resolve to a flat average colour, mid tiles map with a single transform and
only the large near quads take the exact per-corner mapping, and the grid strokes its
rails every third ring instead of per cell.

`node scripts/passage-gallery-smoke.mjs` serves a fixture page of its own, mounts the
component in a StrictMode host and checks the empty state, perspective cells and FOV
framing, pointer look, hover picking with hold boost, click focus with captions and
callbacks, Escape and toggle close, keyboard travel and open, wheel travel with the
wheel switch and scroll-to-close, drag momentum with the interactive switch, seeds,
prop guards, negative speed, reduced motion, pause and hidden tabs,
frame/observer/listener hygiene under StrictMode, remount, the preview page and its
controls, query bounds and presets, the registry and documentation, the source
download and the mobile layout.

## Scroll Expand

Study 023 is an independent implementation of the public interaction at
https://reactbits.dev/animations/scroll-expand. Only the public preview, controls and
documented API were inspected; no reference component, stylesheet, asset or preset
data was fetched or copied. The core is plain React with scoped CSS and a single
rAF loop — no scroll library, animation package or observer polyfill.

At rest the media sits in a rounded window: `inset(21% 29% round 24px)` over a
sticky stage with the image at `scale(1.35)`. Scrolling the section drives one
progress value, `u = scroll / (scrollDistance × stageHeight)`, and every geometry
channel eases on the same `1 − u²(3 − 2u)` curve, so the insets, corner radius and
zoom reach `0 / 0 / 1` together at full bleed. The track is
`stageHeight + scrollDistance × stageHeight` plus a hold segment, so the resting
frame, the expansion and the full-bleed hold are all plain page scrolling.

The text layers hand over inside measured windows: the scroll hint fades over the
first 13% of the expansion, the title lifts, scales and fades between roughly 45%
and 88%, and the overlay copy fades in with a short upward translation between 70%
and 94% over a scrim that reaches its configured opacity as the frame opens. The
hold segment keeps the media full bleed for `holdDistance × stageHeight` before the
section releases. Phases are reported as `rest`, `expanding`, `open`, `complete`
(inside the hold) and `static`.

`smoothing` is a follow time, not a delay: the published progress chases the scroll
target with an exponential filter so the frame converges instead of snapping or
drifting behind, and `smoothing={0}` tracks every scroll event exactly. Motion still
follows the viewer while the section is on screen and stops when it leaves,
when the tab is hidden, or while `enabled` is false — the component then reports a
static frame and installs no listeners. `useWindowScroll` drives the same curve from
the section's own position in the document with a `100svh` stage, for full-page
heroes. A video source plays muted and looping only while the frame is visible and
enabled, and pauses for reduced motion. Without a source the stage shows a labelled
placeholder card instead of an empty frame.

Keyboard users can scroll the focused section with the arrow keys, Home and End,
and the region is named from the media description with the hint as its description.
Prop guards clamp start width and height to 10–100%, radii to 0–48px, zoom to
1–2.5×, `scrollDistance` to 0.4–3×, `holdDistance` to 0–1.5×, `smoothing` to 0–0.4s
and the scrim to 0–1, and `stageHeight` to 0–1400px (0 means content-sized). Live
values published as datasets (`data-frame`, `data-zoom`, `data-progress`,
`data-phase`, `data-scroll`, `data-target`, `data-length`, `data-stage`) keep the
geometry assertable without reading layout. Observers, listeners, timers and frames
are released on unmount, including StrictMode remounts, and offscreen or hidden
instances suspend their loop. The ref handle exposes `reset()`, `waitReady()` and
`progress()`.

The documentation provides preset, media, geometry, motion, overlay and scrim
controls, a desktop/mobile preview, a full-screen link, usage code, component/CSS
source tabs, an example, notes, use cases and a five-file source ZIP. The demo
media — two stills and one looping clip — was generated in-house for this study and
is excluded from the reusable archive. The catalog includes all 27 studies,
newest-first, with a contained inline WebP poster captured from the resting frame.

`node scripts/scroll-expand-smoke.mjs` mounts the component in a StrictMode host and
checks the placeholder state, both scroll sources, the resting frame before
measurement, eased geometry and media zoom across the whole curve, the
hint/title/overlay/scrim handover, reversible scrolling, zero and trailing
smoothing, wheel and keyboard scrolling, the enabled toggle, custom geometry and end
radius, page-scroll driving, muted looping video with offscreen and reduced-motion
pausing, reduced motion, prop guards, frame/observer/listener/timer hygiene,
StrictMode cleanup and remount, the preview page and its reset control, query bounds
and presets, the registry and documentation, the usage and source tabs, the source
download and the mobile layout.
