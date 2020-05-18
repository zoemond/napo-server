import socketIO from "socket.io";
import { SeatsResponse } from "../response/SeatsResponse";
import GameCardsRepository from "~/repository/GameCardsRepository";
import HandOuter from "~/domain/HandOuter";
import Card from "~/domain/Card";
import { SeatName } from "~/domain/SeatName";
import { Policy } from "~/domain/Policy";
import DeclarationRepository from "~/repository/DeclarationRepository";
import { LapSeat } from "~/domain/LapSeat";
import { RoundResponse } from "../response/RoundResponse";

const gameCardsRepository = new GameCardsRepository();
const declarationRepository = new DeclarationRepository();

async function getRound(gameTableId: number): Promise<RoundResponse> {
  try {
    const round = await gameCardsRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

export async function readSeats(gameTableId: number): Promise<SeatsResponse> {
  try {
    const seats = await gameCardsRepository.getSeats(gameTableId);
    return { gameTableId, seats };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

async function open(gameTableId: number): Promise<RoundResponse> {
  try {
    await gameCardsRepository.open(gameTableId);
    const round = await gameCardsRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    console.error("error", error);
    return { errorMessage: error.message };
  }
}

async function handOut(gameTableId: number, roundCount: number): Promise<void> {
  const handOutCards = new HandOuter().handOut();
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "first_seat",
    handOutCards.firstSeat
  );
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "second_seat",
    handOutCards.secondSeat
  );
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "third_seat",
    handOutCards.thirdSeat
  );
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "fourth_seat",
    handOutCards.fourthSeat
  );
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "fifth_seat",
    handOutCards.fifthSeat
  );

  await gameCardsRepository.handOutOpen(
    gameTableId,
    roundCount,
    handOutCards.open
  );
}

export async function newRound(gameTableId: number): Promise<SeatsResponse> {
  try {
    await gameCardsRepository.resetSeatsCards(gameTableId);
    await gameCardsRepository.newRound(gameTableId);
    const roundForHandOut = await gameCardsRepository.getRound(gameTableId);
    await handOut(gameTableId, roundForHandOut.roundCount);
  } catch (error) {
    console.error("error", error);
    return { errorMessage: error.message };
  }

  return readSeats(gameTableId);
}

async function judgeWinnerIfLapEnds(gameTableId: number): Promise<void> {
  try {
    const seats = await gameCardsRepository.getSeats(gameTableId);
    const lapSeats = seats
      .filter((s) => s.playCard)
      .map(
        (s) => new LapSeat(s.playCard as Card, s.seatName, s.isLastLapWinner)
      );

    const isLapEnd = lapSeats.length === 5;
    if (!isLapEnd) {
      return;
    }

    const round = await gameCardsRepository.getRound(gameTableId);
    const declaration = await declarationRepository.getDeclaration(
      gameTableId,
      round.roundCount
    );
    const winner = new Policy().lapWinner(lapSeats, declaration.trump);

    await gameCardsRepository.setFaceCards(
      gameTableId,
      winner.seatName,
      seats
        .map((seat) => seat.playCard as Card)
        .filter((card) => card.isFaceCard())
    );
    await gameCardsRepository.resetPlayCards(gameTableId);
  } catch (error) {
    console.error(error);
  }
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
    const hands = seat.hands.filter((hand) => !hand.equals(playCard));

    await gameCardsRepository.playCard(
      gameTableId,
      seat.seatName,
      hands,
      playCard
    );

    await judgeWinnerIfLapEnds(gameTableId);
  } catch (error) {
    console.error(error);
  }
}
export function setStartRoundEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("start_round", async (startRoundRequests) => {
    const { gameTableId } = startRoundRequests[0]; //一つ送ってもArrayになるので
    const seatsResponse = await newRound(gameTableId);
    const roundResponse = await getRound(gameTableId);
    io.emit("seats", seatsResponse);
    io.emit("round", roundResponse);
  });
}

export function setOpenEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("open", async (openRequests) => {
    const { gameTableId } = openRequests[0]; //一つ送ってもArrayになるので
    const roundResponse = await open(gameTableId);
    io.emit("round", roundResponse);
  });
}

export function setReadRoundEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("read_round", async (roundRequests) => {
    const { gameTableId } = roundRequests[0]; //一つ送ってもArrayになるので

    const roundResponse = await getRound(gameTableId);
    io.emit("round", roundResponse);
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
    const { gameTableId, seatName, card } = playCardRequests[0]; //一つ送ってもArrayになるので

    await playCard(gameTableId, seatName, Card.fromObj(card));
    const seatsResponse = await readSeats(gameTableId);
    io.emit("seats", seatsResponse);
  });
}
