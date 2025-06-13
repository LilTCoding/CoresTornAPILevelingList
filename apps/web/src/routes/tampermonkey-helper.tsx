import { createFileRoute } from '@tanstack/react-router';

const tampermonkeyScriptUrl = 'https://yourdomain.com/torn-auto-send-money.user.js'; // Replace with your actual script URL

export function TampermonkeyHelper() {
  return (
    <div className="cyberpunk-container" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="cyberpunk-header">
        <h1>Tampermonkey Automation</h1>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid #00ff9d', borderRadius: 8, padding: 24, boxShadow: '0 0 20px rgba(0,255,157,0.2)' }}>
        <h2 style={{ color: '#00ff9d', marginBottom: 16 }}>How to Enable Auto-Send Money</h2>
        <ol style={{ color: '#fff', fontSize: '1.1em', marginBottom: 24 }}>
          <li style={{ marginBottom: 12 }}>
            <strong>Install Tampermonkey Extension:</strong><br />
            <a href="https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>Chrome</a> |{' '}
            <a href="https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>Firefox</a> |{' '}
            <a href="https://microsoftedge.microsoft.com/addons/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>Edge</a>
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong>Install the Torn Auto-Send Money Userscript:</strong><br />
            <a href={tampermonkeyScriptUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff9d', fontWeight: 'bold', fontSize: '1.2em' }}>Install Script</a>
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong>How to Use:</strong><br />
            After installing, use a link like:<br />
            <code style={{ background: '#181818', color: '#00ff9d', padding: '2px 6px', borderRadius: 4 }}>https://www.torn.com/sendcash.php#/XID=USER_ID&amp;amount=AMOUNT</code><br />
            Example: <code style={{ background: '#181818', color: '#00ff9d', padding: '2px 6px', borderRadius: 4 }}>https://www.torn.com/sendcash.php#/XID=3542147&amp;amount=18000</code><br />
            The amount will be auto-filled for you!
          </li>
          <li>
            <strong>Optional:</strong> To auto-click the Send button, edit the script and uncomment the auto-click code as described in the script comments.
          </li>
        </ol>
        <div style={{ color: '#ff0033', fontWeight: 'bold', marginTop: 16 }}>
          <span>⚠️ For your security, only install userscripts from sources you trust.</span>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/tampermonkey-helper')({
  component: TampermonkeyHelper,
}); 