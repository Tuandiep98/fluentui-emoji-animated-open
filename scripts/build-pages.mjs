import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { buildCatalog } from './catalog.mjs';
import { resolve } from './lib.mjs';

// Only public showcase files enter the deployment artifact.
// The builder uses Node built-ins; installing rendering dependencies is unnecessary.
const catalog = buildCatalog();
const output = resolve('_site');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const entry of [
  'index.html', 'showcase', 'motion-lab', 'docs', 'provenance',
  'catalog.json', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md',
]) {
  fs.cpSync(resolve(entry), resolve('_site', entry), { recursive: true });
}
fs.mkdirSync(resolve('_site', 'assets'));
for (const entry of catalog.entries) {
  fs.cpSync(resolve('assets', entry.id), resolve('_site', 'assets', entry.id), { recursive: true });
}
fs.writeFileSync(resolve('_site', '.nojekyll'), '');
console.log(`Pages artifact: ${catalog.count} emoji in ${output}`);

// Fingerprinted URLs avoid mixing a cached browser index with a newly deployed app.
let html=fs.readFileSync(resolve('_site','index.html'),'utf8');
for(const file of ['showcase/catalog.js','showcase/app.js','showcase/style.css']){
 const version=createHash('sha256').update(fs.readFileSync(resolve('_site',file))).digest('hex').slice(0,12);
 html=html.replace('"'+file+'"','"'+file+'?v='+version+'"');
}
fs.writeFileSync(resolve('_site','index.html'),html);
