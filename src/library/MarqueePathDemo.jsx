import MarqueeAlongSvgPath from '../components/MarqueeAlongSvgPath';
import {marqueeArtwork,marqueePath} from './marqueePathItems';
import './MarqueePathDemo.css';
export const marqueePaths={loop:marqueePath,wave:'M0 165 C166 -20 332 350 498 165 S830 -20 996 165',ellipse:'M100 165 A398 130 0 1 1 896 165 A398 130 0 1 1 100 165'};
const curves={linear:undefined,smooth:t=>t*t*(3-2*t),accelerate:t=>t*t};
export default function MarqueePathDemo({height=530,fluid=false,baseVelocity=8,direction='normal',repeat=2,showPath=false,slowdownOnHover=false,slowDownFactor=.3,draggable=true,dragSensitivity=.1,dragAwareDirection=false,useScrollVelocity=false,scrollAwareDirection=false,enableRollingZIndex=true,itemSize=56,pathShape='loop',customPath='',easing='linear',fade=false,showControls=true,paused=false}){
  return <div className="msp-demo" data-fluid={fluid} style={{height,width:'100%',maxWidth:fluid?'none':660}}>
    <MarqueeAlongSvgPath className="msp-demo-marquee" path={customPath||marqueePaths[pathShape]||marqueePath} viewBox="0 0 996 330" responsive
      baseVelocity={baseVelocity} direction={direction} repeat={repeat} showPath={showPath} slowdownOnHover={slowdownOnHover} slowDownFactor={slowDownFactor}
      draggable={draggable} grabCursor dragSensitivity={dragSensitivity} dragAwareDirection={dragAwareDirection} useScrollVelocity={useScrollVelocity} scrollAwareDirection={scrollAwareDirection}
      enableRollingZIndex={enableRollingZIndex} easing={curves[easing]} cssVariableInterpolation={fade?[{property:'opacity',from:.15,to:1}]:[]}
      showControls={showControls} paused={paused} aria-label="Artwork moving along an SVG path">
      {marqueeArtwork.map((src,index)=><div className="msp-artwork" key={index} style={{width:itemSize}}><img src={src} alt={`Typographic artwork ${index+1}`} draggable={false}/></div>)}
    </MarqueeAlongSvgPath>
  </div>;
}
