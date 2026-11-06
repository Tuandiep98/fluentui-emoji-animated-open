import path from "node:path";
import sharp from "sharp";
const raw = async (input) => sharp(input).ensureAlpha().raw().toBuffer();
const premul = (v, a) => Math.round((v * a) / 255);
function difference(a, b) {
  let max = 0,
    total = 0;
  for (let i = 0; i < a.length; i += 4)
    for (let c = 0; c < 4; c++) {
      const x = c === 3 ? a[i + c] : premul(a[i + c], a[i + 3]);
      const y = c === 3 ? b[i + c] : premul(b[i + c], b[i + 3]);
      const d = Math.abs(x - y);
      max = Math.max(max, d);
      total += d;
    }
  return { max, total };
}
function bounds(data) {
  let left = 256,
    top = 256,
    right = -1,
    bottom = -1;
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++)
      if (data[(y * 256 + x) * 4 + 3] > 8) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
  return { left, top, right, bottom };
}
export const withinEdge = (b, base) =>
  b.left >= Math.min(2, base.left) &&
  b.top >= Math.min(2, base.top) &&
  b.right <= Math.max(253, base.right) &&
  b.bottom <= Math.max(253, base.bottom);
export async function checkFrames(dir, stillPath, recipe = {}) {
  const frames = [];
  const count = (recipe.fps ?? 24) * 3;
  for (let i = 0; i < count; i++)
    frames.push(
      await raw(path.join(dir, `f${String(i).padStart(3, "0")}.png`)),
    );
  const still = await raw(stillPath);
  if (difference(still, frames[0]).max > 2)
    throw new Error("frame 0 differs from still");
  if (
    difference(frames[count - 1], frames[0]).total >
    difference(frames[0], frames[1]).total
  )
    throw new Error("loop seam is too large");
  const base = bounds(frames[0]);
  for (let i = 0; i < count; i++) {
    const b = bounds(frames[i]);
    // A few shipped stills already reach the edge. Preserve their first frame and never move farther out.
    if (!withinEdge(b, base)) throw new Error(`frame ${i} touches canvas edge`);
    if (
      (recipe.preset !== "flip" &&
        ["left", "right"].some((k) => Math.abs(b[k] - base[k]) > 14)) ||
      ["top", "bottom"].some((k) => Math.abs(b[k] - base[k]) > 14)
    )
      throw new Error(`frame ${i} bbox changes too much`);
  }
}
