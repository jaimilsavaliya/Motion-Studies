// Local optimized demo media; not included in the reusable component download.
export const flexCarouselItems=[
 ['Iridescence','A reflective, iridescent sculptural head','1737071371043-761e02b1ef95'],
 ['White Room','Fashion portrait in an open white room','1693645325828-62cd35c8da8f'],
 ['Liquid Metal','Flowing chrome and rainbow reflections','1739056238917-d89cd05c48d5'],
 ['Clay Study','A sculptural study in warm clay','1747191092806-c7da11881986'],
 ['Low Tops','A pair of low-top shoes','1605034313761-73ea4a0cfbf3'],
 ['Brim','A classic hat in a still-life composition','1495462911434-be47104d70fa'],
 ['Three Forms','Three abstract sculptural forms','1786835568925-20cd20007ed0'],
 ['Automaton','A futuristic sculptural figure','1770249196550-ff6c641165cb'],
 ['Obsidian','A dark, polished abstract object','1787181875088-087d612262a7'],
 ['Poise','A poised sculptural figure','1770062422885-2dfcbe8fb65b'],
 ['Fins','An abstract study of curved fins','1726910133626-9b573eca70ff'],
 ['Plaster','A plaster portrait bust in an artist’s studio','1604854574958-59047362c165'],
].map(([title,alt,photo],index)=>({id:photo,title,alt,src:`/flex-carousel/${String(index+1).padStart(2,'0')}.webp`,source:`https://images.unsplash.com/photo-${photo}`}));
