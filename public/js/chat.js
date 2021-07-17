const socket = io();

// Elements
const $chatForm = document.querySelector('#chat');
const $chatFormInput = $chatForm.querySelector('input');
const $chatFormSubmit = $chatForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#chat-log');

// Templates
const templates = {
    message: document.querySelector('#message-template').innerHTML,
    locationMessage: document.querySelector('#location-message-template').innerHTML,
    sidebar: document.querySelector('#sidebar-template').innerHTML,
};

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far I have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight >= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', data => {
    addMessage(templates.message, {
        username: data.username,
        message: data.text,
        ts: moment(data.createdAt).format('h:mm a'),
    });
});

socket.on('locationMessage', data => {
    addMessage(templates.locationMessage, {
        username: data.username,
        url: data.text,
        ts: moment(data.createdAt).format('h:mm a'),
     });
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(templates.sidebar, {
        room,
        users,
    });
    document.querySelector('#sidebar').innerHTML = html;
});

$chatForm.addEventListener('submit', e => {
    e.preventDefault();

    if (!$chatFormInput.value) {
        return console.log('Please add a message');
    }

    lockButton($chatFormSubmit)
    socket.emit('sendMessage', e.target.elements.message.value, error => {
        unlockButton($chatFormSubmit);
        $chatFormInput.value = '';
        $chatFormInput.focus();

        if (error) {
            return console.log(error);
        }
    });
});

$sendLocationButton.addEventListener('click', e => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported bt your browser.');
    }

    lockButton($sendLocationButton);
    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, error => {
            if (error) {
                return console.log(error);
            }

            unlockButton($sendLocationButton);
        });
    });
});

// Register new user
socket.emit('join', { username, room }, error => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

const lockButton = button => button.setAttribute('disabled', true);

const unlockButton = button => button.removeAttribute('disabled', true);

const addMessage = (template, params = {}) => {
    $messages.insertAdjacentHTML('beforeend', Mustache.render(template, params));
    autoScroll();
};