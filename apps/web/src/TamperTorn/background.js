chrome.webNavigation.onCommitted.addListener((details) => {
  chrome.storage.local.get('scripts', (data) => {
    const scripts = data.scripts || [];
    scripts.forEach(script => {
      const metadata = parseMetadata(script.code);
      if (metadata.match && urlMatches(details.url, metadata.match)) {
        chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          func: executeUserscript,
          args: [script.code]
        });
      }
    });
  });
});

function parseMetadata(code) {
  const metadata = {};
  const metadataBlock = code.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
  if (metadataBlock) {
    const lines = metadataBlock[0].split('\n');
    lines.forEach(line => {
      const match = line.match(/\/\/ @(\w+)\s+(.+)/);
      if (match) {
        metadata[match[1]] = match[2].trim();
      }
    });
  }
  return metadata;
}

function urlMatches(url, pattern) {
  const regex = new RegExp('^' + pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/^http:/, 'http[s]?:')
  + '$');
  return regex.test(url);
}

function executeUserscript(code) {
  const script = document.createElement('script');
  script.textContent = code.replace(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/, '');
  document.head.appendChild(script);
  script.remove();
}