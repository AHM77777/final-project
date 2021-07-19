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

A technology to allow realtime communication between clients, using a simple library called Socket.io we are going to implement this through a live chat web application.

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

With the previous code, a server will be up and running serving files from the public directory. There are 2 HTML files already there that will be served, we will just go back to chat.html later to check how mustache works.
