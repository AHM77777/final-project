const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const public_dir_path = path.join(__dirname, '../public');

app.use('/', express.static(public_dir_path));

io.on('connection', socket => {
    console.log('New WebSocket connection');

    socket.on('join', (options, callback) => {
        socket.join(options.room);

        callback();
    });

    socket.emit('message', generateMessage({
        username: 'Admin',
        text: 'Welcome!'
    }));

    io.on('disconnection', socket => {
        console.log(socket.id + ' left the chat');
    });
});

const generateMessage = data => {
    return {
      username: data.username,
      text: data.text,
      createdAt: new Date().getTime()
    }
  };

server.listen(port);