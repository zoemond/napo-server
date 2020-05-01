import GameCards from "./GameCards";
import Card from "./Card";

const allCards = [
  "club1",
  "club10",
  "club2",
  "club3",
  "club4",
  "club5",
  "club6",
  "club7",
  "club8",
  "club9",
  "club11",
  "club12",
  "club13",
  "diamond1",
  "diamond10",
  "diamond11",
  "diamond12",
  "diamond13",
  "diamond2",
  "diamond3",
  "diamond4",
  "diamond5",
  "diamond6",
  "diamond7",
  "diamond8",
  "diamond9",
  "heart1",
  "heart10",
  "heart11",
  "heart12",
  "heart13",
  "heart2",
  "heart3",
  "heart4",
  "heart5",
  "heart6",
  "heart7",
  "heart8",
  "heart9",
  "spade1",
  "spade10",
  "spade11",
  "spade12",
  "spade13",
  "spade2",
  "spade3",
  "spade4",
  "spade5",
  "spade6",
  "spade7",
  "spade8",
  "spade9",
];

function shuffle<T>(array: T[]): T[] {
  let m = array.length;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    const i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    const t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function sliceCards(cards: string[], start: number, end?: number): Card[] {
  return cards.slice(start, end).map(Card.fromStr);
}
export default class HandOuter {
  handOut(gameTableId: number): GameCards {
    const cards = shuffle(allCards);
    const [card1, card2] = sliceCards(cards, 0, 2);
    return new GameCards(
      gameTableId,
      [card1, card2],
      sliceCards(cards, 2, 12),
      sliceCards(cards, 12, 22),
      sliceCards(cards, 22, 32),
      sliceCards(cards, 32, 42),
      sliceCards(cards, 42)
    );
  }
}
