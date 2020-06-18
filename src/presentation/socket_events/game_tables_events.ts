import socketIO from "socket.io";
import {
  createGameTable,
  readGameTables,
  sitDown,
} from "../events/game_tables_events";

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
