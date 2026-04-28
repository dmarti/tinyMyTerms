'use strict';

// TDD tests for tinymyterms-welcome.js
// Written RED first, then tinymyterms-welcome.js implemented to make them GREEN.

const { initWelcome, showWelcome, dismiss } = require('../src/tinymyterms-welcome.js');

const STORAGE_KEY = 'myterms-welcome-dismissed';
const CONTAINER_ID = 'myterms-welcome';

beforeEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  sessionStorage.clear();
  global.fetch = undefined;
  jest.resetModules();
});

describe('showWelcome', () => {
  test('injects the welcome element into the DOM', () => {
    showWelcome();
    expect(document.getElementById(CONTAINER_ID)).toBeInTheDocument();
  });

  test('element has role="complementary"', () => {
    showWelcome();
    const el = document.getElementById(CONTAINER_ID);
    expect(el.getAttribute('role')).toBe('complementary');
  });

  test('element contains a dismiss button', () => {
    showWelcome();
    expect(document.getElementById('myterms-welcome-dismiss')).toBeInTheDocument();
  });

  test('element contains a link to myterms.info', () => {
    showWelcome();
    const links = document.querySelectorAll(`#${CONTAINER_ID} a`);
    const hrefs = Array.from(links).map(l => l.getAttribute('href'));
    expect(hrefs.some(h => h.includes('myterms.info'))).toBe(true);
  });

  test('element contains a link to tinyMyTerms repo', () => {
    showWelcome();
    const links = document.querySelectorAll(`#${CONTAINER_ID} a`);
    const hrefs = Array.from(links).map(l => l.getAttribute('href'));
    expect(hrefs.some(h => h.includes('tinyMyTerms'))).toBe(true);
  });

  test('does not show if already dismissed this session', () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    showWelcome();
    expect(document.getElementById(CONTAINER_ID)).toBeNull();
  });

  test('injects styles into the head', () => {
    showWelcome();
    expect(document.getElementById('myterms-welcome-styles')).toBeInTheDocument();
  });

  test('does not duplicate styles on multiple calls', () => {
    showWelcome();
    dismiss();
    showWelcome();
    const styleEls = document.querySelectorAll('#myterms-welcome-styles');
    expect(styleEls.length).toBe(1);
  });
});

describe('dismiss', () => {
  test('removes the welcome element from the DOM', () => {
    showWelcome();
    dismiss();
    expect(document.getElementById(CONTAINER_ID)).toBeNull();
  });

  test('sets sessionStorage flag', () => {
    showWelcome();
    dismiss();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  test('dismiss button click triggers dismiss', () => {
    showWelcome();
    document.getElementById('myterms-welcome-dismiss').click();
    expect(document.getElementById(CONTAINER_ID)).toBeNull();
  });
});

describe('initWelcome', () => {
  test('shows welcome when fetch returns 404', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 404 });
    await initWelcome();
    expect(document.getElementById(CONTAINER_ID)).toBeInTheDocument();
  });

  test('does not show welcome when fetch returns 200', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    await initWelcome();
    expect(document.getElementById(CONTAINER_ID)).toBeNull();
  });

  test('does nothing on network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));
    await expect(initWelcome()).resolves.toBeUndefined();
    expect(document.getElementById(CONTAINER_ID)).toBeNull();
  });
});
