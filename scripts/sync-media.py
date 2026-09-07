"""Sync supported artwork with stable IDs; leave originals untouched."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, subprocess

root = Path(__file__).resolve().parents[1]
out = root / 'public/portfolio-media'
manifest = root / 'src/media.json'
old = json.loads(manifest.read_text())
by_source = {item['source']: item for item in old}
by_hash = {item['sha256']: item for item in old if item.get('sha256')}
next_id = max(int(item['id']) for item in old) + 1
items = []
video_extensions = {'.mp4', '.mov', '.m4v'}
for path in sorted((root / 'medias').rglob('*')):
    if path.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp', *video_extensions} or path.name == 'logobulanbintang.png':
        continue
    source = path.relative_to(root).as_posix()
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    prior = by_source.get(source) or by_hash.get(digest)
    slug = prior['id'] if prior else f'{next_id:03d}'
    if not prior:
        next_id += 1
    kind = 'video' if path.suffix.lower() in video_extensions else 'image'
    is_wedding_video = kind == 'video' and '/wedding hafiz/' in f'/{source.lower()}'
    is_feature_video = kind == 'video' and (is_wedding_video or '/vartcomp/' in f'/{source.lower()}')
    dest = out / f'{slug}.{"mp4" if kind == "video" else "webp"}'
    feature_width = 1600 if is_wedding_video else 1000
    needs_feature_upgrade = is_feature_video and prior and prior.get('width', 0) < feature_width
    unchanged = prior and dest.exists() and not needs_feature_upgrade and (prior.get('sha256') == digest or (kind == 'video' and 'sha256' not in prior and path.stat().st_mtime <= dest.stat().st_mtime))
    if unchanged:
        item = dict(prior)
        item.update(category=path.parent.name, source=source)
    else:
        if kind == 'image':
            with Image.open(path) as original:
                image = ImageOps.exif_transpose(original).convert('RGBA')
                image.thumbnail((1600, 1600))
                image.save(dest, 'WEBP', quality=85)
                width, height = image.size
        else:
            max_dimension = '1920' if is_wedding_video else ('1280' if is_feature_video else '720')
            crf = '20' if is_wedding_video else ('22' if is_feature_video else '27')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(path), '-map', '0:v:0', '-map', '0:a:0?', '-c:a', 'aac', '-b:a', '128k', '-vf', f'scale=w=min({max_dimension}\\,iw):h=min({max_dimension}\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', crf, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-threads', '2', str(dest)], check=True)
            poster = out / f'{slug}-poster.webp'
            poster_width = '1600' if is_wedding_video else ('1280' if is_feature_video else '480')
            poster_seek = ['-ss', '31.5'] if is_wedding_video else []
            subprocess.run(['ffmpeg', '-v', 'error', '-y', *poster_seek, '-i', str(dest), '-frames:v', '1', '-vf', f'scale={poster_width}:-1', '-quality', '92', str(poster)], check=True)
            with Image.open(poster) as image:
                width, height = image.size
        item = dict(id=slug, kind=kind, category=path.parent.name, source=source, src=f'/portfolio-media/{dest.name}', poster=f'/portfolio-media/{slug}-poster.webp' if kind == 'video' else None, width=width, height=height)
        print(f'Updated {source}', flush=True)
    item['sha256'] = digest
    items.append(item)
manifest.write_text(json.dumps(items, indent=2) + '\n')
print(f'Synced {len(items)} artworks; stable IDs preserved.', flush=True)
