# Tarot card art — ChatGPT image generation prompts

Generate the 22 Major Arcana illustrations for the Vivida tarot reader.
Drop each finished image at `public/tarot/<slug>.webp` (the filename column
below). The site already renders each card's name, so **the artwork itself must
contain NO text, letters, numerals, or title banners** — garbled AI text ruins
the card. Leave the composition clean.

## Output specs (apply to every card)

- **Orientation / ratio:** portrait, **2:3** (e.g. 1024 × 1536). The UI crops
  with `object-cover`, so keep the main figure centered with a little breathing
  room at the edges.
- **Format:** export/convert to **`.webp`** named exactly as the slug, e.g.
  `the-fool.webp`, `wheel-of-fortune.webp`. (Generate as PNG, then convert —
  see the ffmpeg/cwebp note at the bottom.)
- **No text of any kind** anywhere in the image.
- **Consistency is everything:** generate all 22 in one ChatGPT session and,
  for each new card, paste the **Master style** block first so the deck stays
  visually unified (same palette, linework, framing, mood).

## Master style (paste this before EVERY card)

> Ornate, magnificent tarot card illustration in a semi-realistic painterly
> style — a fusion of Alphonse Mucha art-nouveau elegance and modern cinematic
> digital painting. Rich, luminous, mystical atmosphere. Deep midnight-violet
> and indigo background, glowing gold linework and filigree, accents of
> magenta-pink and cyan starlight. Delicate decorative border inset from the
> edges, celestial motifs (stars, moons, fine gold ornament). Dramatic soft
> lighting, gilded details, high detail, elegant and timeless. Portrait 2:3
> composition. NO text, NO letters, NO numbers, NO title banner anywhere in the
> image.

Then append the per-card line.

## The 22 cards

| # | Card (ka) | Filename | Per-card subject to append to the master style |
|---|-----------|----------|-----------------------------------------------|
| 0 | ბრიყვი | `the-fool.webp` | A radiant youth in embroidered robes stepping off a luminous cliff edge at dawn, one foot in the air, a small white dog leaping at their heels, a white rose in one hand, a bundle tied to a staff over the shoulder, vast glowing sky, distant snow peaks. Carefree, trusting. |
| 1 | მაგი | `the-magician.webp` | A poised figure at an altar, one arm raised to the heavens holding a glowing wand, the other pointing to the earth, a shimmering infinity symbol above the head, a cup, coin, sword and wand on the altar, roses and lilies, streams of radiant energy. |
| 2 | უმაღლესი ქურუმი | `the-high-priestess.webp` | A serene veiled priestess seated between two tall pillars, one dark and one light, a crescent moon at her feet, a partly hidden scroll in her lap, a tapestry of pomegranates behind her, deep blue and silver moonlit tones. |
| 3 | იმპერატრიცა | `the-empress.webp` | A gentle, regal woman on a cushioned throne in a lush golden wheat field and blooming garden, a crown of twelve stars, a heart-shaped shield bearing the Venus symbol, a flowing river, an air of abundance and fertility. |
| 4 | იმპერატორი | `the-emperor.webp` | A commanding bearded ruler on a stone throne carved with ram heads, holding an ankh scepter and a golden orb, red robes over armor, austere majestic mountains behind him, authority and structure. |
| 5 | იეროფანტი | `the-hierophant.webp` | A robed spiritual elder seated between two ornate temple pillars, right hand raised in blessing, wearing a triple crown, crossed keys at his feet, two acolytes kneeling before him, warm gold tones. |
| 6 | შეყვარებულები | `the-lovers.webp` | A man and a woman standing in a paradise garden beneath a great radiant angel with outstretched wings, a blazing sun above, a flowering tree behind one and a flaming tree behind the other, tenderness and sacred choice. |
| 7 | ეტლი | `the-chariot.webp` | An armored victor standing in an ornate chariot drawn by two sphinxes, one black and one white, a canopy of stars overhead, a walled city behind, a crown of stars, poised determination and momentum. |
| 8 | ძალა | `strength.webp` | A gentle woman in flowing white robes calmly closing the jaws of a great golden lion with a serene touch, a glowing infinity symbol above her head, a garland of flowers, soft golden light — courage through gentleness. |
| 9 | განდეგილი | `the-hermit.webp` | A cloaked elder alone on a snowy mountain peak at night, raising a lantern that holds a glowing six-pointed star, leaning on a wooden staff, a vast field of stars around him, quiet introspection. |
| 10 | ბედის ბორბალი | `wheel-of-fortune.webp` | A great cosmic wheel inscribed with mystical symbols turning among the clouds of the night sky, a sphinx resting atop it, serpents descending, symbolic winged creatures at the four corners, the turning of fate. |
| 11 | სამართლიანობა | `justice.webp` | A crowned figure seated between two pillars, holding an upraised double-edged sword in one hand and perfectly balanced golden scales in the other, red robes, a purple veil behind, equilibrium and truth. |
| 12 | ჩამოკიდებული | `the-hanged-man.webp` | A serene man suspended upside-down by one ankle from a living T-shaped tree, hands relaxed behind his back, a glowing golden halo around his head, an air of calm surrender and new perspective. |
| 13 | სიკვდილი | `death.webp` | A dignified skeletal knight in ornate black armor riding a pale horse across a still field, carrying a black banner emblazoned with a single white five-petaled rose, a sun rising between two distant towers — luminous transformation, NOT morbid or gory. |
| 14 | ზომიერება | `temperance.webp` | A winged angel standing with one foot on land and one in a tranquil stream, gracefully pouring shimmering liquid between two golden chalices, a radiant triangle on the chest, irises blooming, a path leading to a glowing crown on the horizon — perfect balance. |
| 15 | ეშმაკი | `the-devil.webp` | A horned, winged shadow-figure perched on a plinth above two loosely chained human figures who could easily slip free, an inverted torch, an ember-lit cavern — dramatic and symbolic of self-made bondage, elegant and tasteful (not gory or disturbing). |
| 16 | კოშკი | `the-tower.webp` | A tall stone tower struck by a great bolt of lightning, its golden crown blasted off, flames bursting from the windows, two small figures falling, a turbulent night sky — sudden upheaval and revelation. |
| 17 | ვარსკვლავი | `the-star.webp` | A calm kneeling woman by a tranquil moonlit pool, pouring water from two jugs — one onto the land, one into the pool — beneath one great radiant eight-pointed star and seven smaller stars, serene hope and healing. Tasteful, ethereal. |
| 18 | მთვარე | `the-moon.webp` | A luminous full moon with a subtle serene face in a night sky, dripping glowing dew, a winding path leading between two towers into the distance, a wolf and a dog howling upward, a crayfish emerging from a pool — mystery and illusion. |
| 19 | მზე | `the-sun.webp` | A joyful child riding a white horse beneath an enormous radiant sun with a gentle face, a field of tall sunflowers behind a low wall, a flowing red banner, pure vitality and joy. |
| 20 | განკითხვა | `judgement.webp` | A great angel among the clouds blowing a golden trumpet, human figures rising with arms uplifted below, a banner marked with a cross, dawn breaking — awakening and calling to a higher path. |
| 21 | სამყარო | `the-world.webp` | A graceful dancing figure draped in a flowing sash within a great laurel wreath, holding two wands, the four symbolic creatures — angel, eagle, bull and lion — glowing in the four corners, cosmic radiance, completion and triumph. |

## After you generate them

1. Save all 22 into this folder (`public/tarot/`) with the exact slug filenames.
2. If ChatGPT gives you PNGs, convert to webp (quality ~82 is plenty):
   ```bash
   # from public/tarot/
   for f in *.png; do cwebp -q 82 "$f" -o "${f%.png}.webp"; done
   # or with ffmpeg:
   # for f in *.png; do ffmpeg -i "$f" -quality 82 "${f%.png}.webp"; done
   ```
3. That's it — the reader and every `/taro/<card>` page will pick them up
   automatically (they fall back to a glyph card-back until the file exists).
