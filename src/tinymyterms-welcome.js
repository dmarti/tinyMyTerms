'use strict';

/**
 * tinyMyTerms-welcome — onboarding component for sites with no MyTerms set up.
 *
 * When a visitor's browser detects (via GET /.well-known/myterms.json → 404)
 * that the site has no MyTerms, this script shows a lightweight welcome
 * overlay explaining the standard and linking to tinyMyTerms to set up.
 *
 * Usage:
 *   <script src="/tinymyterms-welcome.js"></script>
 * The script self-initializes; it checks the well-known endpoint on load.
 */

const WELL_KNOWN_PATH = '/.well-known/myterms.json';
const STORAGE_KEY = 'myterms-welcome-dismissed';
const CONTAINER_ID = 'myterms-welcome';

function alreadyDismissed() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch /* istanbul ignore next */ {
    return false;
  }
}

function dismiss() {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'true');
  } catch /* istanbul ignore next */ {}
  const el = document.getElementById(CONTAINER_ID);
  if (el) el.remove();
}

function injectStyles() {
  if (document.getElementById('myterms-welcome-styles')) return;
  const style = document.createElement('style');
  style.id = 'myterms-welcome-styles';
  style.textContent = `
    #myterms-welcome {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 9998;
      background: #1a1a1a; border-top: 2px solid #4a7aff;
      padding: 1rem 1.5rem; font-family: system-ui, sans-serif;
      font-size: 0.875rem; color: #e0e0e0;
    }
    #myterms-welcome a { color: #4a7aff; }
    #myterms-welcome button {
      margin-left: 1rem; padding: 0.375rem 0.875rem;
      background: #333; color: #e0e0e0; border: 1px solid #555;
      border-radius: 0.25rem; cursor: pointer; font-size: 0.8rem;
    }
    @media (prefers-color-scheme: light) {
      #myterms-welcome { background: #fff; color: #1a1a1a; border-top-color: #4a7aff; }
      #myterms-welcome button { background: #f0f0f0; color: #1a1a1a; border-color: #ccc; }
    }
  `;
  document.head.appendChild(style);
}

function showWelcome() {
  if (alreadyDismissed()) return;
  injectStyles();

  const el = document.createElement('div');
  el.id = CONTAINER_ID;
  el.setAttribute('role', 'complementary');
  el.setAttribute('aria-label', 'MyTerms not configured on this site');
  el.innerHTML = `
    <strong>This site hasn&rsquo;t configured MyTerms yet.</strong>
    MyTerms (<a href="https://myterms.info/" target="_blank" rel="noopener">IEEE 7012-2025</a>)
    lets you specify your privacy terms once and have them honored automatically across sites.
    Website owners: <a href="https://github.com/dmarti/tinyMyTerms" target="_blank" rel="noopener">
    set up tinyMyTerms</a> to eliminate consent dialogs for users who pre-accept your agreements.
    <button id="myterms-welcome-dismiss" aria-label="Dismiss this message">Dismiss</button>
  `;
  document.body.appendChild(el);
  document.getElementById('myterms-welcome-dismiss').addEventListener('click', dismiss);
}

function initWelcome() {
  if (typeof fetch === 'undefined') return Promise.resolve();
  return fetch(WELL_KNOWN_PATH, { method: 'HEAD' })
    .then(res => {
      if (res.status === 404) showWelcome();
    })
    .catch(() => {}); // network errors: silent
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') {
    initWelcome();
  } else /* istanbul ignore next */ {
    document.addEventListener('DOMContentLoaded', initWelcome);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initWelcome, showWelcome, dismiss };
}
