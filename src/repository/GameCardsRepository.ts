import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
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

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    if (!rows) {
      throw new Error(
        `カードを取得できませんでした。[game_table_id: ${gameTableId}]`
      );
    }
    return rows.map(
      (seat) =>
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
    const query = `
    UPDATE seats
            SET play_card = '${playCard.toStr()}',
                is_aide = ${isAide},
                hands = '${this.toStr(hands)}'
        WHERE game_table_id = ${gameTableId}
        AND seat_name = '${seat}'
        ;`;

    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }
  async setWinner(gameTableId: number, seatName: SeatName): Promise<number> {
    const query = `
    UPDATE seats
            SET is_last_lap_winner = TRUE
        WHERE game_table_id = ${gameTableId}
        AND seat_name = '${seatName}'
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);

    const resetLastLap = `
    UPDATE seats
            SET is_last_lap_winner = FALSE
        WHERE game_table_id = ${gameTableId}
        AND seat_name != '${seatName}'
        ;`;

    await connection.execute<OkPacket>(resetLastLap);
    return okPacket.affectedRows;
  }

  async setFaceCards(
    gameTableId: number,
    seatName: SeatName,
    faceCards: Card[]
  ): Promise<number> {
    const selectFaceCards = `
    SELECT face_cards
        FROM seats
        WHERE game_table_id = ${gameTableId}
        AND seat_name = '${seatName}'
        ;`;
    const [rows] = await connection.execute<RowDataPacket[]>(selectFaceCards);
    const oldFaceCards = rows[0].face_cards;

    const newFaceCards = `${
      oldFaceCards ? oldFaceCards + CARD_SEPARATOR : ""
    }${this.toStr(faceCards)}`;

    const query = `
    UPDATE seats
            SET face_cards = '${newFaceCards}'
        WHERE game_table_id = ${gameTableId}
        AND seat_name = '${seatName}'
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }

  async handOutSeat(
    gameTableId: number,
    seatName: SeatName,
    hands: Card[]
  ): Promise<number> {
    const query = `
    UPDATE seats
        SET hands = '${this.toStr(hands)}'
        WHERE game_table_id = ${gameTableId}
        AND seat_name = '${seatName}'
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }

  async resetPlayCards(gameTableId: number): Promise<number> {
    const query = `
    UPDATE seats
            SET play_card = null
        WHERE game_table_id = ${gameTableId}
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }

  async resetSeatsCards(gameTableId: number): Promise<number> {
    const query = `
    UPDATE seats
            SET play_card = null,
                face_cards = null,
                is_last_lap_winner = FALSE,
                hands = null
        WHERE game_table_id = ${gameTableId}
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }
  async saveScores(
    gameTableId: number,
    scores: Map<SeatName, number>
  ): Promise<void> {
    // TODO トランザクション
    Array.from(scores.entries())
      .map((nameScore) => {
        const [name, score] = nameScore;
        return `
    UPDATE seats
            SET score = ${score}
        WHERE game_table_id = ${gameTableId}
        AND seat_name = '${name}'
        ;`;
      })
      .forEach(async (query) => {
        const [okPacket] = await connection.execute<OkPacket>(query);
        return okPacket.affectedRows;
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
