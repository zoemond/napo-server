import { SeatName } from "~/domain/SeatName";
import Card from "~/domain/Card";
import MyGameSight from "~/domain/MyGameSight";
import GameCardsRepository from "~/repository/GameCardsRepository";
import DeclarationRepository from "~/repository/DeclarationRepository";

const gameCardsRepository = new GameCardsRepository();
const declarationRepository = new DeclarationRepository();

export async function playCard(
  gameTableId: number,
  seatName: SeatName,
  playCard: Card
): Promise<void> {
  try {
    const seats = await gameCardsRepository.getSeats(gameTableId);
    const seat = seats.find((s) => s.seatName === seatName);
    if (!seat) {
      throw new Error(`席を取得できませんでした[seatName: ${seatName}]`);
    }
    const myGameSight = new MyGameSight(seat.seatName, seats);
    if (!myGameSight.isMyTurn()) {
      throw new Error(
        `[seatName: ${seatName}]の手番ではありません。手札を切ったあとすぐにカードをクリックした可能性があります`
      );
    }
    const hands = seat.hands.filter((hand) => !hand.equals(playCard));

    const round = await gameCardsRepository.getRound(gameTableId);
    const declaration = await declarationRepository.getDeclaration(
      gameTableId,
      round.roundCount
    );
    const isAide = playCard.equals(declaration.aideCard);

    await gameCardsRepository.playCard(
      gameTableId,
      seat.seatName,
      isAide,
      hands,
      playCard
    );
  } catch (error) {
    console.error(error);
  }
}
