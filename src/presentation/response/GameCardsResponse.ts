import { ErrorResponse } from "@/presentation/response/ErrorResponse";
import GameCards from "@/domain/GameCards";

type GameCardsSuccessResponse = {
  gameCards: GameCards;
};

export type GameCardsResponse = ErrorResponse | GameCardsSuccessResponse;
