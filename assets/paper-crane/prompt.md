# paper crane

Tool: built-in image_gen. Genuine transparent background requested. Original AI-generated illustration, MIT.

## Original prompt

Use case: stylized-concept. Create ONE original 3D vocabulary emoji, friendly Fluent-inspired rounded polished 3D sticker. Three-quarter view, soft upper-left studio light, clear silhouette and identifying details readable at 128px. Centered single isolated subject occupying about 80% of a square canvas, generous genuine transparent margin. No backdrop, ground shadow, text, logos, watermark, extra props, or grid. Preserve believable rigid structure and material. A single orange-red origami PAPER CRANE folded from plain paper: long pointed neck and tiny beak, pointed tail, two broad folded triangular wings, sharp crisp fold lines. Three-quarter side view, wings modestly spread and fully inside frame. Clearly folded paper, no real feathers, no legs, no printed patterns.

## Motion

Cutout refinement for paper-crane: complete fixed base and independent moving part; painted overlap at joint. Per-part eased use gesture; rigid hardware/paper faces stay intact.

The approved master is source.png; motion.json contains the measured final recipe.

## Cutout refinement prompt

Edit the reference into exactly TWO original cutout parts on a transparent atlas. Two columns, one row, each part centered in its own half of a wide canvas, at least 12% clear margin, no overlapping halves. LEFT: orange origami crane body, neck, head, tail and BACK wing intact, painted central fold under removed FRONT wing. RIGHT: detached broad FRONT wing, flat crisp triangular folded paper plane, full root overlap. Keep actual origami structure, no feathers. Match the reference colors/material/proportions/lighting precisely, smooth rounded 3D vocabulary emoji rendering, natural upper-left light. Genuine alpha transparency around every part, absolutely no haze, cast shadow, text, labels, checkerboard or background panels. Only these two parts. Paint all hidden overlap surfaces cleanly so movement reveals actual artwork, not a hole.

Background corrections for alpaca, reindeer, yak and lemur removed opaque/hazy panels with built-in image_gen. The approved assembled rest pose is source.png; motion.json embeds normalized PNG parts and keyframes. rig-source.png preserves the full original atlas. Parts that conflict with anatomy are not used (platypus has no external ears).
