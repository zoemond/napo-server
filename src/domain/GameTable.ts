import { Player } from "./Player";

export default class GameTable {
  constructor(id: number, turnCount: number, players?: Player[]) {
    this.id = id;
    this.turnCount = turnCount;
    this.players = players || [];
  }
  id: number;
  turnCount: number;
  players: Player[];

  isAllSitDown(): boolean {
    return !this.players.some((player) => !player.isSitDown());
  }
}
