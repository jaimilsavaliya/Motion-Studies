import scrollExpandSource from '../components/ScrollExpand.jsx?raw';
import passageSource from '../components/PassageGallery.jsx?raw';
import passageCSS from '../components/PassageGallery.css?raw';
import domeGallerySource from '../components/DomeGallery.jsx?raw';
import domeGalleryCSS from '../components/DomeGallery.css?raw';
import paperCrumpleSource from '../components/PaperCrumple.jsx?raw';
import paperCrumpleCSS from '../components/PaperCrumple.css?raw';
import viscoseCarouselSource from '../components/ViscoseCarousel.jsx?raw';
import viscoseCarouselCSS from '../components/ViscoseCarousel.css?raw';
import scrollExpandCSS from '../components/ScrollExpand.css?raw';
import techTextSource from '../components/TechText.jsx?raw';
import techTextCSS from '../components/TechText.css?raw';
import ditherVeilSource from '../components/DitherVeil.jsx?raw';
import ditherVeilCSS from '../components/DitherVeil.css?raw';
import flexCarouselSource from '../components/FlexCarousel.jsx?raw';
import flexCarouselCSS from '../components/FlexCarousel.css?raw';
import gradientAsciiSource from '../components/GradientASCII.jsx?raw';
import gradientAsciiCSS from '../components/GradientASCII.css?raw';
import marqueePathSource from '../components/MarqueeAlongSvgPath.jsx?raw';
import marqueePathCSS from '../components/MarqueeAlongSvgPath.css?raw';
import dragSource from '../components/DragElements.jsx?raw';
import dragCSS from '../components/DragElements.css?raw';
import canvasSource from '../components/InfiniteCanvas.jsx?raw';
import canvasCSS from '../components/InfiniteCanvas.css?raw';
import membersSource from '../components/HoverMembers.jsx?raw';
import membersCSS from '../components/HoverMembers.css?raw';
import tikSource from '../components/TikTikColorList.jsx?raw';
import tikCSS from '../components/TikTikColorList.css?raw';
import polaroidSource from '../components/PolaroidFlipCard.jsx?raw';
import polaroidCSS from '../components/PolaroidFlipCard.css?raw';
import shutterSource from '../components/ShutterGallery.jsx?raw';
import shutterCSS from '../components/ShutterGallery.css?raw';
import gardenSource from '../components/TypeGarden.jsx?raw';
import gardenCSS from '../components/TypeGarden.css?raw';
import wheelSource from '../components/ImageWheel.jsx?raw';
import wheelCSS from '../components/ImageWheel.css?raw';
import elasticSource from '../components/ElasticCarousel.jsx?raw';
import elasticCSS from '../components/ElasticCarousel.css?raw';
import focusSource from '../components/FocusScaleCarousel.jsx?raw';
import focusCSS from '../components/FocusScaleCarousel.css?raw';
import parallaxSource from '../components/ParallaxCarousel.jsx?raw';
import parallaxCSS from '../components/ParallaxCarousel.css?raw';
import bentoSource from '../components/BentoGrid.jsx?raw';
import bentoCSS from '../components/BentoGrid.css?raw';
import cylinderSource from '../components/TextCylinder.jsx?raw';
import cylinderCSS from '../components/TextCylinder.css?raw';
import radialSource from '../components/RadialPopOut.jsx?raw';
import radialCSS from '../components/RadialPopOut.css?raw';
import hoverRevealSource from '../components/HoverReveal.jsx?raw';
import hoverRevealCSS from '../components/HoverReveal.css?raw';
import source from '../components/ScrollZoomReveal.jsx?raw';
import css from '../components/ScrollZoomReveal.css?raw';
import eclipseSource from '../components/Eclipse.jsx?raw';
import eclipseCSS from '../components/Eclipse.css?raw';

export const components = [{
  slug: 'scroll-zoom-reveal',
  name: 'Scroll Zoom Reveal',
  category: 'Media',
  number: '001',
  description: 'A little window into something bigger. Transform inline media into an immersive, full-screen moment as you scroll.',
  shortDescription: 'From a detail in your headline to the whole picture.',
  tags: ['Scroll', 'Video', 'Image', 'Reveal', 'React'],
  added: 'October 2026',
  source,
  css,
  filename: 'ScrollZoomReveal.jsx',
  cssFilename: 'ScrollZoomReveal.css',
  dependencies: 'React 18+',
  usage: `import ScrollZoomReveal from './components/ScrollZoomReveal';

export default function Hero() {
  return (
    <ScrollZoomReveal
      leading="Above"
      trailing="the shoreline"
      radius={24}
      scrollDistance={200}
    >
      <video
        src="/coast.mp4"
        poster="/coast-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
      />
    </ScrollZoomReveal>
  );
}`,
  imageUsage: `<ScrollZoomReveal
  leading="Beyond"
  trailing="the ordinary"
  radius={16}
>
  <img
    src="/landscape.jpg"
    alt="A mountain range at sunrise"
  />
</ScrollZoomReveal>`,
  props: [
    ['leading', 'string', '"Above"', 'Headline text before the media.'],
    ['trailing', 'string', '"the shoreline"', 'Headline text after the media.'],
    ['radius', 'number', '24', 'Initial corner radius in pixels. Eases to zero at full expansion.'],
    ['scrollDistance', 'number', '200', 'Scroll travel in viewport-height units, in addition to the sticky viewport. Use a positive value.'],
    ['onProgress', '(value: number) => void', '—', 'Optional callback with normalized reveal progress from 0 to 1.'],
    ['children', 'ReactNode', 'Required', 'An image, video, or other media. Fills the frame with object-fit: cover.'],
  ],
  useCases: [
    ['Portfolio opener', 'Let a small preview of your work become the main event.'],
    ['Product reveal', 'Introduce a product in the headline, then give it the whole screen.'],
    ['Editorial transition', 'Move from a story’s introduction into an immersive visual.'],
  ],
}, {
  slug: 'eclipse',
  name: 'Eclipse',
  category: 'WebGL',
  number: '002',
  description: 'A quiet spectacle, rendered in light. A dark lunar disc, a luminous corona, and a drifting diamond-ring flare—made for your next unforgettable hero.',
  shortDescription: 'A luminous corona. A moment of totality.',
  tags: ['WebGL', 'Shader', 'Background', 'Interactive', 'React'],
  added: 'October 2026',
  source: eclipseSource,
  css: eclipseCSS,
  filename: 'Eclipse.jsx',
  cssFilename: 'Eclipse.css',
  dependencies: 'React 18+ · WebGL 1',
  usage: `import Eclipse from './components/Eclipse';

export default function Hero() {
  return (
    <section style={{ position: 'relative', height: 560, background: '#000' }}>
      <Eclipse
        radius={0.205}
        intensity={1}
        speed={1}
        color="#eef0ff"
        interactive
      />
      <h1 style={{
        position: 'absolute', inset: 0, display: 'grid',
        placeItems: 'center', color: '#fff', textAlign: 'center',
        margin: 0, fontSize: 'clamp(28px, 5vw, 56px)',
      }}>
        Your headline
      </h1>
    </section>
  );
}`,
  pauseUsage: `'use client';

import { useState } from 'react';
import Eclipse from './components/Eclipse';

export default function EclipseHero() {
  const [paused, setPaused] = useState(false);

  return (
    <section style={{ position: 'relative', height: 560, background: '#000' }}>
      <Eclipse paused={paused} />
      <button
        type="button"
        onClick={() => setPaused(value => !value)}
        aria-pressed={paused}
        style={{
          position: 'absolute', bottom: 24, right: 24,
          color: '#fff', background: '#151515',
          border: '1px solid #555', padding: '8px 12px',
          borderRadius: 6, cursor: 'pointer',
        }}
      >
        {paused ? 'Play animation' : 'Pause animation'}
      </button>
    </section>
  );
}`,
  props: [
    ['radius', 'number', '0.205', 'Disc radius as a fraction of the shorter container side. Clamped to 0.1–0.35.'],
    ['intensity', 'number', '1', 'Corona brightness. Clamped to 0–2. Star details are independent of this value.'],
    ['speed', 'number', '1', 'Animation time multiplier, clamped to 0–3. Zero freezes drift; pointer interaction may still move the view.'],
    ['color', 'string', '"#eef0ff"', 'Six-digit hex tint for the corona. Invalid values use the default.'],
    ['interactive', 'boolean', 'true', 'Move the foreground disc with the cursor while the corona stays fixed, exposing a flare on the opposite edge. Disabled under reduced-motion preference.'],
    ['paused', 'boolean', 'false', 'Pause the animation loop. Changes to other props still redraw one frame.'],
    ['pixelRatio', 'number', '1.5', 'Maximum render pixel ratio, limited by device DPR and clamped to 0.5–2. Lower values reduce GPU work.'],
    ['className', 'string', '""', 'Optional class on the positioned root element.'],
  ],
  useCases: [
    ['Centered hero', 'Put a short headline on the black disc. Let the corona frame your words.'],
    ['Product launch', 'Give a launch or announcement a gentle visual rhythm with drifting light.'],
    ['Immersive backdrop', 'Add a restrained, cinematic focal point to a dark landing page.'],
  ],
}, {
  slug: 'hover-reveal',
  name: 'Hover Reveal',
  category: 'Media',
  number: '003',
  description: 'An editorial index that comes alive as you explore. Move between names to reveal their images with a soft crossfade, a settling zoom, and a subtle sense of motion.',
  shortDescription: 'A name, an image, a little discovery.',
  tags: ['Hover', 'Image', 'Index', 'Accessible', 'React'],
  added: 'October 2026',
  source: hoverRevealSource,
  css: hoverRevealCSS,
  filename: 'HoverReveal.jsx',
  cssFilename: 'HoverReveal.css',
  dependencies: 'React 18+ · Web Animations API',
  usage: `import HoverReveal from './components/HoverReveal';

const items = [
  { name: 'Blackframe', src: '/hover-reveal/blackframe.webp' },
  { name: 'Novagrid', src: '/hover-reveal/novagrid.webp' },
  { name: 'Ather', src: '/hover-reveal/ather.webp' },
  { name: 'Phantom', src: '/hover-reveal/phantom.webp' },
  { name: 'Obsedian', src: '/hover-reveal/obsedian.webp' },


];

export default function ProjectIndex() {
  return (
    <HoverReveal
      label="Protocols"
      items={items}
      duration={770}
      zoom={1.4}
      parallax={9}
      drift
      radius={18}
      theme="dark"
    />
  );
}`,
  teamUsage: `import HoverReveal from './components/HoverReveal';

const team = [
  {
    name: 'Alex Morgan',
    src: '/team/alex.webp',
    alt: 'Alex Morgan, creative director',
    objectPosition: '50% 30%',
  },
  {
    name: 'Sam Rivera',
    src: '/team/sam.webp',
    alt: 'Sam Rivera, lead designer',
  },
];

export default function Team() {
  return (
    <HoverReveal
      label="Our people"
      items={team}
      theme="light"
      initialIndex={0}
      drift={false}
      parallax={0}
    />
  );
}`,
  props: [
    ['items', 'Array<RevealItem>', '[]', 'The image index. Each item needs a name and src; alt and objectPosition are optional. An empty array shows an empty state.'],
    ['label', 'string', '"Protocols"', 'Small uppercase label above the index. Use an empty string to hide it.'],
    ['initialIndex', 'number', '0', 'Initially selected item, clamped to the array bounds. Read on mount only.'],
    ['duration', 'number', '770', 'Crossfade duration in milliseconds, clamped to 0–2500. The zoom settles over about 1.82× this duration. Zero switches instantly.'],
    ['zoom', 'number', '1.4', 'Incoming image scale, clamped to 1–1.8. Settles to 1. Set to 1 for crossfade only.'],
    ['parallax', 'number', '9', 'Maximum pointer-driven displacement per axis, in pixels. Clamped to 0–20. Zero disables pointer movement.'],
    ['drift', 'boolean', 'true', 'Enable the slow, 8px vertical image float. Independent of pointer movement.'],
    ['radius', 'number', '18', 'Outer border radius in pixels, clamped to 0–40.'],
    ['theme', '"dark" | "light"', '"dark"', 'Color theme for the panel, labels, and dividers.'],
    ['onActiveChange', '(index, item) => void', '—', 'Called when selection changes through hover, focus, or click. Not called on initial mount.'],
    ['className', 'string', '""', 'Optional class on the outer container.'],
  ],
  useCases: [
    ['Client index', 'Trade a static logo wall for a browsable, image-led list.'],
    ['Team portraits', 'Introduce the people behind the work, one name at a time.'],
    ['Selected work', 'Build an editorial case-study index with memorable project covers.'],
  ],
}, {
  slug: 'radial-pop-out',
  name: 'Radial Pop-out',
  category: 'Media',
  number: '004',
  description: 'One cover. A whole collection behind it. Hover to send related images into a playful, staggered orbit, while the hero follows your cursor with a gentle 3D tilt.',
  shortDescription: 'A small cover with a world behind it.',
  tags: ['Hover', 'Gallery', 'Spring', 'Image', 'React'],
  source: radialSource,
  css: radialCSS,
  filename: 'RadialPopOut.jsx',
  cssFilename: 'RadialPopOut.css',
  dependencies: 'React 18+ · Web Animations API',
  usage: `import RadialPopOut from './components/RadialPopOut';

const hero = { src: '/radial-pop-out/japan.webp', alt: 'Japan' };
const items = [
  { src: '/radial-pop-out/fuji.webp', alt: 'Mount Fuji' },
  { src: '/radial-pop-out/hakone.webp', alt: 'Hakone at sunset' },
  { src: '/radial-pop-out/kyoto.webp', alt: 'Torii gates in Kyoto' },
  { src: '/radial-pop-out/osaka.webp', alt: 'An Osaka canal' },
  { src: '/radial-pop-out/ramen.webp', alt: 'A bowl of ramen' },
  { src: '/radial-pop-out/sakura.webp', alt: 'Cherry blossoms' },
  { src: '/radial-pop-out/shibuya.webp', alt: 'Shibuya at night' },
];

export default function Collection() {
  return (
    <RadialPopOut
      hero={hero}
      items={items}
      heroSize={280}
      cardSize={200}
      orbitRadius={210}
      stagger={25}
      tilt={10}
      magnetic={0.36}
      radius={16}
      defaultOpen={false}
    />
  );
}`,
  exampleUsage: `import RadialPopOut from './components/RadialPopOut';

export default function ProductCollection() {
  return (
    <RadialPopOut
      hero={{ src: '/products/featured.webp', alt: 'The new collection' }}
      items={[
        { src: '/products/one.webp', alt: 'Leather tote', rotation: -8 },
        { src: '/products/two.webp', alt: 'Canvas pouch', rotation: 6 },
        { src: '/products/three.webp', alt: 'Travel bag', rotation: -4 },
        { src: '/products/four.webp', alt: 'Wallet', rotation: 8 },
      ]}
      cardSize={140}
      heroSize={220}
      orbitRadius={170}
      tilt={0}
      magnetic={0}
    />
  );
}`,
  props: [
    ['hero', 'ImageItem', '—', 'The foreground image: src, alt, and optional objectPosition. Missing or failed images show a text fallback.'],
    ['items', 'Array<ImageItem>', '[]', 'Related images, clockwise from the top. Each can include rotation in degrees. With no items the hero is static and disabled.'],
    ['heroSize', 'number', '280', 'Desktop hero width/height in pixels, clamped to 80–400. Scales down, normally keeping a 150px touch target where space allows.'],
    ['cardSize', 'number', '200', 'Desktop satellite card width/height in pixels, clamped to 60–280.'],
    ['orbitRadius', 'number', '210', 'Distance from the center to each satellite center in pixels, clamped to 60–380.'],
    ['stagger', 'number', '25', 'Delay between each opening card in milliseconds, clamped to 0–100. Closing cards return together over 220ms.'],
    ['tilt', 'number', '10', 'Maximum hero rotation per axis in degrees, clamped to 0–20. Zero disables rotation.'],
    ['magnetic', 'number', '0.36', 'Hero translation as a fraction of cursor distance from its center, clamped to 0–0.5. Zero disables translation.'],
    ['radius', 'number', '16', 'Card corner radius in pixels, clamped to 0–48.'],
    ['defaultOpen', 'boolean', 'false', 'Initial expanded state. Read on mount only; changing it later does not control the component.'],
    ['onOpenChange', '(open: boolean) => void', '—', 'Called when the expanded state changes, not on initial mount.'],
    ['className', 'string', '""', 'Optional class on the outer responsive wrapper.'],
  ],
  useCases: [
    ['Featured collection', 'Put one product in the spotlight, with related pieces just behind it.'],
    ['Travel journal', 'Let a trip cover unfold into a handful of places and memories.'],
    ['Cast or album hub', 'Reveal supporting characters, tracks, or related releases around a hero.'],
  ],
}, {
  slug: 'text-cylinder',
  name: 'Text Cylinder',
  category: 'Media',
  number: '005',
  description: 'Type becomes a moving landscape. Two counter-rotating text rings surround a still photograph; click through to reveal the next image, title, and colour in one fluid transition.',
  shortDescription: 'A rotating world of type, one image at a time.',
  tags: ['Typography', '3D', 'Slideshow', 'React'],
  source: cylinderSource,
  css: cylinderCSS,
  filename: 'TextCylinder.jsx',
  cssFilename: 'TextCylinder.css',
  dependencies: 'React 18+ · CSS 3D transforms',
  usage: `import TextCylinder from './components/TextCylinder';

const slides = [
  {
    src: '/images/fuji.webp',
    alt: 'Mount Fuji behind a local train',
    lines: ["Mount Fuji", "Above the clouds"],
    color: '#2f5fb3',
    label: 'Yamanashi',
  },
  {
    src: '/images/kyoto.webp',
    alt: 'Rows of orange torii gates in Kyoto',
    lines: ['Kyoto', 'A thousand gates'],
    color: '#e0521b',
    label: 'Fushimi',
  },
  {
    src: '/images/shibuya.webp',
    alt: 'Neon signs on a Shibuya street at night',
    lines: ['Shibuya', 'After midnight'],
    color: '#d6266b',
    label: 'Tokyo',
  },
  {
    src: '/images/sakura.webp',
    alt: 'Cherry blossoms around a street lamp',
    lines: ['Sakura', 'First bloom'],
    color: '#c2185b',
    label: 'Spring',
  },
];

export default function TravelStories() {
  return (
    <TextCylinder
      slides={slides}
      speed={18}
      fontScale={0.24}
      imageWidth={22}
      mobileImageWidth={46}
      duration={700}
      initialIndex={0}
      paused={false}
      theme="dark"
    />
  );
}`,
  exampleUsage: `import { useState } from 'react';
import TextCylinder from './components/TextCylinder';

const projects = [
  { src: '/work/studio.webp', lines: ['Studio North', 'Independent ideas'],
    color: '#2444b8', label: 'Identity', alt: 'Studio North brand identity' },
  { src: '/work/objects.webp', lines: ['Everyday objects', 'A fresh perspective'],
    color: '#ae3a16', label: 'Product', alt: 'A collection of ceramic objects' },
];

export default function SelectedWork() {
  const [paused, setPaused] = useState(false);
  return (
    <>
      <button onClick={() => setPaused(value => !value)}>
        {paused ? 'Resume rotation' : 'Pause rotation'}
      </button>
      <TextCylinder
        slides={projects}
        speed={12}
        paused={paused}
        showControls={false}
        theme="light"
      />
    </>
  );
}`,
  props: [
    ['slides', 'Array<Slide>', '[]', 'Image, one or two title lines, accent colour, and caption for each slide. Empty arrays display a placeholder.'],
    ['speed', 'number', '18', 'Rotation in degrees per second, clamped to −60…60. The second line turns in the opposite direction. Negative values reverse both; zero freezes rotation.'],
    ['fontScale', 'number', '0.24', 'Text size as a fraction of the component height, clamped to 0.12–0.4, with a 24px minimum.'],
    ['imageWidth', 'number', '22', 'Image width as a percentage of the component, clamped to 12–45. The image keeps a 4:5 portrait ratio.'],
    ['mobileImageWidth', 'number', '46', 'Image width percentage when the container is narrower than 640px, clamped to 30–75.'],
    ['duration', 'number', '700', 'Image reveal duration in milliseconds, clamped to 200–1500. The type crossfade takes up to 450ms.'],
    ['initialIndex', 'number', '0', 'Initial slide, zero-based and wrapped to the slide count. Read on mount only.'],
    ['paused', 'boolean', 'false', 'Externally freezes rotation. Clicking through slides still works. A true value overrides the built-in play button.'],
    ['showControls', 'boolean', 'true', 'Shows a small pause button and click hint. Provide an alternative pause control if you hide it.'],
    ['theme', '"dark" | "light"', '"dark"', 'Sets the stage background and control contrast. Each slide supplies its own type colour.'],
    ['onSlideChange', '(index, slide) => void', '—', 'Called when a user selects the next or previous slide; not on initial mount.'],
    ['className', 'string', '""', 'Optional root class. Set height and aspect-ratio: auto to make a full-height hero.'],
  ],
  useCases: [
    ['Studio hero', 'Give selected work a bold typographic stage, with a new identity for every project.'],
    ['Travel and editorial', 'Turn destinations into a tactile sequence of photography, place names, and colour.'],
    ['Events and talks', 'Introduce speakers or sessions with moving titles and a focused portrait.'],
  ],
}, {
  slug: 'bento-grid',
  name: 'Bento Grid',
  category: 'Media',
  number: '006',
  description: 'An image grid with room for the whole story. Click a tile and watch it expand into a full-size photograph, with details alongside it. Browse the collection, then return right where you started.',
  shortDescription: 'A considered grid. A closer look.',
  tags: ['Grid', 'Gallery', 'Modal', 'React'],
  source: bentoSource,
  css: bentoCSS,
  filename: 'BentoGrid.jsx',
  cssFilename: 'BentoGrid.css',
  dependencies: 'React 18+ · React DOM · Web Animations API',
  usage: `import BentoGrid from './components/BentoGrid';

const items = [
  { id: 'neon', src: '/photos/neon.webp', title: 'Neon run',
    eyebrow: 'Night', alt: 'A silver car under neon lights',
    description: 'Colour and reflections on a late-night drive.',
    colSpan: 2, rowSpan: 2 },
  { id: 'wheel', src: '/photos/wheel.webp', title: 'Low and wide',
    eyebrow: 'Detail', description: 'A closer look at the details.' },
  { id: 'tail', src: '/photos/tail.webp', title: 'Tail light',
    eyebrow: 'Detail', description: 'A flash of red in the dark.', rowSpan: 2 },
  { id: 'interior', src: '/photos/interior.webp', title: 'After hours',
    eyebrow: 'Interior', description: 'The view from the driving seat.' },
  { id: 'trails', src: '/photos/trails.webp', title: 'Light trails',
    eyebrow: 'Motion', description: 'The city, drawn in light.', colSpan: 2 },
  { id: 'station', src: '/photos/station.webp', title: 'Last stop',
    eyebrow: 'Night', description: 'One more stop before heading home.', colSpan: 2 },
];

export default function PhotoStories() {
  return (
    <BentoGrid
      items={items}
      columns={4}
      gap={12}
      rowHeight={220}
      mobileRowHeight={150}
      radius={12}
      sidebarWidth={400}
      duration={700}
      theme="dark"
    />
  );
}`,
  exampleUsage: `import BentoGrid from './components/BentoGrid';

export default function SelectedWork() {
  return (
    <BentoGrid
      columns={3}
      rowHeight={240}
      theme="light"
      items={[
        {
          id: 'identity', src: '/work/identity.webp',
          title: 'Studio identity', eyebrow: 'Brand design',
          alt: 'A collection of printed brand materials',
          colSpan: 2, rowSpan: 2,
          description: <><p>A new identity for an independent studio.</p>
            <p>Strategy, typography, and a complete visual system.</p></>,
          credit: 'Your studio', creditHref: 'https://example.com',
        },
        { id: 'objects', src: '/work/objects.webp', title: 'Everyday objects',
          description: 'Thoughtfully designed objects for daily life.' },
        { id: 'space', src: '/work/space.webp', title: 'A place to create',
          description: 'A workspace built for collaboration.' },
      ]}
    />
  );
}`,
  props: [
    ['items', 'Array<BentoItem>', '[]', 'Image tiles with a title, optional details, grid spans, and photo credit. Keep IDs unique. Empty arrays show a placeholder.'],
    ['columns', 'number', '4', 'Desktop column count, clamped to 1–6. Containers narrower than 640px use at most two columns.'],
    ['gap', 'number', '12', 'Space between tiles in pixels, clamped to 0–32.'],
    ['rowHeight', 'number', '220', 'Desktop row height in pixels, clamped to 100–400.'],
    ['mobileRowHeight', 'number', '150', 'Row height below 640px container width, clamped to 80–300.'],
    ['radius', 'number', '12', 'Tile corner radius, clamped to 0–40px. The expanded image has 16px corners.'],
    ['sidebarWidth', 'number', '400', 'Desktop detail panel width in pixels, clamped to 280–520 and no more than 48% of the viewport. Below 768px it becomes a full-width bottom panel.'],
    ['duration', 'number', '700', 'Image expansion and return duration in milliseconds, clamped to 250–1200. Reduced motion makes both instant.'],
    ['theme', '"dark" | "light"', '"dark"', 'Detail panel and control appearance. Photo labels stay white for readability.'],
    ['onActiveChange', '(index, item) => void', '—', 'Receives the zero-based active index and item on open/navigation, or null, null when closed.'],
    ['className', 'string', '""', 'Optional grid wrapper class; use it to set your own max-width.'],
  ],
  useCases: [
    ['Feature stories', 'Give every tile a short introduction and an expanded explanation.'],
    ['Case studies', 'Show the work at a glance, then open the image and project details without navigating away.'],
    ['Product galleries', 'Pair detailed photographs with specifications and descriptive copy in the side panel.'],
  ],
}, {
  slug: 'parallax-carousel',
  name: 'Parallax Carousel',
  category: 'Carousels',
  number: '007',
  description: 'A continuous ribbon of photography with a little more depth. Drag in either direction, let the motion coast, and watch each image drift inside its frame as the collection loops seamlessly.',
  shortDescription: 'A moving collection with depth in every frame.',
  tags: ['Parallax', 'Drag', 'Infinite', 'React'],
  source: parallaxSource,
  css: parallaxCSS,
  filename: 'ParallaxCarousel.jsx',
  cssFilename: 'ParallaxCarousel.css',
  dependencies: 'React 18+ · CSS transforms',
  usage: `import ParallaxCarousel from './components/ParallaxCarousel';

const images = [
  { src: '/gallery/1.webp', alt: 'Ferris wheel at golden hour' },
  { src: '/gallery/2.webp', alt: 'Stingrays in turquoise shallows' },
  { src: '/gallery/3.webp', alt: 'A stream through a mossy forest' },
  { src: '/gallery/4.webp', alt: 'Kitesurfer crossing the bay' },
  { src: '/gallery/5.webp', alt: 'A phone booth on a tropical beach' },
  { src: '/gallery/6.webp', alt: 'Evening light over the coast' },
  { src: '/gallery/7.webp', alt: 'A boat in a clear cove' },
];

export default function TravelGallery() {
  return (
    <ParallaxCarousel
      images={images}
      cardWidth={320}
      cardHeight={600}
      gap={12}
      parallax={60}
      speed={34}
      radius={12}
      fade={80}
      mobileScale={0.62}
      autoPlay={true}
      pauseOnHover={true}
      showDots={false}
    />
  );
}`,
  exampleUsage: `import ParallaxCarousel from './components/ParallaxCarousel';

export default function ProductGallery() {
  return (
    <ParallaxCarousel
      images={[
        { src: '/products/one.webp', alt: 'Ceramic vase, front view' },
        { src: '/products/two.webp', alt: 'Glaze detail', objectPosition: '60% center' },
        { src: '/products/three.webp', alt: 'The collection on a shelf' },
      ]}
      cardWidth={220}
      cardHeight={300}
      parallax={40}
      autoPlay={false}
      showDots
    />
  );
}`,
  props: [
    ['images', 'Array<CarouselImage>', '[]', 'Image source, meaningful alt text, and optional objectPosition. Empty collections show a placeholder; one image disables automatic movement and navigation.'],
    ['cardWidth', 'number', '320', 'Desktop card width in pixels, clamped to 120–600.'],
    ['cardHeight', 'number', '600', 'Desktop card height in pixels, clamped to 160–800.'],
    ['gap', 'number', '12', 'Distance between cards in pixels, clamped to 0–48.'],
    ['parallax', 'number', '60', 'Maximum image shift in pixels, clamped to 0–160. Images are widened by twice this amount to prevent exposed edges. Zero disables image drift.'],
    ['speed', 'number', '34', 'Autoplay speed in pixels per second, clamped to −160…160. Positive moves left, negative moves right, zero stops automatic motion.'],
    ['radius', 'number', '12', 'Card corner radius in pixels, clamped to 0–48.'],
    ['fade', 'number', '80', 'Edge mask width in pixels, clamped to 0–160 and at most one third of the container width. Zero removes the fade.'],
    ['mobileScale', 'number', '0.62', 'Scale for card dimensions, gap, and parallax below 640px container width; clamped to 0.4–1.'],
    ['autoPlay', 'boolean', 'true', 'Enables continuous movement. Manual dragging and navigation still work when false.'],
    ['pauseOnHover', 'boolean', 'true', 'Smoothly slows autoplay to a stop while a mouse pointer is over the strip.'],
    ['paused', 'boolean', 'false', 'External autoplay pause. Does not disable dragging or navigation.'],
    ['showControls', 'boolean', 'true', 'Adds Previous, Pause/Play, Next, and a position count below the strip. If hidden, supply an alternative pause control.'],
    ['showDots', 'boolean', 'false', 'Adds direct image navigation to the control row; showControls must also be true.'],
    ['onIndexChange', '(index: number) => void', '—', 'Reports the zero-based image nearest the center when it changes, including initial layout and resize.'],
    ['className', 'string', '""', 'Optional root class. Leave around 50px beneath the strip for the absolute-positioned controls.'],
  ],
  useCases: [
    ['Editorial stories', 'Let a collection of destinations or moments flow as a continuous visual story.'],
    ['Portfolio covers', 'Browse project imagery with free dragging rather than a rigid snap-to-slide layout.'],
    ['Product photography', 'Reveal texture, detail, and alternate views through a manually browsable collection.'],
  ],
}, {
  slug: 'focus-scale-carousel', name: 'Focus Scale Carousel', category: 'Carousels', number: '008',
  description: 'One image in focus. A whole collection in view. Click a smaller frame to bring it forward as the surrounding cards recede, with a spring transition and editorial captions that follow the selection.',
  shortDescription: 'A collection that gives every image its moment.',
  tags: ['Focus', 'Scale', 'Spring', 'React'],
  source: focusSource, css: focusCSS, filename: 'FocusScaleCarousel.jsx', cssFilename: 'FocusScaleCarousel.css',
  dependencies: 'React 18+ · Web Animations API',
  usage: `import FocusScaleCarousel from './components/FocusScaleCarousel';

const items = [
  { src: '/gallery/1.webp', title: 'Ferris Wheel', collection: 'Golden Hour',
    alt: 'Ferris wheel at golden hour' },
  { src: '/gallery/2.webp', title: 'Stingrays', collection: 'Shallows',
    alt: 'Stingrays gliding through clear water' },
  { src: '/gallery/3.webp', title: 'Forest Stream', collection: 'Old Growth',
    alt: 'A stream running through a mossy forest' },
  { src: '/gallery/4.webp', title: 'Kitesurfer', collection: 'Shallows' },
  { src: '/gallery/5.webp', title: 'Phone Booth', collection: 'Golden Hour' },
  { src: '/gallery/6.webp', title: 'Golden Hour', collection: 'Golden Hour' },
  { src: '/gallery/7.webp', title: 'The Cove', collection: 'Shallows' },
  { src: '/gallery/8.webp', title: 'Sunset Cliff', collection: 'Golden Hour' },
];

export default function PhotoCollection() {
  return (
    <FocusScaleCarousel
      items={items}
      cardWidth={320}
      cardHeight={430}
      gap={14}
      neighborScale={0.37}
      scaleDecay={0.78}
      sideCount={6}
      duration={850}
      autoPlay={4000}
      mobileScale={0.55}
      radius={2}
      showFrame={true}
    />
  );
}`,
  exampleUsage: `import FocusScaleCarousel from './components/FocusScaleCarousel';

export default function Lookbook() {
  return (
    <FocusScaleCarousel
      items={[
        { src: '/looks/one.webp', title: 'Tangerine Dream', collection: 'Studio Pop' },
        { src: '/looks/two.webp', title: 'Peach Hour', collection: 'Warm Room' },
        { src: '/looks/three.webp', title: 'Prism Gate', collection: 'After Dark' },
      ]}
      cardWidth={300}
      cardHeight={400}
      neighborScale={0.45}
      autoPlay={0}
      sideCount={3}
    />
  );
}`,
  props: [
    ['items', 'Array<FocusItem>', '[]', 'Image source, title, collection caption, optional alt text and crop position. Empty arrays display a placeholder.'],
    ['cardWidth', 'number', '320', 'Desktop focused-card width in pixels, clamped to 120–500.'],
    ['cardHeight', 'number', '430', 'Desktop focused-card height in pixels, clamped to 160–700.'],
    ['gap', 'number', '14', 'Edge-to-edge spacing between cards in pixels, clamped to 0–40.'],
    ['neighborScale', 'number', '0.37', 'Scale of the nearest side card relative to the focused image, clamped to 0.2–0.8.'],
    ['scaleDecay', 'number', '0.78', 'Additional scale multiplier for each card farther from the center, clamped to 0.5–0.95.'],
    ['sideCount', 'number', '6', 'Cards on each side, clamped to 1–8. Repeated items fill the sides when the collection is short; duplicate controls are hidden from screen readers.'],
    ['duration', 'number', '850', 'Spring transition duration in milliseconds, clamped to 200–1600.'],
    ['autoPlay', 'number', '4000', 'Milliseconds between selections. Zero disables autoplay; positive values are clamped to 1000–15000. Hover, keyboard focus, dragging, and hidden/offscreen views pause it.'],
    ['mobileScale', 'number', '0.55', 'Scale applied to dimensions, spacing, frame, and captions below 640px container width; clamped to 0.35–1.'],
    ['radius', 'number', '2', 'Card corner radius in pixels before each side-card transform, clamped to 0–30.'],
    ['showFrame', 'boolean', 'true', 'Show the four corner marks around the focused card.'],
    ['showControls', 'boolean', 'true', 'Adds Previous/Pause/Next below the carousel. Provide an alternative pause control when hidden.'],
    ['paused', 'boolean', 'false', 'External autoplay pause. Clicking, swiping, and keyboard navigation remain enabled.'],
    ['initialIndex', 'number', '0', 'Initial zero-based item index, wrapped to the item count. Read on mount only.'],
    ['onIndexChange', '(index, item) => void', '—', 'Called on user or autoplay selection changes, not on initial mount.'],
    ['className', 'string', '""', 'Optional root class. Leave about 50px beneath the carousel for the controls.'],
  ],
  useCases: [
    ['Fashion lookbooks', 'Present one look at full size while the rest of the collection stays within reach.'],
    ['Photographer portfolios', 'Name the series above the frame and the photograph below it.'],
    ['Product colourways', 'Keep the selected variant legible while neighbouring options act as a visual index.'],
  ],
}, {
  slug: 'elastic-carousel', name: 'Elastic Carousel', category: 'Carousels', number: '009',
  description: 'A quiet thumbnail strip opens into a tactile image reel. Drag to stretch and blur the photographs, let go to settle onto a slide, and click the centered image for a closer, distraction-free view.',
  shortDescription: 'A photographic reel with a little give.',
  tags: ['WebGL', 'Drag', 'Elastic', 'React'],
  source: elasticSource, css: elasticCSS, filename: 'ElasticCarousel.jsx', cssFilename: 'ElasticCarousel.css',
  dependencies: 'React 18+ · Native WebGL · CSS fallback',
  usage: `import ElasticCarousel from './components/ElasticCarousel';

const items = [
  { src: '/gallery/1.webp', title: 'Ferris Wheel', alt: 'Ferris wheel at golden hour' },
  { src: '/gallery/2.webp', title: 'Stingrays', alt: 'Stingrays in turquoise water' },
  { src: '/gallery/3.webp', title: 'Forest Stream', alt: 'A stream through a mossy forest' },
  { src: '/gallery/4.webp', title: 'Kitesurfer', alt: 'Kitesurfer crossing the bay' },
  { src: '/gallery/5.webp', title: 'Phone Booth', alt: 'A phone booth on a beach' },
  { src: '/gallery/6.webp', title: 'Golden Hour', alt: 'Evening light over the coast' },
  { src: '/gallery/7.webp', title: 'The Cove', alt: 'Boat anchored in a clear cove' },
  { src: '/gallery/8.webp', title: 'Sunset Cliff', alt: 'Sun setting behind a sea cliff' },
];

export default function ImageReel() {
  return (
    <ElasticCarousel
      items={items}
      height={560}
      stretch={1}
      blur={1}
      gap={16}
      intro={true}
      initialIndex={3}
      pixelRatio={1.5}
    />
  );
}`,
  exampleUsage: `import ElasticCarousel from './components/ElasticCarousel';

export default function ArchitectureGallery() {
  return (
    <ElasticCarousel
      items={[
        { src: '/work/atrium.webp', title: 'Atrium', alt: 'Light-filled atrium' },
        { src: '/work/stairwell.webp', title: 'Stairwell', alt: 'A curved concrete stair' },
        { src: '/work/courtyard.webp', title: 'Courtyard', alt: 'An enclosed garden' },
      ]}
      height={520}
      stretch={0.5}
      blur={0}
      intro={false}
      initialIndex={0}
      pixelRatio={1}
    />
  );
}`,
  props: [
    ['items', 'Array<ElasticItem>', '[]', 'Image source, title, and optional descriptive alt text. Empty arrays show a placeholder.'],
    ['height', 'number', '560', 'Desktop stage height in pixels, clamped to 280–800. Below 640px container width it scales to 60%. The image reel uses the middle 60% of the stage.'],
    ['stretch', 'number', '1', 'Velocity-driven bend and stretch strength, clamped to 0–2. Zero keeps the image planes straight.'],
    ['blur', 'number', '1', 'Directional motion-blur strength, clamped to 0–2. Zero removes blur. Settled images are always sharp.'],
    ['gap', 'number', '16', 'Desktop gap between expanded images in pixels, clamped to 4–40. Scales down on mobile.'],
    ['intro', 'boolean', 'true', 'Reveal thumbnails one by one, hold the strip, then expand automatically with motion blur. False starts expanded. Reduced motion skips the entrance.'],
    ['initialIndex', 'number', 'Middle item', 'Initial zero-based selection; clamped to the collection. Read on mount. For eight items the default is index 3.'],
    ['pixelRatio', 'number', '1.5', 'Rendering resolution cap, clamped to 0.5–2 and limited by device pixel ratio. Use 1 to lower GPU cost.'],
    ['showControls', 'boolean', 'true', 'Adds Previous/Next controls and a short interaction hint beneath the counter.'],
    ['onIndexChange', '(index, item) => void', '—', 'Called as the nearest centered image changes, including while dragging.'],
    ['onOpenChange', '(open: boolean) => void', '—', 'Called when the isolated-image view opens or closes.'],
    ['className', 'string', '""', 'Optional class on the root stage. The stage fills its parent width.'],
  ],
  useCases: [
    ['Studio portfolios', 'Turn a row of project covers into a browsable reel without leaving the page.'],
    ['Architecture galleries', 'Let tall interior and exterior photographs sit at the center of attention.'],
    ['Campaign lookbooks', 'Begin quietly with thumbnails, then let the imagery take over.'],
  ],
}, {
  slug: 'image-wheel',
  name: 'Image Wheel', category: 'Carousels', number: '010',
  description: 'A photographic wheel with a shallow arc and a soft sense of depth. Drag to turn it, or choose a neighbouring frame and let it settle into focus.',
  shortDescription: 'A turn of the wheel. A new point of focus.',
  tags: ['Drag', 'Depth of field', 'Spring', 'React'], added: 'October 2026',
  source: wheelSource, css: wheelCSS, filename: 'ImageWheel.jsx', cssFilename: 'ImageWheel.css', dependencies: 'React 18+',
  usage: `import ImageWheel from './components/ImageWheel';

const images = [
  { src: '/images/coast.webp', alt: 'Golden light along the coast' },
  { src: '/images/forest.webp', alt: 'A stream through the forest' },
  { src: '/images/sea.webp', alt: 'A quiet turquoise bay' },
  { src: '/images/cliff.webp', alt: 'Sunset over the cliffs' },
];

export default function PhotoWheel() {
  return <ImageWheel
    images={images}
    cardSize={190}
    radius={430}
    height={520}
    angle={24}
    blur={9}
    tilt={1}
    initialIndex={0}
    showControls={false}
  />;
}`,
  exampleUsage: `import { useState } from 'react';
import ImageWheel from './components/ImageWheel';

const projects = [
  { src: '/covers/shore.webp', alt: 'Shore — an ocean study' },
  { src: '/covers/city.webp', alt: 'City — an urban journal' },
  { src: '/covers/forest.webp', alt: 'Forest — a field guide' },
];

export default function ProjectPicker() {
  const [selected, setSelected] = useState(1);
  return <>
    <ImageWheel images={projects} initialIndex={1}
      radius={320} cardSize={180} height={440}
      blur={5} tilt={0.5} showControls
      onIndexChange={setSelected} />
    <p>{projects[selected].alt}</p>
  </>;
}`,
  props: [
    ['images', 'WheelImage[]', '[]', 'Images with src and descriptive alt text. Square frames center-crop each image.'],
    ['cardSize', 'number', '190', 'Unscaled square card size in pixels, clamped to 60–360.'],
    ['radius', 'number', '420', 'Horizontal arc radius, clamped to 120–800. This demo uses 430 to match the public preview.'],
    ['height', 'number', '520', 'Unscaled stage height, clamped to 200–800. The composition scales together to fit its container.'],
    ['angle', 'number', '24', 'Angular spacing in degrees, clamped to 12–60. Images behind the front half of the wheel are hidden.'],
    ['blur', 'number', '9', 'Depth-of-field strength, clamped to 0–18. The front image stays sharp. Zero removes depth blur.'],
    ['tilt', 'number', '1', 'Scales the small deterministic card rotations, clamped to 0–2. Zero keeps every card upright.'],
    ['initialIndex', 'number', '0', 'Starting image, clamped to the collection and read on mount. Navigation stops at the first and last image.'],
    ['showControls', 'boolean', 'false', 'Optional Previous/Next buttons and count. Hidden in the reference-style demo.'],
    ['onIndexChange', '(index, image) => void', '—', 'Called when the nearest front image changes, including during a drag.'],
    ['onSelect', '(index, image) => void', '—', 'Called when an already-centered image is activated. Does not open an internal modal.'],
    ['className', 'string', '""', 'Additional class for the full-width wheel stage.'],
  ],
  useCases: [
    ['Photography portfolios', 'Let a body of work pass through the focus of a single frame.'],
    ['Launch heroes', 'A tactile first impression for a product, film, or campaign.'],
    ['Cover browsers', 'Browse album artwork with the depth of a physical rack.'],
    ['Project pickers', 'Choose a case study from an arc of covers rather than a flat grid.'],
  ],
}, {
  slug: 'type-garden', name: 'Type Garden', category: 'Typography', number: '011',
  description: 'A little garden, grown from your words. Letters sprout winding vines and bright flowers; turn the composition into a looping botanical poster.',
  shortDescription: 'Type a thought. Watch it bloom.',
  tags: ['Typing', 'Generative art', 'Canvas', 'Export'], added: 'October 2026',
  source: gardenSource, css: gardenCSS, filename: 'TypeGarden.jsx', cssFilename: 'TypeGarden.css', dependencies: 'React 18+ · bundled OFL font',
  usage: `import TypeGarden from './components/TypeGarden';

export default function ArtPlayground() {
  return <TypeGarden
    height={720}
    initialText={""}
    initialMode={"type"}
    initialPalette={"Rose noir"}
    initialMotion={"breathe"}
    fontSize={240}
    density={1}
    seed={23}
    maxLength={80}
    exportSize={1080}
    exportFps={30}
  />;
}`,
  exampleUsage: `import TypeGarden from './components/TypeGarden';

export default function PosterStudio() {
  return <TypeGarden
    height="100svh"
    initialMode="poster"
    initialText="in bloom"
    initialPalette="Paper"
    initialMotion="visitor"
    exportSize={1080}
    exportFps={30}
    onTextChange={text => console.log('Garden words:', text)}
    onExport={({ format, blob }) => {
      console.log(format, blob.size, 'bytes, generated locally');
    }}
  />;
}`,
  props: [
    ['initialText','string','""','Initial words, read on mount. Type mode starts empty; Poster mode uses “in bloom” when no initial words are supplied.'],
    ['initialMode','"type" | "poster"','"type"','Start with the typing canvas or the square poster editor.'],
    ['initialPalette','string','"Rose noir"','One of the ten named palettes. Unknown names fall back to Rose noir.'],
    ['initialMotion','string','"breathe"','breathe, grow, typed, gust, reach, scatter, or visitor. Used by Poster mode.'],
    ['height','number | CSS string','720','Stage height. Numbers are clamped to 400–1200px; CSS values such as 100svh are also supported.'],
    ['fontSize','number','240','Maximum type size, clamped to 60–360px. Text fits the stage; posters use 80% of this size in a 1080px design space.'],
    ['density','number','1','Secondary bloom density, clamped to 0–2. Main flowers remain at zero.'],
    ['seed','number','23','Deterministic flower geometry seed, clamped to 0–999999. Regrow creates a new variation from the same words.'],
    ['maxLength','number','80','Grapheme limit, clamped to 1–160. Paste and mobile input use the same limit.'],
    ['exportSize','number','1080','Square poster export dimensions, clamped to 256–1080px. Type mode stills use the current stage size.'],
    ['exportFps','number','30','Poster animation export frame rate, clamped to 6–30. Lower values reduce ZIP size and recording work.'],
    ['autoFocus','boolean','false','Focus the typing input on mount. Keep false inside larger pages so the component does not steal keyboard focus.'],
    ['onTextChange','(text) => void','—','Called for user edits and clears in either mode.'],
    ['onExport','({format, blob}) => void','—','Called after a locally generated file is downloaded. Clipboard copy does not fire this callback.'],
    ['className','string','""','Additional class on the root stage.'],
  ],
  useCases: [
    ['Interactive lettering', 'Invite visitors to turn a short thought into a growing composition.'],
    ['Botanical posters', 'Create a square animated artwork from a title, name, or phrase.'],
    ['Personal greetings', 'Make a downloadable floral message without a backend or image service.'],
    ['Creative coding workshops', 'Explore deterministic drawing, typography, and seamless motion presets.'],
  ],
}, {
  slug: 'shutter-gallery', name: 'Shutter Gallery', category: 'Media', number: '012',
  description: 'A collection behind closed shutters. Hover for a glimpse, click to open a frame, and let the image reveal itself without changing its scale.',
  shortDescription: 'A glimpse. A click. The full picture.',
  tags: ['Gallery', 'Hover', 'Responsive', 'Accessible'], added: 'October 2026',
  source: shutterSource, css: shutterCSS, filename: 'ShutterGallery.jsx', cssFilename: 'ShutterGallery.css', dependencies: 'React 18+ · CSS',
  usage: `import ShutterGallery from './components/ShutterGallery';

const items = [
  { src: '/images/car-1.jpg', alt: 'Red sports car in a dark studio',
    title: 'Crimson Edge', subtitle: 'Front three-quarter, studio black' },
  { src: '/images/car-2.jpg', alt: 'Round red tail lamps on black bodywork',
    title: 'Twin Embers', subtitle: 'Round tail lamps, gloss black' },
  { src: '/images/car-3.jpg', alt: 'A red coupe on a city street at night',
    title: 'Night Run', subtitle: 'Rear three-quarter, 2:14 AM' },
];

export default function Collection() {
  return <ShutterGallery items={items} height={520}
    gap={12} expandedGrow={12.6} defaultOpen={null} />;
}`,
  exampleUsage: `import { useState } from 'react';
import ShutterGallery from './components/ShutterGallery';

export default function ProjectGallery({ projects }) {
  const [open, setOpen] = useState(null);
  return <>
    <ShutterGallery items={projects} height={480}
      open={open} onOpenChange={setOpen} aria-label="Selected projects" />
    <button onClick={() => setOpen(null)} disabled={open === null}>
      Close image
    </button>
    <p aria-live="polite">{open === null ? 'Choose a project' : projects[open]?.title}</p>
  </>;
}`,
  props: [
    ['items', 'ShutterItem[]', '[]', 'Images with src, alt, optional title, subtitle and objectPosition. Use a modest collection; eight are shown in the demo.'],
    ['height', 'number', '480', 'Gallery height in pixels, clamped to 240–1000. The demo uses 520.'],
    ['gap', 'number', '12', 'Horizontal gap in pixels, clamped to 0–32. Halved in the vertical layout.'],
    ['expandedGrow', 'number', '12.6', 'Open panel flex weight, clamped to 2–24. Other panels have weight 1, or 1.35/1.6 while peeking.'],
    ['defaultOpen', 'number | null', 'null', 'Initial zero-based open index for uncontrolled usage. Read on mount. Invalid indices close all shutters.'],
    ['open', 'number | null', 'undefined', 'Controlled open index. Pass null to close; omit the prop to let the gallery manage state.'],
    ['onOpenChange', '(index: number | null) => void', '—', 'Called when a user requests a different selection. Controlled parents must update open.'],
    ['aria-label', 'string', '"Image gallery"', 'Accessible name for the gallery group.'],
    ['className', 'string', '""', 'Additional root class. The component fills its parent width.'],
  ],
  useCases: [
    ['Product collections', 'Let a lineup reveal one carefully art-directed product at a time.'],
    ['Photography portfolios', 'Move from a sliver of atmosphere to a full, captioned frame.'],
    ['Editorial chapters', 'Give each chapter a visual doorway without leaving the page.'],
    ['Selected projects', 'Present a compact collection with controlled selection and external detail.'],
  ],
}
, {
  slug: 'polaroid-flip-card', name: 'Polaroid Flip Card', category: 'Media', number: '013',
  description: 'A photograph with a story on the other side. A little paper depth, a handwritten date, and a tactile turn that makes a memory feel like something you can hold.',
  shortDescription: 'Every picture has another side.',
  tags: ['3D flip', 'Pointer tilt', 'Photography', 'Handwriting'], added: 'October 2026',
  source: polaroidSource, css: polaroidCSS, filename: 'PolaroidFlipCard.jsx', cssFilename: 'PolaroidFlipCard.css', dependencies: 'React 18+ · bundled OFL font',
  usage: `import PolaroidFlipCard from './components/PolaroidFlipCard';

export default function Memory() {
  return <PolaroidFlipCard
    src="/photos/sakura.jpg"
    alt="Cherry blossoms in bloom"
    caption="04/02/25"
    message={"kyoto, april.\\ni got up before the crowds\\nand had the whole path to myself.\\npetals everywhere, no one around.\\nbest morning of the trip."}
    width={340} rotation={-3} tilt={14} duration={760}
    theme="dark" defaultFlipped={false}
  />;
}`,
  exampleUsage: `import { useState } from 'react';
import PolaroidFlipCard from './components/PolaroidFlipCard';

export default function GuestNote() {
  const [flipped, setFlipped] = useState(false);
  return <>
    <PolaroidFlipCard src="/photos/together.jpg"
      alt="A couple walking along the shore" caption="06/14/26"
      message={"We are so glad you are here.\\nThank you for being part of our story."}
      theme="light" rotation={2}
      flipped={flipped} onFlipChange={setFlipped} />
    <button onClick={() => setFlipped(value => !value)}>
      {flipped ? 'See the photograph' : 'Read our note'}
    </button>
  </>;
}`,
  props: [
    ['src', 'string', '—', 'Your photograph URL. The square image uses object-fit: cover; missing media has a fallback.'],
    ['alt', 'string', '"Photograph"', 'Descriptive image text and the accessible name of the flip button.'],
    ['caption', 'string', '""', 'Short handwritten date or caption below the photograph.'],
    ['message', 'string', '""', 'Handwritten note on the reverse. Newlines are preserved. Keep it brief; long notes scroll inside the card.'],
    ['width', 'number', '340', 'Card width in pixels, clamped to 160–640 and limited to its container. All paper and type proportions scale together.'],
    ['rotation', 'number', '-3', 'Resting front-face rotation in degrees, clamped to −20–20. The reverse turns upright. Leave space around rotated cards.'],
    ['tilt', 'number', '14', 'Horizontal pointer tilt limit in degrees, clamped to 0–24; vertical tilt is 80% of this. Zero disables angular tilt.'],
    ['duration', 'number', '760', 'Flip duration in milliseconds, clamped to 200–1600. The independent pointer response and outer rotation use their own timing.'],
    ['theme', '"dark" | "light"', '"dark"', 'Paper, edge, ink, and shadow colors. Explicit so the card also works outside the library.'],
    ['defaultFlipped', 'boolean', 'false', 'Initial reverse-side state for uncontrolled usage, read on mount.'],
    ['flipped', 'boolean', 'undefined', 'Controlled state. Omit to let the card manage its own side.'],
    ['onFlipChange', '(flipped: boolean) => void', '—', 'Called when a user requests a side change. Controlled parents must update flipped.'],
    ['objectPosition', 'string', '"center"', 'CSS object-position for the photograph crop.'],
    ['className', 'string', '""', 'Additional class on the native button.'],
  ],
  useCases: [
    ['Travel journals', 'A favorite photograph on the front, the moment behind it on the back.'],
    ['Wedding memories', 'Pair a date with a personal note for the people who were there.'],
    ['About pages', 'Turn a portrait over to discover a short, human introduction.'],
    ['Testimonials', 'A face, a name, and a few handwritten words from a customer.'],
  ],
}, {
  slug: 'tik-tik-color-list', name: 'Tik Tik Color List', category: 'Interactions', number: '014',
  description: 'An archive with a rhythm of its own. Oversized project names scroll through a changing field of color, with a floating image you can pick up and move.',
  shortDescription: 'Keep scrolling. Find your next color.',
  tags: ['Infinite scroll', 'Color', 'Draggable', 'Sound'], added: 'October 2026',
  source: tikSource, css: tikCSS, filename: 'TikTikColorList.jsx', cssFilename: 'TikTikColorList.css', dependencies: 'React 18+ · bundled OFL font',
  usage: `import TikTikColorList from './components/TikTikColorList';

const projects = [
  { id: 0, name: 'Aarzoo', badge: 'Print Design', date: '01 sep',
    bgColor: '#ff0000', image: '/images/aarzoo.webp' },
  { id: 1, name: 'Lost Horizons', badge: 'Concept Art', date: '01 sep',
    bgColor: '#ffffff', image: '/images/horizons.webp' },
  { id: 2, name: 'Eternal Echoes', badge: 'Typography', date: '01 sep',
    bgColor: '#8b5cf6', image: '/images/echoes.webp' },
];

export default function Archive() {
  return <TikTikColorList projects={projects} height={720}
    showPreview={true} previewSize="lg" enableSound={false}
    infiniteScroll={true} scrollThreshold={1000} />;
}`,
  exampleUsage: `import { useState } from 'react';
import TikTikColorList from './components/TikTikColorList';

export default function Portfolio({ projects }) {
  const [sound, setSound] = useState(false);
  return <>
    <button onClick={() => setSound(value => !value)}>
      {sound ? 'Disable sound' : 'Enable sound on next interaction'}
    </button>
    <TikTikColorList projects={projects} height="85svh"
      enableSound={sound} previewSize="md"
      onActiveChange={(index, project) => console.log(project.name)}
      onSelect={(index, project) => console.log('Open project:', project.id)} />
  </>;
}`,
  props: [
    ['projects', 'Project[]', '[]', 'Projects with id, name, badge, bgColor and image. Optional date, description, alt and objectPosition. Empty arrays have a fallback.'],
    ['height', 'number | CSS string', '720', 'Stage height. Numbers clamp to 320–1200px; CSS values such as 100svh are supported. The stage owns its scroll container.'],
    ['showPreview', 'boolean', 'true', 'Show the floating image on containers at least 768px wide. Hidden on narrower layouts.'],
    ['previewSize', '"sm" | "md" | "lg"', '"lg"', 'Square preview size: 240, 320 or 400px, positioned 40px from the bottom and right edges.'],
    ['enableSound', 'boolean', 'false', 'Enable ticks on active-project changes after a click or key press unlocks audio. Muted by default; blocked audio never blocks navigation.'],
    ['soundSrc', 'string', '—', 'Optional appropriately licensed audio file. The component uses a synthesized tick when omitted or unavailable.'],
    ['infiniteScroll', 'boolean', 'true', 'Recycle a bounded set of repeated rows in either direction. Finite mode adds space so every project can cross the selection guide.'],
    ['scrollThreshold', 'number', '1000', 'Edge buffer in pixels, bounded to one collection cycle and 0–5000px. Near an edge the scroll position is rebased without changing visible content.'],
    ['onActiveChange', '(index, project) => void', '—', 'Called when scroll entry changes the active project (70% down / 65% up), including initial selection. Recycled copies do not trigger duplicate callbacks.'],
    ['onSelect', '(index, project) => void', '—', 'Called when a row is activated. No external navigation is performed by the component.'],
    ['aria-label', 'string', '"Project archive"', 'Accessible name for the archive region.'],
    ['className', 'string', '""', 'Additional root class.'],
  ],
  useCases: [
    ['Design archives', 'Browse a long history of posters, identities and experiments by name.'],
    ['Creative portfolios', 'Make every selected project feel like a different visual environment.'],
    ['Editorial indexes', 'Pair a typographic table of contents with a movable visual companion.'],
    ['Collections and catalogs', 'Explore a finite collection in a continuous loop without growing the DOM.'],
  ],
}, {
  slug: 'hover-members', name: 'Hover Members', category: 'Interactions', number: '015',
  description: 'Small portraits. Big personalities. A growing portrait strip and a center-out wave of oversized lettering turn a simple team introduction into a playful interaction.',
  shortDescription: 'A little face. A larger-than-life name.',
  tags: ['Hover', 'Typography', 'Cursor'], added: 'October 2026',
  source: membersSource, css: membersCSS, filename: 'HoverMembers.jsx', cssFilename: 'HoverMembers.css', dependencies: 'React 18+ · bundled freeware font',
  usage: `import HoverMembers from './components/HoverMembers';

const teamMembers = [
  { id: 'alex', name: 'Alex', image: '/team/alex.webp' },
  { id: 'jules', name: 'Jules', image: '/team/jules.webp' },
  { id: 'sam', name: 'Sam', image: '/team/sam.webp' },
];

export default function Team() {
  return <HoverMembers teamMembers={teamMembers}
    defaultName="OUR TEAM" height={720}
    backgroundColor="#121212" textColor="#ffffff"
    hoverTextColor="#fb2c36" cursorColor="#fb2c36"
    showCursor={true} />;
}`,
  exampleUsage: `import { useState } from 'react';
import HoverMembers from './components/HoverMembers';

export default function Studio({ teamMembers }) {
  const [selected, setSelected] = useState(null);
  return <>
    <HoverMembers teamMembers={teamMembers} defaultName="OUR TEAM"
      height="85svh" backgroundColor="#eeeae2" textColor="#161616"
      hoverTextColor="#6c37f2" cursorColor="#6c37f2"
      onMemberSelect={(index, member) => setSelected(member)} />
    {selected && <p>{selected.name} — {selected.role}</p>}
  </>;
}`,
  props: [
    ['teamMembers', 'Member[]', '[]', 'Members with name and image. Optional id, objectPosition and any metadata for your own detail view. Empty arrays keep the default heading.'],
    ['defaultName', 'string', '"OUR TEAM"', 'Heading shown at rest. Short text works best; longer text automatically fits the stage.'],
    ['height', 'number | CSS string', '720', 'Stage height. Numeric values clamp to 320–1200px; CSS values such as 100svh are supported.'],
    ['backgroundColor', 'CSS color', '"#121212"', 'Background of the section.'],
    ['textColor', 'CSS color', '"#ffffff"', 'Default heading color.'],
    ['hoverTextColor', 'CSS color', '"#fb2c36"', 'Active member-name color.'],
    ['cursorColor', 'CSS color', '"#fb2c36"', 'Color of the 120px circular pointer follower.'],
    ['showCursor', 'boolean', 'true', 'Show the lagging arrow follower over the portrait strip. Hidden for touch and reduced motion.'],
    ['onActiveChange', '(index | null, member | null) => void', '—', 'Called when interaction changes the active member; null means the default heading. Not called on initial mount.'],
    ['onMemberSelect', '(index, member) => void', '—', 'Click, tap, Enter or Space activation callback. The component does not navigate automatically.'],
    ['aria-label', 'string', '"Team members"', 'Accessible name for the section.'],
    ['className', 'string', '""', 'Additional root class. Override --hm-font-family to supply another licensed typeface.'],
  ],
  useCases: [
    ['Creative studios', 'Introduce your collaborators with an oversized typographic personality.'],
    ['Speaker lineups', 'Reveal a speaker’s name from a compact strip of portraits.'],
    ['Director rosters', 'Give every person an expressive moment without opening a separate page.'],
    ['Artist collectives', 'Connect portraits to your own biography or project view through a callback.'],
  ],
}, {
  slug: 'infinite-canvas', name: 'Infinite Canvas', category: 'Interactions', number: '016',
  description: 'A collection without an edge. Drag or scroll through a repeating field of images, with long, smooth easing and room to explore in every direction.',
  shortDescription: 'Keep exploring. There is no edge.',
  tags: ['Infinite grid', 'Drag', 'Scroll'], added: 'October 2026',
  source: canvasSource, css: canvasCSS, filename: 'InfiniteCanvas.jsx', cssFilename: 'InfiniteCanvas.css', dependencies: 'React 18+ · native animation loop',
  usage: `import InfiniteCanvas from './components/InfiniteCanvas';

const images = [
  { src: '/images/portrait.webp', alt: 'Portrait in warm afternoon light' },
  { src: '/images/landscape.webp', alt: 'A quiet desert landscape' },
  { src: '/images/sculpture.webp', alt: 'Reflective silver sculpture' },
  // Add the rest of your collection here.
];

export default function Collection() {
  return <InfiniteCanvas images={images} height={720}
    imageSize="auto" gap="5vw" columns={5}
    backgroundColor="#f5f4f3" borderRadius={24}
    showControls={false} />;
}`,
  exampleUsage: `import InfiniteCanvas from './components/InfiniteCanvas';

export default function ImageArchive() {
  return <InfiniteCanvas imageRootPath="/images/archive"
    numberOfImages={20} imageSize="20vw" gap="8vw"
    height="100svh" showControls={true} />;
}

// Place img1.png through img20.png in public/images/archive/.
// Pass an images array instead when you need custom paths or descriptive alt text.`,
  props: [
    ['images', '(string | Image)[]', '—', 'Image URLs or objects with src, alt, optional id and objectPosition. Overrides sequential path generation, including when the array is empty.'],
    ['imageRootPath', 'string', '""', 'Base path for sequential img1.png, img2.png, etc. No media requests are made when neither images nor a path is provided.'],
    ['numberOfImages', 'number', '15', 'Number of sequential files to generate when using imageRootPath; bounded to 0–200.'],
    ['imageSize', 'number | CSS length | "auto"', '"auto"', 'Square cell size. Auto uses 15% of container width at 1024px and above, 45% below. Numeric values are pixels. CSS vw values are resolved relative to this component.'],
    ['gap', 'number | CSS length', '"5vw"', 'Spacing inside each tile and padding around it. Between repeated tiles the two padding edges create a double-width gap.'],
    ['columns', 'number', '5', 'Columns per repeated tile, bounded to 1–12 and the image count. The last row may be incomplete.'],
    ['height', 'number | CSS string', '720', 'Stage height. Numbers clamp to 240–1200px; definite CSS heights such as 100svh are supported.'],
    ['backgroundColor', 'CSS color', '"#f5f4f3"', 'Canvas background.'],
    ['borderRadius', 'number', '24', 'Outer clipping radius, bounded to 0–64px. Images retain their original square corners.'],
    ['showControls', 'boolean', 'false', 'Display a small interaction hint and Reset view button. Home and Escape reset even without controls.'],
    ['aria-label', 'string', '"Infinite image canvas"', 'Accessible region name. Each image is described only once; repeated tiles are hidden from assistive technology.'],
    ['className', 'string', '""', 'Additional root class.'],
  ],
  useCases: [
    ['Visual moodboards', 'Explore photographs, textures and references in a continuous image field.'],
    ['Creative portfolios', 'Show a broad body of work without a beginning or an end.'],
    ['Photography archives', 'Let portraits and landscapes retain their original proportions in consistent cells.'],
    ['Collection showcases', 'Invite visitors to wander through a reusable, repeating gallery.'],
  ],
}, {
  slug: 'drag-elements', name: 'Drag Elements', category: 'Interactions', number: '017',
  description: 'A little room to play. Pick up photographs, labels or any React element, move them freely, and let elastic edges gently bring them home.',
  shortDescription: 'Pick it up. Make it your own.',
  tags: ['Drag', 'Elastic bounds', 'Momentum'], added: 'October 2026',
  source: dragSource, css: dragCSS, filename: 'DragElements.jsx', cssFilename: 'DragElements.css', dependencies: 'React 18+ · Pointer Events',
  usage: `import DragElements from './components/DragElements';

export default function MemoryBoard() {
  return <DragElements height={530} dragElastic={0.5}
    dragMomentum={false} selectedOnTop={true}
    dragTransition={{ bounceStiffness: 200, bounceDamping: 300 }}
    style={{ padding: 80, background: '#eeeeee', borderRadius: 16 }}>
    {['One lovely day', 'Wish you were here', 'Good times'].map((label, index) => (
      <div key={label} aria-label={label} style={{
        width: 160, padding: 20, background: 'white', color: '#171717',
        transform: 'rotate(' + (index * 5 - 5) + 'deg)',
        boxShadow: '0 20px 40px #0003',
      }}>{label}</div>
    ))}
  </DragElements>;
}`,
  exampleUsage: `import { useRef } from 'react';
import DragElements from './components/DragElements';

export default function BoundedLabels() {
  const bounds = useRef(null);
  return <div ref={bounds} style={{ height: 400, background: '#1f464d', overflow: 'hidden' }}>
    <DragElements height="100%" dragConstraints={bounds}
      dragElastic={{ left: 0, right: 0.5, top: 0.2, bottom: 0.2 }}
      dragMomentum={true} style={{ padding: 80 }}>
      {['super fun', 'funky time!', 'awesome'].map(label => (
        <div key={label} aria-label={label} style={{ padding: '16px 28px',
          borderRadius: 100, background: '#e896dc', color: '#1f464d', fontSize: 32 }}>
          {label}
        </div>
      ))}
    </DragElements>
  </div>;
}

// Or constrain translation relative to each item's starting position:
// dragConstraints={{ left: -80, right: 180, top: -80, bottom: 150 }}
// Use draggable={false} on image and video children.`,
  props: [
    ['children', 'ReactNode', 'required', 'Each direct child gets an independent absolute drag wrapper. Give dynamic collections stable keys. Child transforms, rotation and styling are preserved.'],
    ['dragElastic', 'number | boolean | Edges', '0.5', 'Resistance beyond bounds: 0 locks, 1 follows fully. Per-side objects use left/right/top/bottom, with omitted sides set to 0. True uses 0.35; false disables overshoot.'],
    ['dragConstraints', 'Edges | element ref', 'own container', 'Object edges constrain translation from the initial position; omitted edges are unbounded. A ref measures that element’s inner bounds. Rotated child corners may extend past wrapper bounds.'],
    ['dragMomentum', 'boolean', 'true', 'Coast using release velocity. The photo demo disables it; labels enable it. Out-of-bounds items return even with momentum off.'],
    ['dragTransition', 'object', '{ bounceStiffness: 200, bounceDamping: 300 }', 'Spring stiffness and damping; also power (0.8), timeConstant (750ms), restDelta (10px), restSpeed (10px/s). Higher damping makes the edge return deliberately slow.'],
    ['dragPropagation', 'boolean', 'true', 'Allow pointer-down events to reach an ancestor drag wrapper. False stops pointer-down propagation.'],
    ['selectedOnTop', 'boolean', 'true', 'Bring the selected or keyboard-focused child above its siblings. False preserves child-order stacking.'],
    ['height', 'number | CSS string', '500', 'Give the container a definite height; children are absolutely positioned and do not create layout height.'],
    ['style / className', 'object / string', '—', 'Customize the root. Padding determines the initial stack origin; style can also override height.'],
    ['onDragEnd', '(index, { x, y }) => void', '—', 'Called once after a moved pointer gesture ends, with release coordinates before any momentum or return animation.'],
    ['aria-label', 'string', '"Draggable elements"', 'Accessible region label. Name each item with aria-label on its child, or alt on a direct image child.'],
  ],
  useCases: [
    ['Memory boards', 'Let visitors rearrange a small stack of snapshots and keepsakes.'],
    ['Playful typography', 'Turn short headlines and labels into movable, overlapping shapes.'],
    ['Product details', 'Arrange swatches or cards without giving up their existing styling.'],
    ['Interactive compositions', 'Mix arbitrary React children with shared drag constraints.'],
  ],
}, {
  slug: 'marquee-along-svg-path', name: 'Marquee Along SVG Path', category: 'Interactions', number: '018',
  description: 'A marquee with a different route. Send images, labels or any React element along a flowing SVG curve, with tangent rotation, draggable momentum and seamless repetition.',
  shortDescription: 'Take the scenic route.',
  tags: ['SVG path', 'Marquee', 'Drag'], added: 'October 2026',
  source: marqueePathSource, css: marqueePathCSS, filename: 'MarqueeAlongSvgPath.jsx', cssFilename: 'MarqueeAlongSvgPath.css', dependencies: 'React 18+ · native CSS motion paths',
  usage: `import MarqueeAlongSvgPath from './components/MarqueeAlongSvgPath';

const path = 'M0 165 C166 -20 332 350 498 165 S830 -20 996 165';
const words = ['Make', 'something', 'move', 'with', 'feeling'];

export default function FlowingWords() {
  return <div style={{ overflow: 'hidden', background: '#fafafa', borderRadius: 16 }}>
    <MarqueeAlongSvgPath path={path} viewBox="0 0 996 330"
      height={530} responsive baseVelocity={8} direction="normal" repeat={2}
      draggable={true} grabCursor dragSensitivity={0.1}
      showPath={false} slowdownOnHover={false} slowDownFactor={0.3}
      enableRollingZIndex={true} showControls={true}>
      {words.map(word => <div key={word} style={{ padding: '14px 24px',
        borderRadius: 8, background: '#d8edbd', color: '#203019', fontSize: 24 }}>
        {word}
      </div>)}
    </MarqueeAlongSvgPath>
  </div>;
}`,
  exampleUsage: `import { useRef } from 'react';
import MarqueeAlongSvgPath from './components/MarqueeAlongSvgPath';

export default function ScrollRibbon() {
  const scroller = useRef(null);
  return <section ref={scroller} style={{ height: 600, overflowY: 'auto' }}>
    <div style={{ height: 1000, paddingTop: 120 }}>
      <MarqueeAlongSvgPath path="M0 150 C250 0 750 300 1000 150"
        viewBox="0 0 1000 300" height={400} responsive repeat={4}
        useScrollVelocity scrollAwareDirection scrollContainer={scroller}
        slowdownOnHover slowDownFactor={0.2} draggable grabCursor
        cssVariableInterpolation={[{ property: 'opacity', from: 0.2, to: 1 }]}
        showControls>
        <div style={{ padding: 20, background: '#e896dc', color: '#1f464d' }}>Hello</div>
        <div style={{ padding: 20, background: '#1f464d', color: '#e896dc' }}>Again</div>
      </MarqueeAlongSvgPath>
    </div>
  </section>;
}`,
  props: [
    ['children / path', 'ReactNode / string', 'required', 'Direct children follow the SVG d string. Put sizing, background and transforms on children. Use draggable={false} on native images.'],
    ['viewBox', 'string', '"0 0 100 100"', 'Coordinate bounds for the path. Invalid boxes fall back to 0 0 100 100. Nonzero origins are supported.'],
    ['responsive', 'boolean', 'false', 'Scale and align the entire coordinate plane, including children, to the available width and height.'],
    ['preserveAspectRatio', 'string', '"xMidYMid meet"', 'Responsive alignment supports SVG Min/Mid/Max, meet, slice and none. Without responsive, coordinates remain native units.'],
    ['width / height', 'number | CSS string', '"100%"', 'Outer dimensions. Set a definite height on this component or its parent.'],
    ['baseVelocity / direction', 'number / "normal" | "reverse"', '5 / "normal"', 'Percentage points of the path per second. The showcase uses 8. Velocity is bounded to −100…100.'],
    ['repeat', 'number', '3', 'Copies of each child, evenly distributed along the path. Clamped to 1–20. The showcase uses two copies of 13 artworks.'],
    ['easing', '(progress) => number', 'linear', 'Maps each wrapped normalized position to 0–1. Use a monotonic function for predictable item ordering. Invalid output falls back to linear.'],
    ['showPath / pathId', 'boolean / string', 'false / generated', 'Reveal a dashed guide; optionally give the SVG path a stable ID.'],
    ['slowdownOnHover / slowDownFactor', 'boolean / number', 'false / 0.3', 'Spring smoothly toward a fraction of base speed while the region is hovered. Factor is bounded to 0–1.'],
    ['slowDownSpringConfig', 'Spring settings', '{ damping: 50, stiffness: 400 }', 'Supports stiffness, damping and mass for hover speed interpolation.'],
    ['useScrollVelocity / scrollAwareDirection', 'boolean / boolean', 'false / false', 'Boost speed with scroll velocity; optionally let the scroll sign determine travel direction. Scroll is never prevented.'],
    ['scrollContainer / scrollSpringConfig', 'element | ref / Spring settings', 'window / { damping: 50, stiffness: 400 }', 'Observe a custom scroll element, with smoothed velocity. A null ref falls back to window.'],
    ['draggable / grabCursor', 'boolean / boolean', 'false / false', 'Horizontal pointer movement moves the entire ribbon. Grab cursor is optional. Native controls and data-drag-ignore descendants opt out.'],
    ['dragSensitivity', 'number', '0.2', 'Path percentage points per viewport pixel. Bounded to 0–2. Showcase uses 0.1, so 100px moves 10% of the path.'],
    ['dragVelocityDecay / dragAwareDirection', 'number / boolean', '0.96 / false', 'Release velocity decays at a frame-rate-independent rate; optionally retain drag direction as the new base direction. Zero decay disables coasting.'],
    ['enableRollingZIndex / zIndexBase / zIndexRange', 'boolean / number / number', 'true / 1 / 10', 'Stacking follows eased path progress, keeping later positions above earlier ones at crossings.'],
    ['cssVariableInterpolation', '{ property, from, to }[]', '[]', 'Interpolate numeric unitless CSS properties such as opacity and scale, or custom CSS variables. Use CSS calc() with variables for lengths.'],
    ['paused / showControls', 'boolean / boolean', 'false / false', 'Pause autoplay externally, or show accessible Pause/Resume and Reset buttons. The showcase displays controls.'],
    ['className / style / aria-label', 'string / object / string', '—', 'Outer presentation and accessible region name. Clip the enclosing stage to conceal wrapping on open paths.'],
  ],
  useCases: [
    ['Artwork ribbons', 'Arrange a flowing stream of small images with natural tangent rotation.'],
    ['Playful headlines', 'Let words follow a loop, wave or custom drawing instead of a straight line.'],
    ['Brand collections', 'Place logos or badges along a distinctive, reusable motion path.'],
    ['Interactive timelines', 'Add direct dragging and scroll-responsive movement to a visual sequence.'],
  ],
}, {
  slug: 'gradient-ascii', name: 'Gradient ASCII', category: 'Backgrounds', number: '019',
  description: 'Light with a little language. Soft, drifting gradients become fields of ASCII characters that scramble beneath the cursor and ripple out from a click.',
  shortDescription: 'Soft light. Sharp characters.',
  tags: ['ASCII', 'Gradient', 'Interactive', 'WebGL'], added: 'October 2026',
  source: gradientAsciiSource, css: gradientAsciiCSS, filename: 'GradientASCII.jsx', cssFilename: 'GradientASCII.css', dependencies: 'React 18+ · browser WebGL',
  usage: `import { useState } from 'react';
import GradientASCII from './components/GradientASCII';

export default function AsciiHero() {
  const [paused, setPaused] = useState(false);
  return <section style={{ position: 'relative', height: 620, overflow: 'hidden', background: '#101016', color: '#fff' }}>
    <GradientASCII
      colors={['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']}
      shape="horizon" characters=" =+xX0S8#@" cellSize={18}
      density={0.8} glyphOpacity={0.85} gradientOpacity={0.9}
      glow={0.2} depthOfField={0} flicker={0.2} softness={0.5}
      scale={1} flow={0.5} speed={1} grain={0.08} variation={0}
      mouseInteraction={true} scrambleRadius={0.1} clickEffect="wave"
      intro={true} lightMode={false} dpr={1.5} paused={paused}
      style={{ position: 'absolute', inset: 0 }}
    />
    <div style={{ position: 'relative', padding: 32, paddingTop: 400 }}>
      <h1>A little light. A lot of character.</h1>
      <button onClick={() => setPaused(value => !value)}>
        {paused ? 'Resume animation' : 'Pause animation'}
      </button>
    </div>
  </section>;
}`,
  exampleUsage: `import GradientASCII from './components/GradientASCII';

export default function LightWash() {
  return <div style={{ height: 420, position: 'relative', background: '#f5f7fb', borderRadius: 20, overflow: 'hidden' }}>
    <GradientASCII shape="eclipse" lightMode intro={false}
      colors={['#48177b', '#9855e8', '#eabaff', '#fff0ff']}
      characters=" .:-=+*#%@" cellSize={16} density={0.6}
      gradientOpacity={0.35} glyphOpacity={0.9} glow={0.1}
      clickEffect="burst" mouseInteraction dpr={1.5} />
  </div>;
}`,
  props: [
    ['colors', 'string[]', 'Atmosphere palette', 'Two to eight CSS colors, ordered from the shadow edge to the brightest light. Invalid colors are ignored; an empty list uses the default palette.'],
    ['shape', '"horizon" | "pinch" | "rise" | "eclipse"', '"horizon"', 'A curved horizon, pinched band, rising glow or luminous ring. These are independent analytical light fields.'],
    ['characters', 'string', '" =+xX0S8#@"', 'Glyphs from dimmest to brightest; up to 128 Unicode code points. An empty string hides glyphs. A leading space preserves negative space.'],
    ['cellSize', 'number', '18', 'Glyph-cell height in CSS pixels, clamped to 8–80. Width is 62% of height.'],
    ['density', 'number', '0.8', 'Character coverage from 0 to 1; brighter areas fill first. Zero hides all glyphs.'],
    ['glyphOpacity / gradientOpacity', 'number / number', '0.85 / 0.9', 'Independent glyph and gradient opacity, each 0–1. Set gradientOpacity to 0 for characters alone.'],
    ['glow / depthOfField', 'number / number', '0.2 / 0', 'Soft glyph halo (0–1.5) and the proportion/strength of defocused characters (0–1).'],
    ['flicker', 'number', '0.2', 'Neighboring-character substitution, 0–1. No flashing full-screen layers.'],
    ['softness / scale', 'number / number', '0.5 / 1', 'Edge softness (0–1) and centered field size (0.4–2.5).'],
    ['flow / speed', 'number / number', '0.5 / 1', 'Field wavering (0–2) and drift speed (0–5). Speed 0 freezes the shape, not glyph flicker or click effects; use paused to freeze everything.'],
    ['grain / variation', 'number / number', '0.08 / 0', 'Film grain (0–0.4) and deterministic pattern seed (−10000 to 10000).'],
    ['mouseInteraction / scrambleRadius', 'boolean / number', 'true / 0.1', 'A short-lived pointer trail scrambles cells without moving the field. Radius is relative to container height, bounded 0.01–0.5.'],
    ['clickEffect', '"wave" | "burst" | "none"', '"wave"', 'Expanding ring, local burst or no click effect. Up to four simultaneous clicks; ordinary links and touch scrolling are not intercepted.'],
    ['intro', 'boolean', 'true', 'A source-led reveal and character decoding over 2.8 seconds. Reduced motion skips the reveal.'],
    ['lightMode', 'boolean', 'false', 'Darker glyphs for a pale parent surface. The component remains transparent and does not change the page theme.'],
    ['fontFamily', 'string', 'system monospace', 'Font for the locally generated atlas. Available web fonts refresh the atlas after loading; no fonts are fetched by the component.'],
    ['dpr', 'number', 'device ratio, capped at 2', 'Maximum render pixel ratio, bounded 0.5–2 and also limited by GPU dimensions and an eight-million-pixel budget.'],
    ['paused', 'boolean', 'false', 'Freeze drift, flicker, reveal and interaction clocks. Reduced motion, hidden tabs and offscreen visibility also suspend animation.'],
    ['className / style', 'string / CSSProperties', '—', 'Container presentation. Set an explicit parent height; use absolute positioning for a background layer. The canvas is decorative and does not capture pointer input.'],
  ],
  useCases: [
    ['Atmospheric heroes', 'Place a quiet layer of type and light behind a product introduction.'],
    ['Creative portfolios', 'Give a typography-led portfolio a textured, responsive backdrop.'],
    ['Launch moments', 'Reveal an announcement with a soft, source-led wash of color.'],
    ['Interactive surfaces', 'Add subtle pointer feedback without getting in the way of content.'],
  ],
}, {
  slug: 'flex-carousel', name: 'Flex Carousel', category: 'Media', number: '020',
  description: 'A gallery with a softer edge. An infinite row of images bends through an invisible lens, with momentum, spectral edges and a quiet click-to-focus transition.',
  shortDescription: 'A continuous gallery. A liquid edge.',
  tags: ['Carousel', 'WebGL', 'Drag', 'Lens'], added: 'October 2026',
  source: flexCarouselSource, css: flexCarouselCSS, filename: 'FlexCarousel.jsx', cssFilename: 'FlexCarousel.css', dependencies: 'React 18+ · native WebGL',
  usage: `import FlexCarousel from './components/FlexCarousel';

// Supply your own images. Demo photos are not included in the download.
const items = [
  { src: '/photos/sculpture.jpg', title: 'Iridescence', alt: 'An iridescent sculpture' },
  { src: '/photos/studio.jpg', title: 'White Room', alt: 'A portrait in a white studio' },
  { src: '/photos/chrome.jpg', title: 'Liquid Metal', alt: 'Reflective chrome surfaces' },
];

export default function FlexGallery() {
  return <div style={{ height: 540, overflow: 'hidden', borderRadius: 16 }}>
    <FlexCarousel items={items} preset="liquid" intro="rise" fit="natural"
      cardHeight={0.5} gap={12} radius={0} squeeze={0.2}
      focusOnClick={true} captions={true} captureWheel={true}
      autoplay={false} interval={4} showControls={true} pixelRatio={1.5}/>
  </div>;
}`,
  exampleUsage: `import { useState } from 'react';
import FlexCarousel from './components/FlexCarousel';

export default function PortfolioGallery({ projects }) {
  const [selected, setSelected] = useState('');
  return <section>
    <div style={{ height: 500, borderRadius: 20, overflow: 'hidden' }}>
      <FlexCarousel items={projects} preset="arch" intro="deal"
        fit="portrait" cardHeight={0.55} radius={12} gap={20}
        bend={0.25} dispersion={0.2} followCursor
        autoplay interval={5} showControls captureWheel={false}
        onChange={(index, item) => setSelected(item.title)} />
    </div>
    <p aria-live="polite">{selected}</p>
  </section>;
}`,
  props: [
    ['items', '{ src, alt?, title?, subtitle?, id? }[]', '[]', 'Up to 50 images. Natural fit preserves each aspect ratio. Supply descriptive alt text and stable IDs; demo photos are not part of the reusable component.'],
    ['preset', '"liquid" | "ribbon" | "vortex" | "arch"', '"liquid"', 'Starting lens geometry. Explicit lens props override the preset. Changing a preset keeps the current selection.'],
    ['intro', '"rise" | "bloom" | "spin" | "deal" | "none"', '"rise"', 'Lift cards, form the bend, land a flick, spread from the middle, or skip. Runs once after images settle; any navigation input skips it.'],
    ['fit', '"natural" | "portrait" | "square" | "landscape"', '"natural"', 'Natural dimensions or consistent 3:4, 1:1 and 4:3 center-cropped cards.'],
    ['cardHeight', 'number', '0.5', 'Card height as a fraction of stage height, bounded 0.15–0.85.'],
    ['gap / radius', 'number / number', '12 / 0', 'Card spacing and rounded corners in CSS pixels, each bounded 0–80.'],
    ['lensWidth / lensHeight', 'number / number', 'preset values', 'Lens width (0.2–1.6) and height (0.2–2), both relative to the stage width. The lens itself is never drawn.'],
    ['tilt / roundness', 'number / number', 'preset values', 'Lens rotation (−180…180°) and a rounded-rectangle-to-ellipse shape (0–1).'],
    ['bend / reach', 'number / number', 'preset values', 'Flex amount (0–0.9) and transition width (0.05–0.9). Zero bend gives a flat image row.'],
    ['curl', '"twist" | "rise" | "fall"', 'preset value', 'Twist sends the left end down and the right end up. Rise lifts both; fall drops both.'],
    ['dispersion', 'number', 'preset value', 'RGB separation near the bent edges, 0–1.5. The center stays clear.'],
    ['liquid / followCursor', 'number / boolean', '0 / false', 'Velocity-driven edge wobble (0–1.5) and a softly following lens. The lens recenters on pointer exit.'],
    ['squeeze', 'number', '0.2', 'Speed-dependent card shrinkage, 0–0.6. Zero preserves full size while moving.'],
    ['focusOnClick', 'boolean', 'true', 'A side-card click centers it; selecting the centered card opens focus. Other cards part and fade while the lens straightens. Click again, drag, scroll or Escape to close.'],
    ['autoplay / interval', 'boolean / number', 'false / 4', 'Advance one card every 1–30 seconds. Suspends on hover, keyboard focus, interaction, open focus, reduced motion, hidden tabs and offscreen visibility.'],
    ['captions', 'boolean', 'true', 'Show the centered title/subtitle and rolling counter beneath the row. The screen-reader announcement remains available when hidden.'],
    ['captureWheel', 'boolean', 'true', 'Capture vertical wheel input while over the gallery. Horizontal/Shift-wheel input always navigates; Ctrl/Meta zoom remains native.'],
    ['onChange / onSelect', '(index, item) => void', '—', 'Change fires when a different item reaches the center. Select fires when the centered item is selected, even when focusOnClick is false. Neither fires on initial load.'],
    ['initialIndex', 'number', '0', 'Initial selection, read on first item load and clamped to the collection.'],
    ['showControls / paused', 'boolean / boolean', 'false / false', 'Optional Previous/Next and focus Close buttons; autoplay adds Pause/Play. paused suspends autoplay, not manual navigation.'],
    ['pixelRatio', 'number', '1.5', 'Maximum render device pixel ratio, 0.5–2, also bounded by GPU dimensions and an eight-million-pixel budget.'],
    ['className / style / aria-label', 'string / object / string', '—', 'Stage presentation and accessible carousel name. Set an explicit height on the parent.'],
  ],
  useCases: [
    ['Art direction', 'Give sculpture, editorial imagery and visual research a fluid presentation.'],
    ['Portfolio browsing', 'Let people skim a continuous project row, then focus on a single image.'],
    ['Product collections', 'Mix tall and wide product photography without forcing a common crop.'],
    ['Immersive galleries', 'Use direct dragging, subtle optics and keyboard navigation in one surface.'],
  ],
}, {
  slug: 'dither-veil', name: 'Dither Veil', category: 'Animations', number: '021',
  description: 'An image made of dots, with color waiting underneath. Move through a dithered portrait to reveal the original, then watch the texture knit itself back together.',
  shortDescription: 'A veil of dots. A window into color.',
  tags: ['Dither', 'Reveal', 'Pointer', 'Canvas'], added: 'October 2026',
  source: ditherVeilSource, css: ditherVeilCSS, filename: 'DitherVeil.jsx', cssFilename: 'DitherVeil.css', dependencies: 'React 18+ · Canvas 2D · native WebGL',
  usage: `import DitherVeil from './components/DitherVeil';

export default function VeiledImage() {
  return <div style={{height:600,overflow:'hidden',borderRadius:16}}>
    <DitherVeil src="/photos/sculpture.jpg"
      alt="An iridescent sculptural head, looking upward"
      fit="contain" pattern="floyd" palette="duotone"
      pixelSize={2} levels={2} contrast={1.15}
      inkColor="#120f17" paperColor="#f4f1ea"
      revealRadius={200} softness={0.6} linger={1}
      clickBurst />
  </div>;
}`,
  exampleUsage: `'use client';

import {useState} from 'react';
import DitherVeil from './components/DitherVeil';

export default function ReverseVeil() {
  const [paused,setPaused]=useState(false);
  return <section>
    <div style={{height:540,borderRadius:20,overflow:'hidden'}}>
      <DitherVeil src="/photos/sculpture.jpg"
        alt="A reflective sculpture with colorful highlights"
        pattern="bayer" palette="rgb" pixelSize={3}
        levels={3} reverse wander paused={paused}
        rim={0.2} rimColor="#a78bfa" linger={1.4}/>
    </div>
    <button onClick={()=>setPaused(value=>!value)}>
      {paused?'Resume wandering':'Pause wandering'}
    </button>
  </section>;
}`,
  props: [
    ['src', 'string', '""', 'Image URL or data URL. Supply your own media; remote hosts must permit CORS for pixel processing. An empty source displays a placeholder.'],
    ['alt', 'string', '"Interactive dithered image"', 'Accessible description of the image. The canvas is hidden from assistive technology; this names the interactive region.'],
    ['fit', '"contain" | "cover"', '"contain"', 'Preserve the whole image on the ink color, or crop its center to fill the frame.'],
    ['pattern', '"floyd" | "bayer" | "noise" | "atkinson" | "lines"', '"floyd"', 'Serpentine Floyd–Steinberg, ordered Bayer, progressive blue-noise stipple, serpentine Atkinson, or diagonal engraving bands.'],
    ['palette', '"duotone" | "rgb"', '"duotone"', 'Map luminance through a print-like 1.5-power tone curve between ink and paper, or dither each original color channel independently.'],
    ['pixelSize', 'number', '2', 'Target cell size in CSS pixels, bounded 1–20. Very large frames may use coarser cells to respect the processing budget.'],
    ['levels', 'number', '2', 'Tones per channel, rounded to an integer from 2–8. Two gives a 1-bit duotone image or up to eight RGB colors.'],
    ['inkColor', 'CSS color', '"#120f17"', 'Darkest duotone and contain background. Colors are rendered as opaque RGB.'],
    ['paperColor', 'CSS color', '"#f4f1ea"', 'Lightest duotone. RGB mode quantizes original channels instead of using the ink-to-paper ramp.'],
    ['contrast', 'number', '1.15', 'Pre-dither tonal contrast, bounded 0–3. Does not alter the revealed original.'],
    ['brightness', 'number', '0', 'Pre-dither luminance or channel shift, bounded −1…1.'],
    ['revealRadius', 'number', '200', 'Manual and wandering reveal radius in CSS pixels, bounded 0–1000. Zero hides these windows; click ripples are independent.'],
    ['softness', 'number', '0.6', 'Fraction of the reveal radius occupied by dissolving cells, 0–1. Zero gives a hard edge.'],
    ['linger', 'number', '1', 'Trail lifetime in seconds, bounded 0–5. Zero disables the trail. A bounded history of 32 sampled positions keeps rendering light.'],
    ['rimColor', 'CSS color', '"#a78bfa"', 'Color of transition cells along the dissolving edge.'],
    ['rim', 'number', '0', 'Colored-cell band thickness, bounded 0–1. Zero hides the rim.'],
    ['reverse', 'boolean', 'false', 'Start in full color and reveal the dithered layer instead.'],
    ['wander', 'boolean', 'false', 'Move a reveal window autonomously while no manual pointer or keyboard window is active. Supply a pause control.'],
    ['clickBurst', 'boolean', 'true', 'Click, tap, Enter or Space sends an expanding ring across the image. Up to four overlapping rings are retained.'],
    ['paused', 'boolean', 'false', 'Freeze the last autonomous wandering position. Manual input, trail decay and short click ripples still work.'],
    ['pixelRatio', 'number', '1.5', 'Maximum render DPR, bounded 0.5–2, device DPR, GPU dimensions and a four-million-pixel budget. Does not change CSS cell size.'],
    ['className', 'string', '""', 'Additional root class. The component fills its parent; supply a definite parent height.'],
    ['style', 'CSSProperties', '—', 'Root inline styles. Set sizing or a border radius without changing the source.'],
  ],
  useCases: [
    ['Artful introductions', 'Turn a sculptural portrait into an invitation to explore.'],
    ['Editorial imagery', 'Move between a printed texture and the photograph beneath it.'],
    ['Product discovery', 'Let a small sweep of the pointer expose material and color.'],
    ['Creative portfolios', 'Add a tactile reveal without moving the image itself.'],
  ],
}, {
  slug: 'tech-text', name: 'Tech Text', category: 'Typography', number: '022',
  description: 'A wordmark with a little curiosity. Letters become dashed paths under the pointer, lift off the baseline when dragged, and spring back into place.',
  shortDescription: 'Inspect the outlines. Play with the letters.',
  tags: ['Typography', 'Outline', 'Drag', 'Canvas'], added: 'October 2026',
  source: techTextSource, css: techTextCSS, filename: 'TechText.jsx', cssFilename: 'TechText.css', dependencies: 'React 18+ · Canvas 2D',
  usage: `'use client';

import {useState} from 'react';
import TechText from './components/TechText';

export default function Wordmark() {
  const [paused,setPaused]=useState(false);
  return <section>
    <div style={{height:480,background:'#120f17',color:'#fff',borderRadius:16,overflow:'hidden'}}>
      <TechText text="Tech Text" fontSize={150} fontWeight={600}
        reveal="letter" lineStyle="dashed" dashLength={4} dashGap={2}
        selection labels draggable clickKick sweep paused={paused}/>
    </div>
    <button onClick={()=>setPaused(value=>!value)}>
      {paused?'Resume motion':'Pause motion'}
    </button>
  </section>;
}`,
  exampleUsage: `'use client';

import {useState} from 'react';
import TechText, {techTextPresets} from './components/TechText';

export default function MeasuredWordmark() {
  const [paused,setPaused]=useState(false);
  return <section>
    <div style={{height:440,background:'#120f17',color:'#f4f1ea'}}>
      <TechText {...techTextPresets.serif} text="Studio"
        accentColor="#a8c4f5" fontSize={220} sweep={false}
        paused={paused}/>
    </div>
    <button onClick={()=>setPaused(value=>!value)}>
      {paused?'Resume entrance':'Pause entrance'}
    </button>
  </section>;
}`,
  props: [
    ['text', 'string', '"Tech Text"', 'Single-line wordmark. Line breaks become spaces; at most 96 graphemes are rendered. Empty text displays a placeholder.'],
    ['fontFamily', 'string', '""', 'Use a loaded font family, or inherit the container font. Font loading and later font changes trigger new glyph measurements.'],
    ['fontWeight', 'number', '600', 'Font weight, bounded 100–900. Available weights depend on your loaded font.'],
    ['fontSize', 'number', '150', 'Maximum size in CSS pixels, bounded 12–640. Automatically shrinks to the available width and at most 48% of the stage height.'],
    ['letterSpacing', 'number', '−0.05', 'Extra tracking in em, bounded −0.1…0.3. Kerning is included in glyph placement.'],
    ['align', '"left" | "center" | "right"', '"center"', 'Horizontal placement within the stage gutters. The wordmark is vertically centered.'],
    ['color', 'CSS color', '"currentColor"', 'Letter fills, outlines and the ghost left at the baseline. Inherits surrounding text color by default.'],
    ['accentColor', 'CSS color', '"currentColor"', 'Selection frame, handles, connector, labels, specks and font guides.'],
    ['reveal', '"area" | "letter" | "off"', '"letter"', 'A circular fill-to-outline lens, one outlined active letter, or solid text. Drag and click ghosts are independent of this setting.'],
    ['reach', 'number', '200', 'Area reveal radius in CSS pixels, bounded 0–800. Zero disables the circular lens; letter reveal ignores it.'],
    ['softness', 'number', '0.7', 'Soft fraction of the area reveal edge, 0–1. Zero is a hard circle.'],
    ['dashLength', 'number', '4', 'Outline dash length in CSS pixels, bounded 0.5–32.'],
    ['dashGap', 'number', '2', 'Outline dash spacing in CSS pixels, bounded 0–24.'],
    ['lineStyle', '"dashed" | "solid"', '"dashed"', 'Stroke style for the cached glyph paths.'],
    ['strokeWidth', 'number', '1.5', 'Outline thickness in CSS pixels, bounded 0.25–8.'],
    ['specks', 'number', '15', 'Blinking squares around the active letter, rounded and bounded 0–64. Zero hides them; assembly particles are separate.'],
    ['selection', 'boolean', 'true', 'Show a gliding letter frame with corner handles and a drag connector.'],
    ['labels', 'boolean', 'true', 'Label the selection with its letter and ink size, or its offset while dragged. Offsets use positive Y upward.'],
    ['draggable', 'boolean', 'true', 'Move individual letters, leaving their original outline behind. Pointer release springs them home. Keyboard Space picks up/releases.'],
    ['bounce', 'number', '0.4', 'Return-spring overshoot, bounded 0–1. Zero gives a non-overshooting drag return.'],
    ['clickKick', 'boolean', 'true', 'Click or Enter kicks the selected letter upward and sends diminishing delayed impulses to up to six neighboring positions on either side.'],
    ['intro', '"none" | "type" | "assemble" | "metrics"', '"none"', 'No entrance, sequential outlined letters, assembling pixels, or font rules with zoned fills. Begins in view after fonts settle. Text/intro changes restart it.'],
    ['introDuration', 'number', '2', 'Entrance length in seconds, bounded 0.2–8. Hidden/offscreen time and paused time are excluded.'],
    ['guides', 'boolean', 'false', 'Show cap height, x-height, baseline and descender rules while a letter is active. Metrics entrance also draws these rules temporarily.'],
    ['sweep', 'boolean', 'true', 'Run an automatic reveal across the wordmark while the pointer and keyboard are away. Supply a pause control.'],
    ['speed', 'number', '1', 'Idle sweep speed multiplier, bounded 0–5. Zero holds its position; use paused to also stop blinking and entrances.'],
    ['paused', 'boolean', 'false', 'Hold automatic sweep, blinking and entrance progress. Direct input still works; user-initiated return springs may finish.'],
    ['pixelRatio', 'number', '1.5', 'Maximum render DPR, bounded 0.5–2 and device DPR, a three-million-pixel buffer and a 4096px side.'],
    ['className', 'string', '""', 'Extra root class. Set an explicit parent height; the core is transparent.'],
    ['style', 'CSSProperties', '—', 'Root inline styles, including inherited font/color and dimensions.'],
  ],
  useCases: [
    ['Studio wordmarks', 'Give a short name a playful, precise first impression.'],
    ['Type specimens', 'Show the structure, proportions and outlines of a loaded typeface.'],
    ['Creative portfolios', 'Add a small moment of discovery to a typography-led introduction.'],
    ['Launch headlines', 'Assemble a brief announcement with pixels, outlines or measured rules.'],
  ],
}, {
  slug: 'scroll-expand', name: 'Scroll Expand', category: 'Animations', number: '023',
  description: 'A small frame that owns the whole screen by the time you finish scrolling. The media eases back to its natural scale, the corners settle, and your overlay copy takes over.',
  shortDescription: 'Scroll in. The frame takes the stage.',
  tags: ['Scroll', 'Sticky', 'Media', 'Reveal'], added: 'October 2026',
  source: scrollExpandSource, css: scrollExpandCSS, filename: 'ScrollExpand.jsx', cssFilename: 'ScrollExpand.css', dependencies: 'React 18+',
  usage: `'use client';

import ScrollExpand from './components/ScrollExpand';

export default function MediaStage() {
  return (
    <section style={{height:'100vh'}}>
      <ScrollExpand
        src="/images/valley.webp"
        alt="A valley at sunrise"
        title="Built to scale"
        scrollHint="Scroll inside the frame"
      >
        <h2>Every pixel, everywhere</h2>
        <p>The frame opens up as you scroll and hands the whole stage to your media.</p>
      </ScrollExpand>
    </section>
  );
}`,
  exampleUsage: `'use client';

import ScrollExpand from './components/ScrollExpand';

export default function PinnedStage() {
  return (
    <section style={{background:'#100d16',color:'#fff'}}>
      <ScrollExpand
        useWindowScroll
        src="/images/city.webp"
        alt="A skyline at dusk"
        title="Hand it the screen"
        scrollHint="Keep scrolling"
        startWidth={50}
        startRadius={20}
        scrollDistance={0.9}
        holdDistance={0.35}
      >
        <h2>Pinned, then released</h2>
        <p>The page scroll drives the same expansion, then the section lets go.</p>
      </ScrollExpand>
      <div style={{minHeight:'60vh'}} />
    </section>
  );
}`,
  props: [
    ['src', 'string', '""', 'Image or video URL shown inside the frame. Empty sources render a labelled placeholder and skip the scroll listeners.'],
    ['mediaType', '"image" | "video"', '"image"', 'Swap between an image and a looping, muted, inline video. Video pauses while reduced motion is set or the section is offscreen.'],
    ['poster', 'string', '""', 'Poster frame shown while a video loads.'],
    ['alt', 'string', '""', 'Alt text for the media, and the accessible name of the region.'],
    ['title', 'string', '""', 'Headline held over the frame at rest. It lifts and fades as the media takes over.'],
    ['scrollHint', 'string', '""', 'Small cue under the resting frame. It fades out as soon as scrolling starts and doubles as the scroller description.'],
    ['startWidth', 'number', '42', 'Resting frame width as a percentage of the stage, bounded 10–100.'],
    ['startHeight', 'number', '58', 'Resting frame height as a percentage of the stage, bounded 10–100.'],
    ['startRadius', 'number', '24', 'Corner radius of the resting frame in px, bounded 0–48.'],
    ['endRadius', 'number', '0', 'Corner radius once fully expanded in px, bounded 0–48.'],
    ['mediaZoom', 'number', '1.35', 'Media scale at rest, bounded 1–2.5, easing back to 1 as the frame opens.'],
    ['scrollDistance', 'number', '1.2', 'Expansion length in multiples of the stage height, bounded 0.4–3.'],
    ['holdDistance', 'number', '0.35', 'Extra scroll that keeps the frame pinned at full bleed, bounded 0–1.5 stage heights.'],
    ['smoothing', 'number', '0.1', 'Follow time in seconds, bounded 0–0.4. Zero locks the frame to the scrollbar.'],
    ['overlayScrim', 'number', '0.45', 'Strength of the gradient scrim behind overlay content, bounded 0–1.'],
    ['useWindowScroll', 'boolean', 'false', 'Drive the expansion from the page scroll instead of the component\u2019s own scroller.'],
    ['enabled', 'boolean', 'true', 'Turn the expansion off. The frame rests at its start size, listeners are removed, the track collapses and video playback stops.'],
    ['focusPoint', 'string', '"50% 50%"', 'Object position used when the media is cropped, such as "50% 35%".'],
    ['stageHeight', 'number', '0', 'Fixed stage height in px. Zero derives it from the parent height in scroller mode, or 64vh (max 640px) in page-scroll mode.'],
    ['onProgress', '(state) => void', '—', 'Called with { progress, target, phase } when the smoothed value moves or the phase changes. Phases: rest, expanding, open, complete, static, placeholder.'],
    ['children', 'React.ReactNode', '—', 'Overlay content revealed at full bleed. Direct children receive heading and body styling unless you override it.'],
    ['className', 'string', '""', 'Extra root class.'],
    ['style', 'CSSProperties', '—', 'Root inline styles, including inherited color and background.'],
  ],
  useCases: [
    ['Product launches', 'Open with a detail and hand the screen to the product shot.'],
    ['Editorial features', 'Turn a small portrait into a full-bleed photograph mid-scroll.'],
    ['Case studies', 'Let a single frame carry a headline, then the story overlay.'],
    ['Galleries and reels', 'Give video a quiet entry that grows with the reader.'],
  ],
},
{
  slug: 'passage-gallery', name: 'Passage Gallery', category: 'Media', number: '024',
  description: 'A corridor of photos that never ends. Tiles glide past on every wall while the pointer leans the camera, holding down rushes the passage, and a click pulls one photo out of the wall to be looked at properly.',
  shortDescription: 'A tunnel of photos you glide through.',
  tags: ['Canvas', '3D', 'Gallery', 'Scroll'], added: 'October 2026',
  source: passageSource, css: passageCSS, filename: 'PassageGallery.jsx', cssFilename: 'PassageGallery.css', dependencies: 'React 18+',
  usage: `'use client';

import PassageGallery from './components/PassageGallery';

const photos = [
  { src: '/images/ridge.webp', alt: 'A ridge at sunset', title: 'Ridge' },
  { src: '/images/tide.webp', alt: 'A ribbon of water', title: 'Tide' },
  { src: '/images/field.webp', alt: 'A field of colour', title: 'Field' },
];

export default function Hero() {
  return (
    <div style={{ height: '100vh' }}>
      <PassageGallery
        items={photos}
        speed={0.6}
        boost={10}
        fov={72}
        onFocusChange={(item, index) => console.log(item?.title ?? null, index)}
      >
        <h1>Walk the corridor</h1>
        <p>Hold to speed up. Click a photo to bring it forward.</p>
      </PassageGallery>
    </div>
  );
}`,
  exampleUsage: `'use client';

import { useRef } from 'react';
import PassageGallery from './components/PassageGallery';

const archive = [
  { src: '/images/one.webp', alt: 'Cover one', title: 'Cover one' },
  { src: '/images/two.webp', alt: 'Cover two', title: 'Cover two' },
  { src: '/images/three.webp', alt: 'Cover three', title: 'Cover three' },
];

export default function Archive() {
  const gallery = useRef(null);
  return (
    <section>
      <button type="button" onClick={() => gallery.current?.travel(6)}>Rush ahead</button>
      <button type="button" onClick={() => gallery.current?.close()}>Put the photo back</button>
      <div style={{ height: '100vh' }}>
        <PassageGallery
          ref={gallery}
          items={archive}
          colors={['#1d3cff', '#ff7a45']}
          backgroundColor="#0b0b12"
          lanes={4}
          photoFill={0.4}
          accentFill={0.1}
          speed={0.25}
          wheel={false}
          seed={12}
        />
      </div>
    </section>
  );
}`,
  props: [
    ['items', '{ src: string; alt: string; title?: string }[]', 'null', 'Photos placed along the walls. Remote images must allow cross-origin loading. Titles are used by the caption when a photo is opened.'],
    ['colors', '[string, string]', '["#5227FF", "#FF9FFC"]', 'The two ends of the gradient used for accent tiles and empty frames.'],
    ['backgroundColor', 'string', '"#0a0a0a"', 'Colour of the walls and of the distance the tunnel fades into. Grid lines adapt to it, and "transparent" shows the page behind.'],
    ['lanes', 'number', '5', 'Horizontal columns on the floor and ceiling, bounded 2-12. Side-wall rows use a stepped layout: 1-5 → 2, 6-7 → 3, 8-9 → 4, 10-11 → 5 and 12 → 6. Each tile remains square and one cell stays one lane deep.'],
    ['gap', 'number', '0.1', 'Space between tiles as a fraction of a lane, bounded 0-0.4. 0 makes tiles flush.'],
    ['radius', 'number', '0.06', 'Corner rounding as a fraction of the tile, bounded 0-1. 0 stays square and 1 makes ovals.'],
    ['photoFill', 'number', '0.3', 'Share of cells holding a photo, bounded 0-1.'],
    ['accentFill', 'number', '0.06', 'Share of cells holding a gradient accent tile, bounded 0-0.6.'],
    ['lineOpacity', 'number', '0.12', 'Opacity of the hairline grid, bounded 0-0.6.'],
    ['fog', 'number', '1', 'How soon the tunnel fades into the background, bounded 0.2-3. Denser fog also shortens the visible corridor.'],
    ['speed', 'number', '0.6', 'Cruising speed in cells per second, bounded -2 to 4, advancing about 0.7 lanes per second per unit. Negative reverses; 0 stays still.'],
    ['boost', 'number', '10', 'Speed multiplier while the pointer is held down, bounded 1-20.'],
    ['blur', 'number', '1', 'Strength of the motion smear at high speed, bounded 0-3. 0 turns it off.'],
    ['look', 'number', '1', 'How far the camera turns and shifts toward the pointer, bounded 0-3.'],
    ['fov', 'number', '72', 'Vertical field of view in degrees, bounded 40-100. Wider angles exaggerate the depth.'],
    ['hover', 'number', '1', 'Brightening and growth of the photo under the pointer, bounded 0-2. Plain tiles never react.'],
    ['focusOnClick', 'boolean', 'true', 'Clicking a photo brings it straight out of the wall into a centred frame. Clicking again or pressing Escape puts it back.'],
    ['captions', 'boolean', 'true', 'Show the title and position of the opened photo.'],
    ['wheel', 'boolean', 'true', 'Scroll to travel through the tunnel. Scrolling while a photo is open puts it back and moves on.'],
    ['interactive', 'boolean', 'true', 'Enable pointer look, dragging, holding and clicking. Mouse drags travel vertically, touch drags travel sideways.'],
    ['seed', 'number', '0', 'Changes which cells hold photos and accents, bounded 0-20.'],
    ['paused', 'boolean', 'false', 'Stops cruising. Dragging, holding and the keyboard still work, and reduced-motion users never cruise.'],
    ['dpr', 'number', '2', 'Maximum device pixel ratio for the canvas backing store, bounded 0.5-3.'],
    ['ariaLabel', 'string', '"Photo tunnel…"', 'Accessible description of the gallery and how to use it.'],
    ['onFocusChange', '(item, index) => void', 'null', 'Called when a photo is opened, with null and -1 when it is put back.'],
    ['ref', '{ close, travel, reset }', '-', 'Imperative controls: put an opened photo back, push the camera a number of cells, or return to the entrance.'],
    ['children', 'ReactNode', '-', 'Content centred over the tunnel, such as a headline or call to action.'],
    ['className', 'string', '""', 'Classes for the root element, which fills its parent with a 420px minimum height.'],
    ['style', 'CSSProperties', '-', 'Inline styles for the root element.']
  ],
  useCases: [
    ['Portfolio heroes', 'Open a page inside the work instead of in front of it. The corridor keeps a slow drift so the first screen is never static, and the visitor chooses when to stop and look.'],
    ['Archive and index pages', 'Use a photo fill between about 0.2 and 0.5 with accents on top to build an explorable index that reads as depth rather than as a list.'],
    ['Exhibition and event loops', 'Pair a hidden pointer with a steady speed and a low blur for a hands-off installation loop, then hand the controls back on touch.'],
    ['A headline with somewhere to go', 'Children sit over the tunnel, so a hero can carry a call to action while the gallery keeps travelling behind it.']
  ]
},
{
  slug: 'dome-gallery', name: 'Dome Gallery', category: 'Media', number: '025',
  description: 'A dense field of images curved over a dimmed dome. Drag to turn the collection, let the movement settle, then pull a single frame forward without leaving the gallery.',
  shortDescription: 'A drag-driven dome of focusable images.',
  tags: ['Gallery', 'Drag', 'Images', 'CSS'], added: 'October 2026',
  source: domeGallerySource, css: domeGalleryCSS, filename: 'DomeGallery.jsx', cssFilename: 'DomeGallery.css', dependencies: 'React 18+',
  usage: `'use client';

import DomeGallery from './components/DomeGallery';

const images = [
  { src: '/images/portal.webp', alt: 'An amber portal in a red field' },
  { src: '/images/alcove.webp', alt: 'A blue geometric alcove' },
  { src: '/images/archive.webp', alt: 'A plum archival structure' },
];

export default function Gallery() {
  return (
    <section style={{ height: 520 }}>
      <DomeGallery
        images={images}
        fit={0.8}
        minRadius={600}
        segments={34}
        grayscale
      />
    </section>
  );
}`,
  exampleUsage: `'use client';

import DomeGallery from './components/DomeGallery';

const collection = [
  { src: '/images/one.webp', alt: 'A sunlit gallery wall' },
  { src: '/images/two.webp', alt: 'A pale sculptural study' },
  { src: '/images/three.webp', alt: 'A garden archive' },
  { src: '/images/four.webp', alt: 'A red window at dusk' },
];

export default function ArchiveDome() {
  return (
    <div style={{ height: 'min(72vw, 620px)' }}>
      <DomeGallery
        images={collection}
        fit={0.9}
        maxVerticalRotationDeg={6}
        dragDampening={2.6}
        openedImageWidth="440px"
        openedImageHeight="440px"
        grayscale={false}
      />
    </div>
  );
}`,
  props: [
    ['images', '(string | { src: string; alt?: string })[]', 'built-in studies', 'Image URLs or image objects. The supplied collection repeats around the projected field, and each object may provide useful alt text.'],
    ['fit', 'number', '0.5', 'Size factor used to derive the dome radius from its container, bounded 0.1-2.'],
    ['fitBasis', '"auto" | "min" | "max" | "width" | "height"', '"auto"', 'Container dimension used by fit. Auto and min use the smaller dimension.'],
    ['minRadius', 'number', '600', 'Smallest permitted dome radius in pixels, bounded 80-4000.'],
    ['maxRadius', 'number', 'Infinity', 'Largest permitted dome radius in pixels. Infinity leaves the top end open.'],
    ['padFactor', 'number', '0.25', 'Fraction reserved around the projected field before the fitted radius is calculated, bounded 0-0.48.'],
    ['overlayBlurColor', 'string', '"#120F17"', 'Colour used by the soft radial edge and background wash.'],
    ['maxVerticalRotationDeg', 'number', '5', 'Maximum vertical drag angle in degrees, bounded 0-30. 0 makes the dome horizontal-only.'],
    ['dragSensitivity', 'number', '20', 'Pixels per degree of dome rotation, bounded 2-100. Larger values feel slower.'],
    ['enlargeTransitionMs', 'number', '300', 'Duration of the focused-image enlargement and field softening, bounded 0-1600ms.'],
    ['segments', 'number', '35', 'Horizontal density of the projected image field, bounded 12-64.'],
    ['dragDampening', 'number', '2', 'How quickly drag inertia fades after release, bounded 0-5. Higher values settle faster.'],
    ['openedImageWidth', 'string | number', '"400px"', 'Width of the focused image. CSS sizes such as px, %, vw and numbers are accepted.'],
    ['openedImageHeight', 'string | number', '"400px"', 'Height of the focused image. CSS sizes such as px, %, vw and numbers are accepted.'],
    ['imageBorderRadius', 'string | number', '"30px"', 'Corner radius of the closed image tiles.'],
    ['openedImageBorderRadius', 'string | number', '"30px"', 'Corner radius of the focused image.'],
    ['grayscale', 'boolean', 'true', 'Render closed and focused images in grayscale. Set false to retain the original colours.']
  ],
  useCases: [
    ['Portfolio landings', 'Let visitors turn through a compact image archive before choosing a single project to examine.'],
    ['Exhibition indexes', 'Keep a collection spatial and atmospheric instead of flattening it into a conventional grid.'],
    ['Editorial collections', 'Use a handful of source photographs repeatedly to make a dense, discoverable reading surface.'],
    ['Mood boards', 'Toggle grayscale for a restrained archive or full colour for a livelier visual browse.']
  ]
}

,{
  slug: 'paper-crumple', name: 'Paper Crumple', category: 'Micro', number: '026',
  description: 'A paper note that gathers into a textured, lit little wad while you hold and drag it, then remembers exactly the kind of release you choose.',
  shortDescription: 'A hold-to-crumple paper interaction.',
  tags: ['Canvas', 'Paper', 'Hold', 'Drag'], added: 'October 2026',
  source: paperCrumpleSource, css: paperCrumpleCSS, filename: 'PaperCrumple.jsx', cssFilename: 'PaperCrumple.css', dependencies: 'React 18+ · Canvas 2D',
  usage: `'use client';

import PaperCrumple from './components/PaperCrumple';

export default function FieldNote() {
  return (
    <PaperCrumple
      src="/images/field-note.webp"
      backSrc="/images/signal-grid.webp"
      alt="A handwritten note in ink"
      width={312}
      height={312}
      sceneHeight={360}
      releaseBehavior="restore"
      crumpleAmount={0.85}
      foldCount={6}
      draggable
    />
  );
}`,
  exampleUsage: `'use client';

import {useState} from 'react';
import PaperCrumple from './components/PaperCrumple';

export default function CrumpledArchive() {
  const [resetKey,setResetKey]=useState(0);
  return (
    <section>
      <PaperCrumple
        src="/images/archive-front.webp"
        backSrc="/images/archive-back.webp"
        alt="An archival map with a marked route"
        releaseBehavior="creased"
        creaseStrength={0.28}
        foldCount={9}
        wrinkleDepth={0.9}
        resetKey={resetKey}
      />
      <button onClick={() => setResetKey(value => value + 1)}>Flatten the note</button>
    </section>
  );
}`,
  props: [
    ['src', 'string', 'required', 'Image URL printed on the front of the sheet. PNG transparency is preserved; remote images must allow CORS for Canvas drawing.'],
    ['alt', 'string', '"Crumplable image"', 'Description used by the fallback image and accessible hold control.'],
    ['backSrc', 'string', '""', 'Optional reverse-side image. Facets otherwise resolve to paperColor.'],
    ['width', 'number', '312', 'Unfolded paper width in pixels, bounded 80–1600 and scaled down to fit the stage.'],
    ['height', 'number', '312', 'Unfolded paper height in pixels, bounded 80–1800.'],
    ['sceneHeight', 'number', '360', 'Full-width stage height in pixels, bounded 180–1400. Inline style height can override it.'],
    ['imageFit', '"cover" | "contain"', '"contain"', 'How the source image fills the flat paper and crumpled texture.'],
    ['releaseBehavior', '"stay" | "restore" | "creased"', '"restore"', 'Keeps the wad, unfolds flat, or unfolds with residual crease guides.'],
    ['crumpleAmount', 'number', '0.85', 'Maximum compression while held, bounded 0–1.'],
    ['crumpleDuration', 'number', '0.55', 'Approximate hold-settling time in seconds, bounded 0–4. 0 is immediate.'],
    ['releaseDuration', 'number', '0.4', 'Approximate restore-settling time in seconds, bounded 0–4.'],
    ['foldCount', 'number', '6', 'Number of seeded crease guides, bounded 3–16.'],
    ['foldSharpness', 'number', '0.6', 'Blend from rounded wrinkles to angular facets, bounded 0–1.'],
    ['wrinkleDepth', 'number', '0.65', 'Compression and facet depth, bounded 0–2.'],
    ['creaseStrength', 'number', '0.18', 'Residual crease relief for the creased release mode, bounded 0–1.'],
    ['paperColor', 'string', '"#f4f0e8"', 'Unprinted paper color and fallback material color.'],
    ['roughness', 'number', '0.92', 'Matte texture and shadow softness, bounded 0–1.'],
    ['paperTexture', 'number', '0.08', 'Fine seeded paper-grain strength, bounded 0–1.'],
    ['lightIntensity', 'number', '1.8', 'Directional facet-light strength, bounded 0–4.'],
    ['lightAngle', 'number', '-35', 'Direction of the fold light in degrees, bounded -180–180.'],
    ['shadow', 'boolean', 'true', 'Enable the soft paper shadow.'],
    ['shadowOpacity', 'number', '0.16', 'Cast/drop-shadow opacity, bounded 0–1.'],
    ['draggable', 'boolean', 'true', 'Let the held material follow the pointer or keyboard movement.'],
    ['dragRotation', 'number', '10', 'Maximum tilt while dragging in degrees, bounded 0–30.'],
    ['dragRadius', 'number', '180', 'Maximum resting offset on either axis in pixels, bounded 0–600.'],
    ['returnToOrigin', 'boolean', 'true', 'Restore and creased releases return to the stage center. Stay leaves the offset in place.'],
    ['rotation', 'number', '0', 'Initial paper rotation in degrees, bounded -180–180.'],
    ['seed', 'number', '7', 'Repeatable arrangement for facets, crease guides and grain, bounded 0–9999.'],
    ['detail', 'number', '64', 'Crumple facet detail, bounded 32–96. Higher values draw more fold edges.'],
    ['disabled', 'boolean', 'false', 'Disable pointer and keyboard input and finish any active hold.'],
    ['resetKey', 'number | string', '0', 'Change this value to reset position, crumple amount and residual creases.'],
    ['onStateChange', '(state: PaperCrumpleState) => void', '—', 'Lifecycle callback for holding, flat, crumpled, creased and releasing states.'],
    ['onError', '(error: Error) => void', '—', 'Receives image-loading or Canvas setup errors. The original source remains visible as a fallback.'],
    ['className', 'string', '""', 'Additional root class name.'],
    ['style', 'CSSProperties', '—', 'Inline root styles, including custom background or height.']
  ],
  useCases: [
    ['Discardable notes', 'Let a temporary thought, permission slip, or message physically collapse once it has been read.'],
    ['Editorial artifacts', 'Give field notes, maps and scanned fragments a small material response without adding a 3D runtime.'],
    ['Playful empty states', 'Make an inactive card feel touchable, then restore it with a deliberate release rule.'],
    ['Collectible interfaces', 'Keep the crumpled object where it lands for a small, persistent moment in a game or archive.']
  ]
}

,{
  slug: 'viscose-carousel', name: 'Viscose Carousel', category: 'Carousels', number: '027',
  description: 'The original Viscose Carousel: a full-screen Three.js and GSAP project ring with a liquid WebGL field, a project index, wheel and drag input, and an expanded editorial view.',
  shortDescription: 'The original WebGL project ring, adapted for Vite.',
  tags: ['WebGL', 'Three.js', 'GSAP', 'Portfolio'], added: 'October 2026',
  source: viscoseCarouselSource, css: viscoseCarouselCSS, filename: 'ViscoseCarousel.jsx', cssFilename: 'ViscoseCarousel.css', dependencies: 'React 18+ · Three.js · GSAP',
  usage: `'use client';

import ViscoseCarousel from './components/ViscoseCarousel';
import './components/ViscoseCarousel.css';

// Copy the adjacent viscose-carousel/ring and viscose-carousel/shaders
// directories, then keep the component as a dedicated full-viewport route.
export default function SelectedWork() {
  return <ViscoseCarousel />;
}`,
  exampleUsage: `// Edit the local project data rather than passing props.
// src/components/viscose-carousel/ring/projects.js
export const PROJECTS = [
  {
    file: 'study-01.webp',
    name: 'Your Project',
    type: 'Identity',
    year: '2026',
    blurb: 'A concise project introduction.',
    media: [{ src: 'study-01.webp', shape: 'land', caption: 'Project view' }],
    insights: [{ title: 'Approach', text: 'A short production note.' }],
  },
];

// Put matching licensed files in public/viscose-original/.
// The supplied SVG studies are original local placeholders.`,
  props: [],
  useCases: [
    ['Portfolio landings', 'Use the upstream full-screen project ring as an immersive selected-work entrance.'],
    ['Editorial archives', 'Let a card expand into a scrollable project story while retaining the original ring behind it.'],
    ['Creative direction', 'Start with the included local placeholder artwork, then replace the project records and media with licensed work.']
  ]
}

];

export const getComponent = (slug) => components.find(component => component.slug === slug);
