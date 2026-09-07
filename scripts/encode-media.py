from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,json
root=Path(__file__).resolve().parents[1]
items=json.loads((root/'src/media.json').read_text())
def encode(item):
 dest=root/'public'/item['src'].lstrip('/')
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/item['source']),'-map','0:v:0','-map','0:a:0?','-c:a','aac','-b:a','128k','-vf','scale=w=min(720\\,iw):h=min(720\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2','-c:v','libx264','-preset','veryfast','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',str(dest)],check=True)
 print('Encoded '+item['id'],flush=True)
with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(encode,[i for i in items if i['kind']=='video']))
print('All videos optimized with original audio.',flush=True)
