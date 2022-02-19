import { RoundResponse } from "../response/RoundResponse";
import RoundRepository from "~/repository/RoundRepository";
import { toErrorResponse } from "../response/ErrorResponse";

const roundRepository = new RoundRepository();

export async function openPair(gameTableId: number): Promise<RoundResponse> {
  try {
    await roundRepository.open(gameTableId);
    const round = await roundRepository.getRound(gameTableId);
    return { gameTableId, round };
  } catch (error) {
    return toErrorResponse(error);
  }
}
