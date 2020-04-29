import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import GameTable from "@/domain/GameTable";

const TABLE = "game_tables";

export default class GameTableRepository {
  async list(): Promise<GameTable[]> {
    const query = `SELECT * from ${TABLE};`;

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    return rows.map(
      (rows) =>
        new GameTable(
          rows.id,
          rows.turn_count,
          rows.seat_first,
          rows.seat_second,
          rows.seat_third,
          rows.seat_fourth,
          rows.seat_fifth
        )
    );
  }

  async create(): Promise<number> {
    const query = `INSERT INTO ${TABLE} (id) VALUES (0)`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
  }
}
