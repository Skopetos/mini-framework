# mini-framework

A lightweight JavaScript framework for building interactive web applications with Virtual DOM, state management, and routing.

## 🎯 For Auditors - Quick Start

To test this framework:

1. **Start the server** from the project root:
   ```bash
   python3 -m http.server 8080
   ```

2. **View the TodoMVC app**:
   - Open browser to: `http://localhost:8080/todomvc/`
   - Test all features: add todos, mark complete, filter, edit, etc.

3. **Run the tests** (optional):
   - Open browser to: `http://localhost:8080/tests/tests.html`
   - View test results to verify framework functionality

4. **Read the documentation**:
   - Full guide: [docs/guide.md](docs/guide.md)
   - Contains all code examples and explanations

5. **Test the framework** (optional):
   - Create a new folder (e.g., `test-app/`)
   - Copy `todomvc/index.html` as a template
   - Import framework: `import { ... } from '../framework/index.js'`
   - Follow examples in `docs/guide.md`

## Features

- **Virtual DOM**: Efficient DOM updates through diffing algorithm
- **State Management**: Global state accessible throughout your app
- **Hash-based Routing**: Simple client-side routing
- **Declarative Event Handling**: Clean event syntax without addEventListener

## Quick Start

1. Clone or download this repository
2. Start a local server from the project root:
   ```bash
   python3 -m http.server 8080
   ```
3. Open `http://localhost:8080/todomvc/` to see the TodoMVC example

## Project Structure

```
mini-framework/
├── framework/          # Core framework files
│   ├── dom.js         # Virtual DOM implementation
│   ├── state.js       # State management
│   ├── routing.js     # Routing system
│   └── index.js       # Main exports
├── todomvc/           # TodoMVC implementation example
│   ├── app.js
│   ├── index.html
│   └── style.css
├── tests/             # Framework tests
│   └── tests.html     # Test runner (open in browser)
└── docs/
    └── guide.md       # Complete documentation
```

## Documentation

For detailed documentation on how to use the framework, see [docs/guide.md](docs/guide.md)

## Example Usage

```javascript
import { render, createState, setState, getState } from './framework/index.js';

// Create state
const { getState, setState } = createState({ count: 0 });

// Define component
function App() {
  const { count } = getState();
  return {
    tag: 'div',
    children: [
      { tag: 'h1', children: [`Count: ${count}`] },
      {
        tag: 'button',
        attrs: {
          onclick: () => setState({ count: count + 1 })
        },
        children: ['Increment']
      }
    ]
  };
}

// Render
const container = document.getElementById('root');
setRenderer(render, container, App);
render(App(), container);
```

## License

MIT
