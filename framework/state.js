import { render } from './dom.js';

let _state = null;
let _renderer = null;
let _container = null;
let _app = null;

function setRenderer(renderFunc, container, app) {
    _renderer = renderFunc;
    _container = container;
    _app = app;
}

/**
 * Creates a new state object.
 * @param {object} initialState - The initial state.
 * @returns {object} The state object.
 */
function createState(initialState) {
  _state = initialState;
  return {
    getState,
    setState,
  };
}

/**
 * Gets the current state.
 * @returns {object} The current state.
 */
function getState() {
  return _state;
}

/**
 * Updates the state and re-renders the application.
 * @param {object} newState - The new state.
 */
function setState(newState) {
  _state = { ..._state, ...newState };
  _renderer(_app(), _container);
}

function renderApp() {
    _renderer(_app(), _container);
}

export { createState, getState, setState, setRenderer, renderApp };
