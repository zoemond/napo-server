import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import GameTable from "@/domain/GameTable";
import { SeatName } from "@/domain/SeatName";
import { Player } from "@/domain/Player";

const TABLE = "game_tables";

export default class GameTableRepository {
  async listGameTables(): Promise<GameTable[]> {
    const query = `SELECT * from ${TABLE};`;

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    return rows.map(
      (rows) =>
        new GameTable(rows.id, rows.turn_count, [
          new Player("first_seat", rows.first_seat),
          new Player("second_seat", rows.second_seat),
          new Player("third_seat", rows.third_seat),
          new Player("fourth_seat", rows.fourth_seat),
          new Player("fifth_seat", rows.fifth_seat),
        ])
    );
  }

  async create(): Promise<number> {
    const query = `INSERT INTO ${TABLE} (id) VALUES (0)`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }

  async sitDown(
    gameTableId: number,
    seat: SeatName,
    playerName: string
  ): Promise<number> {
    const query = `
    UPDATE game_tables 
        SET ${seat} = '${playerName}'
        WHERE game_tables.id = ${gameTableId}
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }
}
