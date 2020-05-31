import { SeatName } from "./SeatName";
import Card from "./Card";
import { LapSeat } from "./LapSeat";

export class Seat {
  seatName: SeatName;
  playCard?: Card;
  isAide: boolean;
  isLastLapWinner: boolean;
  faceCards: Card[] = [];
  hands: Card[] = [];
  score = 0;

  constructor(
    seatName: SeatName,
    playCard?: Card,
    isAide = false,
    isLastLapWinner = false,
    faceCards: Card[] = [],
    hands: Card[] = [],
    score = 0
  ) {
    this.seatName = seatName;
    this.playCard = playCard;
    this.isAide = isAide;
    this.isLastLapWinner = isLastLapWinner;
    this.faceCards = faceCards;
    this.hands = hands;
    this.score = score;
  }

  toLapSeat(): LapSeat {
    if (!this.playCard) {
      throw new Error("手札が出されていないのに点数計算をしようとしています");
    }
    return new LapSeat(
      this.playCard as Card,
      this.seatName,
      this.hands.length,
      this.isLastLapWinner
    );
  }
}
