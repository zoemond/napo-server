import { SeatName } from "./SeatName";
import Card from "./Card";

type State = "completed" | "cheated" | "playing" | "all_green";
type Winner = "napoleon_forces" | "allied_forces";
export class Turn {
  constructor(
    turnCount: number,
    openCards?: [Card, Card],
    isOpened = false,
    state: State = "playing",
    winner?: Winner,
    cheater?: SeatName
  ) {
    this.turnCount = turnCount;
    this.openCards = openCards;
    this.isOpened = isOpened;
    this.state = state;
    this.winner = winner;
    this.cheater = cheater;
  }
  turnCount: number;
  openCards?: [Card, Card];
  isOpened = false;
  state: "completed" | "cheated" | "playing" | "all_green" = "playing";
  winner?: "napoleon_forces" | "allied_forces";
  cheater?: SeatName;
}
