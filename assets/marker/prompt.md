# marker

Tool: built-in image_gen. Genuine transparent background requested. Original AI-generated illustration, MIT.

## Original prompt

Use case: stylized-concept. Create ONE original 3D vocabulary emoji, a friendly Fluent-inspired rounded polished 3D sticker. Soft upper-left studio light, clear silhouette, restrained identifying details readable at128px. Single subject centered in a square canvas with generous genuine transparent margins, occupying about80% of canvas. No backdrop, ground shadow, text, logos, watermark, human hands or grid. Preserve believable structure and material. One chunky green felt-tip marker with cap on, visible cap seam and clip, plain clean barrel, no lettering. Three-quarter product view, entire object visible.

## Motion

Cutout refinement for marker: complete fixed base and independent moving part; painted overlap at joint. Per-part eased use gesture; rigid hardware/paper faces stay intact.

The approved master is source.png; motion.json contains the measured final recipe.

## Cutout refinement prompt

Edit the reference into exactly TWO original cutout parts on a transparent atlas. Two columns, one row, each part centered in its own half of a wide canvas, at least 12% clear margin, no overlapping halves. LEFT: green uncapped marker barrel with its short visible dark felt nib and neck fully painted. RIGHT: matching green cap with clip, isolated. Preserve the original diagonal lower-left to upper-right axis. Match the reference colors/material/proportions/lighting precisely, smooth rounded 3D vocabulary emoji rendering, natural upper-left light. Genuine alpha transparency around every part, absolutely no haze, cast shadow, text, labels, checkerboard or background panels. Only these two parts. Paint all hidden overlap surfaces cleanly so movement reveals actual artwork, not a hole.

Background corrections for alpaca, reindeer, yak and lemur removed opaque/hazy panels with built-in image_gen. The approved assembled rest pose is source.png; motion.json embeds normalized PNG parts and keyframes. rig-source.png preserves the full original atlas. Parts that conflict with anatomy are not used (platypus has no external ears).
