'use strict';

// RED phase: these tests define the expected behavior of tinymyterms.js.
// They fail until src/tinymyterms.js is implemented.

const { initTinyMyTerms } = require('../src/tinymyterms.js');

const AGREEMENTS = ['SD-BASE', 'SD-BASE-DP', 'PDC-AI', 'PDC-GOOD', 'PDC-INTENT'];

function makeDialog(agreements = ['SD-BASE']) {
  const el = document.createElement('div');
  el.setAttribute('data-myterms-agreement', agreements.join(' '));
  agreements.forEach(id => el.classList.add(`myterms-consent--${id}`));
  el.classList.add('myterms-consent');
  el.setAttribute('role', 'dialog');

  const btn = document.createElement('button');
  btn.className = 'myterms-agree-btn';
  btn.textContent = 'I Agree';
  el.appendChild(btn);

  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('initTinyMyTerms', () => {
  test('is exported as a function', () => {
    expect(typeof initTinyMyTerms).toBe('function');
  });

  describe('when no prior acceptance recorded', () => {
    test('shows the consent dialog', () => {
      const dialog = makeDialog(['SD-BASE']);
      dialog.style.display = 'none';
      initTinyMyTerms();
      expect(dialog.style.display).not.toBe('none');
    });

    test('shows dialog for multi-agreement banner', () => {
      const dialog = makeDialog(AGREEMENTS);
      dialog.style.display = 'none';
      initTinyMyTerms();
      expect(dialog.style.display).not.toBe('none');
    });
  });

  describe('when all agreements already accepted in localStorage', () => {
    test('hides the dialog immediately', () => {
      localStorage.setItem('myterms-accepted-SD-BASE', 'true');
      const dialog = makeDialog(['SD-BASE']);
      dialog.style.display = '';
      initTinyMyTerms();
      expect(dialog.style.display).toBe('none');
    });

    test('hides multi-agreement dialog when all accepted', () => {
      AGREEMENTS.forEach(id => localStorage.setItem(`myterms-accepted-${id}`, 'true'));
      const dialog = makeDialog(AGREEMENTS);
      initTinyMyTerms();
      expect(dialog.style.display).toBe('none');
    });

    test('keeps dialog visible when only some agreements accepted', () => {
      localStorage.setItem('myterms-accepted-SD-BASE', 'true');
      const dialog = makeDialog(['SD-BASE', 'PDC-GOOD']);
      dialog.style.display = 'none';
      initTinyMyTerms();
      expect(dialog.style.display).not.toBe('none');
    });
  });

  describe('Agree button click', () => {
    test('sets localStorage for each agreement', () => {
      const dialog = makeDialog(['SD-BASE', 'PDC-GOOD']);
      dialog.style.display = 'none';
      initTinyMyTerms();

      const btn = dialog.querySelector('.myterms-agree-btn');
      btn.click();

      expect(localStorage.getItem('myterms-accepted-SD-BASE')).toBe('true');
      expect(localStorage.getItem('myterms-accepted-PDC-GOOD')).toBe('true');
    });

    test('hides dialog after clicking Agree', () => {
      const dialog = makeDialog(['SD-BASE']);
      dialog.style.display = 'none';
      initTinyMyTerms();

      dialog.querySelector('.myterms-agree-btn').click();
      expect(dialog.style.display).toBe('none');
    });

    test('dispatches myterms:accepted custom event', () => {
      const dialog = makeDialog(['SD-BASE']);
      dialog.style.display = 'none';
      initTinyMyTerms();

      const handler = jest.fn();
      document.addEventListener('myterms:accepted', handler);
      dialog.querySelector('.myterms-agree-btn').click();
      expect(handler).toHaveBeenCalledTimes(1);

      document.removeEventListener('myterms:accepted', handler);
    });

    test('event detail contains accepted agreement IDs', () => {
      const dialog = makeDialog(['SD-BASE', 'PDC-AI']);
      dialog.style.display = 'none';
      initTinyMyTerms();

      let eventDetail;
      document.addEventListener('myterms:accepted', e => { eventDetail = e.detail; });
      dialog.querySelector('.myterms-agree-btn').click();
      expect(eventDetail.agreements).toEqual(['SD-BASE', 'PDC-AI']);
    });
  });

  describe('multiple dialogs on page', () => {
    test('handles each dialog independently', () => {
      localStorage.setItem('myterms-accepted-SD-BASE', 'true');
      const d1 = makeDialog(['SD-BASE']);
      const d2 = makeDialog(['PDC-GOOD']);
      d1.style.display = '';
      d2.style.display = 'none';
      initTinyMyTerms();
      expect(d1.style.display).toBe('none');
      expect(d2.style.display).not.toBe('none');
    });
  });

  describe('CSS class convention', () => {
    test('dialog carries myterms-consent--<ID> class for each agreement', () => {
      const dialog = makeDialog(['SD-BASE', 'PDC-GOOD']);
      expect(dialog.classList.contains('myterms-consent--SD-BASE')).toBe(true);
      expect(dialog.classList.contains('myterms-consent--PDC-GOOD')).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('does not error on dialog with no agree button', () => {
      const el = document.createElement('div');
      el.setAttribute('data-myterms-agreement', 'SD-BASE');
      el.classList.add('myterms-consent--SD-BASE');
      el.style.display = 'none';
      document.body.appendChild(el);
      expect(() => initTinyMyTerms()).not.toThrow();
      expect(el.style.display).not.toBe('none');
    });

    test('does not change display when dialog is already visible', () => {
      localStorage.clear();
      const el = document.createElement('div');
      el.setAttribute('data-myterms-agreement', 'SD-BASE');
      el.classList.add('myterms-consent--SD-BASE');
      el.style.display = 'block';
      const btn = document.createElement('button');
      btn.className = 'myterms-agree-btn';
      el.appendChild(btn);
      document.body.appendChild(el);
      initTinyMyTerms();
      expect(el.style.display).toBe('block');
    });

    test('handles element with empty data-myterms-agreement', () => {
      const el = document.createElement('div');
      el.setAttribute('data-myterms-agreement', '');
      document.body.appendChild(el);
      expect(() => initTinyMyTerms()).not.toThrow();
    });
  });
});
