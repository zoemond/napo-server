import { Trump } from "./Trump";
import { SeatName } from "./SeatName";
import Card from "./Card";

export class Declaration {
  constructor(
    openCards: [Card, Card],
    faceCardNumber: number,
    trump: Trump = "no_trump",
    napoleon: SeatName = "seatFifth",
    aide: SeatName = "seatFifth"
  ) {
    this.openCards = openCards;
    this.faceCardNumber = faceCardNumber;
    this.trump = trump;
    this.napoleon = napoleon;
    this.aide = aide;
  }
  openCards: [Card, Card];
  faceCardNumber: number;
  trump: Trump;
  napoleon: SeatName;
  aide: SeatName;
}
