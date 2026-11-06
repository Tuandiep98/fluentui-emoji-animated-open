import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { transform } from "./presets.mjs";
import { defs, effects } from "./fx.mjs";
import { checkRegions, deformPixels } from "./deform.mjs";

export async function imageBox(bytes) {
  const t = await sharp(bytes)
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });
  return {
    left: -t.info.trimOffsetLeft,
    top: -t.info.trimOffsetTop,
    width: t.info.width,
    height: t.info.height,
  };
}
export function pivotOf(box, recipe) {
  const p =
    recipe.pivot ??
    (["float", "pulse", "pop", "shine", "flip", "rattle"].includes(
      recipe.preset,
    )
      ? "center"
      : recipe.preset === "swing"
        ? "top"
        : "bottom");
  const ratio =
    p === "top"
      ? { x: 0.5, y: 0 }
      : p === "center"
        ? { x: 0.5, y: 0.5 }
        : p === "bottom"
          ? { x: 0.5, y: 1 }
          : p;
  return {
    x: box.left + ratio.x * box.width,
    y: box.top + ratio.y * box.height,
  };
}
const f = (x) => Number(x.toFixed(4));
export async function renderFrames(
  id,
  recipe,
  dir,
  stillPath = path.join("public/content/images", `${id}.png`),
) {
  const bytes = fs.readFileSync(stillPath);
  const box = await imageBox(bytes);
  const pivot = pivotOf(box, recipe);
  const data = bytes.toString("base64");
  const regions = recipe.regions ?? [];
  checkRegions(regions);
  const pixels = regions.length
    ? await sharp(bytes).ensureAlpha().raw().toBuffer()
    : undefined;
  fs.mkdirSync(dir, { recursive: true });
  const frames = (recipe.fps ?? 24) * 3;
  for (let frame = 0; frame < frames; frame++) {
    const t = frame / frames;
    const p = transform(recipe.preset, t, recipe);
    const fx = effects(id, recipe, t, box);
    const matrix = `translate(${f(pivot.x + p.x)} ${f(pivot.y + p.y)}) rotate(${f(p.rotation)}) scale(${f(p.sx)} ${f(p.sy)}) translate(${-f(pivot.x)} ${-f(pivot.y)})`;
    const frameData =
      pixels && t !== 0
        ? (
            await sharp(deformPixels(pixels, 256, 256, regions, t), {
              raw: { width: 256, height: 256, channels: 4 },
            })
              .png()
              .toBuffer()
          ).toString("base64")
        : data;
    const image = `<image width="256" height="256" href="data:image/png;base64,${frameData}"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">${defs}<g>${fx.back}</g><g transform="${matrix}">${image}</g><g>${fx.front}</g></svg>`;
    let png = await sharp(Buffer.from(svg)).png().toBuffer();
    if (fx.glint) {
      const glintSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">${fx.glint}</svg>`;
      const overlay = await sharp(Buffer.from(glintSvg)).png().toBuffer();
      png = await sharp(png)
        .composite([{ input: overlay, blend: "atop" }])
        .png()
        .toBuffer();
    }
    fs.writeFileSync(
      path.join(dir, `f${String(frame).padStart(3, "0")}.png`),
      png,
    );
  }
  return box;
}
