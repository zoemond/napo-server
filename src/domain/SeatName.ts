export type SeatName =
  | "first_seat"
  | "second_seat"
  | "third_seat"
  | "fourth_seat"
  | "fifth_seat";
export function isSeatName(name: string): name is SeatName {
  return [
    "first_seat",
    "second_seat",
    "third_seat",
    "fourth_seat",
    "fifth_seat",
  ].includes(name);
}
