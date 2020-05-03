import connection from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";
import GameTable from "@/domain/GameTable";
import { SeatName } from "@/domain/Seat";

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

  async sitDown(
    gameTableId: number,
    seat: SeatName,
    playerName: string
  ): Promise<number> {
    const seatColumn = this.seatToColumnName(seat);
    const query = `
    UPDATE game_tables 
        SET ${seatColumn} = '${playerName}'
        WHERE game_tables.id = ${gameTableId}
        ;`;
    const [okPacket] = await connection.execute<OkPacket>(query);
    return okPacket.insertId;
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
