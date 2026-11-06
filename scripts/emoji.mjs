import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
import {asset,read,write,resolve,snapshot,relative} from './lib.mjs';
import {renderFrames} from './motion/render.mjs';
import {checkFrames} from './motion/gates.mjs';
import {encoder,encode} from './motion/encode.mjs';
import {PRESETS} from './motion/presets.mjs';
import {checkAsset} from './check.mjs';
const [command,id,...args]=process.argv.slice(2),dir=asset(id);
const option=(flag,fallback)=>{const i=args.indexOf(flag);return i<0?fallback:args[i+1]};
const force=args.includes('--force');
const validCommands=['new','prepare','animate','review','approve'];
if(!validCommands.includes(command))throw Error('Usage: npm run new|stills|animate|review|approve -- <emoji-id>');
if(command==='new'){
  if(fs.existsSync(dir))throw Error(`${id} already exists`);
  const category=option('--category','other');if(!['home','kitchen','garden','produce','meals','other'].includes(category))throw Error('Unknown category');
  fs.mkdirSync(dir,{recursive:true});
  const name=option('--name',id.replaceAll('-',' '));
  write(path.join(dir,'meta.json'),{id,name,category,terms:{en:{text:name},...(option('--vi')?{vi:{text:option('--vi')}}:{})},license:'MIT',origin:'original-ai-generated',status:'draft'});
  write(path.join(dir,'motion.json'),{preset:'nod',amp:.3,fps:16,fx:[],note:'Replace with a motion specific to the object; keep rigid parts fixed.'});
  fs.writeFileSync(path.join(dir,'prompt.md'),`# ${name}\n\nCreate one original, friendly 3D vocabulary sticker of ${name}. Accurate identifying details, soft materials, clear silhouette at128px, centered in a square canvas with generous margin. Genuine alpha transparency. No text, logo, scene or external shadow. Save the approved high-resolution PNG as source.png in this directory.\n\nRecord the actual prompt, tool and any targeted corrections here.\n`);
  console.log(`Created ${relative(dir)}. Generate and review source.png, then run npm run stills -- ${id}.`);
}else if(command==='prepare'){
  if(!fs.existsSync(path.join(dir,'source.png')))throw Error('Place the approved transparent master at '+relative(path.join(dir,'source.png')));
  if(!force&&['still.png','still.webp'].some(f=>fs.existsSync(path.join(dir,f))))throw Error('Stills exist. Use a new id for a variant, or --force for an intentional revision.');
  const input=await sharp(path.join(dir,'source.png')).metadata();if(!input.hasAlpha)throw Error('Source needs a genuine alpha channel');
  const piece=await sharp(path.join(dir,'source.png')).trim({threshold:8}).resize(224,224,{fit:'inside',withoutEnlargement:true}).png().toBuffer();
  const info=await sharp(piece).metadata();
  const png=await sharp({create:{width:256,height:256,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:piece,left:Math.floor((256-info.width)/2),top:Math.floor((256-info.height)/2)}]).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer();
  fs.writeFileSync(path.join(dir,'still.png'),png);
  await sharp(png).webp({quality:85,alphaQuality:90,effort:6}).toFile(path.join(dir,'still.webp'));
  console.log(`Prepared ${id}: PNG +WebP, 256px, alpha,224px artwork frame.`);
}else if(command==='animate'){
  const recipe=read(path.join(dir,'motion.json'));
  if(!PRESETS.includes(recipe.preset)||![12,16,18,20,24].includes(recipe.fps??24))throw Error('Invalid preset or frame rate');
  const target=option('--out',path.join(dir,'animated.avif'));
  if(fs.existsSync(target)&&!force)throw Error('Output exists. Use --out <temporary.avif>, a new id, or explicit --force.');
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'emoji-motion-'));
  try{await renderFrames(id,recipe,tmp,path.join(dir,'still.png'));await checkFrames(tmp,path.join(dir,'still.png'),recipe);const encoded=path.join(tmp,'result.avif');
    const size=encode(tmp,encoded,encoder(),{qualityStep:8,alphaQuality:60,alphaStep:10,speed:4,fps:recipe.fps??24,frames:(recipe.fps??24)*3});fs.copyFileSync(encoded,target);console.log(`${id}: ${recipe.preset},${(size/1024).toFixed(1)}KiB → ${target}`);
  }finally{fs.rmSync(tmp,{recursive:true,force:true})}
}else if(command==='review'){
  await checkAsset(id,{review:false});
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'emoji-review-')),out=resolve('out/review');fs.mkdirSync(out,{recursive:true});
  try{execFileSync('ffmpeg',['-v','error','-i',path.join(dir,'animated.avif'),'-filter_complex','[0:2][0:3]alphamerge','-fps_mode','passthrough',path.join(tmp,'f%03d.png')]);
    const frames=fs.readdirSync(tmp).sort(),tiles=[];
    for(let bg=0;bg<2;bg++)for(let i=0;i<9;i++)tiles.push({input:await sharp(i?path.join(tmp,frames[Math.floor((i-1)*frames.length/8)]):path.join(dir,'still.png')).resize(128,128).flatten({background:bg?'#172E32':'#F6F2E9'}).png().toBuffer(),left:i*128,top:bg*128});
    await sharp({create:{width:1152,height:256,channels:4,background:'#F6F2E9'}}).composite(tiles).png().toFile(path.join(out,`${id}.png`));
    write(path.join(out,`${id}.json`),{id,hashes:snapshot(dir)});console.log(`Review ${relative(path.join(out,`${id}.png`))}: still +8 decoded frames, light/dark. Also open the AVIF for playback.`);
  }finally{fs.rmSync(tmp,{recursive:true,force:true})}
}else if(command==='approve'){
  await checkAsset(id,{review:false});
  const evidence=read(resolve('out/review',`${id}.json`)),current=snapshot(dir);for(const [file,h]of Object.entries(current))if(evidence.hashes[file]!==h)throw Error(`Review is stale: ${file}`);
  const meta=read(path.join(dir,'meta.json'));meta.status='ready';write(path.join(dir,'meta.json'),meta);
  write(path.join(dir,'review.json'),{reviewedAt:new Date().toISOString(),method:'maintainer approval after contact-sheet and playback review',hashes:snapshot(dir)});
  console.log(`Approved ${id}. Run npm run catalog && npm run check.`);
}
