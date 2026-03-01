let eventsApplied = false;

function isEmptyVNode(vnode) {
  return vnode === null || vnode === undefined || vnode === false;
}

function isTextVNode(vnode) {
  return typeof vnode === 'string' || typeof vnode === 'number';
}

function getVNodeChildren(vnode) {
  const children = Array.isArray(vnode.children) ? vnode.children : [];
  return children.filter(child => !isEmptyVNode(child));
}

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
  if (isEmptyVNode(vnode)) {
    return document.createTextNode('');
  }

  if (isTextVNode(vnode)) {
    return document.createTextNode(String(vnode));
  }

  const el = document.createElement(vnode.tag);
  vnode.$el = el;
  el.__events = {};

  const attrs = vnode.attrs || {};
  const children = getVNodeChildren(vnode);

  for (const key in attrs) {
    if (key.startsWith('on')) {
      const eventType = key.substring(2).toLowerCase();
      el.__events[eventType] = attrs[key];
    } else if (key === 'checked' || key === 'disabled' || key === 'selected') {
      // Handle boolean attributes
      if (attrs[key]) {
        el[key] = true;
      }
    } else {
      el.setAttribute(key, attrs[key]);
    }
  }

  for (const child of children) {
    if (isEmptyVNode(child)) continue;
    el.appendChild(createElement(child));
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
  if (!el) return;

  if (isEmptyVNode(newVNode)) {
    el.remove();
    return;
  }

  if (isEmptyVNode(oldVNode)) {
    el.replaceWith(createElement(newVNode));
    return;
  }

  if (isTextVNode(newVNode) || isTextVNode(oldVNode)) {
    const newText = isTextVNode(newVNode) ? String(newVNode) : '';
    const oldText = isTextVNode(oldVNode) ? String(oldVNode) : '';

    if (newText !== oldText) {
      if (!isTextVNode(newVNode) || !isTextVNode(oldVNode)) {
        el.replaceWith(createElement(newVNode));
      } else {
        el.textContent = newText;
      }
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
      } else if (attr === 'checked' || attr === 'disabled' || attr === 'selected') {
          // Handle boolean attributes as properties
          el[attr] = !!newAttrs[attr];
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
      } else if (attr === 'checked' || attr === 'disabled' || attr === 'selected') {
          // Reset boolean attributes if not in new attrs
          if (!(attr in newAttrs)) {
              el[attr] = false;
          }
      } else if (!(attr in newAttrs)) {
          el.removeAttribute(attr);
      }
  }

  // Diff children
  const oldChildren = getVNodeChildren(oldVNode);
  const newChildren = getVNodeChildren(newVNode);
  const parentEl = el;

  const oldLen = oldChildren.length;
  const newLen = newChildren.length;
  const minLen = Math.min(oldLen, newLen);

  // Update existing children
  for (let i = 0; i < minLen; i++) {
    updateElement(parentEl.childNodes[i], newChildren[i], oldChildren[i]);
  }

  // Add new children
  if (newLen > oldLen) {
    for (let i = oldLen; i < newLen; i++) {
      parentEl.appendChild(createElement(newChildren[i]));
    }
  }

  // Remove old children
  if (oldLen > newLen) {
    for (let i = oldLen - 1; i >= newLen; i--) {
      parentEl.childNodes[i].remove();
    }
  }
}

export { createElement, render, updateElement };
