import { Trump } from "./Trump";
import { SeatName } from "./SeatName";
import Card from "./Card";

export class Declaration {
  constructor(
    faceCardNumber: number,
    trump: Trump,
    napoleon: SeatName,
    aide: SeatName,
    discards?: [Card, Card]
  ) {
    this.discards = discards;
    this.faceCardNumber = faceCardNumber;
    this.trump = trump;
    this.napoleon = napoleon;
    this.aide = aide;
  }
  discards?: [Card, Card];
  faceCardNumber: number;
  trump: Trump;
  napoleon: SeatName;
  aide: SeatName;
}
