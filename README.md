# Web sockets and real time event-based communication

## Objectives

The idea here is that you learn how to use websockets to create live communications between client-server through the creation of a small web application.

Along with this, you will learn how to configure an static HTTP server with Node.js.

Here are the things that will be done in this task:

- Setup a static HTTP server with Express.
- Learn how to implement a websockets in Node.
- Create a simple real-time live chat.
- Learn how to add dynamic templates through mustache.

## Web Sockets

A technology to allow realtime communication between client and server, using a simple library called Socket.io we are going to implement this through a live chat web application.

Web sockets use a method of communication known as Full-duplex (which allows bidirectional messaging) through a single TCP connection, which allows a lower overhead communication, resulting in real-time response from events.

## Before you begin

This repo includes two brances: master and template, for this assignment we are going to work with template. Fork this repo and clone your fork into the desired location, make sure to switch to the required branch before starting with the task.

Once the repo is cloned and ready, install all required npm packages. Also, make sure that the final file structure looks something like this:

- node_modules/ (auto-generated)
- public/
  - css/
    - styles.css
  - img/
    - favicon.png
  - js/
    - chat.js
  - chat.html
  - index.html
- src/
  - utils/
    - messages.js
    - users.js
  - index.js
- package.json (already included)

# Static server creation

To begin we need to create ensure the server can serve static files from a folder, so head to the index.js file and add the following code:

```
/* Import required packages */
const path = require('path');
const http = require('http');
const express = require('express');

/* Create server */
const app = express();
const server = http.createServer(app);

/* Configure port server and set public directory */
const port = process.env.PORT || 3000;
const public_dir_path = path.join(__dirname, '../public');

app.use('/', express.static(public_dir_path));

/* Start server */
server.listen(port);
```

With the previous code, a server will be up and running serving files from the public directory. There are 2 HTML files already there that will be served, we will just go back to _chat.html_ later to check how _mustache_ works.

## Open a websocket

Implement the following code between the module import statements and the **port.listen()** call:

```

// Code

io.on('connection', socket => {
    console.log('New WebSocket connection');
});

// Code

```

We use there the method on() to start a connection with a web socket, this will allow our server send and receive events in real time, thus allowing the real-time communication we are looking for.

## React to events

We use the method on() to receive events and perform actions in the server based on their type. The method has two arguments: a string that tells the event type to communication, and a callback with a reference to the socket used.

Any action to be performed must be added inside the initial **connection** event so they can all be used within the same context.

If we wanted to close a connection, we should add a call to on() using the event _disconnect_:

```
// Code

io.on('connection', socket => {
  console.log('New Websocket connection');

  io.on('disconnect', () => {});
});

// Code

```

As you can see, we didn't added the socket in the callback for _disconnect_, that's because it wasn't needed since it is being passed from the initial _connection_!

## Subscribe to channels

We now are able to react to events in our server, but how are we going to tell the clients whenever stuff happens? For that we need to emit events that we are going to react to in the front-end through a simple library (we are checking that in a moment).

Connections need to be subscribed to channels in order to receive and send messages with the server, for that we are going to use the following code:

```
// Code

io.on('connection', socket => {

  socket.on('join', (options, callback) => {
    socket.join(options.room);
  });

  // Code
});

// Code

```

Using the method _join()_ we can specify the current room a socket will be subscribed to, and they can be changed at any time as needed by calling it again.

Here we wait for an event called _join_ from the client that will include the room name required to join the socket to. We are going to check how this is sent later.

## Send events

Once the socket is subscribed to a channel we can start sending and receiving events from it. There are multiple ways events can be send to the clients based on the target audience.

Let's suppose we are trying to greet the user that just connected through a message in screen. If we wanted only the current socket to see the message, we would do it like this:

```
// Code

const generateMessage = data => {
  return {
    username: data.username,
    text: data.text,
    createdAt: new Date().getTime()
  }
};

io.on('connection', socket => {
  socket.join('room_name');

  socket.emit('message', generateMessage({
    username: 'Admin',
    text: 'Welcome!'
  }));

  // Code
});

// Code

```

For now let's assume we have an event already defined in the client-side for receiving messages.

With this we would be able to receive the event with the required data in the client, and print the message on screen.

## React to events in client side

Since we just communicated a message with the client we need a way to act on the sent event.

Open the file public/js/chat.js and add the following code to it:

```
const socket = io();

const $chatForm = document.querySelector('#chat');
const $chatFormInput = $chatForm.querySelector('input');
const $chatFormSubmit = $chatForm.querySelector('button');
const $messages = document.querySelector('#chat-log');

// Templates
const templates = {
    message: document.querySelector('#message-template').innerHTML,
    sidebar: document.querySelector('#sidebar-template').innerHTML,
};

socket.on('message', data => {
    addMessage(templates.message, {
        username: data.username,
        message: data.text,
        ts: moment(data.createdAt).format('h:mm a'),
    });
});

// Register new user, this is the event used in the server to join the client to a room!
// As you can see, it sends two parameters: the username and the user room.
// Both values are retrieved using the Qs library.
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.emit('join', { username, room }, error => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

const addMessage = (template, params = {}) => {
    $messages.insertAdjacentHTML('beforeend', Mustache.render(template, params));
};

```

In the page chat.html you can see we are using multiple scripts to accomplish printing the message seen on screen:

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/3.0.1/mustache.min.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script src="/js/chat.js"></script>
```

And the code reacts to the event sent by the server through the method socket.on(), with this we tell the browser to print the message sent to the screen.

With this we now know how to open a connection through websockets, how to send and receive events from the server and the client.

But this barely allows the users do anything, what if they want to send messages between each other?

## Broadcasting messages

Right now we are just greeting the user whenever they get in, we need to receive their messages and send them to our server so all other sockets in their channel can see them.

For that we first need to emit an event. In chat.js add the following code:

```
// Code

$chatForm.addEventListener('submit', e => {
    e.preventDefault();

    if (!$chatFormInput.value) {
        return console.log('Please add a message');
    }

    socket.emit('sendMessage', e.target.elements.message.value, error => {
      $chatFormInput.value = '';
      $chatFormInput.focus();

      if (error) {
        return console.log(error);
      }
    });
});

// Code
```

The above code will use the identifiers already declared for the chat form elements, retrieve the message added by the client and send it through an emmited _sendMessage_ event, which will be catched by the server to prepare the message required for every other socket in the channel.

We now need to open the index.js file and add the following event to react on the message sent:

```
// Code



// Code

```
