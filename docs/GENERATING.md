# Creating and reviewing emoji

## 1. Install local rendering tools

Use Node.js >=22 and npm. Install FFmpeg (including ffprobe) with the `libaom-av1` encoder, or install `avifenc` as an alternative encoder. The renderer uses FFmpeg with libaom-av1 when available, then falls back to avifenc.

```sh
brew install ffmpeg libavif  # macOS; use your package manager elsewhere
npm ci
ffmpeg -version
ffprobe -version
npm run dev
```

The browser showcase also works by opening `index.html` directly. Rendering requires local tools; browsing does not.

## 2. Scaffold a unique asset

```sh
npm run new -- rain-boot --name "rain boot" --category garden --vi "ủng đi mưa"
```

IDs must be lowercase ASCII slugs. Categories: `home`, `kitchen`, `garden`, `produce`, `meals`, `wildlife`, `clothing`, `school-art`, `other`. Category labels, CLI validation, README statistics and showcase filters share `scripts/categories.mjs`. Only categories with ready emoji appear in the showcase. The command refuses to overwrite an existing ID. It creates `meta.json`, `motion.json`, and `prompt.md` with draft status.

Add accurate translations to `meta.json` as needed. Imported entries show the nine-language format. `origin` describes how the illustration was authored; update it if you draw your own master rather than use AI.

## 3. Generate or draw the transparent master

Use `prompt.md` with your chosen image-generation tool. Request one centered, recognizable 3D object, readable at small sizes, with genuine transparent pixels, no text, no logo, no scene, and generous clear margin. Ask for identifying details appropriate to the word. Record the actual prompt, tool, date, and any corrections in that file. Save the approved transparent PNG as `assets/rain-boot/source.png`.

This step is explicit and provider-independent. The CLI does not call an image-generation API. Inspect the master on light and dark backgrounds; fix baked-in checkerboards, halos, missing parts, and ambiguous details before rendering.

```sh
npm run stills -- rain-boot
```

This trims transparent margins, fits the art within a 224px frame, and centers it on a transparent 256px canvas. PNG is lossless; WebP is a lightweight still. Both retain alpha. Keep the original master.

## 4. Author motion for the object

Edit `assets/rain-boot/motion.json`. A simple starting point:

```json
{
  "preset": "nod",
  "amp": 0.3,
  "fps": 16,
  "fx": [],
  "note": "A small friendly tilt, keeping the sole rigid."
}
```

For localized motion, use an existing asset as a reference instead of applying the same bounce to every object:

- `birdbath`: stationary stone base with `liquid-ripple` over the water surface.
- `fern` / `pansy`: plant deformation with a stable base.
- `armchair`: restrained movement for a rigid furnishing.

Presets and timing are defined in `scripts/motion/presets.mjs`; localized deformation in `deform.mjs`; effects in `fx.mjs`. Inspect matching recipes before adding parameters: the renderer uses specific schemas, not arbitrary CSS keyframes. To list supported presets:

```sh
node --input-type=module -e 'import {PRESETS} from "./scripts/motion/presets.mjs"; console.log(PRESETS)'
```

Example of a surface-specific recipe (`assets/birdbath/motion.json`):

```json
{
  "fps": 16,
  "fx": ["liquid-ripple"],
  "preset": "still",
  "surface": {"x": 0.5, "y": 0.18, "rx": 0.34, "ry": 0.065}
}
```

Surface coordinates are normalized to the 256px still. Adapt them to the actual object. Keep rigid parts fixed, use restrained amplitudes, preserve silhouette, and settle cleanly at the loop boundary. Supported frame rates: 12, 16, 18, 20, 24 fps; duration is three seconds.

```sh
npm run animate -- rain-boot
# Non-mutating experiment on an existing icon:
npm run animate -- birdbath --out /tmp/birdbath-test.avif
```

The renderer checks cover-frame identity, loop seam, bounds, and alpha before encoding. It tries quality settings until the AVIF fits within 60 KiB. It fails rather than accepting an oversized or structurally invalid file. A recipe that barely moves can still fail the decoded-motion check at review time.

## 5. Inspect actual decoded output

```sh
npm run review -- rain-boot
```

Open `out/review/rain-boot.png`: the first column is the still, followed by eight frames decoded from the actual AVIF, on light and dark backgrounds. Also play `assets/rain-boot/animated.avif` in an animated-AVIF-capable browser. Check:

- Clear meaning and distinguishing details at 128px and 256px.
- Correct transparency, no black background, no halos or clipped edges.
- Motion belongs to this object; rigid parts stay stable.
- Smooth loop, intentional timing, no distracting whole-object wobble.

The review command records hashes of the exact files shown. Approval refuses stale evidence after any asset or metadata change.

```sh
npm run approve -- rain-boot
npm run catalog
npm run check
```

Approval is a maintainer action after visual review; passing automated gates alone is not a design review. Ready assets only enter the generated catalogs when all six file hashes match `review.json`.

## Quality gates and revisions

`npm run check` checks all ready assets: metadata, 256px stills, alpha, AVIF size, sequence dimensions, frame rate, frame count, duration, decoded transparency and visible motion, and review hashes. `npm run check -- birdbath` targets one ID. `npm run check -- --quick` skips decoded motion but keeps structural and review checks.

For an intentional revision, the still and animation commands accept `--force`. This invalidates prior review; regenerate the contact sheet, inspect playback, approve, rebuild catalogs, and run checks again. Prefer a new ID for an alternate design. Never edit `showcase/catalog.js` or `catalog.json` manually.

The original 230 are imported from an existing reviewed release. Their per-asset review records retain imported evidence and hashes; `provenance/` preserves the production ledger, prompts available for the next 100, and translation references. The historical prompt archive is not a claim that every imported master can be recreated pixel-for-pixel: AI generation is stochastic.


## Rigid moving parts

Some assets use `layers` in motion.json: a measured polygon isolates a rigid part, with a `pivot` and small `angle`, `x`, or `y` motion. Coordinates are pixels on the normalized 256px still. See `assets/stapler/motion.json`, `assets/marker/motion.json`, and `assets/glue-stick/motion.json`. The fixed portion retains its pixels while the selected piece moves. Points must stay in the 256px canvas, rotation is bounded to 15 degrees, and translation to 8px; the frame bounds and loop gates still apply. Measure each new image rather than copying another icon's coordinates.

Localized organic deformation still uses `regions`; `chalk-dust` adds a few restrained powder grains for chalk. Always inspect decoded AVIF frames for cut edges, unexpected gaps, and rigid parts drifting.

## Cutout rigs (v1)

For animals needing independent head, ears and eyelids, `motion.json` may contain `rig: {version: 1, images, nodes}`. Images are PNG data URLs embedded in the authoring recipe, never fetched by the showcase. Nodes have optional `image`, `rect: [x,y,width,height]`, `pivot: [x,y]`, `children` and `tracks`. Each channel (`x`, `y`, `rotation`, `scaleX`, `scaleY`, `opacity`) has eased `[seconds,value]` keyframes spanning 0–3 seconds with equal endpoint values. A subtle scaleY breath curve is also supported. Children inherit parent transforms. Draw overlapping complete parts to hide joints; do not cut holes out of a flat image.

Use the capybara recipe as an example. `npm run animate -- capybara --out out/capybara-test.avif` rebuilds it with the normal still, loop, bounds and encoding gates. Preparing a new source still requires rendering the rig at t=0, since general source normalization changes its coordinates. Decode and review the AVIF at 48/64/96px on light/dark before updating review hashes.
