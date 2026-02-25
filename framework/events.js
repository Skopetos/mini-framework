/**
 * Adds event listeners to a DOM element.
 * @param {HTMLElement} el - The element to add the listeners to.
 * @param {object} attrs - The attributes of the element, including event listeners.
 */
function addEventListeners(el, attrs) {
    for (const key in attrs) {
        if (key.startsWith('on')) {
            const event = key.substring(2).toLowerCase();
            el.addEventListener(event, attrs[key]);
        }
    }
}

/**
 * Updates event listeners on a DOM element.
 * @param {HTMLElement} el - The element to update the listeners on.
 * @param {object} newAttrs - The new attributes.
 * @param {object} oldAttrs - The old attributes.
 */
function updateEventListeners(el, newAttrs, oldAttrs) {
    oldAttrs = oldAttrs || {};
    newAttrs = newAttrs || {};

    for (const key in oldAttrs) {
        if (key.startsWith('on')) {
            const event = key.substring(2).toLowerCase();
            el.removeEventListener(event, oldAttrs[key]);
        }
    }

    for (const key in newAttrs) {
        if (key.startsWith('on')) {
            const event = key.substring(2).toLowerCase();
            el.addEventListener(event, newAttrs[key]);
        }
    }
}

export { addEventListeners, updateEventListeners };
