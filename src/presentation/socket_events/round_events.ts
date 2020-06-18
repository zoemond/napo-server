import socketIO from "socket.io";
import { getRound, newRound } from "../uc/round_uc";
import { readSeats } from "../uc/seats_uc";
import { calculateScore } from "../uc/score_uc";
import RoundRepository from "~/repository/RoundRepository";

const roundRepository = new RoundRepository();

export function setStartRoundEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("start_round", async (startRoundRequests) => {
    const { gameTableId } = startRoundRequests[0]; //一つ送ってもArrayになるので
    const roundResponse = await newRound(gameTableId);
    const seatResponse = await readSeats(gameTableId);
    io.emit("round", roundResponse);
    io.emit("seats", seatResponse);
    io.emit("declaration", { gameTableId });
  });
}

export function setReadRoundEvent(socket: socketIO.Socket): void {
  socket.on("read_round", async (roundRequests) => {
    const { gameTableId } = roundRequests[0]; //一つ送ってもArrayになるので

    const roundResponse = await getRound(gameTableId);
    socket.emit("round", roundResponse);
  });
}

export function setCalcScoreAndNewRoundEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("calc_score_and_new_round", async (playCardRequests) => {
    const { gameTableId } = playCardRequests[0]; //一つ送ってもArrayになるので
    const round = await roundRepository.getRound(gameTableId);
    const roundCount = round.roundCount;
    if (roundCount !== 0) {
      await calculateScore(gameTableId, roundCount);
    }
    const roundResponse = await newRound(gameTableId);
    const seatResponse = await readSeats(gameTableId);
    io.emit("round", roundResponse);
    io.emit("seats", seatResponse);
    io.emit("declaration", { gameTableId });
  });
}
