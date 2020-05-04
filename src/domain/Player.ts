import { SeatName } from "./SeatName";

export class Player {
  constructor(seatName: SeatName) {
    this.seatName = seatName;
  }
  seatName: SeatName;
  name?: string;

  isSitDown(): boolean {
    return !!this.name;
  }
}
