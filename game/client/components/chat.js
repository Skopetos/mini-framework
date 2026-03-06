import { SOCKET_EVENTS } from '../../shared/constants.js';

export function createChat(messages, socket) {
  return {
    tag: 'div',
    attrs: { class: 'chat-container' },
    children: [
      {
        tag: 'div',
        attrs: { class: 'chat-header' },
        children: ['💬 Chat'],
      },
      {
        tag: 'div',
        attrs: { class: 'chat-messages', id: 'chat-messages' },
        children: messages.map(msg => ({
          tag: 'div',
          attrs: { class: 'chat-message' },
          children: [
            {
              tag: 'span',
              attrs: { class: 'chat-message-nickname' },
              children: [`${msg.nickname}:`],
            },
            { tag: 'span', children: [msg.text] },
          ],
        })),
      },
      {
        tag: 'div',
        attrs: { class: 'chat-input-container' },
        children: [
          {
            tag: 'input',
            attrs: {
              type: 'text',
              class: 'chat-input',
              placeholder: 'Type a message...',
              onkeydown: (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
                    text: e.target.value.trim(),
                  });
                  e.target.value = '';
                }
              },
            },
          },
        ],
      },
    ],
  };
}
