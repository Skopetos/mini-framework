import { addEventListeners, updateEventListeners } from './events.js';

/**
 * Creates a DOM element from a virtual element (VNode).
 * @param {object} vnode - The virtual element.
 * @param {string} vnode.tag - The tag of the element.
 * @param {object} vnode.attrs - The attributes of the element.
 * @param {Array<object|string>} vnode.children - The children of the element.
 * @returns {HTMLElement} The created DOM element.
 */
function createElement(vnode) {
  const el = document.createElement(vnode.tag);
  vnode.$el = el;

  addEventListeners(el, vnode.attrs);

  for (const key in vnode.attrs) {
    if (!key.startsWith('on')) {
      el.setAttribute(key, vnode.attrs[key]);
    }
  }

  for (const child of vnode.children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(createElement(child));
    }
  }

  return el;
}



let currentVNode = null;

/**
 * Renders a virtual node into a container element.
 * @param {object} vnode - The virtual node to render.
 * @param {HTMLElement} container - The container element to render into.
 */
function render(vnode, container) {
  if (currentVNode === null) {
    // First render
    container.appendChild(createElement(vnode));
  } else {
    // Subsequent renders
    updateElement(container.firstChild, vnode, currentVNode);
  }
  currentVNode = vnode;
}

/**
 * Updates the DOM based on the differences between the new and old virtual DOM.
 * @param {HTMLElement} parent - The parent element in the DOM.
 * @param {object} newVNode - The new virtual node.
 * @param {object} oldVNode - The old virtual node.
 */
function updateElement(parent, newVNode, oldVNode, index = 0) {
  const el = parent.childNodes[index];

  if (!newVNode) {
    el.remove();
  } else if (typeof newVNode === 'string' || typeof oldVNode === 'string') {
    if (newVNode !== oldVNode) {
      el.textContent = newVNode;
    }
  } else if (newVNode.tag !== oldVNode.tag) {
    const newEl = createElement(newVNode);
    el.replaceWith(newEl);
  } else {
    updateEventListeners(el, newVNode.attrs, oldVNode.attrs);

    // Diff attributes
    const oldAttrs = oldVNode.attrs || {};
    const newAttrs = newVNode.attrs || {};

    for (const attr in newAttrs) {
      if (newAttrs[attr] !== oldAttrs[attr] && !attr.startsWith('on')) {
        el.setAttribute(attr, newAttrs[attr]);
      }
    }

    for (const attr in oldAttrs) {
      if (!(attr in newAttrs) && !attr.startsWith('on')) {
        el.removeAttribute(attr);
      }
    }

    // Diff children
    const oldChildren = oldVNode.children || [];
    const newChildren = newVNode.children || [];
    const len = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < len; i++) {
      updateElement(el, newChildren[i], oldChildren[i], i);
    }
  }
}

export { createElement, render, updateElement };

