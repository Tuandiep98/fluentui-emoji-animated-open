const bell = (t, a, b) =>
  t <= a || t >= b ? 0 : Math.sin((Math.PI * (t - a)) / (b - a)) ** 2;
const n = (x) => Number(x.toFixed(3));
export function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}
const star = (x, y, size, alpha) =>
  `<path d="M0 ${-size} Q${size * 0.18} ${-size * 0.18} ${size} 0 Q${size * 0.18} ${size * 0.18} 0 ${size} Q${-size * 0.18} ${size * 0.18} ${-size} 0 Q${-size * 0.18} ${-size * 0.18} 0 ${-size}Z" fill="url(#spark)" opacity="${n(alpha)}" transform="translate(${n(x)} ${n(y)})"/>`;
const bubble = (x, y, r, a, color = "#C5EBFF") =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${color}" opacity="${n(a)}"/><circle cx="${n(x - r * 0.27)}" cy="${n(y - r * 0.3)}" r="${n(r * 0.25)}" fill="white" opacity="${n(a * 0.8)}"/>`;
export const defs = `<defs><radialGradient id="spark"><stop stop-color="white"/><stop offset=".55" stop-color="#FFF4B8"/><stop offset="1" stop-color="#FFD675" stop-opacity="0"/></radialGradient><radialGradient id="puff"><stop stop-color="white" stop-opacity=".8"/><stop offset="1" stop-color="#B7B4B5" stop-opacity="0"/></radialGradient></defs>`;

export function effects(id, recipe, t, box) {
  const frames = (recipe.fps ?? 24) * 3;
  const end = (frames - 1) / frames;
  if (t === 0 || t >= end) return { back: "", front: "", glint: "" };
  const fx = recipe.fx ?? [];
  const random = rng(id);
  const cx = box.left + box.width / 2,
    cy = box.top + box.height / 2;
  let back = "",
    front = "",
    glint = "";
  for (const name of fx) {
    if (name === "sparkle" || name === "twinkle") {
      for (let i = 0; i < (name === "twinkle" ? 2 : 3); i++) {
        const x = box.left + box.width * (0.18 + random() * 0.64);
        const y = box.top + 12 + random() * Math.min(28, box.height * 0.2);
        front += star(
          x,
          y,
          name === "twinkle" ? 5 : 8,
          0.85 * bell(t, 0.12 + i * 0.13, 0.44 + i * 0.13),
        );
      }
    } else if (name === "glint") {
      const x = box.left - 40 + (box.width + 80) * ((t - 0.2) / 0.2);
      glint = `<path d="M${n(x)} 0 l14 0 -90 256 -14 0Z" fill="white" opacity="${n((recipe.glintAlpha ?? 0.45) * bell(t, 0.2, 0.4))}"/>`;
    } else if (name === "steam" || name === "smoke") {
      for (let i = 0; i < 3; i++) {
        const phase = (t * 2 + i / 3) % 1;
        const a = 0.55 * Math.sin(Math.PI * phase) * bell(t, 0, end);
        front += `<path d="M${n(cx - 10 + i * 10)} ${n(box.top + 14 - phase * 4)} q-5 -3 0 -6 q5 -3 0 -6" stroke="${name === "steam" ? "#FFFFFF" : "#B7B4B5"}" stroke-width="5" stroke-linecap="round" fill="none" opacity="${n(a)}"/>`;
      }
    } else if (name === "notes") {
      for (let i = 0; i < 2; i++)
        front += `<text x="${n(cx + box.width * 0.25 + i * 12)}" y="${n(cy - 30 - i * 9 - t * 12)}" font-size="24" fill="${i ? "#4AA3FF" : "#8A6CFF"}" opacity="${n(0.8 * bell(t, 0.12 + i * 0.18, 0.42 + i * 0.18))}">♪</text>`;
    } else if (name === "speed-lines") {
      const x =
        recipe.facing === "left" ? box.left + box.width - 8 : box.left - 10;
      for (let i = 0; i < 3; i++)
        back += `<path d="M${n(x)} ${n(cy - 12 + i * 12)} h18" stroke="#D9DDE5" stroke-width="${i === 1 ? 4 : 3}" stroke-linecap="round" opacity="${n(0.7 * bell(t, 0.1, 0.55))}"/>`;
    } else if (name === "chalk-dust") {
      // A few powder grains, kept close to the chalk rather than a large smoke cloud.
      const a = 0.7 * bell(t, 0.12, 0.68);
      for (let i = 0; i < 6; i++) {
        const x = box.left + box.width * 0.2 + i * 4;
        const y = box.top + box.height * 0.82 + (i % 3) * 3 - t * 9;
        front += `<circle cx="${n(x)}" cy="${n(y)}" r="1.5" fill="#FFF6EF" opacity="${n(a)}"/>`;
      }
    } else if (name === "puff" || name === "dust") {
      for (let i = 0; i < 2; i++)
        back += `<circle cx="${n(cx + (i ? 12 : -12))}" cy="${n(name === "dust" ? box.top + box.height - 5 : box.top + 20)}" r="${n(9 + i * 3)}" fill="url(#puff)" opacity="${n(bell(t, 0.35, 0.62))}"/>`;
    } else if (name === "bubbles-rise") {
      for (let i = 0; i < 3; i++) {
        const phase = (t + i / 3) % 1;
        front += bubble(
          cx - 12 + i * 12,
          box.top + box.height * 0.35 - phase * 25,
          4 + i,
          0.6 * Math.sin(Math.PI * phase) * bell(t, 0, end),
        );
      }
    } else if (name === "rays") {
      for (let i = 0; i < 8; i++)
        back += `<path d="M${n(cx)} ${n(cy - 50)} v-18" stroke="#FFE0A0" stroke-width="5" stroke-linecap="round" opacity="${n(0.4 * bell(t, 0, end))}" transform="rotate(${i * 45} ${n(cx)} ${n(cy)})"/>`;
    } else if (name === "ring-burst") {
      back += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(25 + 40 * t)}" fill="none" stroke="#C5EBFF" stroke-width="5" opacity="${n(0.5 * bell(t, 0.08, 0.55))}"/>`;
    } else if (name === "lamp-glow" || name === "glass-glint") {
      const x = box.left + box.width * (recipe.emit?.x ?? 0.5);
      const y = box.top + box.height * (recipe.emit?.y ?? 0.5);
      const radius = recipe.glowRadius ?? 20;
      const alpha = bell(t, 0.08, 0.85);
      if (name === "lamp-glow")
        front += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${radius}" ry="${n(radius * 0.5)}" fill="#FFF3BC" opacity="${n(alpha * 0.32)}"/>`;
      else {
        const offset = radius * (t * 2 - 1);
        front += `<path d="M${n(x + offset - 5)} ${n(y + radius * 0.55)} l${n(radius * 0.65)} ${n(-radius * 1.1)}" stroke="white" stroke-width="3" stroke-linecap="round" opacity="${n(alpha * 0.4)}"/>`;
      }
    } else if (name === "bell-ring") {
      const x = box.left + box.width * (recipe.emit?.x ?? 0.5);
      const y = box.top + box.height * (recipe.emit?.y ?? 0.6);
      const alpha = 0.65 * bell(t, 0.18, 0.65);
      for (const side of [-1, 1])
        front += `<path d="M${n(x + side * 32)} ${n(y - 13)} q${side * 9} 13 0 26" stroke="#F8CC6A" stroke-width="3" stroke-linecap="round" fill="none" opacity="${n(alpha)}"/>`;
    } else if (name === "liquid-ripple") {
      // Surface coordinates are measured on each sticker; the vessel stays fixed.
      const surface = recipe.surface ?? { x: 0.5, y: 0.25, rx: 0.28, ry: 0.06 };
      const x = box.left + box.width * surface.x;
      const y = box.top + box.height * surface.y;
      for (let i = 0; i < 2; i++) {
        const phase = (t * 1.5 + i * 0.5) % 1;
        const alpha = Math.sin(Math.PI * phase) * bell(t, 0.05, 0.87) * 0.65;
        front += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(box.width * surface.rx * (0.25 + phase * 0.75))}" ry="${n(box.height * surface.ry * (0.25 + phase * 0.75))}" fill="none" stroke="${recipe.rippleColor ?? "#D6F5FF"}" stroke-width="1.5" opacity="${n(alpha)}"/>`;
      }
    } else if (name === "water-jets") {
      for (const emitter of recipe.emitters ?? []) {
        const x = box.left + box.width * emitter.x;
        const y = box.top + box.height * emitter.y;
        const angle = (emitter.angle * Math.PI) / 180;
        for (let i = 0; i < 3; i++) {
          const phase = (t * 3 + i / 3) % 1;
          const distance = phase * 24;
          const px = x + Math.cos(angle) * distance;
          const py = y + Math.sin(angle) * distance + phase * phase * 8;
          const alpha = 0.9 * Math.sin(Math.PI * phase) * bell(t, 0.08, 0.85);
          front += `<ellipse cx="${n(px)}" cy="${n(py)}" rx="2" ry="3.2" fill="#75D8FF" opacity="${n(alpha)}" transform="rotate(${emitter.angle + 90} ${n(px)} ${n(py)})"/>`;
          front += `<circle cx="${n(px - 0.5)}" cy="${n(py - 0.6)}" r="0.8" fill="white" opacity="${n(alpha * 0.85)}"/>`;
        }
      }
    } else if (name === "water-drops") {
      const x = box.left + box.width * (recipe.emit?.x ?? 0.94);
      const y = box.top + box.height * (recipe.emit?.y ?? 0.48);
      for (let i = 0; i < 3; i++) {
        const phase = (t * 3 + i / 3) % 1;
        const alpha = 0.85 * bell(t, 0.17, 0.7) * Math.sin(Math.PI * phase);
        const px = x - phase * 3 + i * 2;
        const py = y + 4 + phase * 28;
        front += `<path d="M${n(px)} ${n(py - 5)} C${n(px + 5)} ${n(py + 1)} ${n(px + 4)} ${n(py + 5)} ${n(px)} ${n(py + 6)} C${n(px - 4)} ${n(py + 5)} ${n(px - 5)} ${n(py + 1)} ${n(px)} ${n(py - 5)}Z" fill="#76D9FF" opacity="${n(alpha)}"/><ellipse cx="${n(px - 1)}" cy="${n(py)}" rx="1.5" ry="3" fill="white" opacity="${n(alpha * 0.7)}"/>`;
      }
    } else throw new Error(`unknown FX: ${name}`);
  }
  return { back, front, glint };
}
