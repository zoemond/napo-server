import Card from "./Card";

export default class HandOutCards {
  constructor(
    open: [Card, Card],
    firstSeat: Card[],
    secondSeat: Card[],
    thirdSeat: Card[],
    fourthSeat: Card[],
    fifthSeat: Card[]
  ) {
    this.open = open;
    this.firstSeat = firstSeat;
    this.secondSeat = secondSeat;
    this.thirdSeat = thirdSeat;
    this.fourthSeat = fourthSeat;
    this.fifthSeat = fifthSeat;
  }
  open: [Card, Card];
  firstSeat: Card[];
  secondSeat: Card[];
  thirdSeat: Card[];
  fourthSeat: Card[];
  fifthSeat: Card[];
}
