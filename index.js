const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Running");
});
let numUsers = 0;
io.on("connection", (socket) => {
  // when the client emits 'add user', this listens and executes
  socket.on("add user", (username) => {
    let addedUser = false;
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit("login", {
      numUsers: numUsers,
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit("user joined", {
      username: socket.username,
      numUsers: numUsers,
    });
  });

  socket.on("typing", () => {
    console.log(socket.username, "typing");
    socket.broadcast.emit("typing", {
      username: socket.username,
      value: "typing...",
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", {
      username: socket.username,
    });
  });
  socket.on("disconnect", () => {
    // echo globally that this client has left
    socket.broadcast.emit("user left", {
      username: socket.username,
      numUsers: numUsers,
    });
  });
  socket.on("new message", (data) => {
    console.log(socket.username, data, "hi");
    socket.broadcast.emit("new message", {
      username: socket.username,
      value: data,
      self: false,
    });
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
