import Card from "./Card";
import { Trump } from "./Trump";
import { Suit } from "./Suit";
import { LapSeat } from "./LapSeat";

export class Policy {
  lapWinner(seatCards: LapSeat[], trump: Trump): LapSeat {
    const winner =
      this.mighty(seatCards) ||
      this.jack(trump, seatCards) ||
      this.oppositeJack(trump, seatCards) ||
      this.same2(seatCards) ||
      this.higherSuit(trump, seatCards) ||
      this.higherNoTrump(seatCards);

    if (!winner) throw new Error("周の勝者を決定できませんでした");

    return winner;
  }

  // FIXME: undefinedなくしたい
  private mighty(seatCards: LapSeat[]): LapSeat | undefined {
    const mighty = new Card("spade", 1);
    const yoromeki = new Card("heart", 12);
    const mightySeat = seatCards.find((seat) => seat.playCard.equals(mighty));
    if (mightySeat) {
      const mightyKiller = seatCards.find((seat) =>
        seat.playCard.equals(yoromeki)
      );
      if (mightyKiller) {
        return mightyKiller;
      } else {
        return mightySeat;
      }
    }
  }

  private jack(trump: Trump, seatCards: LapSeat[]): LapSeat | undefined {
    if (trump === "no_trump") {
      return undefined;
    }
    const jack = seatCards.find((seat) => {
      const playCard = seat.playCard;
      return playCard.suit === trump && playCard.number === 11;
    });
    return jack;
  }

  private oppositeJack(
    trump: Trump,
    seatCards: LapSeat[]
  ): LapSeat | undefined {
    if (trump === "no_trump") {
      return undefined;
    }
    const oppositeSuit = this.oppositeSuit(trump);
    const jack = seatCards.find((seat) => {
      const playCard = seat.playCard;
      return playCard.suit === oppositeSuit && playCard.number === 11;
    });
    return jack;
  }

  private oppositeSuit(suit: Trump): Suit | undefined {
    switch (suit) {
      case "club":
        return "spade";
      case "spade":
        return "club";
      case "diamond":
        return "heart";
      case "heart":
        return "diamond";
    }
  }

  private same2(seatCards: LapSeat[]): LapSeat | undefined {
    const card2Seat = seatCards.find((seat) => seat.playCard.number === 2);
    if (!card2Seat) {
      return undefined;
    }
    if (
      seatCards
        .map((seat) => seat.playCard)
        .every((card) => card.suit === card2Seat.playCard.suit)
    ) {
      return card2Seat;
    }
  }

  private higherSuit(trump: Trump, seatCards: LapSeat[]): LapSeat | undefined {
    return seatCards
      .filter((seat) => seat.playCard.suit === trump)
      .sort((s1, s2) => s1.playCard.number - s2.playCard.number)[0];
  }

  private higherNoTrump(seatCards: LapSeat[]): LapSeat | undefined {
    const firstSeat = seatCards.find((seat) => seat.isFirstPlay);
    return seatCards
      .filter((seat) => seat.playCard.suit === firstSeat?.playCard.suit)
      .sort((s1, s2) => s2.playCard.number - s1.playCard.number)[0];
  }
}
