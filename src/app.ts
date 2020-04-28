import express from "express";
import path from "path";
import { testQuery } from "@/repository/test";
import * as http from "http";
import socketIO from "socket.io";

const PORT = process.env.PORT || 7000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket: socketIO.Socket) => {
  socket.on("create_game_table", (msg: string) => {
    io.emit("created_game_table", msg);
  });
});

app.get("/", function (req: express.Request, res: express.Response) {
  res.sendFile(path.resolve("index.html"));
});
app.get("/db", function (req: express.Request, res: express.Response) {
  testQuery();
  res.status(200).send("ok");
});

server.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
