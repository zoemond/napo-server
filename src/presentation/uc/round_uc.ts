import { RoundResponse } from "../response/RoundResponse";
import GameCardsRepository from "~/repository/GameCardsRepository";
import { handOut } from "./hand_out_uc";

const gameCardsRepository = new GameCardsRepository();

export async function getRound(gameTableId: number): Promise<RoundResponse> {
  try {
    const round = await gameCardsRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

export async function newRound(gameTableId: number): Promise<RoundResponse> {
  try {
    await gameCardsRepository.resetSeatsCards(gameTableId);
    await gameCardsRepository.newRound(gameTableId);
    const roundForHandOut = await gameCardsRepository.getRound(gameTableId);
    await handOut(gameTableId, roundForHandOut.roundCount);
    const round = await gameCardsRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    console.error("error", error);
    return { errorMessage: error.message };
  }
}

export async function completeRound(
  gameTableId: number
): Promise<RoundResponse> {
  try {
    const round = await gameCardsRepository.getRound(gameTableId);
    await gameCardsRepository.completeRound(gameTableId, round.roundCount);
    return { gameTableId, round };
  } catch (error) {
    console.error("error", error);
    return { errorMessage: error.message };
  }
}
