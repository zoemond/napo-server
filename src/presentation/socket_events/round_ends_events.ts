import socketIO from "socket.io";
import GameCardsRepository from "~/repository/GameCardsRepository";
import { RoundResponse } from "../response/RoundResponse";

const gameCardsRepository = new GameCardsRepository();

async function getRound(gameTableId: number): Promise<RoundResponse> {
  try {
    const round = await gameCardsRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

async function completeRound(gameTableId: number): Promise<RoundResponse> {
  try {
    const round = await gameCardsRepository.getRound(gameTableId);
    await gameCardsRepository.completeRound(gameTableId, round.roundCount);
    return { gameTableId, round };
  } catch (error) {
    console.error("error", error);
    return { errorMessage: error.message };
  }
}

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
