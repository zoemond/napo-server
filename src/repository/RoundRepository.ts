import db from "./connection";
import Card from "~/domain/Card";
import { Round } from "~/domain/Round";

const CARD_SEPARATOR = "_";

export default class RoundRepository {
  async newRound(gameTableId: number): Promise<number> {
    const { rows } = await db.query(
      `INSERT INTO rounds (game_table_id, round_count)
        SELECT game_table_id, round_count + 1 FROM rounds
          WHERE game_table_id = $1
          ORDER BY round_count DESC
          LIMIT 1
          RETURNING game_table_id`,
      [gameTableId],
    )
    return rows[0].game_table_id;
  }

  async completeRound(
    gameTableId: number,
    roundCount: number
  ): Promise<number> {
    const { rows } = await db.query(
      "UPDATE rounds SET state = $1 WHERE game_table_id = $2 AND round_count = $3 RETURNING game_table_id",
      ["completed", gameTableId, roundCount],
    )
    return rows[0].game_table_id
  }

  async getRound(gameTableId: number): Promise<Round> {
    const { rows } = await db.query(
      "SELECT * FROM rounds WHERE game_table_id = $1 ORDER BY round_count DESC LIMIT 1",
      [gameTableId],
    )
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
    return (await db.query(
      "UPDATE rounds SET is opend = TRUE WHERE game_table_id = $1",
      [gameTableId],
    )).rowCount;
  }

  async handOutOpen(
    gameTableId: number,
    roundCount: number,
    open: [Card, Card]
  ): Promise<number> {
    return (await db.query(
      "UPDATE rounds SET open_cards = $1 WHERE game_table_id = $2 AND round_count = $3",
      [this.openToStr(open), gameTableId, roundCount],
    )).rowCount;
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
