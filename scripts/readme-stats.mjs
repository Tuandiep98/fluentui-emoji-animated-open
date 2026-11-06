import fs from 'node:fs';

const START = '<!-- EMOJI-STATS:START -->';
const END = '<!-- EMOJI-STATS:END -->';
const categories = new Map([
  ['home', 'Home'],
  ['kitchen', 'Kitchen'],
  ['garden', 'Garden'],
  ['produce', 'Fruit & vegetables'],
  ['meals', 'Food & drink'],
  ['other', 'Other'],
]);
const cell = value => String(value).replaceAll('|', '\\|').replace(/[\r\n]+/g, ' ');

export function renderReadmeStats(entries) {
  const counts = new Map();
  for (const entry of entries) {
    const category = entry.category || 'other';
    counts.set(category, (counts.get(category) || 0) + 1);
  }
  const order = [...categories.keys()];
  const keys = [...counts.keys()].sort((a, b) => {
    const rank = key => order.includes(key) ? order.indexOf(key) : order.length;
    return rank(a) - rank(b) || a.localeCompare(b);
  });
  return [
    START,
    `**${entries.length} emoji · ${counts.size} categories**`,
    '',
    '| Category | Emoji |',
    '| --- | ---: |',
    ...keys.map(key => `| ${cell(categories.get(key) || key)} | ${counts.get(key)} |`),
    `| **Total** | **${entries.length}** |`,
    END,
  ].join('\n');
}

export function updateReadmeStats(entries, readmePath) {
  const before = fs.readFileSync(readmePath, 'utf8');
  if (before.split(START).length !== 2 || before.split(END).length !== 2 || before.indexOf(END) < before.indexOf(START)) {
    throw new Error('README.md must contain exactly one ordered EMOJI-STATS marker pair');
  }
  const after = before.slice(0, before.indexOf(START)) + renderReadmeStats(entries) + before.slice(before.indexOf(END) + END.length);
  if (after !== before) fs.writeFileSync(readmePath, after);
}
