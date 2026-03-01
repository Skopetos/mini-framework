import { createElement, render, setRenderer, createState, createRouter, navigate, getCurrentView } from '../framework/index.js';

const { getState, setState } = createState({
    todos: [],
    filter: 'all', // 'all', 'active', 'completed'
    editing: null,
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
    const { editing } = getState();
    const isEditing = editing === todo.id;

    const save = (e) => {
        const newTitle = e.target.value.trim();
        if (newTitle) {
            const todos = getState().todos.map(t =>
                t.id === todo.id ? { ...t, title: newTitle } : t
            );
            setState({ todos, editing: null });
        } else {
            const todos = getState().todos.filter(t => t.id !== todo.id);
            setState({ todos, editing: null });
        }
    };

    const cancel = () => {
        setState({ editing: null });
    };

    return {
        tag: 'li',
        attrs: {
            class: `${todo.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`,
        },
        children: [
            {
                tag: 'div',
                attrs: {
                    class: 'view',
                },
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
                    {
                        tag: 'label',
                        attrs: {
                            ondblclick: () => {
                                setState({ editing: todo.id });
                            },
                        },
                        children: [todo.title],
                    },
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
            isEditing && {
                tag: 'input',
                attrs: {
                    class: 'edit',
                    value: todo.title,
                    onkeydown: (e) => {
                        if (e.key === 'Enter') save(e);
                        if (e.key === 'Escape') cancel();
                    },
                    onblur: save,
                    autofocus: true,
                },
            },
        ].filter(Boolean),
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
    const completedCount = todos.length - itemsLeft;

    const clearCompletedButton = completedCount > 0 ? {
        tag: 'button',
        attrs: {
            class: 'clear-completed',
            onclick: () => {
                const newTodos = getState().todos.filter(todo => !todo.completed);
                setState({ todos: newTodos });
            },
        },
        children: ['Clear completed'],
    } : null;

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
            clearCompletedButton,
        ].filter(Boolean),
    };
}


function App() {
    const { todos } = getState();
    const todoList = todos.length > 0 ? TodoList() : null;
    const footer = todos.length > 0 ? Footer() : null;

    return {
        tag: 'div',
        attrs: { class: 'todoapp' },
        children: [
            Header(),
            todoList,
            footer,
        ].filter(Boolean),
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
        setState({ filter: 'active' }, false);
    } else if (hash === '#/completed') {
        setState({ filter: 'completed' }, false);
    } else {
        setState({ filter: 'all' }, false);
    }
}

window.addEventListener('hashchange', handleRouteChange);


setRenderer(render, container, App);

render(App(), container);
