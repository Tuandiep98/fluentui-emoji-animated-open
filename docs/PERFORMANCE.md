# Showcase performance

The showcase is a static page with no framework, build pipeline, remote fonts, or runtime services. It can be hosted on any static host or opened from disk.

## Loading and rendering

- The browser loads a compact generated search catalog, not the full metadata and hash manifest.
- Initial gallery: 24 cards. Each explicit “Show more” adds 24. Cards use native lazy loading, asynchronous decoding, fixed image dimensions, and `content-visibility`.
- Hero art and gallery defaults are WebP stills. PNG is the image-error fallback for gallery and detail previews.
- No AVIF is assigned before user interaction. An unsupported AVIF restores the still.
- At most three gallery animations play concurrently. Starting another stops the oldest; opening details stops all gallery playback.
- IntersectionObserver stops offscreen motion. `visibilitychange` and `pagehide` stop playback when the tab is hidden or left.
- Reduced-motion and data-saver disable automatic hover/focus animation. Explicit Play remains available. CSS decorative transitions are also removed for reduced motion.
- Search is local, Unicode-aware and debounced; no request is sent to any server. Theme and hover preference use local storage where available.

The imported animations are three seconds, 256px, and at most 60 KiB each. The typical animation is about 25 KiB. Source masters are download-only; they are not used in gallery rendering.

## Serving

```sh
npm ci
npm run dev
```

The included preview server listens only on `127.0.0.1`, with correct AVIF/WebP MIME types and no-cache headers for development. For deployment, serve `index.html`, `showcase/`, `assets/`, documentation, catalog, and license as static files. Preserve directory paths. No Node runtime is required in production.

The asset paths are stable, not content-addressed. Use normal revalidation or a short cache lifetime unless your deployment versions the whole release path. Do not apply immutable caching to mutable paths. Exclude `.git`, `node_modules`, and `out/` from published files.

## Recheck after adding assets

Run `npm run catalog` and `npm run check`. In a browser, test search, category filtering, pagination, downloads, detail playback, dark backdrop, keyboard Escape, and reduced-motion. Verify that initial loading does not fetch animations and that leaving the viewport stops animated previews. Check a narrow viewport for horizontal overflow. Do not measure only file size: animation decoding and concurrent playback are also part of the budget.
