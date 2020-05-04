import { SeatName } from "./SeatName";
import Card from "./Card";

export class Seat {
  seatName: SeatName;
  playCard?: Card;
  faceCards: Card[] = [];
  hands: Card[] = [];
  score = 0;

  constructor(
    seatName: SeatName,
    playCard?: Card,
    faceCards: Card[] = [],
    hands: Card[] = [],
    score = 0
  ) {
    this.seatName = seatName;
    this.playCard = playCard;
    this.faceCards = faceCards;
    this.hands = hands;
    this.score = score;
  }
}
