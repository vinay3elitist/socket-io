const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile("C:/Users/Admin/Documents/SocketIO/index.html");
});

let nsp = io.of("/my-namespace");

nsp.on("connection", (socket) => {
  console.log("Someone connected");
  nsp.emit("hi", "Hello Everyone!");
});

// let clients = 0;

// io.on("connection", (socket) => {
//   console.log("User connected");

//   // send function on socket object associates the 'message' event
//   // setTimeout(() => {
//   //   socket.send("Sent message after 5 seconds");
//   // }, 5000);

//   // custom event
//   // setTimeout(() => {
//   //   socket.emit('testerEvent', { description: 'A custom event named testerEvent!'});
//   // }, 5000);

//   // client-side event
//   // socket.on('clientEvent', (data) => {
//   //   console.log(data);
//   // });

//   // broadcasting
//   clients++;
//   // send this message to new clients
//   socket.emit('newclientconnect', { description: "Hey, Welcome"});
//   // other clients this message
//   socket.broadcast.emit('newclientconnect', { description: clients + " clients connected!" });

//   // broadcasting to all clients
//   // io.sockets.emit("broadcast", { description: clients + " clients connected!" });

//   socket.on("disconnect", () => {
//     clients--;
//     // io.sockets.emit("broadcast", {
//     //   description: clients + " clients connected!",
//     // });

//     socket.broadcast.emit('newclientconnect', { description: clients + " clients connected!" });
//     console.log("User disconnected");
//   });
// });

http.listen(3000, () => {
  console.log("Server listening on port 3000!");
});
