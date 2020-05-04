import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import Card from "@/domain/Card";
import { SeatName } from "@/domain/SeatName";
import { Seat } from "@/domain/Seat";
import HandOutCards from "@/domain/HandOutCards";

const CARD_SEPARATOR = "_";

export default class GameCardsRepository {
  async get(gameTableId: number): Promise<Seat[]> {
    const query = `
    SELECT * 
        FROM seats 
        WHERE game_table_id = ${gameTableId};`;

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    const seats = rows;
    if (!seats) {
      throw new Error(
        `カードを取得できませんでした。[game_table_id: ${gameTableId}]`
      );
    }
    return rows.map(
      (seat) =>
        new Seat(
          seat.seat_name,
          Card.fromStr(seat.play_card),
          this.fromStr(seat.face_cards),
          this.fromStr(seat.hands),
          seat.score
        )
    );
  }

  async playCard(
    gameTableId: number,
    playCard: Card,
    seat: SeatName,
    hands: Card[]
  ): Promise<number> {
    const query = `
    UPDATE seats
            SET play_card = '${playCard.toStr()}',
            SET hands = '${this.toStr(hands)}'
        WHERE game_table_id = ${gameTableId}
        AND seat = ${seat}
        ;`;

    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }

  async handOut(
    gameTableId: number,
    handOutCards: HandOutCards
  ): Promise<number> {
    this.handOutSeat(gameTableId, "seatFirst", handOutCards.firstSeat);
    this.handOutSeat(gameTableId, "seatSecond", handOutCards.secondSeat);
    this.handOutSeat(gameTableId, "seatThird", handOutCards.thirdSeat);
    this.handOutSeat(gameTableId, "seatFourth", handOutCards.fourthSeat);
    this.handOutSeat(gameTableId, "seatFifth", handOutCards.fifthSeat);

    return this.handOutOpen(gameTableId, handOutCards.open);
  }
  private async handOutOpen(
    gameTableId: number,
    turnCount: number,
    open: [Card, Card]
  ): Promise<number> {
    const query = `
    INSERT INTO turns
        SET game_table_id = ${gameTableId},
        SET turn_count = ${turnCount},
        SET open_cards = '${this.openToStr(open)}'
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }
  private async handOutSeat(
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

  private openFromStr(open: string): [Card, Card] {
    const [o1, o2] = open.split(CARD_SEPARATOR).map(Card.fromStr);
    return [o1, o2];
  }

  private openToStr([open1, open2]: [Card, Card]): string {
    return open1.toStr() + CARD_SEPARATOR + open2.toStr();
  }

  private fromStr(cards: string): Card[] {
    return cards.split(CARD_SEPARATOR).map(Card.fromStr);
  }

  private toStr(cards: Card[]): string {
    return cards.map((card) => card.toStr()).join(CARD_SEPARATOR);
  }
}
