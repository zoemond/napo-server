import socketIO from "socket.io";
import { GameTablesResponse } from "../response/GameTablesResponse";
import GameTableRepository from "@/repository/GameTableRepository";

const gameTableRepository = new GameTableRepository();

async function readGameTables(): Promise<GameTablesResponse> {
  try {
    const list = await gameTableRepository.list();
    return { gameTables: list };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

async function createGameTable(): Promise<GameTablesResponse> {
  try {
    await gameTableRepository.create();
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
