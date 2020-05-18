import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import Card from "~/domain/Card";
import { Declaration } from "~/domain/Declaration";
import { Trump } from "~/domain/Trump";
import { SeatName } from "~/domain/SeatName";

const CARD_SEPARATOR = "_";

export default class DeclarationRepository {
  async declareNapoleon(
    gameTableId: number,
    roundCount: number,
    faceCardNumber: number,
    trump: Trump,
    napoleon: SeatName,
    aideCard: Card,
    discards: [Card, Card]
  ): Promise<number> {
    const query = `
    INSERT INTO declarations 
        VALUES (
            ${gameTableId},
            ${roundCount},
            '${this.openToStr(discards)}',
            ${faceCardNumber},
            '${trump}',
            '${napoleon}',
            '${aideCard.toStr()}'
            )
        ;`;
    const setFirstPlay = `
    UPDATE seats
            SET is_last_lap_winner = TRUE
        WHERE game_table_id = ${gameTableId}
        AND seat_name = '${napoleon}'
        ;`;
    await connection.execute<OkPacket>(setFirstPlay);
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }

  async getDeclaration(gameTableId: number): Promise<Declaration> {
    const query = `
    SELECT * 
        FROM declarations
        WHERE game_table_id = ${gameTableId}
        AND round_count = (SELECT round_count FROM rounds WHERE game_table_id = ${gameTableId})
        ;`;

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    if (!rows || !rows[0]) {
      throw new Error(
        `宣言を取得できませんでした。[game_table_id: ${gameTableId}]`
      );
    }
    const declaration = rows[0];
    return new Declaration(
      declaration.face_card_number,
      declaration.trump,
      declaration.napoleon,
      Card.fromStr(declaration.aide_card),
      this.openFromStr(declaration.discards)
    );
  }

  private openFromStr(open: string): [Card, Card] {
    const [o1, o2] = open.split(CARD_SEPARATOR).map(Card.fromStr);
    return [o1, o2];
  }

  private openToStr([open1, open2]: [Card, Card]): string {
    return open1.toStr() + CARD_SEPARATOR + open2.toStr();
  }
}
