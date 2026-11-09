// Small per-part puppet warps preserve a generated sticker's texture without moving its whole body.
import { sampleTrack, validateTrack } from "./tracks.mjs";
import { beat, settle } from "./presets.mjs";

export function checkRegions(regions = []) {
  for (const r of regions) {
    if (r.keyframes) validateTrack(r.keyframes, r.kind === "rotate" ? -15 : -8, r.kind === "rotate" ? 15 : 8);
    if (!["press", "wave", "rotate"].includes(r.kind))
      throw new Error("unknown regional motion");
    if (
      !Array.isArray(r.center) ||
      !Array.isArray(r.radius) ||
      r.center.length !== 2 ||
      r.radius.length !== 2 ||
      r.center.some((x) => !Number.isFinite(x) || x < 0 || x > 256) ||
      r.radius.some((x) => !Number.isFinite(x) || x <= 0 || x > 256) ||
      !Number.isFinite(r.amp) ||
      Math.abs(r.amp) > (r.kind === "rotate" ? 15 : 8)
    )
      throw new Error("invalid regional motion bounds");
  }
}

export function deformPixels(input, width, height, regions, t) {
  if (t === 0 || !regions.length) return input;
  const result = Buffer.alloc(input.length);
  const fields = regions.map((r) => ({
    ...r,
    value:
      r.keyframes ? sampleTrack(r.keyframes, t * 3) : r.kind === "press"
        ? r.amp * (beat(t, 0.08, 0.5) + 0.15 * settle(t, 0.5))
        : r.amp *
          Math.sin(2 * Math.PI * (r.cycles ?? 1) * t) *
          beat(t, 0, 0.88),
  }));
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      let dx = 0,
        dy = 0;
      for (const r of fields) {
        const u = (x - r.center[0]) / r.radius[0];
        const v = (y - r.center[1]) / r.radius[1];
        const w = Math.max(0, 1 - u * u - v * v) ** 2;
        if (!w) continue;
        if (r.kind === "press") dy += r.value * w;
        else if (r.kind === "wave") dx += r.value * w;
        else {
          const pivot = r.pivot ?? r.center;
          const a = (r.value * Math.PI) / 180;
          const px = x - pivot[0],
            py = y - pivot[1];
          dx += (px * Math.cos(a) - py * Math.sin(a) - px) * w;
          dy += (px * Math.sin(a) + py * Math.cos(a) - py) * w;
        }
      }
      const sx = x - dx,
        sy = y - dy;
      const left = Math.floor(sx),
        top = Math.floor(sy);
      const fx = sx - left,
        fy = sy - top;
      let alpha = 0,
        red = 0,
        green = 0,
        blue = 0;
      for (let yy = 0; yy < 2; yy++)
        for (let xx = 0; xx < 2; xx++) {
          const px = left + xx,
            py = top + yy;
          if (px < 0 || py < 0 || px >= width || py >= height) continue;
          const weight = (xx ? fx : 1 - fx) * (yy ? fy : 1 - fy);
          const i = (py * width + px) * 4;
          const a = input[i + 3] * weight;
          alpha += a;
          red += input[i] * a;
          green += input[i + 1] * a;
          blue += input[i + 2] * a;
        }
      const out = (y * width + x) * 4;
      if (alpha > 0) {
        result[out] = Math.round(red / alpha);
        result[out + 1] = Math.round(green / alpha);
        result[out + 2] = Math.round(blue / alpha);
        result[out + 3] = Math.round(alpha);
      }
    }
  return result;
}
