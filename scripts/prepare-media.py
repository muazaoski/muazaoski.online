from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import subprocess,json
root=Path(__file__).resolve().parents[1]
out=root/'public'/'portfolio-media';out.mkdir(exist_ok=True)
items=[]; thumbs=[]
for n,p in enumerate(sorted((root/'medias').rglob('*'))):
 if not p.is_file(): continue
 kind='video' if p.suffix.lower()=='.mp4' else 'image'
 slug=f'{len(items)+1:03d}'
 if kind=='video':
  dest=out/f'{slug}-poster.webp'
  subprocess.run(['ffmpeg','-v','error','-y','-ss','1','-i',str(p),'-frames:v','1','-vf','scale=480:-1',str(dest)],check=True)
  im=Image.open(dest)
 else:
  im=ImageOps.exif_transpose(Image.open(p)).convert('RGBA'); im.thumbnail((1600,1600))
  dest=out/f'{slug}.webp';im.save(dest,'WEBP',quality=85)
 items.append(dict(id=slug,kind=kind,category=p.parent.name,source=str(p.relative_to(root)).replace('\\','/'),src=f'/portfolio-media/{slug}.mp4' if kind=='video' else f'/portfolio-media/{slug}.webp',poster=f'/portfolio-media/{slug}-poster.webp' if kind=='video' else None,width=im.width,height=im.height))
 thumb=Image.new('RGB',(210,180),'#dddddd'); fitted=ImageOps.contain(im.convert('RGB'),(200,140));thumb.paste(fitted,((210-fitted.width)//2,0)); ImageDraw.Draw(thumb).text((5,144),f'{slug} {p.parent.name}',fill='black'); thumbs.append(thumb)
sheet=Image.new('RGB',(210*6,180*((len(thumbs)+5)//6)),'white')
for i,im in enumerate(thumbs):sheet.paste(im,((i%6)*210,(i//6)*180))
(root/'qa.local').mkdir(exist_ok=True)
sheet.save(root/'qa.local'/'media-contact-sheet.jpg')
(root/'src'/'media.json').write_text(json.dumps(items,indent=2))
print(f'Prepared {len(items)} media entries')
