const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
// /https://personal-chat-be.herokuapp.com/
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
let alluser = [];
io.on("connection", (socket) => {
  socket.emit("myid", socket.id);
  socket.on("new-join", (data) => {
    alluser.push(data);

    //socket.emit("All-user", alluser);
    // io.sockets.emit("message", msg);
    io.sockets.emit("All-user", alluser);
  });
  socket.on("New-mesage", (data) => {
    console.log(data);
    io.to(data.to).emit("send-message", {
      from: data.id,
      message: data.message,
      name: data.name,
      sender: false,
    });
  });
  socket.on("disconnect", () => {
    // echo globally that this client has left
    alluser = alluser.filter((s) => s.id !== socket.id);
    socket.broadcast.emit("user left", alluser);
  });
  // when the client emits 'stop typing', we broadcast it to others
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
