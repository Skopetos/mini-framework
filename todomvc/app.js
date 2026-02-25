import { createElement, render } from '../framework/index.js';

const vnode = createElement({
  tag: 'h1',
  attrs: {},
  children: ['Hello, World!'],
});

const container = document.getElementById('root');

render(vnode, container);
