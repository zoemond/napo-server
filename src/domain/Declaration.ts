import { Trump } from "./Trump";
import { SeatName } from "./SeatName";
import Card from "./Card";

export class Declaration {
  constructor(
    faceCardNumber: number,
    trump: Trump,
    napoleon: SeatName,
    aideCard: Card,
    discards?: [Card, Card]
  ) {
    this.discards = discards;
    this.faceCardNumber = faceCardNumber;
    this.trump = trump;
    this.napoleon = napoleon;
    this.aideCard = aideCard;
  }
  discards?: [Card, Card];
  faceCardNumber: number;
  trump: Trump;
  napoleon: SeatName;
  aideCard: Card;
}
