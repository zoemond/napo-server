import { ErrorResponse } from "@/presentation/response/ErrorResponse";
import { Seat } from "@/domain/Seat";

export type SeatSuccessResponse = {
  seat: Seat;
};

export type GameTablesResponse = ErrorResponse | SeatSuccessResponse;
