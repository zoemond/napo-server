import Card from "./Card";
import { SeatName } from "./SeatName";

export class LapSeat {
  playCard: Card;
  seatName: SeatName;
  handsCount: number;
  isLastLapWinner: boolean;
  constructor(
    playCard: Card,
    seatName: SeatName,
    handsCount: number,
    isLastLapWinner: boolean
  ) {
    this.playCard = playCard;
    this.seatName = seatName;
    this.handsCount = handsCount;
    this.isLastLapWinner = isLastLapWinner;
  }
}
