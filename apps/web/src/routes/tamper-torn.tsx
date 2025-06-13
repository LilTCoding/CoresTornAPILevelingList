import { createFileRoute } from '@tanstack/react-router';

export function TamperTorn() {
  return (
    <div className="cyberpunk-container" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="cyberpunk-header">
        <h1>TamperTorn Extension</h1>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid #00ff9d', borderRadius: 8, padding: 24, boxShadow: '0 0 20px rgba(0,255,157,0.2)' }}>
        <h2 style={{ color: '#00ff9d', marginBottom: 16 }}>How to Install TamperTorn</h2>
        <ol style={{ color: '#fff', fontSize: '1.1em', marginBottom: 24 }}>
          <li style={{ marginBottom: 12 }}>
            <strong>Download the extension files:</strong><br />
            <a href="/TamperTorn/manifest.json" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>manifest.json</a> |{' '}
            <a href="/TamperTorn/popup.html" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>popup.html</a> |{' '}
            <a href="/TamperTorn/popup.js" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>popup.js</a> |{' '}
            <a href="/TamperTorn/background.js" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>background.js</a> |{' '}
            <a href="/TamperTorn/userscript.js" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>userscript.js</a> |{' '}
            <a href="/TamperTorn/styles.css" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>styles.css</a>
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong>Install as an Unpacked Extension:</strong><br />
            <ol style={{ marginLeft: 20 }}>
              <li>Go to <span style={{ color: '#00ff9d' }}>chrome://extensions</span> (or your browser's extensions page).</li>
              <li>Enable <b>Developer mode</b>.</li>
              <li>Click <b>Load unpacked</b> and select the <b>TamperTorn</b> folder.</li>
            </ol>
          </li>
          <li>
            <strong>Enjoy enhanced Torn automation and features!</strong>
          </li>
        </ol>
        <div style={{ color: '#ff0033', fontWeight: 'bold', marginTop: 16 }}>
          <span>⚠️ Only install extensions from sources you trust.</span>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/tamper-torn')({
  component: TamperTorn,
}); 