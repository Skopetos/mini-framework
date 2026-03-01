let eventsApplied = false;

function applyEvents(container) {
    if (eventsApplied) return;

    const eventTypes = ['click', 'keydown', 'change', 'input', 'submit']; // Add more events as needed

    for (const eventType of eventTypes) {
        container.addEventListener(eventType, e => {
            let el = e.target;
            while (el && el !== container) {
                if (el.__events && el.__events[eventType]) {
                    el.__events[eventType](e);
                }
                if (el === container) break;
                el = el.parentElement;
            }
        });
    }
    eventsApplied = true;
}

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
  el.__events = {};

  for (const key in vnode.attrs) {
    if (key.startsWith('on')) {
      const eventType = key.substring(2).toLowerCase();
      el.__events[eventType] = vnode.attrs[key];
    } else {
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
  applyEvents(container);

  if (currentVNode === null) {
    // First render
    container.innerHTML = '';
    container.appendChild(createElement(vnode));
  } else {
    // Subsequent renders
    updateElement(container.firstChild, vnode, currentVNode);
  }
  currentVNode = vnode;
}

/**
 * Updates the DOM based on the differences between the new and old virtual DOM.
 * @param {HTMLElement} el - The DOM element to update.
 * @param {object} newVNode - The new virtual node.
 * @param {object} oldVNode - The old virtual node.
 */
function updateElement(el, newVNode, oldVNode) {
  if (!newVNode) {
    el.remove();
    return;
  }
  
  if (typeof newVNode === 'string' || typeof oldVNode === 'string') {
    if (newVNode !== oldVNode) {
      el.textContent = newVNode;
    }
    return;
  }
  
  if (newVNode.tag !== oldVNode.tag) {
    const newEl = createElement(newVNode);
    el.replaceWith(newEl);
    return;
  }
  
  newVNode.$el = el;
  el.__events = el.__events || {};

  // Diff attributes
  const oldAttrs = oldVNode.attrs || {};
  const newAttrs = newVNode.attrs || {};

  for (const attr in newAttrs) {
      if (attr.startsWith('on')) {
          const eventType = attr.substring(2).toLowerCase();
          el.__events[eventType] = newAttrs[attr];
      } else if (newAttrs[attr] !== oldAttrs[attr]) {
          el.setAttribute(attr, newAttrs[attr]);
      }
  }

  for (const attr in oldAttrs) {
      if (attr.startsWith('on')) {
          if (!(attr in newAttrs)) {
              const eventType = attr.substring(2).toLowerCase();
              delete el.__events[eventType];
          }
      } else if (!(attr in newAttrs)) {
          el.removeAttribute(attr);
      }
  }

  // Diff children
  const oldChildren = oldVNode.children || [];
  const newChildren = newVNode.children || [];
  const len = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < len; i++) {
    updateElement(el.childNodes[i], newChildren[i], oldChildren[i]);
  }
}

export { createElement, render, updateElement };

