export const MOTION_VERSION = 7;
export const FRAMES = 72;
const tau = Math.PI * 2;
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  const v = clamp(x);
  return v * v * (3 - 2 * v);
};
export const beat = (t, start, end) =>
  t <= start || t >= end
    ? 0
    : Math.sin((Math.PI * (t - start)) / (end - start)) ** 2;
export const settle = (t, start, freq = 5, damping = 7) => {
  if (t <= start || t >= 0.88) return 0;
  const u = t - start;
  return (
    Math.sin(tau * freq * u) *
    Math.exp(-damping * u) *
    smooth((0.88 - t) / 0.12)
  );
};
const pose = (x = 0, y = 0, rotation = 0, sx = 1, sy = 1) => ({
  x,
  y,
  rotation,
  sx,
  sy,
});

export function transform(preset, t, recipe = {}) {
  if (t === 0) return pose();
  const a = recipe.amp ?? 1;
  const dir = recipe.facing === "left" ? -1 : 1;
  const b = beat(t, 0.05, 0.58);
  const s = settle(t, 0.52);
  let p;
  switch (preset) {
    case "still":
      p = pose();
      break;
    case "hop": {
      const jump = beat(t, 0.1, 0.45);
      const squash = recipe.noSquash
        ? 0
        : 0.045 * beat(t, 0.02, 0.15) + 0.06 * beat(t, 0.41, 0.54);
      const sy = recipe.noSquash ? 1 : 1 - a * squash + a * 0.025 * jump;
      p = pose(0, -a * (10 * jump + Math.max(0, s) * 2), 0, 1 / sy, sy);
      break;
    }
    case "jelly": {
      const sy = 1 - a * (0.055 * beat(t, 0.05, 0.28) - 0.028 * s);
      p = pose(0, 0, 0, 1 / sy, sy);
      break;
    }
    case "sway":
      p = pose(
        0,
        0,
        a * 5 * Math.sin(tau * t),
        1 + a * 0.012 * Math.sin(tau * t),
        1 - a * 0.012 * Math.sin(tau * t),
      );
      break;
    case "rock":
      p = pose(0, -a * 1.5 * Math.sin(tau * t) ** 2, a * 6 * Math.sin(tau * t));
      break;
    case "swing":
      p = pose(0, 0, a * (12 * Math.sin(tau * 2 * t) * beat(t, 0.01, 0.83)));
      break;
    case "float":
      p = pose(0, -a * 6 * Math.sin(tau * t), a * 3 * Math.sin(tau * t));
      break;
    case "drive":
      p = pose(
        a * dir * 3 * b,
        -a * 3 * (beat(t, 0.08, 0.24) + beat(t, 0.35, 0.51)),
        a * dir * 3 * b,
      );
      break;
    case "pulse": {
      const v = beat(t, 0.08, 0.35) + beat(t, 0.42, 0.69);
      p = pose(0, 0, 0, 1 + a * 0.055 * v, 1 + a * 0.055 * v);
      break;
    }
    case "pop": {
      const v =
        -0.05 * beat(t, 0.03, 0.19) + 0.07 * beat(t, 0.18, 0.43) + 0.018 * s;
      p = pose(0, 0, 0, 1 + a * v, 1 + a * v);
      break;
    }
    case "shine": {
      const v = 0.015 * Math.sin(Math.PI * t) ** 2;
      p = pose(0, 0, 0, 1 + a * v, 1 + a * v);
      break;
    }
    case "flip": {
      const v = beat(t, 0.08, 0.65);
      p = pose(
        0,
        -a * 3 * v,
        0,
        1 - a * 0.8 * Math.sin(2 * Math.PI * v) ** 2,
        1,
      );
      break;
    }
    case "tool":
      p = pose(
        0,
        0,
        a * dir * (-4 * beat(t, 0.03, 0.21) + 12 * beat(t, 0.2, 0.48) + 2 * s),
      );
      break;
    case "rattle":
      p = pose(0, 0, a * 4 * Math.sin(tau * 5 * t) * beat(t, 0.02, 0.48));
      break;
    case "breathe": {
      const v = a * 0.02 * Math.sin(Math.PI * t) ** 2;
      p = pose(0, 0, 0, 1 + v, 1 + v);
      break;
    }
    case "nod":
      p = pose(0, 0, a * (6 * beat(t, 0.07, 0.37) - 3 * beat(t, 0.37, 0.62)));
      break;
    case "pour":
      p = pose(0, 0, a * 8 * beat(t, 0.08, 0.7));
      break;
    default:
      throw new Error(`unknown preset: ${preset}`);
  }
  if (
    Math.abs(p.x) > 12 ||
    Math.abs(p.y) > 12 ||
    Math.abs(p.rotation) > (preset === "swing" || preset === "tool" ? 14 : 9) ||
    p.sx < 0.2 ||
    p.sx > 1.08 ||
    p.sy < 0.92 ||
    p.sy > 1.08
  )
    throw new Error(`motion limit: ${preset}`);
  return p;
}

export const PRESETS = [
  "still",
  "hop",
  "jelly",
  "sway",
  "rock",
  "swing",
  "float",
  "drive",
  "pulse",
  "pop",
  "shine",
  "flip",
  "tool",
  "rattle",
  "breathe",
  "nod",
  "pour",
];
