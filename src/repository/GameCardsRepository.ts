import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import Card from "@/domain/Card";
import GameCards from "@/domain/GameCards";
import { SeatName } from "@/domain/Seat";

const CARD_SEPARATOR = "_";

export default class GameCardsRepository {
  async get(gameTableId: number): Promise<GameCards> {
    const query = `
    SELECT * 
        FROM game_cards 
        WHERE game_table_id = ${gameTableId};`;

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    const gameCards = rows[0];
    if (!gameCards) {
      throw new Error(
        `カードを取得できませんでした。[game_table_id: ${gameTableId}]`
      );
    }
    return new GameCards(
      gameCards.game_table_id,
      this.openFromStr(gameCards.open_cards),
      this.fromStr(gameCards.seat_first),
      this.fromStr(gameCards.seat_second),
      this.fromStr(gameCards.seat_third),
      this.fromStr(gameCards.seat_fourth),
      this.fromStr(gameCards.seat_fifth)
    );
  }

  async playCard(
    gameTableId: number,
    fieldCards: Card[],
    seat: SeatName,
    hands: Card[]
  ): Promise<number> {
    const query = `
    UPDATE game_cards
        SET ${this.seatToColumnName(seat)} = '${this.toStr(hands)}'',
        SET field_cards = '${this.toStr(fieldCards)}',
        WHERE game_table_id = ${gameTableId}
        ;`;

    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.affectedRows;
  }

  async handOut(gameCards: GameCards): Promise<number> {
    const query = `INSERT INTO game_cards VALUES (
        ${gameCards.gameTableId}, 
        '${this.openToStr(gameCards.open)}', 
         null,
        '${this.toStr(gameCards.seatFirst)}',
        '${this.toStr(gameCards.seatSecond)}',
        '${this.toStr(gameCards.seatThird)}',
        '${this.toStr(gameCards.seatFourth)}',
        '${this.toStr(gameCards.seatFifth)}'
        );`;

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

  private seatToColumnName(seat: SeatName): string {
    switch (seat) {
      case "seatFirst":
        return "seat_first";
      case "seatSecond":
        return "seat_second";
      case "seatThird":
        return "seat_third";
      case "seatFourth":
        return "seat_fourth";
      case "seatFifth":
        return "seat_fifth";
      default:
        throw new Error("席名をカラム名に変換できません:" + seat);
    }
  }
}
