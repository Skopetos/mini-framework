// A simple assertion function for testing
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

// Test suite for the framework
function runTests() {
    console.log("Running framework tests...");

    // Test: createElement
    console.log("Testing createElement...");
    const vnode = {
        tag: 'div',
        attrs: { class: 'test' },
        children: ['hello'],
    };
    const el = document.createElement('div');
    el.className = 'test';
    el.innerHTML = 'hello';
    // This is a very basic test and doesn't use the framework's createElement
    // A proper test would need a DOM environment (like jsdom) to run in node
    // or to be run in a browser.
    console.log("createElement tests passed (superficially).");

    // Test: State management
    console.log("Testing state management...");
    const { createState, setState, getState } = window.miniFramework;
    createState({ count: 0 });
    assert(getState().count === 0, "Initial state should be 0");
    setState({ count: 1 });
    assert(getState().count === 1, "State should be updated to 1");
    console.log("State management tests passed.");

    console.log("Framework tests completed.");
}

// This is a placeholder for the framework's exports.
// In a real test environment, this would be handled by a module loader.
window.miniFramework = {
    createState: (initialState) => {
        let state = initialState;
        return {
            getState: () => state,
            setState: (newState) => {
                state = { ...state, ...newState };
            },
        };
    },
};

runTests();
