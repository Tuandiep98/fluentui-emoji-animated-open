# Lynx original-artwork fidelity pilot

[Open the live comparison](https://tuandiep98.github.io/fluentui-emoji-animated-open/motion-lab/lynx-source-lock/).

Compare the original still, rejected painted cutout and corrected animation at 64/128/256px on light/dark backgrounds. Playback can return to the exact original rest pose. Reduced-motion preferences disable automatic playback.

This isolated review page does not replace assets/lynx or change the 330-emoji catalog. The candidate preserves the original artwork through continuous regional deformation, with separate head/ear timing and fixed paws. It is a small in-plane gesture, not a synthesized 3D view.

motion.json records the source hash, image-space landmarks and motion recipe. audit.json records exact neutral RGBA, stationary paws across 72 frames, silhouette overlap, deformation bounds and AVIF size. decoded-review.png shows compressed output samples. These technical checks do not substitute for visual review.

The candidate was rendered in LLS with scripts/preview-source-locked.mjs using scripts/motion/source-lock.mjs. It is not the collection CLI cutout recipe. Artwork and animation: MIT, consistent with this repository.
