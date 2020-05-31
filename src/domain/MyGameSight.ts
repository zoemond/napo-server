import Card from "./Card";
import { SeatName, orderedSeatNames } from "./SeatName";
import { Seat } from "./Seat";

export default class MyGameSight {
  mySeat: Seat;
  rightSeat: Seat;
  seats: Seat[];

  constructor(mySeatName: SeatName, seats: Seat[]) {
    this.seats = seats;

    const myIdx = seats.findIndex((seat) => seat.seatName === mySeatName);
    this.mySeat = seats[myIdx];
    this.rightSeat = this.findSeatNextTo(myIdx, 4, seats);
  }

  private findSeatNextTo(
    baseIdx: number,
    nextMeNum: number,
    seats: Seat[]
  ): Seat {
    const idx = (baseIdx + nextMeNum) % orderedSeatNames.length;
    const seatName = orderedSeatNames[idx];
    const seat = seats.find((seat) => seat.seatName === seatName);
    if (seat) {
      return seat;
    }
    throw new Error("隣の座席を特定できませんでした");
  }

  rightCard(): Card | undefined {
    return this.rightSeat.playCard;
  }

  isMyTurn(): boolean {
    if (this.mySeat.playCard) {
      return false;
    }
    if (this.rightCard()) {
      return true;
    }
    return this.mySeat.isLastLapWinner;
  }
}
