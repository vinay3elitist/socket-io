const express = require("express");
const { createServer } = require("http");
const { join } = require("path");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { availableParallelism } = require("os");
const cluster = require("cluster");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");
require("dotenv").config();

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: 3000 + i,
    });
  }

  return setupPrimary();
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const messageSchema = new mongoose.Schema({
    clientOffset: { type: String, unique: true },
    content: String,
  });

  const Message = mongoose.model("Message", messageSchema);

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    adapter: createAdapter(),
  });

  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
  });

  io.on("connection", async (socket) => {
    console.log("Connection established");
    socket.on("chat-message", async (chatMsg, clientOffset, callback) => {
      let message;
      try {
        message = new Message({ content: chatMsg, clientOffset });
        await message.save();
      } catch (error) {
        if (error.code === 11000) {
          callback();
        } else {
          console.error(error);
        }
        return;
      }
      io.emit("chat-message", chatMsg, message._id);
      callback();
    });

    if (!socket.recovered) {
      try {
        const messages = await Message.find({
          id: {
            $gt: socket.handshake.auth.serverOffset || 0,
          },
        }).exec();
        messages.forEach((message) => {
          socket.emit("chat-message", message.content, message._id);
        });
      } catch (error) {
        console.log(error);
      }
    }
  });

  server.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
  });
}

main();
