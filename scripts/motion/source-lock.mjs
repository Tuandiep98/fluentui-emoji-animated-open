// Opt-in identity gate: compare to an immutable original, never to an assembled replacement.
import { createHash } from "node:crypto";
import sharp from "sharp";
import { checkRegions, deformationField } from "./deform.mjs";
import {validateTrack} from "./tracks.mjs";

export async function checkSourceLock(bytes, recipe) {
  const lock = recipe.sourceLock;
  if (!lock) return;
  if (
    lock.version !== 1 ||
    !/^[a-f0-9]{64}$/.test(lock.sha256) ||
    createHash("sha256").update(bytes).digest("hex") !== lock.sha256
  )
    throw Error("Source lock: original artwork hash mismatch");
  const { width, height } = await sharp(bytes).metadata();
  if (
    width !== 256 ||
    height !== 256 ||
    recipe.preset !== "still" ||
    recipe.rig ||
    recipe.layers?.length ||
    ((lock.mode ?? "continuous") === "continuous" && recipe.tracks) ||
    recipe.fx?.length
  )
    throw Error(
      "Source lock: use the original 256px image and continuous regional motion only",
    );
  if (![12,16,18,20,24].includes(recipe.fps ?? 24)) throw Error('Source lock: invalid frame rate');
  if (!['continuous','rigid'].includes(lock.mode ?? 'continuous')) throw Error('Source lock: unknown mode');
  for (const pin of lock.pinnedRegions ?? []) {
    if (!Array.isArray(pin.rect) || pin.rect.length !== 4 || !pin.rect.every(Number.isInteger)) throw Error('Source lock: invalid anchor');
    const [x,y,w,h]=pin.rect;
    if(x<0||y<0||w<1||h<1||x+w>256||y+h>256)throw Error('Source lock: invalid anchor');
  }
  if (lock.mode === 'rigid') {
    if(recipe.regions?.length)throw Error('Source lock: rigid artwork cannot deform');
    for(const [key,track] of Object.entries(recipe.tracks ?? {})) {
      if(!['x','y','rotation'].includes(key))throw Error('Source lock: rigid artwork cannot scale or mirror');
      validateTrack(track,-2,2);
      if(track[0][1]!==0)throw Error('Source lock: rigid rest pose must be original');
    }
    return {minDeterminant:1,maxDeterminant:1,maxDisplacement:null,mode:'rigid'};
  }
  checkRegions(recipe.regions);
  for (const region of recipe.regions ?? []) {
    if (
      !region.keyframes ||
      region.keyframes[0][1] !== 0 ||
      region.keyframes.at(-1)[1] !== 0
    )
      throw Error(
        "Source lock: all regions must return to the original rest pose",
      );
  }
  // Check every output pixel at every output time. The inverse sampling map must
  // remain orientation preserving and near unit area, with small displacement.
  let minDeterminant = Infinity,
    maxDeterminant = -Infinity,
    maxDisplacement = 0;
  for (let frame = 0; frame <= (recipe.fps ?? 24) * 3; frame++) {
    const field = deformationField(
      recipe.regions ?? [],
      frame / ((recipe.fps ?? 24) * 3),
    );
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 256; x++) {
        const [dx, dy] = field(x, y),
          [xx, xy] = field(x + 0.5, y),
          [yx, yy] = field(x, y + 0.5);
        const det =
          (1 - (xx - dx) * 2) * (1 - (yy - dy) * 2) -
          (yx - dx) * 2 * (xy - dy) * 2;
        minDeterminant = Math.min(minDeterminant, det);
        maxDeterminant = Math.max(maxDeterminant, det);
        maxDisplacement = Math.max(maxDisplacement, Math.hypot(dx, dy));
      }
  }
  if (minDeterminant < 0.7 || maxDeterminant > 1.3 || maxDisplacement > 6)
    throw Error(
      "Source lock: deformation stretches, folds or moves the original too far",
    );
  return { minDeterminant, maxDeterminant, maxDisplacement };
}
