import { createElement, render } from '../framework/index.js';

const view1 = createElement({
  tag: 'div',
  attrs: {},
  children: [
    {
      tag: 'h1',
      attrs: { class: 'title' },
      children: ['Hello, World!'],
    },
    {
      tag: 'p',
      children: ['This is the first view.'],
    },
  ],
});

const view2 = createElement({
    tag: 'div',
    attrs: {},
    children: [
      {
        tag: 'h1',
        attrs: { class: 'title' },
        children: ['Hello, World! (Updated)'],
      },
      {
        tag: 'p',
        children: ['This is the second view.'],
      },
      {
        tag: 'button',
        attrs: {
            onclick: () => console.log('Button clicked!'),
        },
        children: ['Click me'],
      }
    ],
  });

const container = document.getElementById('root');

// First render
render(view1, container);

// After 2 seconds, render the second view
setTimeout(() => {
  render(view2, container);
}, 2000);
