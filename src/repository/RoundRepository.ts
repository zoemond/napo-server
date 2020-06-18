import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import Card from "~/domain/Card";
import { Round } from "~/domain/Round";

const CARD_SEPARATOR = "_";

export default class RoundRepository {
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

  async completeRound(
    gameTableId: number,
    roundCount: number
  ): Promise<number> {
    const query = `
    UPDATE rounds 
            SET state = 'completed'
            WHERE game_table_id = ${gameTableId}
            AND round_count = ${roundCount}
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
        `ラウンドを取得できませんでした。[game_table_id: ${gameTableId}]`
      );
    }
    const round = rows[0];
    return new Round(
      round.round_count,
      this.openFromStr(round.open_cards),
      round.is_opened,
      round.state,
      round.winner,
      round.cheater
    );
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
}
