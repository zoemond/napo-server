import { Seat } from "./Seat";
import { SeatName } from "./SeatName";
import { Declaration } from "./Declaration";

const getAideScore = (
  napoleon: Seat,
  aide: Seat,
  declaredNumber: number
): number => {
  const unitScore = declaredNumber - 12;
  if (napoleon.faceCards.length + aide.faceCards.length >= declaredNumber) {
    return unitScore;
  }
  return -unitScore;
};

const createCalculator = (
  seats: Seat[],
  declaration: Declaration
): ((seatName: SeatName) => number) => {
  const napoleon = seats.find((seat) => seat.seatName === declaration.napoleon);
  const aide =
    seats.find((seat) => seat.isAide) ||
    // 切り札がまだ出てないとき
    seats.find((seat) =>
      seat.hands.find((hand) => hand.equals(declaration.aideCard))
    );

  if (!napoleon || !aide) {
    throw new Error("ナポレオンも副官も存在しません");
  }
  const baseScore = getAideScore(napoleon, aide, declaration.faceCardNumber);

  return (seatName: SeatName): number => {
    if (seatName === aide.seatName) {
      return baseScore;
    }
    if (seatName === napoleon.seatName) {
      return 2 * baseScore;
    }
    return -1 * baseScore;
  };
};

export const calcScores = (
  seats: Seat[],
  declaration: Declaration
): Map<SeatName, number> => {
  const calculator = createCalculator(seats, declaration);
  const seatScores: [SeatName, number][] = seats
    .map((seat) => seat.seatName)
    .map((seatName) => [seatName, calculator(seatName)]);
  return new Map(seatScores);
};
