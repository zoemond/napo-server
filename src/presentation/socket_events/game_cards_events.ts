import socketIO from "socket.io";
import Card from "~/domain/Card";
import { readSeats } from "../uc/seats_uc";
import { judgeWinnerIfLapEnds } from "../uc/lap_end_uc";
import { playCard } from "../uc/play_cards_uc";

export function setReadSeatsEvent(socket: socketIO.Socket): void {
  socket.on("read_seats", async (readSeatsRequests) => {
    const { gameTableId } = readSeatsRequests[0]; //一つ送ってもArrayになるので

    const seatsResponse = await readSeats(gameTableId);
    socket.emit("seats", seatsResponse);
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
