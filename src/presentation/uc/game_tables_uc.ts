import { GameTablesResponse } from "../response/GameTablesResponse";
import GameTableRepository from "~/repository/GameTableRepository";
import { SeatName } from "~/domain/SeatName";
import { toErrorResponse } from "../response/ErrorResponse";

const gameTableRepository = new GameTableRepository();

export async function readGameTables(): Promise<GameTablesResponse> {
  try {
    const list = await gameTableRepository.listGameTables();
    return { gameTables: list };
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function createGameTable(): Promise<GameTablesResponse> {
  try {
    await gameTableRepository.createGameTable();
  } catch (error) {
    return toErrorResponse(error);
  }
  return readGameTables();
}

export async function sitDown(
  gameTableId: number,
  seatName: SeatName,
  userName: string
): Promise<GameTablesResponse> {
  try {
    await gameTableRepository.sitDown(gameTableId, seatName, userName);
  } catch (error) {
    return toErrorResponse(error);
  }
  return readGameTables();
}
