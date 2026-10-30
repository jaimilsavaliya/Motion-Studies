import './DemoPreviewStage.css';

// Preview-only framing. Keep the essential sizing local so a demo never falls
// back to a top-left, fixed-width block when library-level styles change.
export default function DemoPreviewStage({className,background,children}) {
  return <main className={`${className} ms-demo-preview-stage`} style={{
    display:'flex',alignItems:'center',justifyContent:'center',
    width:'100%',minHeight:'100svh',boxSizing:'border-box',
    padding:'24px var(--ms-demo-preview-gutter, 24px)',background,
  }}>{children}</main>;
}
