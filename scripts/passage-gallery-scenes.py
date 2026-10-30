"""In-house abstract scene generator for Study 024.
Dark grounds, saturated shapes: the same visual register the public reference demo
uses, drawn from scratch here with simple procedural geometry."""
import numpy as np
from PIL import Image, ImageFilter
W,H=640,640   # square: a corridor tile is a unit square in world space
rng=np.random.default_rng(20241024)

def base(colour):
    y=np.linspace(0,1,H)[:,None]
    a=np.array(colour,dtype=float)
    grad=a[None,None,:]*(1-0.45*y[:,:,None])
    img=np.repeat(grad,1,axis=1)
    return np.repeat(img,W,axis=1) if img.shape[1]==1 else img

def blend(img,mask,colour,alpha=1.0):
    col=np.array(colour,dtype=float)
    m=(mask[...,None]*alpha)
    return img*(1-m)+col*m

def radial(cx,cy,r,soft=1.0):
    yy,xx=np.mgrid[0:H,0:W]
    d=np.sqrt(((xx-cx)/r)**2+((yy-cy)/r)**2)
    return np.clip(1-d,0,1)**soft

def band(freq,phase,slope=0.0,thick=.22,soft=1.6):
    yy,xx=np.mgrid[0:H,0:W]
    t=(yy/H)+slope*(xx/W)+phase
    v=np.abs(((t*freq)%1.0)-0.5)*2
    return np.clip(1-(v/ (thick*2)),0,1)**soft

def wave_band(freq,phase,amp=.18,slope=0.0,thick=.2,soft=1.5):
    yy,xx=np.mgrid[0:H,0:W]
    t=(yy/H)+amp*np.sin(2*np.pi*(xx/W)*freq+phase)+slope*(xx/W)+phase*0.13
    v=np.abs(((t*freq*1.0)%1.0)-0.5)*2
    return np.clip(1-(v/(thick*2)),0,1)**soft

def grain(img,amount=5.0):
    return np.clip(img+rng.normal(0,amount,(H,W,1)),0,255)

def crisp(img,levels=8):
    """posterise a touch and keep edges hard, so tiles read as graphic art"""
    q=np.round(img/ (255/levels))*(255/levels)
    return np.clip(q*.45+img*.55,0,255)

def wedge(cx,cy,r0,r1,a0,a1,feather=1.6):
    yy,xx=np.mgrid[0:H,0:W]
    dx,dy=xx-cx,yy-cy
    d=np.sqrt(dx**2+dy**2)
    ang=(np.degrees(np.arctan2(dy,dx))+360)%360
    inside=((d>=r0)&(d<=r1)&(ang>=a0)&(ang<=a1)).astype(float)
    inner=np.clip((d-r0)/6,0,1)*np.clip((r1-d)/6,0,1)
    return inside*inner

def disc(cx,cy,r,feather=1.2):
    yy,xx=np.mgrid[0:H,0:W]
    d=np.sqrt((xx-cx)**2+(yy-cy)**2)
    return np.clip(1-(d-r+feather)/feather,0,1)

def bar(x0,y0,x1,y1,width,feather=1.2):
    yy,xx=np.mgrid[0:H,0:W]
    vx,vy=x1-x0,y1-y0
    t=np.clip(((xx-x0)*vx+(yy-y0)*vy)/(vx*vx+vy*vy),0,1)
    d=np.sqrt((xx-(x0+t*vx))**2+(yy-(y0+t*vy))**2)
    return np.clip(1-(d-width/2+feather)/feather,0,1)

def save(img,name):
    im=Image.fromarray(np.clip(crisp(img),0,255).astype(np.uint8))
    im=im.filter(ImageFilter.GaussianBlur(0.3))
    im.save(f'public/passage-gallery/scenes/{name}.webp','WEBP',quality=88,method=6)
    print(f'{name}: mean luma {np.asarray(im).mean():.1f}')

INK=(9,5,18);DEEP=(24,10,48)

# amber-crest — amber/gold crest over a deep plum ground
img=base((28,8,34))
img=blend(img,wave_band(1.1,0.12,amp=0.16,thick=.34),(214,118,26),.95)
img=blend(img,radial(150,420,340,1.4),(255,214,140),.95)
img=blend(img,wave_band(0.7,0.62,amp=0.22,thick=.18),(122,28,74),.85)
img=blend(img,bar(-40,470,700,250,58),(255,206,120),.95)
img=blend(img,disc(180,470,86),(255,232,168),.95)
save(grain(img),'amber-crest')

# violet-fold — indigo/violet folded diagonals
img=base((16,8,44))
yy,xx=np.mgrid[0:H,0:W]
fold=np.abs(np.sin((xx/W)*3.1+(yy/H)*1.6+0.4))
img=blend(img,(fold<0.35).astype(float),(104,58,246),.9)
img=blend(img,np.clip(1-((xx-450)**2+(yy-160)**2)/190000,0,1),(150,96,238),.9)
img=blend(img,np.clip(1-((xx-150)**2+(yy-500)**2)/120000,0,1),(58,26,150),.9)
img=blend(img,bar(-30,-20,690,660,74),(74,34,182),.9)
img=blend(img,bar(120,700,620,-40,40),(206,166,255),.9)
save(grain(img),'violet-fold')

# tidal-band — teal bands over deep navy
img=base((7,16,40))
img=blend(img,wave_band(1.4,0.05,amp=.10,slope=-.1,thick=.30),(30,150,160),.9)
img=blend(img,wave_band(1.4,0.52,amp=.10,slope=-.1,thick=.16),(120,232,222),.95)
img=blend(img,radial(520,420,200,1.6),(14,90,120),.85)
img=blend(img,disc(470,380,120),(150,246,236),.95)
img=blend(img,bar(0,150,640,150,16),(20,120,140),.9)
save(grain(img),'tidal-band')

# rose-shutter — rose/magenta verticals on dark maroon
img=base((34,8,26))
stripes=(np.sin((np.mgrid[0:H,0:W][1]/W)*np.pi*9)>0).astype(float)
img=blend(img,stripes,(228,64,140),.75)
img=blend(img,radial(320,300,340,1.1),(228,110,170),.45)
img=blend(img,band(0.8,0.30,thick=.10),(120,20,70),.8)
img=blend(img,bar(0,300,640,340,26),(255,190,220),.9)
img=blend(img,disc(150,470,72),(255,120,180),.9)
save(grain(img),'rose-shutter')

# copper-arc — copper arcs on a warm dark ground
img=base((30,14,16))
yy,xx=np.mgrid[0:H,0:W]
for cx,cy,r,w,c in [(90,520,320,26,(226,120,52)),(430,170,260,20,(255,180,96)),(330,600,190,14,(150,60,30))]:
    d=np.abs(np.sqrt((xx-cx)**2+(yy-cy)**2)-r)
    img=blend(img,np.clip(1-d/w,0,1),c,.95)
img=blend(img,radial(500,430,240,1.5),(120,40,26),.8)
img=blend(img,wedge(320,640,300,340,205,335),(255,196,110),.95)
save(grain(img),'copper-arc')

# plum-wave — magenta/plum waves on black
img=base((18,6,24))
img=blend(img,wave_band(1.0,0.0,amp=.20,thick=.30),(196,42,150),.95)
img=blend(img,wave_band(1.0,0.5,amp=.20,thick=.22),(255,120,210),.9)
img=blend(img,wave_band(0.5,0.25,amp=.30,thick=.14),(88,18,96),.85)
img=blend(img,disc(200,420,96),(255,150,230),.95)
img=blend(img,bar(340,700,660,300,34),(160,40,170),.9)
save(grain(img),'plum-wave')

# coral-steps — coral terraces on deep red-violet
img=base((26,6,22))
yy,xx=np.mgrid[0:H,0:W]
steps=np.floor((1-yy/H)*5)/5.0
img=blend(img,(steps%0.4<0.2).astype(float),(214,72,58),.7)
img=blend(img,radial(180,220,260,1.3),(255,150,96),.55)
img=blend(img,band(1.2,0.4,slope=.25,thick=.12),(120,20,90),.8)
img=blend(img,bar(0,470,640,430,40),(255,180,130),.9)
img=blend(img,bar(0,300,640,250,26),(150,30,100),.9)
save(grain(img),'coral-steps')

# ice-bloom — pale cyan bloom on blue-black
img=base((6,12,34))
img=blend(img,radial(400,240,260,1.2),(150,226,240),.85)
img=blend(img,radial(400,240,440,2.0),(30,90,150),.7)
img=blend(img,wave_band(0.8,0.3,amp=.12,thick=.14),(226,246,255),.6)
img=blend(img,disc(330,250,110),(226,246,255),.95)
img=blend(img,bar(0,470,640,410,30),(30,80,140),.9)
save(grain(img),'ice-bloom')
