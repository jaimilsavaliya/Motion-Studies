# Third-party notices — Viscose Carousel integration

## Viscose Carousel

The renderer, ring modules, and supporting shaders in this directory were adapted from **Viscose Carousel** by **Yousuf Soomro**, Copyright © 2026 Yousuf Soomro, under the MIT License.

- Upstream repository: https://github.com/Yousuf-developer/Viscose-carousel
- Full upstream license (including its asset exclusions): `licenses/Viscose-MIT-LICENSE.txt`

Integration changes are limited to Vite-compatible import paths, CSS scoping, local asset paths, and system-font defaults. The upstream `public/` assets and PP Neue Montreal font have **not** been copied into this project.

## simplex-noise / webgl-noise

`shaders/planeShaders.js` includes simplex noise code credited in its source comments to:

- Copyright © 2011 Ashima Arts
- Copyright © 2011–2016 Stefan Gustavson
- MIT License — https://github.com/ashima/webgl-noise

The in-source copyright and MIT notice are retained.

## Local replacement media

`public/viscose-original/` contains original procedural SVG artwork generated for this Motion Studies integration. It is not from the upstream repository. Replace it with your own appropriately licensed artwork in any production adaptation.
