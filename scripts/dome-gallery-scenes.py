#!/usr/bin/env python3
"""Generate the in-house demo artwork used by Dome Gallery's playground.
The reusable component archive intentionally excludes public/dome-gallery/scenes.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math, random

OUT=Path(__file__).resolve().parents[1]/'public'/'dome-gallery'/'scenes'
OUT.mkdir(parents=True,exist_ok=True)
SIZE=720
SCENES=[
 ('amber-portal',('#251314','#a95028','#f7cc72'),'A warm geometric portal'),
 ('blue-alcove',('#071a2a','#266b8b','#aee1d5'),'A blue alcove and pool'),
 ('orchid-figure',('#23122b','#a24d7a','#ffbf9e'),'A rose silhouette study'),
 ('olive-ridge',('#11231e','#4b8060','#d7d98c'),'A mossy ridge under a pale sun'),
 ('plum-archive',('#1d1534','#67529c','#ffd08b'),'A plum archive of stacked planes'),
 ('coral-window',('#32181b','#ba5c53','#f5bea0'),'A coral window study'),
 ('night-bloom',('#071722','#1e5c72','#b6e1d5'),'A nocturnal bloom above water'),
]

def lerp(a,b,t): return tuple(round(a[i]+(b[i]-a[i])*t) for i in range(3))
def rgb(h):
 h=h.lstrip('#');return tuple(int(h[i:i+2],16) for i in (0,2,4))
def polygon(draw,pts,fill): draw.polygon([(round(x),round(y)) for x,y in pts],fill=fill)
def scene(index,name,colors,alt):
 random.seed(913+index)
 a,b,c=map(rgb,colors)
 im=Image.new('RGB',(SIZE,SIZE))
 pix=im.load()
 for y in range(SIZE):
  for x in range(SIZE):
   tx=x/(SIZE-1);ty=y/(SIZE-1)
   base=lerp(a,b,ty*.72+tx*.10)
   glow=max(0,1-math.hypot(tx-.56,ty-.36)*1.35)
   pix[x,y]=lerp(base,c,glow*.18)
 draw=ImageDraw.Draw(im,'RGBA')
 # coarse paper grain and thin cross hatch to make different regions feel tactile
 for _ in range(1800):
  x=random.randrange(SIZE);y=random.randrange(SIZE);r=random.choice([1,1,2,3])
  draw.ellipse((x-r,y-r,x+r,y+r),fill=(255,255,255,random.randrange(4,18)))
 for n in range(12):
  x=(n/11)*SIZE
  draw.line((x,0,x-SIZE*.2,SIZE),fill=(*c,18),width=2)
 if index==0:
  draw.rectangle((80,88,640,668),fill=(*a,110));draw.rounded_rectangle((172,105,548,675),radius=185,fill=(*c,205));draw.rounded_rectangle((245,170,475,675),radius=118,fill=(*a,240));
  draw.ellipse((305,235,416,346),fill=(*b,170));draw.rectangle((126,510,594,524),fill=(*c,90))
 elif index==1:
  polygon(draw,[(0,570),(260,270),(475,570)],(*c,200));polygon(draw,[(242,720),(552,232),(720,655)],(*b,210));
  draw.rounded_rectangle((101,97,428,453),radius=12,outline=(*c,220),width=19);draw.rectangle((134,129,392,421),fill=(*a,120));draw.ellipse((316,412,687,783),fill=(*c,100))
 elif index==2:
  draw.ellipse((205,80,526,404),fill=(*c,185));polygon(draw,[(260,275),(487,275),(595,690),(147,690)],(*b,210));draw.ellipse((315,165,414,262),fill=(*a,210));
  draw.rectangle((0,549,720,570),fill=(*c,110));draw.arc((33,345,687,950),190,350,fill=(*c,200),width=18)
 elif index==3:
  polygon(draw,[(0,600),(156,336),(294,532),(468,227),(720,560),(720,720),(0,720)],(*b,230));
  draw.ellipse((438,83,602,247),fill=(*c,235));draw.ellipse((478,123,562,207),fill=(*a,70));draw.line((0,586,720,492),fill=(*c,160),width=15)
 elif index==4:
  for i in range(7):
   x=68+i*89;y=114+(i%2)*63
   draw.rounded_rectangle((x,y,x+138,y+426),radius=70,outline=(*c,130),width=12)
  polygon(draw,[(0,590),(214,426),(436,570),(720,359),(720,720),(0,720)],(*b,170));draw.ellipse((318,234,470,386),fill=(*c,130))
 elif index==5:
  draw.rounded_rectangle((84,74,628,638),radius=38,outline=(*c,210),width=24);draw.rectangle((157,150,556,562),fill=(*a,120));
  for i in range(5):draw.rectangle((188+i*55,178,220+i*55,530),fill=(*b,100))
  draw.ellipse((352,248,494,390),fill=(*c,210));draw.line((81,628,640,152),fill=(*c,145),width=16)
 else:
  draw.ellipse((118,125,628,635),fill=(*b,130));
  for i in range(16):
   angle=i*math.pi/8; x=370+math.cos(angle)*190;y=367+math.sin(angle)*190
   draw.ellipse((x-66,y-27,x+66,y+27),fill=(*c,80))
  draw.ellipse((284,279,456,451),fill=(*c,210));draw.rectangle((0,536,720,720),fill=(*a,160));
  for i in range(7):draw.arc((i*80-120,500,i*80+210,830),180,360,fill=(*c,100),width=7)
 im=im.filter(ImageFilter.UnsharpMask(radius=1.2,percent=140,threshold=4))
 im.save(OUT/f'{name}.webp','WEBP',quality=88,method=6)

for i,(name,colors,alt) in enumerate(SCENES): scene(i,name,colors,alt)
print(f'generated {len(SCENES)} scenes in {OUT}')
