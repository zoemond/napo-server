export default class GameTable {
  constructor(
    id: number,
    turnCount: number,
    seatFirst: string,
    seatSecond: string,
    seatThird: string,
    seatFourth: string,
    seatFifth: string
  ) {
    this.id = id;
    this.turnCount = turnCount;
    this.seatFirst = seatFirst;
    this.seatSecond = seatSecond;
    this.seatThird = seatThird;
    this.seatFourth = seatFourth;
    this.seatFifth = seatFifth;
  }
  id: number;
  turnCount: number;
  seatFirst: string;
  seatSecond: string;
  seatThird: string;
  seatFourth: string;
  seatFifth: string;
}
