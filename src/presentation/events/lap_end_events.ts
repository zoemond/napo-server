import GameCardsRepository from "~/repository/GameCardsRepository";
import DeclarationRepository from "~/repository/DeclarationRepository";
import { Policy } from "~/domain/Policy";
import Card from "~/domain/Card";

const declarationRepository = new DeclarationRepository();
const gameCardsRepository = new GameCardsRepository();

export async function judgeWinnerIfLapEnds(gameTableId: number): Promise<void> {
  try {
    const seats = await gameCardsRepository.getSeats(gameTableId);
    const lapSeats = seats.filter((s) => s.playCard).map((s) => s.toLapSeat());

    const isLapEnd = lapSeats.length === 5;
    if (!isLapEnd) {
      return;
    }

    const round = await gameCardsRepository.getRound(gameTableId);
    const declaration = await declarationRepository.getDeclaration(
      gameTableId,
      round.roundCount
    );
    const winner = new Policy().lapWinner(lapSeats, declaration.trump);

    gameCardsRepository.setWinner(gameTableId, winner.seatName);

    const faceCards = seats
      .map((seat) => seat.playCard as Card)
      .filter((card) => card.isFaceCard());
    if (faceCards.length > 0) {
      await gameCardsRepository.setFaceCards(
        gameTableId,
        winner.seatName,
        faceCards
      );
    }
    await gameCardsRepository.resetPlayCards(gameTableId);
  } catch (error) {
    console.error(error);
  }
}
