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

  for (const key in vnode.attrs) {
    if (key.startsWith('on')) {
      const event = key.substring(2).toLowerCase();
      el.addEventListener(event, vnode.attrs[key]);
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
  if (currentVNode === null) {
    // First render
    container.appendChild(createElement(vnode));
  } else {
    // Subsequent renders
    updateElement(container, vnode, currentVNode);
  }
  currentVNode = vnode;
}

/**
 * Updates the DOM based on the differences between the new and old virtual DOM.
 * @param {HTMLElement} parent - The parent element in the DOM.
 * @param {object} newVNode - The new virtual node.
 * @param {object} oldVNode - The old virtual node.
 */
function updateElement(parent, newVNode, oldVNode) {
  parent.replaceChild(createElement(newVNode), parent.firstChild);
}

export { createElement, render, updateElement };
