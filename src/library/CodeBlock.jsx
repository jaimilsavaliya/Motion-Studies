import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Check, Copy, WrapText } from 'lucide-react';

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const success = document.execCommand('copy');
    area.remove();
    if (!success) throw new Error('Copy unavailable');
  }
}
export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try { await copyText(text); setStatus('Copied'); }
    catch { setStatus('Select to copy'); }
    setTimeout(() => setStatus(''), 2200);
  }
  return <button className={`ms-copy ${className}`} onClick={copy} aria-label={status || label}>
    {status === 'Copied' ? <Check size={13} /> : <Copy size={13} />}<span aria-live="polite">{status || label}</span>
  </button>;
}
export default function CodeBlock({ code, filename = 'Example.jsx', language = 'jsx', compact = false }) {
  const [wrap, setWrap] = useState(false);
  return <div className={`ms-code-block ${compact ? 'compact' : ''}`}>
    <div className="ms-code-header"><span><span className="ms-file-dot" />{filename}</span><div><button className={`ms-icon-button ${wrap ? 'active' : ''}`} onClick={() => setWrap(!wrap)} aria-label="Toggle line wrapping" title="Toggle line wrapping"><WrapText size={14} /></button><CopyButton text={code} /></div></div>
    <Highlight theme={themes.vsDark} code={code.trim()} language={language}>
      {({ tokens, getLineProps, getTokenProps }) => <pre className={wrap ? 'wrap' : ''} tabIndex="0" aria-label={`${filename} source code`}><code>{tokens.map((line, i) => <div key={i} {...getLineProps({ line })}><span className="ms-line-number" aria-hidden="true">{i + 1}</span><span className="ms-code-line">{line.map((token, key) => <span key={key} {...getTokenProps({ token })} />)}</span></div>)}</code></pre>}
    </Highlight>
  </div>;
}
