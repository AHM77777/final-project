const socket = io();

// Elements
const $chatForm = document.querySelector('#chat');
const $chatFormInput = $chatForm.querySelector('input');
const $chatFormSubmit = $chatForm.querySelector('button');
const $messages = document.querySelector('#chat-log');

// Options
const options = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Templates
const templates = {message: document.querySelector('#message-template').innerHTML};

socket.on('message', data => {
    addMessage(templates.message, {
        username: data.username,
        message: data.text,
        ts: moment(data.createdAt).format('h:mm a'),
    });
});

$chatForm.addEventListener('submit', e => {
    e.preventDefault();

    if (!$chatFormInput.value) {
        return console.log('Please add a message');
    }

    socket.emit('sendMessage', {text: e.target.elements.message.value, room: options.room}, error => {
      $chatFormInput.value = '';
      $chatFormInput.focus();

      if (error) {
        return console.log(error);
      }
    });
});

// Register new user
socket.emit('join', { username: options.username, room: options.room }, error => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

const addMessage = (template, params = {}) => {
    $messages.insertAdjacentHTML('beforeend', Mustache.render(template, params));
};