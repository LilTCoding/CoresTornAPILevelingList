let editingScriptId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadScripts();
  document.getElementById('newScript').addEventListener('click', () => {
    editingScriptId = null;
    document.getElementById('scriptCode').value = `// ==UserScript==
// @name         New TamperTorn Script
// @namespace    http://tampertorn.com
// @version      1.0
// @description  A new userscript
// @author       You
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log('TamperTorn script running!');
})();
`;
    showEditor();
  });
  document.getElementById('saveScript').addEventListener('click', saveScript);
  document.getElementById('deleteScript').addEventListener('click', deleteScript);
  document.getElementById('cancelEdit').addEventListener('click', hideEditor);
});

function loadScripts() {
  chrome.storage.local.get('scripts', (data) => {
    const scripts = data.scripts || [];
    const list = document.getElementById('scriptList');
    list.innerHTML = '';
    scripts.forEach((script, index) => {
      const li = document.createElement('li');
      const metadata = parseMetadata(script.code);
      li.textContent = metadata.name || `Script ${index + 1}`;
      li.addEventListener('click', () => {
        editingScriptId = index;
        document.getElementById('scriptCode').value = script.code;
        showEditor();
      });
      list.appendChild(li);
    });
  });
}

function saveScript() {
  const code = document.getElementById('scriptCode').value;
  chrome.storage.local.get('scripts', (data) => {
    const scripts = data.scripts || [];
    if (editingScriptId !== null) {
      scripts[editingScriptId] = { code };
    } else {
      scripts.push({ code });
    }
    chrome.storage.local.set({ scripts }, () => {
      loadScripts();
      hideEditor();
    });
  });
}

function deleteScript() {
  if (editingScriptId === null) return;
  chrome.storage.local.get('scripts', (data) => {
    const scripts = data.scripts || [];
    scripts.splice(editingScriptId, 1);
    chrome.storage.local.set({ scripts }, () => {
      loadScripts();
      hideEditor();
    });
  });
}

function showEditor() {
  document.getElementById('editor').style.display = 'block';
  document.getElementById('scriptList').style.display = 'none';
  document.getElementById('newScript').style.display = 'none';
}

function hideEditor() {
  document.getElementById('editor').style.display = 'none';
  document.getElementById('scriptList').style.display = 'block';
  document.getElementById('newScript').style.display = 'block';
  editingScriptId = null;
}

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