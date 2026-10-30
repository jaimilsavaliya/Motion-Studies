import DragElements from '../components/DragElements';
import './DragElementsDemo.css';
const photos=[
  {width:141,height:179,rotation:-10}, {width:131,height:161,rotation:1},
  {width:127,height:162,rotation:2}, {width:136,height:154,rotation:-8},
  {width:125,height:168,rotation:-7}, {width:129,height:171,rotation:-5},
];
export default function DragElementsDemo({scene='photos',height=530,fluid=false,dragMomentum=scene==='labels',dragElastic=.5,selectedOnTop=true,bounceStiffness=200,bounceDamping=300}){
  const labels=scene==='labels';
  return <div className={`de-showcase ${labels?'de-label-scene':'de-photo-scene'}`} data-fluid={fluid} style={{height,width:'100%',maxWidth:fluid?'none':660,'--de-demo-height':`${height}px`}}>
    {!labels&&<h2 className="de-memory-title">All your <strong>memories.</strong></h2>}
    <DragElements className={`de-demo-board ${labels?'de-label-board':''}`} height="100%" dragMomentum={dragMomentum} dragElastic={dragElastic}
      selectedOnTop={selectedOnTop} dragTransition={{bounceStiffness,bounceDamping}}>
      {labels?['super fun ✿','funky time! ✴','awesome ✺'].map((label,index)=><div key={label} className="de-demo-label" aria-label={label} style={{transform:`rotate(${[-2,2,-4][index]}deg)`}}>{label}</div>)
        :photos.map((photo,index)=><div key={index} className="de-demo-photo" aria-label={`Analog photo ${index+1}`} style={{width:photo.width,height:photo.height,transform:`rotate(${photo.rotation}deg)`}}>
          <div className="de-demo-photo-crop"><img src={`/drag-elements/${index+1}.webp`} alt={`Analog photo ${index+1}`} draggable="false"/></div>
        </div>)}
    </DragElements>
  </div>;
}
