import socketIO from "socket.io";
import { GameTablesResponse } from "../response/GameTablesResponse";
import GameTableRepository from "~/repository/GameTableRepository";
import { SeatName } from "~/domain/SeatName";

const gameTableRepository = new GameTableRepository();

async function readGameTables(): Promise<GameTablesResponse> {
  try {
    const list = await gameTableRepository.listGameTables();
    return { gameTables: list };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

async function createGameTable(): Promise<GameTablesResponse> {
  try {
    await gameTableRepository.createGameTable();
  } catch (error) {
    return { errorMessage: error.message };
  }
  return readGameTables();
}

async function sitDown(
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

export function setCreateGameTableEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("create_game_table", async () => {
    const response = await createGameTable();
    io.emit("game_tables", response);
  });
}

export function setReadGameTablesEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("read_game_tables", async () => {
    const response = await readGameTables();
    io.emit("game_tables", response);
  });
}

export function setSitDownEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("sit_down", async (sitDownRequests) => {
    const { gameTableId, seatName, playerName } = sitDownRequests[0]; //一つ送ってもArrayになるので

    const response = await sitDown(gameTableId, seatName, playerName);
    io.emit("game_tables", response);
  });
}
