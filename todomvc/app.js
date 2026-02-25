import { createElement, render, setRenderer, createState, createRouter, navigate, getCurrentView } from '../framework/index.js';

const { getState, setState } = createState({
    todos: [],
    filter: 'all', // 'all', 'active', 'completed'
});

function Header() {
    return {
        tag: 'header',
        attrs: { class: 'header' },
        children: [
            { tag: 'h1', children: ['todos'] },
            {
                tag: 'input',
                attrs: {
                    class: 'new-todo',
                    placeholder: 'What needs to be done?',
                    autofocus: true,
                    onkeydown: (e) => {
                        if (e.key === 'Enter' && e.target.value.trim() !== '') {
                            const newTodo = { id: Date.now(), title: e.target.value.trim(), completed: false };
                            setState({ todos: [...getState().todos, newTodo] });
                            e.target.value = '';
                        }
                    },
                },
            },
        ],
    };
}

function TodoItem({ todo }) {
    return {
        tag: 'li',
        attrs: { class: todo.completed ? 'completed' : '' },
        children: [
            {
                tag: 'div',
                attrs: { class: 'view' },
                children: [
                    {
                        tag: 'input',
                        attrs: {
                            class: 'toggle',
                            type: 'checkbox',
                            checked: todo.completed,
                            onchange: () => {
                                const todos = getState().todos.map(t =>
                                    t.id === todo.id ? { ...t, completed: !t.completed } : t
                                );
                                setState({ todos });
                            },
                        },
                    },
                    { tag: 'label', children: [todo.title] },
                    {
                        tag: 'button',
                        attrs: {
                            class: 'destroy',
                            onclick: () => {
                                const todos = getState().todos.filter(t => t.id !== todo.id);
                                setState({ todos });
                            },
                        },
                    },
                ],
            },
        ],
    };
}

function TodoList() {
    const { todos, filter } = getState();
    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    return {
        tag: 'section',
        attrs: { class: 'main' },
        children: [
            {
                tag: 'input',
                attrs: { id: 'toggle-all', class: 'toggle-all', type: 'checkbox' },
            },
            { tag: 'label', attrs: { for: 'toggle-all' }, children: ['Mark all as complete'] },
            {
                tag: 'ul',
                attrs: { class: 'todo-list' },
                children: filteredTodos.map(todo => TodoItem({ todo })),
            },
        ],
    };
}

function Footer() {
    const { todos, filter } = getState();
    const itemsLeft = todos.filter(todo => !todo.completed).length;

    return {
        tag: 'footer',
        attrs: { class: 'footer' },
        children: [
            {
                tag: 'span',
                attrs: { class: 'todo-count' },
                children: [`${itemsLeft} items left`],
            },
            {
                tag: 'ul',
                attrs: { class: 'filters' },
                children: [
                    {
                        tag: 'li',
                        children: [
                            {
                                tag: 'a',
                                attrs: { href: '#/', class: filter === 'all' ? 'selected' : '' },
                                children: ['All'],
                            },
                        ],
                    },
                    {
                        tag: 'li',
                        children: [
                            {
                                tag: 'a',
                                attrs: { href: '#/active', class: filter === 'active' ? 'selected' : '' },
                                children: ['Active'],
                            },
                        ],
                    },
                    {
                        tag: 'li',
                        children: [
                            {
                                tag: 'a',
                                attrs: { href: '#/completed', class: filter === 'completed' ? 'selected' : '' },
                                children: ['Completed'],
                            },
                        ],
                    },
                ],
            },
        ],
    };
}


function App() {
    return {
        tag: 'div',
        attrs: { class: 'todoapp' },
        children: [
            Header(),
            TodoList(),
            Footer(),
        ],
    };
}

const routes = {
    '#/': App,
    '#/active': App,
    '#/completed': App,
};

createRouter(routes);

const container = document.getElementById('root');

function handleRouteChange() {
    const hash = window.location.hash;
    if (hash === '#/active') {
        setState({ filter: 'active' });
    } else if (hash === '#/completed') {
        setState({ filter: 'completed' });
    } else {
        setState({ filter: 'all' });
    }
}

window.addEventListener('hashchange', handleRouteChange);


setRenderer(render, container, App);

render(App(), container);
