export type SeatName =
  | "seatFirst"
  | "seatSecond"
  | "seatThird"
  | "seatFourth"
  | "seatFifth";

export function isSeatName(name: string): name is SeatName {
  return [
    "seatFirst",
    "seatSecond",
    "seatThird",
    "seatFourth",
    "seatFifth",
  ].includes(name);
}
