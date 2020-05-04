import socketIO from "socket.io";
import { SeatsResponse } from "../response/SeatsResponse";
import GameCardsRepository from "@/repository/GameCardsRepository";
import HandOuter from "@/domain/HandOuter";
import Card from "@/domain/Card";
import { SeatName } from "@/domain/SeatName";

const gameCardsRepository = new GameCardsRepository();

async function readSeats(gameTableId: number): Promise<SeatsResponse> {
  try {
    const seats = await gameCardsRepository.get(gameTableId);
    return { seats };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

export async function handOut(gameTableId: number): Promise<SeatsResponse> {
  try {
    const handOutCards = new HandOuter().handOut();
    await gameCardsRepository.handOut(gameTableId, handOutCards);
  } catch (error) {
    console.error("error", error);
    return { errorMessage: error.message };
  }

  return readSeats(gameTableId);
}

async function playCard(
  gameTableId: number,
  seatName: SeatName,
  playCard: Card
): Promise<void> {
  try {
    const seats = await gameCardsRepository.get(gameTableId);
    const seat = seats.find((s) => s.seatName === seatName);
    if (!seat) {
      throw new Error(`席を取得できませんでした[seatName: ${seatName}]`);
    }
    const hands = seat.hands.filter(
      (hand) => hand.toStr() !== playCard.toStr()
    );

    await gameCardsRepository.playCard(
      gameTableId,
      playCard,
      seat.seatName,
      hands
    );
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

    const response = await readSeats(gameTableId);
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
    const response = await readSeats(gameTableId);
    io.emit("game_cards", response);
  });
}
