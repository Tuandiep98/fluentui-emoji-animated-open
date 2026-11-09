import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const resolve = (...parts) => path.join(ROOT, ...parts);
export const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
export const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
export const hash = (data) => createHash('sha256').update(data).digest('hex');
export const hashFile = (file) => hash(fs.readFileSync(file));
export const files = ['source.png', 'still.png', 'still.webp', 'animated.avif', 'motion.json', 'meta.json'];
export const ids = () => fs.readdirSync(resolve('assets'), {withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).sort();
export function asset(id) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id ?? '')) throw Error('Use a lowercase, hyphen-separated emoji id.');
  return resolve('assets', id);
}
export const snapshot = (dir) => Object.fromEntries([...files,...(fs.existsSync(path.join(dir,'rig-source.png'))?['rig-source.png']:[])].map(file=>[file, hashFile(path.join(dir,file))]));
export const relative = (file) => path.relative(ROOT, file).split(path.sep).join('/');
