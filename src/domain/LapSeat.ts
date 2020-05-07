import Card from "./Card";
import { SeatName } from "./SeatName";

export class LapSeat {
  playCard: Card;
  seatName: SeatName;
  isFirstPlay: boolean;
  constructor(playCard: Card, seatName: SeatName, isFirstPlay: boolean) {
    this.playCard = playCard;
    this.seatName = seatName;
    this.isFirstPlay = isFirstPlay;
  }
}
