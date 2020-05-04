import socketIO from "socket.io";
import { SeatsResponse } from "../response/SeatsResponse";
import GameCardsRepository from "@/repository/GameCardsRepository";
import HandOuter from "@/domain/HandOuter";
import Card from "@/domain/Card";
import { SeatName } from "@/domain/SeatName";

const gameCardsRepository = new GameCardsRepository();

async function readSeats(gameTableId: number): Promise<SeatsResponse> {
  try {
    const seats = await gameCardsRepository.getSeats(gameTableId);
    return { gameTableId, seats };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

export async function startTurn(gameTableId: number): Promise<SeatsResponse> {
  try {
    const turn = await gameCardsRepository.getTurn(gameTableId);
    const handOutCards = new HandOuter().handOut();
    await gameCardsRepository.startTurn(
      gameTableId,
      turn.turnCount,
      handOutCards
    );
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
    const seats = await gameCardsRepository.getSeats(gameTableId);
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

export function setStartTurnEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("start_turn", async (startTurnRequests) => {
    const { gameTableId } = startTurnRequests[0]; //一つ送ってもArrayになるので
    const seatsResponse = await startTurn(gameTableId);
    io.emit("seats", seatsResponse);
  });
}

export function setReadCardsEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("read_seats", async (handOutRequests) => {
    const { gameTableId } = handOutRequests[0]; //一つ送ってもArrayになるので

    const seatsResponse = await readSeats(gameTableId);
    io.emit("seats", seatsResponse);
  });
}

export function setPlayCardEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("play_card", async (playCardRequests) => {
    const { gameTableId, seat, card } = playCardRequests[0]; //一つ送ってもArrayになるので

    await playCard(gameTableId, seat, new Card(card.suit, card.number));
    const seatsResponse = await readSeats(gameTableId);
    io.emit("seats", seatsResponse);
  });
}
