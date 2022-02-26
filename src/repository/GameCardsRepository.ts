import db from "./connection";
import Card from "~/domain/Card";
import { SeatName } from "~/domain/SeatName";
import { Seat } from "~/domain/Seat";

const CARD_SEPARATOR = "_";

export default class GameCardsRepository {
  async getSeats(gameTableId: number): Promise<Seat[]> {
    const query = `
    SELECT * 
        FROM seats 
        WHERE game_table_id = ${gameTableId}
        ;`;

    const { rows } = await db.query(
      "SELECT * FROM seats WHERE game_table_id = $1",
      [gameTableId],
    )
    if (!rows) {
      throw new Error(
        `カードを取得できませんでした。[game_table_id: ${gameTableId}]`
      );
    }
    return rows.map(
      (seat: any) =>
        new Seat(
          seat.seat_name,
          seat.play_card && Card.fromStr(seat.play_card),
          seat.is_aide,
          seat.is_last_lap_winner,
          this.fromStr(seat.face_cards),
          this.fromStr(seat.hands),
          seat.score
        )
    );
  }

  async playCard(
    gameTableId: number,
    seat: SeatName,
    isAide: boolean,
    hands: Card[],
    playCard: Card
  ): Promise<number> {
    const { rowCount } = await db.query(
      `UPDATE seats SET play_card = $1, is_aide = $2, hands = $3
        WHERE game_table_id = $4 AND seat_name = $5`,
      [playCard.toStr(), isAide, this.toStr(hands), gameTableId, seat],
    )
    return rowCount;
  }

  async setWinner(gameTableId: number, seatName: SeatName): Promise<number> {
    const { rows } = await db.query(
      "UPDATE seats SET is_last_lap_winner = TRUE WHERE game_table_id = $1 AND seat_name = $2",
      [gameTableId, seatName],
    )

    await db.query(
      "UPDATE seats SET is_last_lap_winner = FALSE WHERE game_table_id = $1 AND seat_name != $2",
      [gameTableId, seatName],
    )
    return rows.length;
  }

  async setFaceCards(
    gameTableId: number,
    seatName: SeatName,
    faceCards: Card[]
  ): Promise<number> {
    const fc_result = await db.query(
      "SELECT face_cards FROM seats WHERE game_table_id = $1 AND seat_name = $2",
      [gameTableId, seatName],
    )
    const oldFaceCards = fc_result.rows[0].face_cards;

    const newFaceCards = `${
      oldFaceCards ? oldFaceCards + CARD_SEPARATOR : ""
    }${this.toStr(faceCards)}`;

    const { rowCount } = await db.query(
      "UPDATE seats SET face_cards = $1 WHERE game_table_id = $2 AND seat_name = $3",
      [newFaceCards, gameTableId, seatName],
    )
    return rowCount;
  }

  async handOutSeat(
    gameTableId: number,
    seatName: SeatName,
    hands: Card[]
  ): Promise<number> {
    return (await db.query(
      "UPDATE seats SET hands = $1 WHERE game_table_id = $2 AND seat_name = $3",
      [this.toStr(hands), gameTableId, seatName],
    )).rowCount;
  }

  async resetPlayCards(gameTableId: number): Promise<number> {
    return (await db.query(
      "UPDATE seats SET play_card = null WHERE game_table_id = $1",
      [gameTableId],
    )).rowCount;
  }

  async resetSeatsCards(gameTableId: number): Promise<number> {
    return (await db.query(
      `UPDATE seats
        SET play_card = null,
            face_cards = null,
            is_last_lap_winner = FALSE,
            hands = null
        WHERE game_table_id = $1`,
      [gameTableId],
    )).rowCount;
  }

  async saveScores(
    gameTableId: number,
    scores: Map<SeatName, number>
  ): Promise<void> {
    // TODO トランザクション
    Array.from(scores.entries())
    .map((nameScore) => {
      const [name, score] = nameScore;
      return {
        query: "UPDATE seats SET score = $1 WHERE game_table_id = $2 AND seat_name = $3",
        values: [score, gameTableId, name]};
    })
    .forEach(async (q) => {
      return (await db.query(q.query, q.values)).rowCount;
    });
  }

  private fromStr(cards: string): Card[] {
    if (!cards) {
      return [];
    }
    return cards.split(CARD_SEPARATOR).map(Card.fromStr);
  }

  private toStr(cards: Card[]): string {
    if (!cards || cards.length < 1) {
      return "";
    }
    return cards.map((card) => card.toStr()).join(CARD_SEPARATOR);
  }
}
