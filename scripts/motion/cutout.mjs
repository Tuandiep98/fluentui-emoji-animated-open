// Offline cutout rigs: embedded PNG artwork, parent/child joints and per-part tracks.
// Only the rendered AVIF is delivered to the app; no rig runtime is required.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const channels = {x:[-24,24],y:[-24,24],rotation:[-30,30],scaleX:[.05,1.2],scaleY:[.05,1.2],opacity:[0,1]};
const finite=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
export function checkRig(rig) {
  if(rig?.version!==1 || !rig.images || !Array.isArray(rig.nodes))throw Error('Invalid cutout rig');
  const images=Object.entries(rig.images);
  if(!images.length||images.length>16)throw Error('Invalid cutout image count');
  for(const [name,image] of images)if(!/^[a-z0-9-]+$/.test(name)||typeof image!=='string'||image.length>3_000_000||!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(image))throw Error('Cutout images must be embedded PNGs');
  let count=0;
  function check(nodes,depth=0){
    if(depth>8)throw Error('Cutout hierarchy too deep');
    for(const node of nodes){
      if(++count>32)throw Error('Too many cutout nodes');
      if(node.pivot&&(!Array.isArray(node.pivot)||node.pivot.length!==2||node.pivot.some(v=>!finite(v,0,256))))throw Error('Invalid cutout pivot');
      if(node.image&&(!rig.images[node.image]||!Array.isArray(node.rect)||node.rect.length!==4||node.rect.some((v,i)=>!finite(v,i<2?0:1,256))))throw Error('Invalid cutout artwork');
      for(const [channel,track] of Object.entries(node.tracks??{})){
        const bounds=channels[channel];if(!bounds)throw Error('Unknown cutout channel');
        if(!Array.isArray(track)){
          if(channel!=='scaleY'||track?.curve!=='breath'||!finite(track.amp,0,.03))throw Error('Invalid cutout curve');
          continue;
        }
        if(track.length<2||track.length>64||track[0][0]!==0||track.at(-1)[0]!==3)throw Error('Cutout tracks must span three seconds');
        for(let i=0;i<track.length;i++)if(!Array.isArray(track[i])||track[i].length!==2||!finite(track[i][0],0,3)||!finite(track[i][1],...bounds)||(i&&track[i][0]<=track[i-1][0]))throw Error('Invalid cutout keyframes');
        if(track[0][1]!==track.at(-1)[1])throw Error('Cutout track does not loop');
      }
      if(node.children){if(!Array.isArray(node.children))throw Error('Invalid cutout children');check(node.children,depth+1);}
    }
  }
  check(rig.nodes);
}
function sample(track,t,fallback){
  if(!track)return fallback;
  if(track.curve==='breath')return 1+track.amp*Math.sin(Math.PI*t/3)**2;
  for(let i=1;i<track.length;i++)if(t<=track[i][0]){const [a,x]=track[i-1],[b,y]=track[i];const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return x+(y-x)*u*u*(3-2*u);}
  return track.at(-1)[1];
}
export function rigSvg(rig,t){
  function draw(node){
    const tracks=node.tracks??{},[px,py]=node.pivot??[0,0];
    const value=(key,fallback=0)=>sample(tracks[key],t,fallback);
    const matrix=`translate(${value('x')} ${value('y')}) rotate(${value('rotation')} ${px} ${py}) translate(${px} ${py}) scale(${value('scaleX',1)} ${value('scaleY',1)}) translate(${-px} ${-py})`;
    let art='';if(node.image){const [x,y,width,height]=node.rect;art=`<image x="${x}" y="${y}" width="${width}" height="${height}" href="${rig.images[node.image]}"/>`;}
    return `<g opacity="${value('opacity',1)}" transform="${matrix}">${art}${(node.children??[]).map(draw).join('')}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">${rig.nodes.map(draw).join('')}</svg>`;
}
export async function renderCutoutFrames(recipe,dir){
  checkRig(recipe.rig);
  fs.mkdirSync(dir,{recursive:true});
  const fps=recipe.fps??24;
  for(let i=0;i<fps*3;i++)await sharp(Buffer.from(rigSvg(recipe.rig,i/fps))).png().toFile(path.join(dir,`f${String(i).padStart(3,'0')}.png`));
  return {left:0,top:0,width:256,height:256};
}
