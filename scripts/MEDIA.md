Portfolio media
===============

To sync all current image/video folders while preserving existing artwork IDs:

    python scripts/sync-media.py

This fingerprints sources for later incremental updates, retains original audio in videos,
and excludes the contest logo/model from artwork cards. CNY and Raya each have a draggable
sticker section. Originals remain untouched.

To refresh promo images without renumbering existing media or rebuilding videos:

    python scripts/sync-image-category.py promo

Promo and Live Stickers have separate collections in the page navigation.

To refresh the Bulan Bintang Contest artwork while keeping the logo out of the gallery:

    python scripts/sync-image-category.py "Bulan Bintang Contest" --exclude logobulanbintang.png

The section-bar logo is copied from that folder to `public/portfolio-media/bulan-bintang-logo.png`.
The interactive packaging model is copied from `kotak.glb` in the same folder to `public/portfolio-media/kotak.glb`.

Original files are in `medias/`. The site serves optimized copies from
`public/portfolio-media/`, indexed by `src/media.json`.

To regenerate with Python (Pillow installed) and FFmpeg on PATH:

    python scripts/prepare-media.py
    python scripts/encode-media.py

The first command creates WebP images and video posters. The second creates
H.264 MP4 copies, limited to 720 pixels on the longest edge, with fast-start
metadata and AAC audio from the original when available. Neither command modifies the originals.

Media IDs follow sorted source paths. If you add or rename source files,
review the curated IDs and titles in `src/portfolio.js` after regenerating.

The page mixes every piece into one collage. Video tiles initially load only
their poster images. Clicking a tile opens a player with native controls and
sound enabled. The player is removed when closed or when switching pieces,
so only one video can play at a time.
