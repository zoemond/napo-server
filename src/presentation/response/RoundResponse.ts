import { ErrorResponse } from "~/presentation/response/ErrorResponse";
import { Round } from "~/domain/Round";

type RoundSuccessResponse = {
  gameTableId: number;
  round: Round;
};

export type RoundResponse = ErrorResponse | RoundSuccessResponse;
