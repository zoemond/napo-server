import GameTable from "@/domain/GameTable";
import { ErrorResponse } from "@/presentation/response/ErrorResponse";

type GameTablesSuccessResponse = {
  gameTables: GameTable[];
};

export type GameTablesResponse = ErrorResponse | GameTablesSuccessResponse;
