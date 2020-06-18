import { RoundResponse } from "../response/RoundResponse";
import GameCardsRepository from "~/repository/GameCardsRepository";

const gameCardsRepository = new GameCardsRepository();

export async function openPair(gameTableId: number): Promise<RoundResponse> {
  try {
    await gameCardsRepository.open(gameTableId);
    const round = await gameCardsRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    console.error("error", error);
    return { errorMessage: error.message };
  }
}
