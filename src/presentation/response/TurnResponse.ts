import { ErrorResponse } from "@/presentation/response/ErrorResponse";
import { Turn } from "@/domain/Turn";

type TurnSuccessResponse = {
  gameTableId: number;
  turn: Turn;
};

export type TurnResponse = ErrorResponse | TurnSuccessResponse;
