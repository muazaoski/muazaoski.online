from pathlib import Path
import subprocess,json
root=Path.cwd()
for item in json.loads((root/'src/media.json').read_text()):
 if item['kind']!='video':continue
 dest=root/'public'/item['src'].lstrip('/'); temp=dest.with_suffix('.audio.mp4')
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(dest),'-i',str(root/item['source']),'-map','0:v:0','-map','1:a:0?','-c:v','copy','-c:a','aac','-b:a','128k','-movflags','+faststart',str(temp)],check=True)
 temp.replace(dest)
 print('Restored audio '+item['id'],flush=True)
