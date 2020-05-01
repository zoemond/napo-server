import socketIO from "socket.io";
import {
  GameTablesResponse,
  GameTablesSuccessResponse,
} from "../response/GameTablesResponse";
import GameTableRepository from "@/repository/GameTableRepository";
import * as wsGameCardsEvents from "@/presentation/socket_events/game_cards_events";
import { ErrorResponse } from "../response/ErrorResponse";
import GameTable from "@/domain/GameTable";

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

async function sitDown(
  gameTableId: number,
  seat: string,
  userName: string
): Promise<GameTablesResponse> {
  try {
    await gameTableRepository.sitDown(gameTableId, seat, userName);
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
    const { gameTableId, seat, playerName } = sitDownRequests[0]; //一つ送ってもArrayになるので

    const response = await sitDown(gameTableId, seat, playerName);
    io.emit("game_tables", response);
    if ((response as ErrorResponse).errorMessage) {
      return;
    }
    const gameTable = (response as GameTablesSuccessResponse).gameTables.find(
      (gameTable: GameTable) => gameTable.id === gameTableId
    );
    if (!gameTable) {
      throw new Error(
        `更新できたはずのテーブルがないとき [tableId: ${gameTableId}]`
      );
    }

    if (gameTable.isAllSitDown()) {
      await wsGameCardsEvents.handOutCards(gameTableId);
    }
  });
}
