import * as http from "http";
import socketIO from "socket.io";
import express from "express";
import * as wsGameTableEvents from "@/presentation/socket_events/game_tables_events";
import * as wsGameCardsEvents from "@/presentation/socket_events/game_cards_events";
import * as wsDeclarationEvents from "@/presentation/socket_events/declaration_events";

const PORT = process.env.PORT || 7000;
const app = express();

app.use(express.static(process.env.CLIENT_DIR));

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket: socketIO.Socket) => {
  wsGameTableEvents.setCreateGameTableEvent(socket, io);
  wsGameTableEvents.setReadGameTablesEvent(socket, io);
  wsGameTableEvents.setSitDownEvent(socket, io);
  wsGameCardsEvents.setReadTurnEvent(socket, io);
  wsGameCardsEvents.setOpenEvent(socket, io);
  wsGameCardsEvents.setStartTurnEvent(socket, io);
  wsGameCardsEvents.setReadCardsEvent(socket, io);
  wsGameCardsEvents.setPlayCardEvent(socket, io);
  wsDeclarationEvents.setDeclarationEvent(socket, io);
  wsDeclarationEvents.setDeclareTrumpEvent(socket, io);
});

server.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
