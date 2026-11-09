import fs from 'node:fs';
import { CATEGORY_LABELS } from './categories.mjs';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function updateShowcaseStats(entries, filename) {
  const counts = new Map();
  for (const entry of entries) counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
  const filters = `<button data-category="all" aria-pressed="true">All emoji <span>${entries.length}</span></button>` +
    Object.entries(CATEGORY_LABELS).filter(([key]) => counts.has(key)).map(([key, label]) => `<button data-category="${key}" aria-pressed="false">${escape(label)} <span>${counts.get(key)}</span></button>`).join('');
  const sizes = entries.map(entry => entry.animationBytes).sort((a, b) => a - b);
  const median = sizes.length ? Math.round(sizes[Math.floor(sizes.length / 2)] / 1024) : 0;
  const before = fs.readFileSync(filename, 'utf8');
  const after = before
    .replace(/(<meta name="description" content="Explore )\d+( original 3D emoji)/, (_, a, b) => `${a}${entries.length}${b}`)
    .replace(/(<strong id="count-stat">)[^<]*(<\/strong>)/, (_, a, b) => `${a}${entries.length}${b}`)
    .replace(/(<strong id="size-stat">)[^<]*(<\/strong>)/, (_, a, b) => `${a}${median} KiB${b}`)
    .replace(/(<strong id="size-stat">[^<]*<\/strong><span>)[^<]*(<\/span>)/, (_, a, b) => `${a}median animation${b}`)
    .replace(/(<div class="filters"[^>]*>)[\s\S]*?(<\/div>)/, (_, a, b) => `${a}${filters}${b}`)
    .replace(/(<p id="results"[^>]*>)[^<]*(<\/p>)/, (_, a, b) => `${a}${entries.length} emoji to explore${b}`);
  if (after !== before) fs.writeFileSync(filename, after);
}
