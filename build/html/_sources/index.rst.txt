.. websockets-lesson documentation master file, created by
   sphinx-quickstart on Thu Jul 29 13:47:00 2021.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to websockets-lesson's documentation!
=============================================

.. toctree::
   :maxdepth: 2

.. js:autofunction:: generateMessage

.. function:: app.use(path, handle)

Allows registering middlewares for different paths in the instantiated express server.

.. function:: io.on(event, callback: Function<socket> | Function<options, callback>)

React to an event with the logic defined in the callback, which has either a parameter for the socket (in case of opening a connection) or two parameters for the options sent and the post handle actions.

.. function:: io.to(room_name)

Specifies the channel an event will be broadcasted to.

.. function:: socket.join(room_name)

Subscribe a socket to the specified room, so they can share events with the channel.

.. function:: socket.emit(event, handle)

Send an event to the specified socket, so only he can see the content.