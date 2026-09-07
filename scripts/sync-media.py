"""Sync supported artwork with stable IDs; leave originals untouched."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, subprocess

root = Path(__file__).resolve().parents[1]
out = root / 'public/portfolio-media'
manifest = root / 'src/media.json'
old = json.loads(manifest.read_text())
by_source = {item['source']: item for item in old}
next_id = max(int(item['id']) for item in old) + 1
items = []
for path in sorted((root / 'medias').rglob('*')):
    if path.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov'} or path.name == 'logobulanbintang.png':
        continue
    source = path.relative_to(root).as_posix()
    prior = by_source.get(source)
    slug = prior['id'] if prior else f'{next_id:03d}'
    if not prior:
        next_id += 1
    kind = 'video' if path.suffix.lower() in {'.mp4', '.mov'} else 'image'
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    dest = out / f'{slug}.{"mp4" if kind == "video" else "webp"}'
    unchanged = prior and dest.exists() and (prior.get('sha256') == digest or (kind == 'video' and 'sha256' not in prior and path.stat().st_mtime <= dest.stat().st_mtime))
    if unchanged:
        item = dict(prior)
    else:
        if kind == 'image':
            with Image.open(path) as original:
                image = ImageOps.exif_transpose(original).convert('RGBA')
                image.thumbnail((1600, 1600))
                image.save(dest, 'WEBP', quality=85)
                width, height = image.size
        else:
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(path), '-map', '0:v:0', '-map', '0:a:0?', '-c:a', 'aac', '-b:a', '128k', '-vf', 'scale=w=min(720\\,iw):h=min(720\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-threads', '2', str(dest)], check=True)
            poster = out / f'{slug}-poster.webp'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(dest), '-frames:v', '1', '-vf', 'scale=480:-1', str(poster)], check=True)
            with Image.open(poster) as image:
                width, height = image.size
        item = dict(id=slug, kind=kind, category=path.parent.name, source=source, src=f'/portfolio-media/{dest.name}', poster=f'/portfolio-media/{slug}-poster.webp' if kind == 'video' else None, width=width, height=height)
        print(f'Updated {source}', flush=True)
    item['sha256'] = digest
    items.append(item)
manifest.write_text(json.dumps(items, indent=2) + '\n')
print(f'Synced {len(items)} artworks; stable IDs preserved.', flush=True)
