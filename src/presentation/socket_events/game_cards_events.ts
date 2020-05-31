import socketIO from "socket.io";
import { SeatsResponse } from "../response/SeatsResponse";
import GameCardsRepository from "~/repository/GameCardsRepository";
import HandOuter from "~/domain/HandOuter";
import Card from "~/domain/Card";
import { SeatName } from "~/domain/SeatName";
import { Policy } from "~/domain/Policy";
import DeclarationRepository from "~/repository/DeclarationRepository";
import { RoundResponse, RoundSuccessResponse } from "../response/RoundResponse";
import { getDeclaration } from "~/presentation/socket_events/declaration_events";
import { ErrorResponse } from "../response/ErrorResponse";
import MyGameSight from "~/domain/MyGameSight";

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

export async function newRound(gameTableId: number): Promise<RoundResponse> {
  try {
    await gameCardsRepository.resetSeatsCards(gameTableId);
    await gameCardsRepository.newRound(gameTableId);
    const roundForHandOut = await gameCardsRepository.getRound(gameTableId);
    await handOut(gameTableId, roundForHandOut.roundCount);
    const round = await gameCardsRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    console.error("error", error);
    return { errorMessage: error.message };
  }
}

async function judgeWinnerIfLapEnds(gameTableId: number): Promise<void> {
  try {
    const seats = await gameCardsRepository.getSeats(gameTableId);
    const lapSeats = seats.filter((s) => s.playCard).map((s) => s.toLapSeat());

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

    const faceCards = seats
      .map((seat) => seat.playCard as Card)
      .filter((card) => card.isFaceCard());
    if (faceCards.length > 0) {
      await gameCardsRepository.setFaceCards(
        gameTableId,
        winner.seatName,
        faceCards
      );
    }
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
    const myGameSight = new MyGameSight(seat.seatName, seats);
    if (!myGameSight.isMyTurn()) {
      throw new Error(
        `[seatName: ${seatName}]の手番ではありません。手札を切ったあとすぐにカードをクリックした可能性があります`
      );
    }
    const hands = seat.hands.filter((hand) => !hand.equals(playCard));
    await gameCardsRepository.playCard(
      gameTableId,
      seat.seatName,
      hands,
      playCard
    );
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
    const roundResponse = await newRound(gameTableId);
    const seatResponse = await readSeats(gameTableId);
    io.emit("round", roundResponse);
    io.emit("seats", seatResponse);
    io.emit("declaration", { gameTableId });
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
    if ((roundResponse as ErrorResponse).errorMessage) {
      return;
    }
    // いくつかのクライアントはroundCountがいつ変化するかを知らないので教える
    const declarationResponse = await getDeclaration(
      gameTableId,
      (roundResponse as RoundSuccessResponse).round.roundCount
    );
    io.emit("declaration", declarationResponse);
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
    /**
     * TODO: 状態の更新がどこでどのタイミングで行われるか不明瞭
     * どんなときに クライアント・サーバ, ブロードキャスト・普通のレスポンスどちらが行うか、
     * せめてルールを決める必要がある
     */
    // 5人のカードが出揃う状態にする
    io.emit("seats", seatsResponse);
    // 勝敗を決定して絵札を回収する
    judgeWinnerIfLapEnds(gameTableId);
  });
}
