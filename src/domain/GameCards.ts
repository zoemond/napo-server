import Card from "./Card";

export default class GameCards {
  constructor(
    gameTableId: number,
    open: [Card, Card],
    fieldCards: Card[],
    seatFirst: Card[],
    seatSecond: Card[],
    seatThird: Card[],
    seatFourth: Card[],
    seatFifth: Card[]
  ) {
    this.gameTableId = gameTableId;
    this.fieldCards = fieldCards;
    this.open = open;
    this.seatFirst = seatFirst;
    this.seatSecond = seatSecond;
    this.seatThird = seatThird;
    this.seatFourth = seatFourth;
    this.seatFifth = seatFifth;
  }
  gameTableId: number;
  open: [Card, Card];
  fieldCards: Card[] = [];
  seatFirst: Card[] = [];
  seatSecond: Card[] = [];
  seatThird: Card[] = [];
  seatFourth: Card[] = [];
  seatFifth: Card[] = [];
}
