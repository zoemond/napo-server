import { ErrorResponse } from "@/presentation/response/ErrorResponse";
import { Declaration } from "@/domain/Declaration";

type DeclarationSuccessResponse = {
  gameTableId: number;
  declaration: Declaration;
};

export type DeclarationResponse = ErrorResponse | DeclarationSuccessResponse;
