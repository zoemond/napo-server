import { ErrorResponse } from "@/presentation/response/ErrorResponse";
import { Seat } from "@/domain/Seat";

type SeatsSuccessResponse = {
  seats: Seat[];
};

export type SeatsResponse = ErrorResponse | SeatsSuccessResponse;
