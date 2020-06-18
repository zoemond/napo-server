import socketIO from "socket.io";
import GameCardsRepository from "~/repository/GameCardsRepository";
import Card from "~/domain/Card";
import { RoundSuccessResponse } from "../response/RoundResponse";
import { ErrorResponse } from "../response/ErrorResponse";
import { readSeats } from "../uc/seats_uc";
import { getRound, newRound } from "../uc/round_uc";
import { judgeWinnerIfLapEnds } from "../uc/lap_end_uc";
import { getDeclaration } from "../uc/declaration_uc";
import { playCard } from "../uc/play_cards_uc";
import { calculateScore } from "../uc/score_uc";

const gameCardsRepository = new GameCardsRepository();

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

export function setReadSeatsEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("read_seats", async (readSeatsRequests) => {
    const { gameTableId } = readSeatsRequests[0]; //一つ送ってもArrayになるので

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

export function setCalcScoreAndNewRoundEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("calc_score_and_new_round", async (playCardRequests) => {
    const { gameTableId } = playCardRequests[0]; //一つ送ってもArrayになるので
    const round = await gameCardsRepository.getRound(gameTableId);
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
