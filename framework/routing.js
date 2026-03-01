import { renderApp } from './state.js';

let _routes = {};
let _currentView = null;

/**
 * Creates a new router.
 * @param {object} routes - The routes.
 */
function createRouter(routes) {
    _routes = routes;
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
}

function handleHashChange() {
    const hash = window.location.hash || '#/';
    const view = _routes[hash] || _routes['#/'];
    if (view) {
        _currentView = view;
        renderApp();
    }
}

/**
 * Navigates to a new URL.
 * @param {string} hash - The URL hash.
 */
function navigate(hash) {
    window.location.hash = hash;
}

function getCurrentView() {
    return _currentView;
}

export { createRouter, navigate, getCurrentView };
