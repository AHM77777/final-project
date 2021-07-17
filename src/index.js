const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const public_dir_path = path.join(__dirname, '../public');

app.use('/', express.static(public_dir_path));

io.on('connection', socket => {
    console.log('New WebSocket connection');

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            ...options
        });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage({
            username: 'Admin',
            text: 'Welcome!'
        }));

        socket.broadcast.to(user.room).emit('message', generateMessage({
            username: 'Admin',
            text: `${user.username} has joined!`
        }));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            callback('Profanity is not allowed!');
        }

        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage({
            username: user.username,
            text: message
        }));
        callback();
    });

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateMessage({
            username: user.username,
            text: `https://google.com/maps?q=${position.latitude},${position.longitude}`
        }));
        callback();
    });

    socket.on('disconnect', () => {
        const removedUser = removeUser(socket.id);
        if (removedUser) {
            io.to(removedUser.room).emit('message', generateMessage({
                username: 'Admin',
                text: `${removedUser.username} has left the chat!`
            }));
            io.to(removedUser.room).emit('roomData', {
                room: removedUser.room,
                users: getUsersInRoom(removedUser.room)
            });
        }
    });
});

server.listen(port);