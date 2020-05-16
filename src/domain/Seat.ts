import { SeatName } from "./SeatName";
import Card from "./Card";

export class Seat {
  seatName: SeatName;
  playCard?: Card;
  isLastLapWinner: boolean;
  faceCards: Card[] = [];
  hands: Card[] = [];
  score = 0;

  constructor(
    seatName: SeatName,
    playCard?: Card,
    isLastLapWinner = false,
    faceCards: Card[] = [],
    hands: Card[] = [],
    score = 0
  ) {
    this.seatName = seatName;
    this.playCard = playCard;
    this.isLastLapWinner = isLastLapWinner;
    this.faceCards = faceCards;
    this.hands = hands;
    this.score = score;
  }
}
