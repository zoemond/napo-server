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
     * ----------------
     * # 絵札回収のリクエストをクライアントが行うとことを考える。
     * ## 誰が行うかが問題になる
     * - クライアントがそれぞれでリクエストを行う場合
     *   → 5回のリクエストを受け取ることになる
     * - 1つのクライアントがリクエストを行う場合
     *   → エラーハンドリングが難しそう
     *   → 絵札回収のリクエスト失敗後, 離席などのUC
     *
     * # 絵札回収をサーバで判断して行う事を考える。
     * - 現在のようにクライアントの状態を考慮してイベントをemitすることになる
     *   → クライアントの状態はクライアントで制御したい
     *
     * # 解決案
     * - 絵札回収はサーバで判断して行う
     * - クライアントは何周目かを明示してカード取得リクエストを投げる
     * - サーバはその週目のカードを返すようにする
     * ## 問題点
     * 1. 上記案を実現するためにはテーブル(DBの)に週目の概念をもたせる必要がある
     * 2. クライアントの要求によってDBの構造を変化させている。いい気がするけどめずらいので気になる。
     */
    // 5人のカードが出揃う状態にする
    io.emit("seats", seatsResponse);
    // 勝敗を決定して絵札を回収する
    judgeWinnerIfLapEnds(gameTableId);
  });
}
