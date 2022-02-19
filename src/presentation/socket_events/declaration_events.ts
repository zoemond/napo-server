import socketIO from "socket.io";
import Card from "~/domain/Card";
import { readSeats } from "../uc/seats_uc";
import { declareTrump, getDeclaration } from "../uc/declaration_uc";
import { openPair } from "../uc/open_uc";

export function setDeclareTrumpEvent(
  socket: socketIO.Socket,
  io: socketIO.Server
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

export function setOpenPairEvent(
  socket: socketIO.Socket,
  io: socketIO.Server
): void {
  socket.on("open", async (openRequests) => {
    const { gameTableId } = openRequests[0]; //一つ送ってもArrayになるので
    const roundResponse = await openPair(gameTableId);
    io.emit("round", roundResponse);
  });
}
export function setReadDeclarationEvent(socket: socketIO.Socket): void {
  socket.on("read_declaration", async (readSeatsRequests) => {
    const { gameTableId } = readSeatsRequests[0]; //一つ送ってもArrayになるので

    const declarationResponse = await getDeclaration(gameTableId);
    socket.emit("declaration", declarationResponse);
  });
}
