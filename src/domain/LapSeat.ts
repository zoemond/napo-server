import Card from "./Card";
import { SeatName } from "./SeatName";

export class LapSeat {
  playCard: Card;
  seatName: SeatName;
  isLastLapWinner: boolean;
  constructor(playCard: Card, seatName: SeatName, isLastLapWinner: boolean) {
    this.playCard = playCard;
    this.seatName = seatName;
    this.isLastLapWinner = isLastLapWinner;
  }
}
