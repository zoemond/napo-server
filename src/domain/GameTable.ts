import { Player } from "./Player";

export default class GameTable {
  constructor(id: number, roundCount: number, players?: Player[]) {
    this.id = id;
    this.roundCount = roundCount;
    this.players = players || [];
  }
  id: number;
  roundCount: number;
  players: Player[];

  isAllSitDown(): boolean {
    return !this.players.some((player) => !player.isSitDown());
  }
}
