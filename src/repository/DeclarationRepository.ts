import db from "./connection";
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
    const setFirstPlay = `
    UPDATE seats
      SET is_last_lap_winner = TRUE
      WHERE game_table_id = $1
      AND seat_name = $2`;
    await db.query(setFirstPlay, [gameTableId, napoleon]);

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
    const { rows } = await db.query(
      "INSERT INTO declarations VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING game_table_id",
      [
        gameTableId, roundCount, this.openToStr(discards), faceCardNumber,
        trump, napoleon, aideCard.toStr(),
      ],
    )
    return rows[0].game_table_id;
  }

  async getDeclaration(
    gameTableId: number,
    roundCount: number
  ): Promise<Declaration> {
    const { rows } = await db.query(
      "SELECT * FROM declarations WHERE game_table_id = $1 AND round_count = $2",
      [gameTableId, roundCount],
    );
    console.log(`gameTableId: ${gameTableId}, roundCount: ${roundCount}`)
    console.log(rows);
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
