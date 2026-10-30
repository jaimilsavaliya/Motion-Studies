/*
 * Local replacement project records for the Viscose runtime.
 *
 * The upstream repository's public artwork and editorial content are excluded
 * from its source licence, so this integration intentionally uses original
 * procedural artwork generated for Motion Studies instead. Replace these
 * records and the matching images in public/viscose-original/ in production.
 */
const LOCAL_PROJECTS = [
  ["study-01.webp", "Ember Index", "Identity", "2026", "A warm signal held against a dark field."],
  ["study-02.webp", "Tidal Room", "Spatial", "2025", "A measured study of rhythm, depth, and blue light."],
  ["study-03.webp", "Silt Archive", "Editorial", "2024", "Material traces arranged as a quiet visual catalogue."],
  ["study-04.webp", "Veil House", "Architecture", "2026", "A facade broken into soft layers of shade and colour."],
  ["study-05.webp", "Field Notes", "Research", "2025", "A collection of marks made while mapping a landscape."],
  ["study-06.webp", "Orchid Index", "Art Direction", "2024", "Botanical colour treated as a system rather than decoration."],
  ["study-07.webp", "Sunline", "Campaign", "2026", "A graphic horizon drawn with saturated, late-day light."],
  ["study-08.webp", "Blue Hour", "Motion", "2025", "An evening study in reflected colour and slow movement."],
  ["study-09.webp", "Moraine", "Photography", "2023", "A cool, granular composition with a distant point of warmth."],
  ["study-10.webp", "Afterimage", "Digital", "2026", "A persistent outline that shifts as the viewer gets closer."],
  ["study-11.webp", "Lithic", "Objects", "2024", "Weight, tactility, and a sequence of carved planes."],
  ["study-12.webp", "Static Garden", "Culture", "2025", "An artificial garden that changes its tone with the weather."],
  ["study-13.webp", "Relay", "Strategy", "2026", "One message transmitted through a chain of distinct signals."],
  ["study-14.webp", "Meridian", "Editorial", "2023", "A line of orientation between earth tones and open sky."],
  ["study-15.webp", "Chroma Field", "Installation", "2024", "A calibrated field of colour designed to reward movement."],
  ["study-16.webp", "Night Orchard", "Photography", "2025", "Dark fruit, low light, and a slower way of looking."],
  ["study-17.webp", "Contour", "Typography", "2026", "Letterforms stretched across a shifting topographic grid."],
  ["study-18.webp", "Phase Study", "Experimental", "2024", "A set of moving parts brought briefly into alignment."],
];

export const PROJECTS = LOCAL_PROJECTS.map(([file, name, type, year, blurb], index) => ({
  file,
  name,
  type,
  year,
  blurb,
  media: [
    { src: file, shape: "land", caption: `${name}, primary study` },
    { src: file, shape: index % 2 ? "port" : "wide", caption: `${name}, detail` },
    { src: file, shape: "port", caption: `${name}, material note` },
  ],
  insights: [
    { title: "Structure", text: "A locally generated abstract artwork stands in for a project image so the original renderer can be evaluated without redistributed media." },
    { title: "Tone", text: "Each record keeps a distinct palette and a deliberate contrast between broad colour and fine line work." },
    { title: "Replace", text: "For a production use, supply your own licensed project imagery, captions, and accessible descriptions." },
  ],
}));

export const IMAGE_FILES = PROJECTS.map((project) => project.file);
