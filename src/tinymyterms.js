'use strict';

/**
 * tinyMyTerms — IEEE 7012-2025 MyTerms consent library
 *
 * Protocol:
 *  1. Client does GET /.well-known/myterms.json — 200=contract, 404=none
 *  2. Site publishes <link rel="terms-of-service" type="application/json">
 *  3. Consent dialog tagged myterms-consent--<ID> for ad-blocker element-hiding
 *
 * Ad blocker users subscribe to blocklists/SD-BASE.txt etc. to pre-accept.
 * Other users click "I Agree"; acceptance is stored in localStorage.
 */

const STORAGE_PREFIX = 'myterms-accepted-';
const AGREE_SELECTOR = '.myterms-agree-btn';
const DIALOG_SELECTOR = '[data-myterms-agreement]';

function agreementsFromElement(el) {
  const raw = el.getAttribute('data-myterms-agreement') || '';
  return raw.split(/\s+/).filter(Boolean);
}

function allAccepted(agreements) {
  return agreements.every(id => localStorage.getItem(STORAGE_PREFIX + id) === 'true');
}

function acceptAgreements(agreements) {
  agreements.forEach(id => localStorage.setItem(STORAGE_PREFIX + id, 'true'));
}

function hide(el) {
  el.style.display = 'none';
}

function show(el) {
  if (el.style.display === 'none') {
    el.style.display = '';
  }
}

function initTinyMyTerms() {
  const dialogs = Array.from(document.querySelectorAll(DIALOG_SELECTOR));

  dialogs.forEach(dialog => {
    const agreements = agreementsFromElement(dialog);

    if (allAccepted(agreements)) {
      hide(dialog);
      return;
    }

    show(dialog);

    const btn = dialog.querySelector(AGREE_SELECTOR);
    if (!btn) return;

    btn.addEventListener('click', function onAgree() {
      acceptAgreements(agreements);
      hide(dialog);
      document.dispatchEvent(new CustomEvent('myterms:accepted', {
        detail: { agreements },
        bubbles: true,
      }));
      btn.removeEventListener('click', onAgree);
    });
  });
}

/* istanbul ignore next */
if (typeof document !== 'undefined' && document.readyState !== 'loading') {
  initTinyMyTerms();
} else /* istanbul ignore next */ if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initTinyMyTerms);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initTinyMyTerms };
}
