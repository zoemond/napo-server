import { GameTablesResponse } from "../response/GameTablesResponse";
import GameTableRepository from "~/repository/GameTableRepository";
import { SeatName } from "~/domain/SeatName";

const gameTableRepository = new GameTableRepository();

export async function readGameTables(): Promise<GameTablesResponse> {
  try {
    const list = await gameTableRepository.listGameTables();
    return { gameTables: list };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

export async function createGameTable(): Promise<GameTablesResponse> {
  try {
    await gameTableRepository.createGameTable();
  } catch (error) {
    return { errorMessage: error.message };
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
    return { errorMessage: error.message };
  }
  return readGameTables();
}
