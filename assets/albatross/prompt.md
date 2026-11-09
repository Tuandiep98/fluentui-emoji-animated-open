# albatross

Tool: built-in image_gen. Genuine transparent background requested. Original AI-generated illustration, MIT.

## Original prompt

Use case: stylized-concept. Asset type: production 3D vocabulary emoji for children, inspired by the polished dimensional material language of Fluent Emoji Animated, original artwork. Create ONE complete anatomically recognizable animal: wandering albatross, white head and rounded white body, long pale pink hooked bill, dark black folded wing feathers, pale webbed feet, three-quarter standing view facing image-right, wings folded and fully visible. Soft sculpted dimensional forms, natural species colors, subtle fine texture, warm neutral studio lighting from upper left, crisp readable silhouette at 64px. Gentle appealing natural eyes only where biologically present; preserve real anatomy and identifying features. Full subject centered, square composition, generous 12% transparent margin around all beaks, tails, legs and spines. Genuine alpha transparency. No cast ground shadow, no scenery, water, stand, branch, frame, text, logo, badges, humans or extra animals. ONE finished assembled illustration, NOT a cutout rig, NOT separate parts, NOT a sprite sheet. Every body part must already be connected correctly in this immutable rest-pose master. Exactly one animal.

## Targeted correction

Original generation contained diffuse white/gray background haze; targeted alpha correction before freezing source.

Use case: background-extraction. Edit target: the supplied albatross image. Remove ONLY the diffuse white and gray background haze completely. Keep the entire single bird exactly unchanged: same head and hooked pink bill, pose, silhouette, black-and-white wing feathers, proportions, pale webbed feet, colors, lighting and camera. Do not redraw or add body parts. Output a clean isolated bird on genuine alpha transparency everywhere outside its silhouette, including gaps between legs and toes. No ground shadow, glow, scenery, new outlines or opaque/hazy patches.

## Motion

New original frozen before motion. Continuous anatomy fields measured directly on the original; staggered gestures preserve rest pose, facing, attached anatomy and fixed contacts. No repainted or detached parts.

The approved master is source.png; motion.json contains the measured final recipe.

## Original artwork fidelity

New original artwork generated with built-in image_gen and locked before animation. reference.png locks the original 256px still by SHA-256; source.png is the original high-resolution master. The sourceLock recipe uses continuous local motion or rigid presentation, with no repainted cutout parts. Previous cutout experiments are retired. Exact neutral pixels, loop, anchors, geometry and decoded native-scale motion were checked.
