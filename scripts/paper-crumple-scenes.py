"""Generate original local paper textures used by the Paper Crumple study."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random

root=Path(__file__).resolve().parent.parent
out=root/'public'/'paper-crumple'/'scenes'
out.mkdir(parents=True,exist_ok=True)
W=H=720
serif='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
italic='/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf'
mono='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'

def font(path,size):
    return ImageFont.truetype(path,size)

def grain(image,seed,amount=7600):
    random.seed(seed)
    draw=ImageDraw.Draw(image,'RGBA')
    for _ in range(amount):
        x=random.randrange(W);y=random.randrange(H)
        tone=random.choice([(34,28,24,7),(255,255,255,16),(155,135,110,5)])
        draw.point((x,y),fill=tone)

def handwritten_line(base,text,x,y,max_width,seed):
    """Lay down an original, lightly uneven line without relying on external artwork."""
    rng=random.Random(seed)
    size=28
    chosen=font(italic,size)
    while ImageDraw.Draw(Image.new('RGBA',(1,1))).textbbox((0,0),text,font=chosen)[2]>max_width and size>14:
        size-=1;chosen=font(italic,size)
    bbox=ImageDraw.Draw(Image.new('RGBA',(1,1))).textbbox((0,0),text,font=chosen)
    layer=Image.new('RGBA',(max_width+36,58),(0,0,0,0))
    draw=ImageDraw.Draw(layer,'RGBA')
    # A few variable-opacity passes retain a pen-like softness while remaining authored here.
    draw.text((12+rng.uniform(-1.2,1.2),8+rng.uniform(-1,1)),text,font=chosen,fill=(22,19,18,rng.randint(210,238)))
    if rng.random()>.35:
        draw.text((12.45,8.25),text,font=chosen,fill=(28,23,21,35))
    layer=layer.rotate(rng.uniform(-1.35,1.35),resample=Image.Resampling.BICUBIC,expand=False)
    base.alpha_composite(layer,(int(x),int(y)))

def notes():
    im=Image.new('RGBA',(W,H),'#fbfaf7');d=ImageDraw.Draw(im,'RGBA');random.seed(2081)
    # A nearly blank, warm writing page: visual texture only, not an imported reference image.
    lines=[
      'At the edge of dawn, the river wrote a quiet answer.',
      'I folded the last blue hour into my coat pocket',
      'and listened for the small bells under the bridge.',
      'No map knows the shape of a familiar silence;',
      'it opens slowly, like light behind a curtain.',
      'Keep this note where the wind can find it.',
      'There are names for every colour of rain,',
      'but none for the moment it becomes a memory.',
      'If you return, bring nothing but your hands.',
      'The empty garden will remember the way home.',
      'Tonight the city is a lantern on the water,',
      'and every window has learned to hold its breath.',
      'I leave these lines unfinished on purpose.',
      'Read them only when the tide is turning.'
    ]
    y=60
    for i,line in enumerate(lines):
        handwritten_line(im,line,57+(i%3)*3,y,606,400+i*17)
        y+=40+rng_jitter(i,211,2.6)
    # Modest original date and small ruled mark — enough character without a technical-card look.
    d.text((56,675),'13 OCT  ·  NIGHT INDEX',font=font(mono,12),fill=(35,29,27,75))
    grain(im,2081,300)
    return im.convert('RGB')

def rng_jitter(index,seed,spread):
    return (random.Random(seed+index*37).random()-.5)*2*spread

def map_back():
    im=Image.new('RGBA',(W,H),'#f4f0e8');d=ImageDraw.Draw(im,'RGBA');random.seed(611)
    # Soft reverse side: spare handwritten fragments, guides and old fold marks.
    for i in range(11):
        y=76+i*53
        d.line((48,y,W-48,y),fill=(52,44,39,15),width=1)
    fragments=['turn the page slowly','the moon is still warm','leave room for weather','do not lose the margin','a paper sky, unfolded','nothing here is permanent']
    for i,text in enumerate(fragments):
        handwritten_line(im,text,90+(i%2)*52,84+i*101,470,1200+i*19)
    for _ in range(5):
        x=random.randint(70,620);y=random.randint(90,610)
        d.arc((x-28,y-18,x+32,y+22),random.randint(160,220),random.randint(240,340),fill=(36,30,27,75),width=2)
    d.rectangle((32,32,W-33,H-33),outline=(40,33,30,40),width=1)
    grain(im,611,400)
    return im.convert('RGB')

notes().save(out/'field-notes.webp','WEBP',quality=95,method=6)
map_back().save(out/'signal-grid.webp','WEBP',quality=94,method=6)
print('Wrote',out/'field-notes.webp','and',out/'signal-grid.webp')
