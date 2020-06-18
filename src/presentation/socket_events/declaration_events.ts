import socketIO from "socket.io";
import Card from "~/domain/Card";
import { readSeats } from "../events/seats_events";
import { declareTrump } from "../events/declaration_events";

export function setDeclareTrumpEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("declare_trump", async (declareRequests) => {
    const {
      gameTableId,
      trump,
      faceCardNumber,
      aideCard,
      napoleon,
      discards,
    } = declareRequests[0]; //一つ送ってもArrayになるので

    const declarationResponse = await declareTrump(
      gameTableId,
      trump,
      faceCardNumber,
      Card.fromObj(aideCard),
      napoleon,
      discards.map(Card.fromObj)
    );
    io.emit("declaration", declarationResponse);

    // TODO: 責任が分離しないようにうまくやる
    const seatsResponse = await readSeats(gameTableId);
    io.emit("seats", seatsResponse);
  });
}
