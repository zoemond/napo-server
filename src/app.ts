import * as http from "http";
import socketIO from "socket.io";
import express from "express";
import * as wsGameTableEvents from "~/presentation/socket_events/game_tables_events";
import * as wsGameCardsEvents from "~/presentation/socket_events/game_cards_events";
import * as wsDeclarationEvents from "~/presentation/socket_events/declaration_events";
import * as wsRoundEndsEvents from "~/presentation/socket_events/round_ends_events";

const PORT = process.env.PORT || 7000;
const app = express();

app.use(express.static(process.env.CLIENT_DIR));

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket: socketIO.Socket) => {
  wsGameTableEvents.setCreateGameTableEvent(socket, io);
  wsGameTableEvents.setReadGameTablesEvent(socket, io);
  wsGameTableEvents.setSitDownEvent(socket, io);
  wsGameCardsEvents.setReadRoundEvent(socket, io);
  wsGameCardsEvents.setStartRoundEvent(socket, io);
  wsGameCardsEvents.setReadSeatsEvent(socket, io);
  wsGameCardsEvents.setPlayCardEvent(socket, io);
  wsGameCardsEvents.setCalcScoreAndNewRoundEvent(socket, io);
  wsDeclarationEvents.setDeclareTrumpEvent(socket, io);
  wsDeclarationEvents.setOpenPairEvent(socket, io);
  wsRoundEndsEvents.setCompleteRoundEvent(socket, io);
});

server.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
