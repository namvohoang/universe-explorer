---
description: Verify every image and texture comes from a trusted source, is listed in CREDITS.md with credit and licence, and is honestly labelled (photo vs artist's concept).
---

# Credits Check

## Steps

1. **Collect media**: `git ls-files public/media` plus any untracked files there, and every image
   URL or import referenced from `src/`.

2. **No hotlinks, no third parties**:
   ```bash
   grep -rnE "https?://[^\"' )]+\.(png|jpe?g|webp|avif|gif|svg|mp4|webm)" src public --include=*.ts --include=*.tsx --include=*.css --include=*.html --include=*.json
   ```
   Every hit must be a comment or a `CREDITS.md`-style source reference, not something the app loads.

3. **Compare with `CREDITS.md`**: list files with no row, rows with no file, and rows with an
   empty field (file, object, kind, credit, licence, source, retrieved, changes).

4. **Check each source**: the source URL is the image's own page on a trusted site
   (`.claude/rules/media.md`). Open it and confirm the credit line and licence match the row.
   Flag third-party copyright notices on NASA pages and Creative Commons terms (attribution
   wording, share-alike) that the app does not meet.

5. **Check honesty**: every row whose kind is not `photo` has a visible label in the UI. No
   agency logo or insignia is used. No AI-generated image.

6. **Check the basics**: alt text present for every image; file is web-sized.

7. **Report** a table: file → object → kind → source → licence → listed? → verdict
   (OK / MISSING / BLOCKER). Offer to add missing rows to `CREDITS.md`; do not add a row for an
   image whose source page you have not opened.
