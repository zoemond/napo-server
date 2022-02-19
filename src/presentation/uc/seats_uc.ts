import { SeatsResponse } from "../response/SeatsResponse";
import GameCardsRepository from "~/repository/GameCardsRepository";
import { toErrorResponse } from "../response/ErrorResponse";

const gameCardsRepository = new GameCardsRepository();

export async function readSeats(gameTableId: number): Promise<SeatsResponse> {
  try {
    const seats = await gameCardsRepository.getSeats(gameTableId);
    return { gameTableId, seats };
  } catch (error) {
    return toErrorResponse(error);
  }
}
