# mini-framework Documentation

Welcome to the documentation for mini-framework! This document will guide you through the features of the framework and how to use them.

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Creating Elements](#creating-elements)
- [Rendering Elements](#rendering-elements)
- [Event Handling](#event-handling)
- [State Management](#state-management)
- [Routing](#routing)
- [How it Works](#how-it-works)

## Features

mini-framework is a simple JavaScript framework for building user interfaces. It provides the following features:

-   **DOM Abstraction**: A virtual DOM implementation for efficient DOM updates.
-   **State Management**: A simple state management system to keep your application's state in one place.
-   **Routing**: A hash-based routing system for creating single-page applications.
-   **Event Handling**: A declarative way to handle DOM events.

## Getting Started

To use mini-framework, you need to include the framework files in your HTML file using ES6 modules.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My App</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="app.js"></script>
</body>
</html>
```

Then in your `app.js`:

```javascript
import { createElement, render, createState, setRenderer } from '../framework/index.js';
```

You can then start building your application in your own JavaScript file.

## Creating Elements

You can create elements using virtual nodes (VNodes). A VNode is a JavaScript object that describes the element.

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

Here's how you would create a `div` with a `p` tag inside:

```javascript
const vnode = {
  tag: 'div',
  attrs: { class: 'container' },
  children: [
    {
      tag: 'p',
      children: ['Hello, World!'],
    },
  ],
};
```

### Adding Attributes

You can add attributes to an element by specifying them in the `attrs` object of the virtual node.

```javascript
const vnode = {
  tag: 'input',
  attrs: {
    type: 'text',
    placeholder: 'Enter your name',
    class: 'my-input',
    id: 'name-input',
  },
  children: [],
};
```

### Nesting Elements

You can nest elements by adding virtual nodes to the `children` array of a virtual node.

```javascript
const vnode = {
    tag: 'div',
    attrs: { class: 'card' },
    children: [
        {
            tag: 'h1',
            children: ['This is a title'],
        },
        {
            tag: 'p',
            children: ['This is a paragraph.'],
        },
        {
            tag: 'button',
            attrs: { class: 'btn' },
            children: ['Click me'],
        },
    ],
};
```

## Rendering Elements

To render a virtual node to the DOM, you use the `render` function. This function takes a virtual node and a container element as arguments.

```javascript
import { render } from '../framework/index.js';

const vnode = {
  tag: 'h1',
  children: ['Hello, World!'],
};

const container = document.getElementById('root');

render(vnode, container);
```

## Event Handling

You can handle DOM events by adding attributes to the virtual node that start with `on`. For example, to handle a `click` event, you would add an `onclick` attribute.

**Important**: This is different from using `addEventListener()`. With mini-framework, you declare events directly in your VNode structure.

### Click Event Example

```javascript
const vnode = {
    tag: 'button',
    attrs: {
        onclick: () => console.log('Button clicked!'),
    },
    children: ['Click me'],
};
```

### Keyboard Event Example

```javascript
const vnode = {
    tag: 'input',
    attrs: {
        type: 'text',
        placeholder: 'Type something...',
        onkeydown: (e) => {
            if (e.key === 'Enter') {
                console.log('Enter pressed!', e.target.value);
            }
        },
    },
    children: [],
};
```

### Multiple Event Types

The framework supports various event types:
- `onclick` - Click events
- `onkeydown` - Keyboard key press
- `onchange` - Input value changes
- `oninput` - Input value changes (fires on each keystroke)
- `onsubmit` - Form submission
- `ondblclick` - Double click
- `onblur` - Element loses focus

```javascript
const vnode = {
    tag: 'input',
    attrs: {
        type: 'text',
        onclick: () => console.log('Input clicked'),
        onchange: (e) => console.log('Value changed:', e.target.value),
        onblur: () => console.log('Input lost focus'),
    },
    children: [],
};
```

## State Management

mini-framework provides a simple state management system. You can create a state object using the `createState` function.

```javascript
import { createState } from '../framework/index.js';

const { getState, setState } = createState({
    count: 0,
    username: '',
});
```

You can then get the current state using `getState()` and update the state using `setState()`.

When you call `setState()`, the framework will automatically re-render the application with the new state.

### Complete State Example

```javascript
import { render, createState, setRenderer } from '../framework/index.js';

const { getState, setState } = createState({
    count: 0,
});

function App() {
    const state = getState();
    return {
        tag: 'div',
        children: [
            { tag: 'h1', children: [`Count: ${state.count}`] },
            {
                tag: 'button',
                attrs: {
                    onclick: () => setState({ count: state.count + 1 }),
                },
                children: ['Increment'],
            },
        ],
    };
}

const container = document.getElementById('root');

// Connect state to renderer
setRenderer(render, container, App);

// Initial render
render(App(), container);
```

### How State Updates Work

1. User clicks a button
2. `setState()` is called with new state values
3. State is merged with existing state
4. Framework automatically re-renders the app
5. Virtual DOM diffing ensures only changed elements update

## Routing

mini-framework provides a hash-based routing system. You can create a router using the `createRouter` function.

### Basic Routing Example

```javascript
import { createRouter, getCurrentView } from '../framework/index.js';

const Home = () => ({ tag: 'h1', children: ['Home Page'] });
const About = () => ({ tag: 'h1', children: ['About Page'] });
const Contact = () => ({ tag: 'h1', children: ['Contact Page'] });

const routes = {
    '#/': Home,
    '#/about': About,
    '#/contact': Contact,
};

createRouter(routes);
```

### Using Routes in Your App

```javascript
function App() {
    const View = getCurrentView();
    return View ? View() : Home();
}
```

### Navigation

You can navigate between routes in two ways:

1. **Using links:**
```javascript
const vnode = {
    tag: 'nav',
    children: [
        { tag: 'a', attrs: { href: '#/' }, children: ['Home'] },
        { tag: 'a', attrs: { href: '#/about' }, children: ['About'] },
        { tag: 'a', attrs: { href: '#/contact' }, children: ['Contact'] },
    ],
};
```

2. **Programmatically:**
```javascript
import { navigate } from '../framework/index.js';

navigate('#/about');
```

### Routing with State

You can sync routing with state for dynamic content:

```javascript
function handleRouteChange() {
    const hash = window.location.hash;
    if (hash === '#/active') {
        setState({ filter: 'active' }, false);
    } else if (hash === '#/completed') {
        setState({ filter: 'completed' }, false);
    } else {
        setState({ filter: 'all' }, false);
    }
}

window.addEventListener('hashchange', handleRouteChange);
```

## How it Works

### Virtual DOM

mini-framework is based on the concept of a **Virtual DOM**. Here's how it works:

1. **Virtual Representation**: When you render a view, the framework creates a virtual representation of the DOM as JavaScript objects (VNodes).

2. **Diffing Algorithm**: When the state changes, the framework creates a new virtual DOM and compares it with the old one using a diffing algorithm.

3. **Efficient Updates**: It then updates only the parts of the real DOM that actually changed, rather than re-rendering everything.

This approach is much more efficient than manipulating the real DOM directly on every change, especially for complex applications.

### State Management System

The state management is based on a **single state object**:

1. All application state lives in one place
2. When you call `setState()`, new state is merged with existing state
3. After state update, a re-render is automatically triggered
4. Components read from state using `getState()`

### Routing System

The routing system uses **URL hash-based routing**:

1. Routes are defined as hash patterns (e.g., `#/`, `#/about`)
2. When the hash changes (via links or `navigate()`), the router detects it
3. The corresponding view component is found and rendered
4. This creates a single-page application experience without page reloads

### Event Handling

Events use a **delegation pattern**:

1. Event handlers are declared in VNode attributes (`onclick`, etc.)
2. Framework sets up listeners at the container level (not on individual elements)
3. When an event fires, it bubbles up to the container
4. The framework matches the event to the correct handler
5. This is more efficient than attaching listeners to every element

---

## Example: Complete Counter App

Here's a complete example putting it all together:

```javascript
import { render, createState, setRenderer } from '../framework/index.js';

// Initialize state
const { getState, setState } = createState({
    count: 0,
});

// Define component
function App() {
    const { count } = getState();
    
    return {
        tag: 'div',
        attrs: { class: 'app' },
        children: [
            { 
                tag: 'h1', 
                children: [`Count: ${count}`] 
            },
            {
                tag: 'div',
                attrs: { class: 'buttons' },
                children: [
                    {
                        tag: 'button',
                        attrs: {
                            onclick: () => setState({ count: count + 1 }),
                        },
                        children: ['+'],
                    },
                    {
                        tag: 'button',
                        attrs: {
                            onclick: () => setState({ count: count - 1 }),
                        },
                        children: ['-'],
                    },
                    {
                        tag: 'button',
                        attrs: {
                            onclick: () => setState({ count: 0 }),
                        },
                        children: ['Reset'],
                    },
                ],
            },
        ],
    };
}

// Setup and render
const container = document.getElementById('root');
setRenderer(render, container, App);
render(App(), container);
```

---

## Running the Examples

To run the TodoMVC example or create your own app:

1. Start a local server from the project root:
   ```bash
   python3 -m http.server 8080
   ```

2. Open your browser to:
   - TodoMVC: `http://localhost:8080/todomvc/`
   - Tests: `http://localhost:8080/tests/tests.html`
   - Your custom app: `http://localhost:8080/your-folder/`

**Note**: You must use a server (not just open the HTML file) because the framework uses ES6 modules, which require HTTP/HTTPS protocol.

---

## Testing the Framework

The framework includes a basic test suite to verify core functionality:

1. Start the local server (see above)
2. Open `http://localhost:8080/tests/tests.html` in your browser
3. The page will run tests for:
   - State management (`createState`, `getState`, `setState`)
   - Element creation
   - Basic framework operations

Test results will display on the page in green (passed) or red (failed).

---

For more examples, check out the TodoMVC implementation in the `todomvc/` folder!