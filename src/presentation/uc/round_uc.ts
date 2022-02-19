import { RoundResponse } from "../response/RoundResponse";
import GameCardsRepository from "~/repository/GameCardsRepository";
import { handOut } from "./hand_out_uc";
import RoundRepository from "~/repository/RoundRepository";
import { toErrorResponse } from "../response/ErrorResponse";

const gameCardsRepository = new GameCardsRepository();
const roundRepository = new RoundRepository();

export async function getRound(gameTableId: number): Promise<RoundResponse> {
  try {
    const round = await roundRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function newRound(gameTableId: number): Promise<RoundResponse> {
  try {
    await gameCardsRepository.resetSeatsCards(gameTableId);
    await roundRepository.newRound(gameTableId);
    const roundForHandOut = await roundRepository.getRound(gameTableId);
    await handOut(gameTableId, roundForHandOut.roundCount);
    const round = await roundRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function completeRound(
  gameTableId: number
): Promise<RoundResponse> {
  try {
    const round = await roundRepository.getRound(gameTableId);
    await roundRepository.completeRound(gameTableId, round.roundCount);
    return { gameTableId, round };
  } catch (error) {
    return toErrorResponse(error);
  }
}
