import { DeclarationResponse } from "../response/DeclarationResponse";
import DeclarationRepository from "~/repository/DeclarationRepository";
import GameCardsRepository from "~/repository/GameCardsRepository";
import { Trump } from "~/domain/Trump";
import Card from "~/domain/Card";
import { SeatName } from "~/domain/SeatName";
import { Declaration } from "~/domain/Declaration";

const declarationRepository = new DeclarationRepository();
const seatsRepository = new GameCardsRepository();

export async function getDeclaration(
  gameTableId: number,
  roundCount: number
): Promise<DeclarationResponse> {
  try {
    const declaration = await declarationRepository.getDeclaration(
      gameTableId,
      roundCount
    );
    return { gameTableId, declaration };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

export async function declareTrump(
  gameTableId: number,
  trump: Trump,
  faceCardNumber: number,
  aideCard: Card,
  napoleon: SeatName,
  discards: [Card, Card]
): Promise<DeclarationResponse> {
  try {
    const [discard1, discard2] = discards;
    if (discard1.equals(discard2)) {
      throw new Error("同じカードは捨てられません.");
    }

    const seats = await seatsRepository.getSeats(gameTableId);
    const round = await seatsRepository.getRound(gameTableId);
    const hands = seats
      .find((seat) => seat.seatName === napoleon)
      ?.hands.concat(round.openCards as [Card, Card])
      .filter((card) => !card.equals(discard1) && !card.equals(discard2));
    console.log("hands", hands);
    console.log("opens", discards);
    if (!hands) {
      throw new Error(
        `ナポレオンを特定できませんでした. [napoleon: ${napoleon}]`
      );
    }

    await declarationRepository.declareNapoleon(
      gameTableId,
      round.roundCount,
      faceCardNumber,
      trump,
      napoleon,
      aideCard,
      discards
    );
    await seatsRepository.handOutSeat(gameTableId, napoleon, hands);
    const declaration = new Declaration(
      faceCardNumber,
      trump,
      napoleon,
      aideCard,
      discards
    );
    return { gameTableId, declaration };
  } catch (error) {
    return { errorMessage: error.message };
  }
}
