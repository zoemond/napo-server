import HandOuter from "~/domain/HandOuter";
import GameCardsRepository from "~/repository/GameCardsRepository";

const gameCardsRepository = new GameCardsRepository();

export async function handOut(
  gameTableId: number,
  roundCount: number
): Promise<void> {
  const handOutCards = new HandOuter().handOut();
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "first_seat",
    handOutCards.firstSeat
  );
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "second_seat",
    handOutCards.secondSeat
  );
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "third_seat",
    handOutCards.thirdSeat
  );
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "fourth_seat",
    handOutCards.fourthSeat
  );
  await gameCardsRepository.handOutSeat(
    gameTableId,
    "fifth_seat",
    handOutCards.fifthSeat
  );

  await gameCardsRepository.handOutOpen(
    gameTableId,
    roundCount,
    handOutCards.open
  );
}
