# capybara

Tool: built-in image_gen. Genuine transparent background requested. Original AI-generated illustration, MIT.

## Original prompt

Use case: stylized-concept. Create ONE original 3D vocabulary emoji, a friendly Fluent-inspired rounded polished 3D sticker. Soft upper-left studio light, clear silhouette, restrained identifying details readable at128px. Single subject centered in a square canvas with generous genuine transparent margins, occupying about80% of canvas. No backdrop, ground shadow, text, logos, watermark, human hands or grid. Preserve believable structure and material. One species-accurate friendly animal: A capybara, stocky warm-brown rodent with blunt rectangular head, tiny round ears, short legs, no visible long tail, standing three-quarter profile. Do not add accessories, a scene, companions, exaggerated cartoon anatomy or faces inconsistent with the species.

## Motion

Tai nhỏ rung một nhịp và thở nhẹ; đầu vuông, chân ngắn giữ rõ.

The approved master is source.png; motion.json contains the measured final recipe.

## Cutout v1 revision (2026-11-09)

Tool: built-in image_gen, original capybara master as reference, transparent output. Requested an isolated 3-column × 2-row parts atlas: headless body with four feet and a painted neck; earless eyeless head with muzzle; front ear; back ear; open eye; closed eye. Preserve golden-brown rounded 3D texture and matching lighting; extra overlap at joints; no text, scene or ground shadow.

The current source.png is the assembled rest pose. motion.json embeds all six original PNG parts and their independent keyframe tracks; no external atlas is needed to rebuild. `npm run animate -- capybara --out out/capybara-test.avif` uses the shared cutout renderer. This is an in-plane head tilt, not a true 3D turn.
