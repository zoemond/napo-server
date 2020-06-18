import GameCardsRepository from "~/repository/GameCardsRepository";
import DeclarationRepository from "~/repository/DeclarationRepository";
import { calcScores } from "~/domain/ScoreCalculator";

const gameCardsRepository = new GameCardsRepository();
const declarationRepository = new DeclarationRepository();

export async function calculateScore(
  gameTableId: number,
  roundCount: number
): Promise<void> {
  const seats = await gameCardsRepository.getSeats(gameTableId);
  const declaration = await declarationRepository.getDeclaration(
    gameTableId,
    roundCount
  );
  const scores = calcScores(seats, declaration);
  gameCardsRepository.saveScores(gameTableId, scores);
}
