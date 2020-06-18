import socketIO from "socket.io";
import { getRound, completeRound } from "../uc/round_uc";

export function setCompleteRoundEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("complete_round", async (startRoundRequests) => {
    const { gameTableId } = startRoundRequests[0]; //一つ送ってもArrayになるので
    await completeRound(gameTableId);
    const roundResponse = await getRound(gameTableId);
    io.emit("round", roundResponse);
  });
}
