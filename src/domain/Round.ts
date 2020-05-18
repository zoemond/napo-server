import { SeatName } from "./SeatName";
import Card from "./Card";

type State = "completed" | "cheated" | "playing" | "all_green";
type Winner = "napoleon_forces" | "allied_forces";
export class Round {
  constructor(
    roundCount: number,
    openCards?: [Card, Card],
    isOpened = false,
    state: State = "playing",
    winner?: Winner,
    cheater?: SeatName
  ) {
    this.roundCount = roundCount;
    this.openCards = openCards;
    this.isOpened = isOpened;
    this.state = state;
    this.winner = winner;
    this.cheater = cheater;
  }
  roundCount: number;
  openCards?: [Card, Card];
  isOpened = false;
  state: "completed" | "cheated" | "playing" | "all_green" = "playing";
  winner?: "napoleon_forces" | "allied_forces";
  cheater?: SeatName;
}
