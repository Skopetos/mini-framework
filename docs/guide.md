# mini-framework Documentation

Welcome to the documentation for mini-framework! This document will guide you through the features of the framework and how to use them.

## Features

mini-framework is a simple JavaScript framework for building user interfaces. It provides the following features:

-   **DOM Abstraction**: A virtual DOM implementation for efficient DOM updates.
-   **State Management**: A simple state management system to keep your application's state in one place.
-   **Routing**: A hash-based routing system for creating single-page applications.
-   **Event Handling**: A declarative way to handle DOM events.

## Getting Started

To use mini-framework, you need to include the `framework/index.js` file in your HTML file.

```html
<script src="../framework/index.js"></script>
```

You can then start building your application in your own JavaScript file.

## Creating Elements

You can create elements using the `createElement` function. This function takes a JavaScript object (a "virtual node") that describes the element.

A virtual node has the following structure:

```javascript
{
  tag: 'div', // The tag of the element
  attrs: { class: 'container' }, // The attributes of the element
  children: [ // The children of the element
    'Hello, World!',
    {
      tag: 'p',
      attrs: {},
      children: ['This is a paragraph.'],
    },
  ],
}
```

Here's how you would use `createElement` to create a `div` with a `p` tag inside:

```javascript
import { createElement } from '../framework/index.js';

const vnode = createElement({
  tag: 'div',
  attrs: { class: 'container' },
  children: [
    {
      tag: 'p',
      children: ['Hello, World!'],
    },
  ],
});
```

### Adding Attributes

You can add attributes to an element by specifying them in the `attrs` object of the virtual node.

```javascript
const vnode = createElement({
  tag: 'input',
  attrs: {
    type: 'text',
    placeholder: 'Enter your name',
  },
  children: [],
});
```

### Nesting Elements

You can nest elements by adding virtual nodes to the `children` array of a virtual node.

```javascript
const vnode = createElement({
    tag: 'div',
    attrs: {},
    children: [
        {
            tag: 'h1',
            children: ['This is a title'],
        },
        {
            tag: 'p',
            children: ['This is a paragraph.'],
        },
    ],
});
```

## Rendering Elements

To render a virtual node to the DOM, you use the `render` function. This function takes a virtual node and a container element as arguments.

```javascript
import { createElement, render } from '../framework/index.js';

const vnode = createElement({
  tag: 'h1',
  children: ['Hello, World!'],
});

const container = document.getElementById('root');

render(vnode, container);
```

## Event Handling

You can handle DOM events by adding attributes to the virtual node that start with `on`. For example, to handle a `click` event, you would add an `onclick` attribute.

```javascript
const vnode = createElement({
    tag: 'button',
    attrs: {
        onclick: () => console.log('Button clicked!'),
    },
    children: ['Click me'],
});
```

## State Management

mini-framework provides a simple state management system. You can create a state object using the `createState` function.

```javascript
import { createState } from '../framework/index.js';

const { getState, setState } = createState({
    count: 0,
});
```

You can then get the current state using `getState` and update the state using `setState`.

When you call `setState`, the framework will automatically re-render the application with the new state.

To connect your application to the state, you need to use the `setRenderer` function.

```javascript
import { render, setRenderer } from '../framework/index.js';

function App() {
    const state = getState();
    // Return a virtual node that depends on the state
}

const container = document.getElementById('root');

setRenderer(render, container, App);

render(App(), container);
```

## Routing

mini-framework provides a hash-based routing system. You can create a router using the `createRouter` function.

```javascript
import { createRouter, getCurrentView } from '../framework/index.js';

const Home = () => ({ tag: 'h1', children: ['Home'] });
const About = () => ({ tag: 'h1', children: ['About'] });

const routes = {
    '#/': Home,
    '#/about': About,
};

createRouter(routes);
```

Then, you can modify your `App` function to return the current view from the router.

```javascript
function App() {
    const View = getCurrentView();
    return View ? View() : Home();
}
```

You can navigate between routes using the `navigate` function or by changing the URL hash directly.

```javascript
import { navigate } from '../framework/index.js';

navigate('#/about');
```

## How it Works

mini-framework is based on the concept of a virtual DOM. When you render a view, the framework creates a virtual representation of the DOM. When the state changes, the framework creates a new virtual DOM and compares it with the old one. It then updates the real DOM only where it's necessary. This is much more efficient than re-rendering the entire DOM on every state change.

The state management system is based on a single state object. When you call `setState`, the framework merges the new state with the old state and then triggers a re-render.

The routing system is based on the URL hash. When the hash changes, the router finds the corresponding view and triggers a re-render.
