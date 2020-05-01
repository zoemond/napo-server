import socketIO from "socket.io";
import { GameCardsResponse } from "../response/GameCardsResponse";
import GameCardsRepository from "@/repository/GameCardsRepository";
import HandOuter from "@/domain/HandOuter";

const gameCardsRepository = new GameCardsRepository();

async function readGameCards(gameTableId: number): Promise<GameCardsResponse> {
  try {
    const gameCards = await gameCardsRepository.get(gameTableId);
    return { gameCards };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

export async function handOutCards(
  gameTableId: number
): Promise<GameCardsResponse> {
  try {
    const gameCards = new HandOuter().handOut(gameTableId);
    await gameCardsRepository.handOut(gameCards);
  } catch (error) {
    console.log("error", error);

    return { errorMessage: error.message };
  }

  return readGameCards(gameTableId);
}

export function setReadCardsEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("read_cards", async (handOutRequests) => {
    const gameTableId = handOutRequests[0]; //一つ送ってもArrayになるので

    const response = await readGameCards(gameTableId);
    io.emit("game_cards", response);
  });
}
