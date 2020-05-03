import * as http from "http";
import socketIO from "socket.io";
import * as wsGameTableEvents from "@/presentation/socket_events/game_tables_events";
import * as wsGameCardsEvents from "@/presentation/socket_events/game_cards_events";

const PORT = process.env.PORT || 7000;
const server = http.createServer();
const io = socketIO(server);

io.on("connection", (socket: socketIO.Socket) => {
  wsGameTableEvents.setCreateGameTableEvent(socket, io);
  wsGameTableEvents.setReadGameTablesEvent(socket, io);
  wsGameTableEvents.setSitDownEvent(socket, io);
  wsGameCardsEvents.setReadCardsEvent(socket, io);
  wsGameCardsEvents.setPlayCardEvent(socket, io);
});

server.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
