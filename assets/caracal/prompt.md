# caracal

Tool: built-in image_gen. Genuine transparent background requested. Original AI-generated illustration, MIT.

## Original prompt

Use case: stylized-concept. Create ONE original 3D vocabulary emoji, a friendly Fluent-inspired rounded polished 3D sticker. Soft upper-left studio light, clear silhouette, restrained identifying details readable at128px. Single subject centered in a square canvas with generous genuine transparent margins, occupying about80% of canvas. No backdrop, ground shadow, text, logos, watermark, human hands or grid. Preserve believable structure and material. One species-accurate friendly animal: A caracal, sleek reddish-tan unspotted coat, very tall pointed ears with long straight black tufts, narrow face and slender limbs. Seated full body; not fluffy spotted lynx. Do not add accessories, a scene, companions, exaggerated cartoon anatomy or faces inconsistent with the species.

## Motion

Species gesture: alert. Cutout refinement: measured head joint, independent delayed ears and genuine open/closed eye artwork; all feet stay planted. Complete painted overlap at neck and ear roots.

The approved master is source.png; motion.json contains the measured final recipe.

## Cutout refinement prompt

Animal: caracal. Produce a cutout animation atlas EDITED from this exact reference animal. Match species, silhouette, colors, markings, soft rounded 3D vocabulary emoji style, original facing. True transparent background, no scene/text/labels/ground shadow. Exactly 3 columns x 2 rows, 1536x1024 canvas, each part centered separately in its 512px cell with clear margins. Row1 left: headless body including ALL original feet/legs and tail, neck painted complete under future head. Row1 middle: detached whole HEAD, original face/muzzle/nose/mouth and forehead, but EYELESS and EARLESS (smooth painted matching fur where eyes/ears were, no eyelid shapes), neck overlap; keep any crest. Row1 right: isolated near EAR, long base for overlap; include entire ear tuft for lynx/caracal. Row2 left: isolated far EAR and whole tuft. Row2 middle: OPEN EYE PAIR matching frontal/three-quarter view, correct spacing, including thin eyelid rims only, transparent elsewhere. Row2 right: corresponding CLOSED EYELID PAIR, same placement/spacing/view, minimal fur/skin rims, transparent elsewhere. No other animals or objects. Parts have identical lighting and scale internally. Do not leave residual eyes or ears on head.

Background corrections for alpaca, reindeer, yak and lemur removed opaque/hazy panels with built-in image_gen. The approved assembled rest pose is source.png; motion.json embeds normalized PNG parts and keyframes. rig-source.png preserves the full original atlas. Parts that conflict with anatomy are not used (platypus has no external ears).
