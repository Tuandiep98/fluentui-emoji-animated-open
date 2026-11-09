// Rigid parts rotate/slide around measured joints while the remaining artwork stays fixed.
import { sampleTrack, validateTrack } from "./tracks.mjs";
import { beat, settle } from "./presets.mjs";

export function checkLayers(layers = []) {
  for (const part of layers) {
    for (const [key,track] of Object.entries(part.tracks ?? {})) {
      if (!["angle","x","y"].includes(key)) throw new Error("Unknown rigid layer channel");
      validateTrack(track,key === "angle" ? -15 : -8,key === "angle" ? 15 : 8);
    }
    if (
      !Array.isArray(part.polygon) ||
      part.polygon.length < 3 ||
      part.polygon.some(
        (point) =>
          !Array.isArray(point) ||
          point.length !== 2 ||
          point.some((n) => !Number.isFinite(n) || n < 0 || n > 256),
      ) ||
      !Array.isArray(part.pivot) ||
      part.pivot.length !== 2 ||
      part.pivot.some((n) => !Number.isFinite(n) || n < 0 || n > 256) ||
      ["angle", "x", "y"].some(
        (key) =>
          !Number.isFinite(part[key] ?? 0) ||
          Math.abs(part[key] ?? 0) > (key === "angle" ? 15 : 8),
      )
    ) {
      throw new Error(
        "Invalid rigid layer: measured polygon, pivot and bounded transform required",
      );
    }
  }
}

export function layeredImage(data, layers, t) {
  const image = `<image width="256" height="256" href="data:image/png;base64,${data}"/>`;
  if (!layers.length || t === 0 || (t >= 0.88 && !layers.some(part => part.tracks))) return image;
  const amount = beat(t, 0.06, 0.68) + 0.08 * settle(t, 0.68);
  const shapes = layers.map(
    (part, i) =>
      `<polygon id="part-${i}" points="${part.polygon.map((point) => point.join(",")).join(" ")}"/>`,
  );
  const clips = layers
    .map(
      (_, i) => `<clipPath id="clip-${i}"><use href="#part-${i}"/></clipPath>`,
    )
    .join("");
  const cuts = layers
    .map((_, i) => `<use href="#part-${i}" fill="black"/>`)
    .join("");
  const pieces = layers
    .map((part, i) => {
      const angle = part.tracks?.angle ? sampleTrack(part.tracks.angle,t*3) : (part.angle ?? 0) * amount;
      const x = part.tracks?.x ? sampleTrack(part.tracks.x,t*3) : (part.x ?? 0) * amount,
        y = part.tracks?.y ? sampleTrack(part.tracks.y,t*3) : (part.y ?? 0) * amount;
      return `<g transform="translate(${x} ${y}) rotate(${angle} ${part.pivot[0]} ${part.pivot[1]})"><g clip-path="url(#clip-${i})">${image}</g></g>`;
    })
    .join("");
  return `<defs>${shapes.join("")}${clips}<mask id="fixed-art" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256"><rect width="256" height="256" fill="white"/>${cuts}</mask></defs><g mask="url(#fixed-art)">${image}</g>${pieces}`;
}
