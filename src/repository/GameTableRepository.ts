import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import GameTable from "~/domain/GameTable";
import { SeatName, orderedSeatNames } from "~/domain/SeatName";
import { Player } from "~/domain/Player";

export default class GameTableRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private rowToGameTable(gameTableRow: any): GameTable {
    return new GameTable(gameTableRow.id, gameTableRow.turn_count, [
      new Player("first_seat", gameTableRow.first_seat),
      new Player("second_seat", gameTableRow.second_seat),
      new Player("third_seat", gameTableRow.third_seat),
      new Player("fourth_seat", gameTableRow.fourth_seat),
      new Player("fifth_seat", gameTableRow.fifth_seat),
    ]);
  }

  async readGameTable(gameTableId: number): Promise<GameTable> {
    const query = `
    SELECT * 
        FROM game_tables
        WHERE id = ${gameTableId}
        ;`;
    const [rows] = await connection.execute<RowDataPacket[]>(query);
    const gameTable = rows[0];
    return this.rowToGameTable(gameTable);
  }

  async listGameTables(): Promise<GameTable[]> {
    const query = `SELECT * from game_tables;`;

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    return rows.map((row) => this.rowToGameTable(row));
  }

  async createGameTable(): Promise<number> {
    const gameTableId = await this.initGameTable();
    await this.initSeats(gameTableId);
    return await this.initTurn(gameTableId);
  }
  private async initGameTable(): Promise<number> {
    const query = `INSERT INTO game_tables (id) VALUES (0)`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }
  private async initSeats(gameTableId: number): Promise<number> {
    const idSeatNameValues = orderedSeatNames
      .map((seatName) => `(${gameTableId}, '${seatName}')`)
      .join(",");
    const query = `
    INSERT INTO seats
                (game_table_id, seat_name) 
        VALUES ${idSeatNameValues}`;

    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }
  private async initTurn(gameTableId: number): Promise<number> {
    const query = `INSERT INTO turns (game_table_id, turn_count) VALUES (${gameTableId}, 0)`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }

  async sitDown(
    gameTableId: number,
    seatName: SeatName,
    playerName: string
  ): Promise<number> {
    const query = `
    UPDATE game_tables 
        SET ${seatName} = '${playerName}'
        WHERE id = ${gameTableId}
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }
}
