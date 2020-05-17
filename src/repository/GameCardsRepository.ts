import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import Card from "~/domain/Card";
import { SeatName } from "~/domain/SeatName";
import { Seat } from "~/domain/Seat";
import HandOutCards from "~/domain/HandOutCards";
import { Turn } from "~/domain/Turn";

const CARD_SEPARATOR = "_";

export default class GameCardsRepository {
  async getTurn(gameTableId: number): Promise<Turn> {
    const query = `
    SELECT * 
        FROM turns 
        WHERE game_table_id = ${gameTableId};`;

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    if (!rows || !rows[0]) {
      throw new Error(
        `ターンを取得できませんでした。[game_table_id: ${gameTableId}]`
      );
    }
    const turn = rows[0];
    return new Turn(
      turn.turn_count,
      this.openFromStr(turn.open_cards),
      turn.is_opened,
      turn.winner,
      turn.cheater
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
    hands: Card[],
    playCard: Card
  ): Promise<number> {
    const query = `
    UPDATE seats
            SET play_card = '${playCard.toStr()}',
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

  async resetPlayCards(gameTableId: number): Promise<number> {
    const query = `
    UPDATE seats
            SET play_card = null
        WHERE game_table_id = ${gameTableId}
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }

  async open(gameTableId: number): Promise<number> {
    const query = `
    UPDATE turns
        SET is_opened = TRUE
        WHERE game_table_id = ${gameTableId}
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }

  async startTurn(
    gameTableId: number,
    turnCount: number,
    handOutCards: HandOutCards
  ): Promise<number> {
    this.handOutSeat(gameTableId, "first_seat", handOutCards.firstSeat);
    this.handOutSeat(gameTableId, "second_seat", handOutCards.secondSeat);
    this.handOutSeat(gameTableId, "third_seat", handOutCards.thirdSeat);
    this.handOutSeat(gameTableId, "fourth_seat", handOutCards.fourthSeat);
    this.handOutSeat(gameTableId, "fifth_seat", handOutCards.fifthSeat);

    return this.handOutOpen(gameTableId, turnCount, handOutCards.open);
  }
  private async handOutOpen(
    gameTableId: number,
    turnCount: number,
    open: [Card, Card]
  ): Promise<number> {
    const query = `
    UPDATE turns
        SET turn_count = ${turnCount},
            open_cards = '${this.openToStr(open)}'
        WHERE game_table_id = ${gameTableId}
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
