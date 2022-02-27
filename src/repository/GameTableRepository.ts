import db from "./connection";
import GameTable from "~/domain/GameTable";
import { SeatName, orderedSeatNames } from "~/domain/SeatName";
import { Player } from "~/domain/Player";

export default class GameTableRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private rowToGameTable(gameTableRow: any): GameTable {
    return new GameTable(gameTableRow.id, gameTableRow.round_count, [
      new Player("first_seat", gameTableRow.first_seat),
      new Player("second_seat", gameTableRow.second_seat),
      new Player("third_seat", gameTableRow.third_seat),
      new Player("fourth_seat", gameTableRow.fourth_seat),
      new Player("fifth_seat", gameTableRow.fifth_seat),
    ]);
  }

  async readGameTable(gameTableId: number): Promise<GameTable> {
    const { rows } = await db.query(
      "SELECT * FROM game_tables WHERE id = $1",
      [gameTableId],
    );
    const gameTable = rows[0];
    return this.rowToGameTable(gameTable);
  }

  async listGameTables(): Promise<GameTable[]> {

    const { rows } = await db.query("SELECT * FROM game_tables", []);
    return rows.map((row) => this.rowToGameTable(row));
  }

  async createGameTable(): Promise<number> {
    const gameTableId = await this.initGameTable();
    await this.initSeats(gameTableId);
    return await this.initRound(gameTableId);
  }

  private async initGameTable(): Promise<number> {
    const { rows } = await db.query(
      "INSERT INTO game_tables (id) VALUES (nextval('game_tables_id_seq')) RETURNING id",
    )
    return rows[0].id;
  }

  private async initSeats(gameTableId: number): Promise<void> {
    const idSeatNameValues = orderedSeatNames
      .map((seatName) => `(${gameTableId}, '${seatName}')`)
      .join(",");

    await db.query(
      `INSERT INTO seats (game_table_id, seat_name) VALUES ${idSeatNameValues}`,
    )
  }

  private async initRound(gameTableId: number): Promise<number> {
    const { rows } = await db.query(
      "INSERT INTO rounds (game_table_id,round_count) VALUES ($1, 0) RETURNING game_table_id",
      [gameTableId],
    )
    return rows[0].game_table_id;
  }

  async sitDown(
    gameTableId: number,
    seatName: SeatName,
    playerName: string
  ): Promise<number> {
    const { rows } = await db.query(
      `UPDATE game_tables SET ${seatName} = $1 WHERE id = $2 RETURNING id`,
      [playerName, gameTableId],
    )
    return rows[0].id;
  }
}
