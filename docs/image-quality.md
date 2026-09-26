# Original image quality

Portfolio images use original files from the supplied [Drive folder](https://drive.google.com/drive/folders/1hpYbxBng5KZ1ZkHlq_gjj4gV-ILMytJL).

- `public/work/originals/` contains untouched source PNGs. There is no JPEG conversion, resizing, sharpening, AI upscaling, or image CDN transformation.
- `src/imageSources.json` maps the existing portfolio image identifiers to originals and crop rectangles in source pixels.
- `PortfolioImage.jsx` displays each crop through an SVG viewport. Cropping happens only at display time; the file and its pixels remain unchanged. Images outside the viewport load as the visitor approaches them.
- Individual high-resolution stills are preferred when they match the existing scene. Where the supplied material is a collage, the original collage is shared between its tiles and downloaded once by the browser. Titles on individual hero stills are rendered as text rather than baked into a new image.
- `asset-provenance.json` records original filenames, dimensions, and SHA-256 hashes. `npm run build` verifies that every portfolio tile has a source and that both the source and built image bytes match the imported original.

## Source limitations

An original collage is not equivalent to a full-resolution original for every photograph within it. Most supplied collages are 2100 × 1500. A large landscape photo can occupy about 2090 pixels of that width, but a small inset may contain only 500–800 pixels. Preserving its PNG pixels removes the site's previous JPEG export loss, but cannot recover detail absent from the supplied file.

For crisp images on a 2× display, the visible crop should ideally have at least twice the displayed CSS width and height in source pixels. Browser scaling and cropping are still necessary for responsive layouts; they do not alter or recompress the source file. Film grain, focus, and compression already present in the original footage remain.

To improve a source-limited tile, supply an individual full-resolution still for that exact frame, copy it unchanged into `public/work/originals/`, and update its crop and provenance. Do not upscale a small JPEG and label it as a higher-quality original.

When deploying, keep automatic lossy image optimization disabled if the host or CDN offers it. The local build verifies its own output; it cannot verify transformations applied later by a hosting service.
