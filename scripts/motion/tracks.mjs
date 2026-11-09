// Seconds-based smooth keyframes for individual parts and material regions.
export function validateTrack(track,min,max) {
  if(!Array.isArray(track)||track.length<2||track.length>64||track[0]?.[0]!==0||track.at(-1)?.[0]!==3)throw Error('Motion track must span 0–3 seconds');
  for(let i=0;i<track.length;i++){const p=track[i];if(!Array.isArray(p)||p.length!==2||!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[1]<min||p[1]>max||(i&&p[0]<=track[i-1][0]))throw Error('Invalid motion track');}
  if(track[0][1]!==track.at(-1)[1])throw Error('Motion track must loop');
}
export function sampleTrack(track,time,fallback=0){
  if(!track)return fallback;
  for(let i=1;i<track.length;i++)if(time<=track[i][0]){const [a,x]=track[i-1],[b,y]=track[i];const u=Math.max(0,Math.min(1,(time-a)/(b-a)));return x+(y-x)*u*u*(3-2*u);}
  return track.at(-1)[1];
}
export function poseTracks(tracks={},time){
  const bounds={x:[-12,12],y:[-12,12],rotation:[-9,9],sx:[.92,1.08],sy:[.92,1.08]};
  return Object.fromEntries(Object.entries(tracks).map(([key,track])=>{if(!bounds[key])throw Error('Unknown pose channel');validateTrack(track,...bounds[key]);return [key,sampleTrack(track,time,key==='sx'||key==='sy'?1:0)];}));
}
