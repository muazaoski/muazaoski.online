"""Refresh one image folder while preserving IDs for all existing media."""
from pathlib import Path
import argparse
import json
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('category', choices=[p.name for p in (root / 'medias/images').iterdir() if p.is_dir()])
parser.add_argument('--exclude', action='append', default=[], help='Asset filename to omit from artwork cards (repeatable)')
args = parser.parse_args()
manifest = root / 'src/media.json'
items = json.loads(manifest.read_text(encoding='utf-8'))
existing = {item['source']: item for item in items}
next_id = max(int(item['id']) for item in items) + 1
folder = root / 'medias/images' / args.category
updated = []
for source_file in sorted(folder.iterdir()):
    if source_file.name in args.exclude:
        continue
    if source_file.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp'}:
        continue
    source = source_file.relative_to(root).as_posix()
    prior = existing.get(source)
    media_id = prior['id'] if prior else f'{next_id:03d}'
    if not prior:
        next_id += 1
    with Image.open(source_file) as original:
        image = ImageOps.exif_transpose(original).convert('RGBA')
        image.thumbnail((1600, 1600))
        image.save(root / f'public/portfolio-media/{media_id}.webp', 'WEBP', quality=85)
        updated.append(dict(id=media_id, kind='image', category=args.category,
                            source=source, src=f'/portfolio-media/{media_id}.webp',
                            poster=None, width=image.width, height=image.height))
items = [item for item in items if not (item['kind'] == 'image' and item['category'] == args.category)] + updated
manifest.write_text(json.dumps(items, indent=2) + '\n', encoding='utf-8')
print(f'Updated {len(updated)} {args.category} images; {len(items)} total media entries. Existing IDs preserved.')
