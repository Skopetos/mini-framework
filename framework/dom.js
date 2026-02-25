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
    el.setAttribute(key, vnode.attrs[key]);
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

export { createElement };
