import socketIO from "socket.io";
import { GameCardsResponse } from "../response/GameCardsResponse";
import GameCardsRepository from "@/repository/GameCardsRepository";
import HandOuter from "@/domain/HandOuter";
import Card from "@/domain/Card";
import { SeatName } from "@/domain/Seat";

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
    console.error("error", error);
    return { errorMessage: error.message };
  }

  return readGameCards(gameTableId);
}

async function playCard(
  gameTableId: number,
  seat: SeatName,
  card: Card
): Promise<void> {
  try {
    const gameCards = await gameCardsRepository.get(gameTableId);
    const hands = gameCards[seat].filter((c) => c.toStr() !== card.toStr());
    const fieldCards = [...gameCards.fieldCards, card];

    await gameCardsRepository.playCard(gameTableId, fieldCards, seat, hands);
  } catch (error) {
    console.error(error);
  }
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
export function setPlayCardEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("play_card", async (playCardRequests) => {
    const { gameTableId, seat, card } = playCardRequests[0]; //一つ送ってもArrayになるので

    await playCard(gameTableId, seat, new Card(card.suit, card.number));
    const response = await readGameCards(gameTableId);
    io.emit("game_cards", response);
  });
}
