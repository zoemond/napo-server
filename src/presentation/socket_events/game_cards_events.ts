import socketIO from "socket.io";
import { SeatsResponse } from "../response/SeatsResponse";
import GameCardsRepository from "~/repository/GameCardsRepository";
import HandOuter from "~/domain/HandOuter";
import Card from "~/domain/Card";
import { SeatName } from "~/domain/SeatName";
import { Policy } from "~/domain/Policy";
import DeclarationRepository from "~/repository/DeclarationRepository";
import { LapSeat } from "~/domain/LapSeat";
import { TurnResponse } from "../response/TurnResponse";

const gameCardsRepository = new GameCardsRepository();
const declarationRepository = new DeclarationRepository();

async function getTurn(gameTableId: number): Promise<TurnResponse> {
  try {
    const turn = await gameCardsRepository.getTurn(gameTableId);
    return { gameTableId, turn };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

async function readSeats(gameTableId: number): Promise<SeatsResponse> {
  try {
    const seats = await gameCardsRepository.getSeats(gameTableId);
    return { gameTableId, seats };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

async function open(gameTableId: number): Promise<TurnResponse> {
  try {
    await gameCardsRepository.open(gameTableId);
    const turn = await gameCardsRepository.getTurn(gameTableId);
    return { gameTableId, turn };
  } catch (error) {
    console.error("error", error);
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
    const isFirstPlay = seats.every((seat) => !seat.playCard);
    const hands = seat.hands.filter(
      (hand) => hand.toStr() !== playCard.toStr()
    );
    console.log("hands: ", hands);
    console.log("playCard: ", playCard, playCard.toStr());

    await gameCardsRepository.playCard(
      gameTableId,
      seat.seatName,
      hands,
      playCard,
      isFirstPlay
    );
  } catch (error) {
    console.error(error);
  }
}

async function endLap(gameTableId: number): Promise<void> {
  try {
    const seats = await gameCardsRepository.getSeats(gameTableId);
    const lapSeats = seats
      .filter((s) => s.playCard)
      .map((s) => new LapSeat(s.playCard as Card, s.seatName, s.isFirstPlay));
    if (lapSeats.length < 5) {
      throw new Error(`全員がカードを出していません[seats: ${seats}]`);
    }

    const declaration = await declarationRepository.getDeclaration(gameTableId);
    const winner = new Policy().lapWinner(lapSeats, declaration.trump);

    await gameCardsRepository.endTurn(
      gameTableId,
      winner.seatName,
      seats
        .map((seat) => seat.playCard as Card)
        .filter((card) => card.isFaceCard())
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
    const turnResponse = await getTurn(gameTableId);
    io.emit("seats", seatsResponse);
    io.emit("turn", turnResponse);
  });
}

export function setOpenEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("open", async (openRequests) => {
    const { gameTableId } = openRequests[0]; //一つ送ってもArrayになるので
    const turnResponse = await open(gameTableId);
    io.emit("turn", turnResponse);
  });
}

export function setReadTurnEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("read_turn", async (turnRequests) => {
    const { gameTableId } = turnRequests[0]; //一つ送ってもArrayになるので

    const turnResponse = await getTurn(gameTableId);
    io.emit("turn", turnResponse);
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

export function setEndLapEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("end_lap", async (playCardRequests) => {
    const { gameTableId } = playCardRequests[0]; //一つ送ってもArrayになるので

    await endLap(gameTableId);
    const seatsResponse = await readSeats(gameTableId);
    io.emit("seats", seatsResponse);
  });
}
