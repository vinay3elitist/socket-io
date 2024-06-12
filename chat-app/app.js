const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {}
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log("Connection established");

    socket.on('chat-message', (chatMsg) => {
        io.emit('chat-message', chatMsg);
    })

    socket.on('disconnect', () => {
        console.log("Connection closed");
    })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});