import { RoundResponse } from "../response/RoundResponse";
import GameCardsRepository from "~/repository/GameCardsRepository";

const gameCardsRepository = new GameCardsRepository();

export async function getRound(gameTableId: number): Promise<RoundResponse> {
  try {
    const round = await gameCardsRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    return { errorMessage: error.message };
  }
}
