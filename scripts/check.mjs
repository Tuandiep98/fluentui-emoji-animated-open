import { CATEGORY_IDS } from './categories.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { ids,asset,read,resolve,snapshot } from './lib.mjs';
export async function checkAsset(id,{decode=true,review=true}={}) {
  const dir=asset(id),meta=read(path.join(dir,'meta.json')),r=read(path.join(dir,'motion.json'));
  if(meta.id!==id||!meta.name||!CATEGORY_IDS.includes(meta.category)||meta.license!=='MIT')throw Error(`${id}: invalid metadata`);
  for(const file of ['still.png','still.webp']){const m=await sharp(path.join(dir,file)).metadata();if(m.width!==256||m.height!==256||!m.hasAlpha)throw Error(`${id}/${file}: needs 256×256 alpha`)}
  const output=path.join(dir,'animated.avif');
  if(fs.statSync(output).size>60*1024)throw Error(`${id}: AVIF exceeds60KiB`);
  const fps=r.fps??24;if(![12,16,18,20,24].includes(fps))throw Error(`${id}: invalid fps`);
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=index,codec_name,width,height,nb_frames,r_frame_rate,duration','-of','json',output],{encoding:'utf8'}));
  const seq=probe.streams.filter(s=>Number(s.nb_frames)>1);
  if(seq.length!==2||seq.some(s=>s.codec_name!=='av1'||s.width!==256||s.height!==256||Number(s.nb_frames)!==fps*3||s.r_frame_rate!==`${fps}/1`||!Number.isFinite(Number(s.duration))||Math.abs(Number(s.duration)-3)>.001))throw Error(`${id}: color/alpha sequence contract failed`);
  if(decode){
    const times=[0,.25,.3,.37,.57].map(t=>Math.round(t*fps*3));
    const select=times.map(n=>`eq(n,${n})`).join('+');
    const raw=execFileSync('ffmpeg',['-v','error','-i',output,'-filter_complex',`[0:${seq[0].index}][0:${seq[1].index}]alphamerge,select='${select}'`,'-fps_mode','passthrough','-frames:v','5','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{maxBuffer:2*1024*1024});
    const bytes=256*256*4;if(raw.length!==bytes*5)throw Error(`${id}: missing frames`);
    let clear=false,opaque=false,maxChanged=0;
    for(let i=3;i<bytes;i+=4){clear ||=raw[i]===0;opaque ||=raw[i]>=250}
    for(let f=1;f<5;f++){let changed=0;for(let i=0;i<bytes;i+=4){const j=f*bytes+i;let d=Math.abs(raw[i+3]-raw[j+3]);for(let c=0;c<3;c++)d=Math.max(d,Math.abs(raw[i+c]*raw[i+3]/255-raw[j+c]*raw[j+3]/255));if(d>=4)changed++}maxChanged=Math.max(maxChanged,changed)}
    if(!clear||!opaque||maxChanged<20)throw Error(`${id}: alpha or real-motion gate failed`);
  }
  if(review){const expected=read(path.join(dir,'review.json')).hashes;for(const [file,value]of Object.entries(snapshot(dir)))if(expected[file]!==value)throw Error(`${id}/${file}: needs a new review`)}
  return meta;
}
if(process.argv[1]&&import.meta.url===new URL(`file://${path.resolve(process.argv[1])}`).href){
  const selected=process.argv.slice(2).filter(x=>!x.startsWith('--'));
  const list=selected.length?selected:ids().filter(id=>read(path.join(asset(id),'meta.json')).status==='ready');
  const catalog=read(resolve('catalog.json'));if(!selected.length&&catalog.count!==list.length)throw Error('Run npm run catalog');
  for(const id of list)await checkAsset(id,{decode:!process.argv.includes('--quick')});
  console.log(`Checked ${list.length} emoji: metadata, files, alpha, sequence, size,${process.argv.includes('--quick')?'':' decoded motion,'} review hashes.`);
}
