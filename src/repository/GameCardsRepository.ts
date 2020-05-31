import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import Card from "~/domain/Card";
import { SeatName } from "~/domain/SeatName";
import { Seat } from "~/domain/Seat";
import { Round } from "~/domain/Round";

const CARD_SEPARATOR = "_";

export default class GameCardsRepository {
  async newRound(gameTableId: number): Promise<number> {
    const query = `
    INSERT INTO rounds (game_table_id, round_count) 
            SELECT game_table_id, round_count + 1
                FROM rounds
                WHERE game_table_id = ${gameTableId}
                ORDER BY round_count DESC
                LIMIT 1
            ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }
  async getRound(gameTableId: number): Promise<Round> {
    const query = `
    SELECT * 
        FROM rounds 
        WHERE game_table_id = ${gameTableId}
        ORDER BY round_count DESC
        LIMIT 1
        ;`;

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    if (!rows || !rows[0]) {
      throw new Error(
        `ターンを取得できませんでした。[game_table_id: ${gameTableId}]`
      );
    }
    const round = rows[0];
    return new Round(
      round.round_count,
      this.openFromStr(round.open_cards),
      round.is_opened,
      round.winner,
      round.cheater
    );
  }

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
    console.log("rows", rows);

    const newFaceCards = `${
      oldFaceCards ? oldFaceCards + CARD_SEPARATOR : ""
    }${this.toStr(faceCards)}`;

    const query = `
    UPDATE seats
            SET face_cards = '${newFaceCards}',
                is_last_lap_winner = TRUE
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

  async open(gameTableId: number): Promise<number> {
    const query = `
    UPDATE rounds
        SET is_opened = TRUE
        WHERE game_table_id = ${gameTableId}
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }

  async handOutOpen(
    gameTableId: number,
    roundCount: number,
    open: [Card, Card]
  ): Promise<number> {
    const query = `
    UPDATE rounds
        SET open_cards = '${this.openToStr(open)}'
        WHERE game_table_id = ${gameTableId}
        AND round_count = ${roundCount}
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

  private openFromStr(open: string): [Card, Card] | undefined {
    if (!open) {
      return undefined;
    }
    const [o1, o2] = open.split(CARD_SEPARATOR).map(Card.fromStr);
    return [o1, o2];
  }

  private openToStr([open1, open2]: [Card, Card]): string {
    return open1.toStr() + CARD_SEPARATOR + open2.toStr();
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
