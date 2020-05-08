import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import Card from "@/domain/Card";
import { Declaration } from "@/domain/Declaration";
import { Trump } from "@/domain/Trump";
import { SeatName } from "@/domain/SeatName";

const CARD_SEPARATOR = "_";

export default class DeclarationRepository {
  async declareNapoleon(
    gameTableId: number,
    turnCount: number,
    faceCardNumber: number,
    trump: Trump,
    napoleon: SeatName,
    aide: SeatName,
    opens: [Card, Card]
  ): Promise<number> {
    const query = `
    INSERT INTO declarations 
        VALUES (
            ${gameTableId},
            ${turnCount},
            '${this.openToStr(opens)}',
            ${faceCardNumber},
            '${trump}',
            '${napoleon}',
            '${aide}'
            )
        ;`;

    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }

  async getDeclaration(gameTableId: number): Promise<Declaration> {
    const query = `
    SELECT * 
        FROM declarations
        WHERE game_table_id = ${gameTableId}
        AND turn_count = (SELECT turn_count FROM turns WHERE game_table_id = ${gameTableId})
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
      declaration.aide,
      this.openFromStr(declaration.open_cards)
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
