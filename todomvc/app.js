import { createElement, render, setRenderer, createState } from '../framework/index.js';

const { getState, setState } = createState({
  count: 0,
});

function App() {
  const state = getState();
  return {
    tag: 'div',
    attrs: {},
    children: [
      {
        tag: 'h1',
        attrs: { class: 'title' },
        children: [`Counter: ${state.count}`],
      },
      {
        tag: 'button',
        attrs: {
          onclick: () => setState({ count: getState().count + 1 }),
        },
        children: ['Increment'],
      },
      {
        tag: 'button',
        attrs: {
            onclick: () => setState({ count: getState().count - 1 }),
        },
        children: ['Decrement'],
      }
    ],
  };
}

const container = document.getElementById('root');

setRenderer(render, container, App);

render(App(), container);
