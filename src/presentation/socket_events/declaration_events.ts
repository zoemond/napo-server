import socketIO from "socket.io";
import GameCardsRepository from "@/repository/GameCardsRepository";
import Card from "@/domain/Card";
import { SeatName } from "@/domain/SeatName";
import DeclarationRepository from "@/repository/DeclarationRepository";
import { DeclarationResponse } from "../response/DeclarationResponse";
import { Trump } from "@/domain/Trump";
import { Declaration } from "@/domain/Declaration";

const declarationRepository = new DeclarationRepository();
const seatsRepository = new GameCardsRepository();

async function getDeclaration(
  gameTableId: number
): Promise<DeclarationResponse> {
  try {
    const declaration = await declarationRepository.getDeclaration(gameTableId);
    return { gameTableId, declaration };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

async function declareTrump(
  gameTableId: number,
  trump: Trump,
  faceCardNumber: number,
  aideCard: Card,
  napoleon: SeatName,
  openCards: [Card, Card]
): Promise<DeclarationResponse> {
  try {
    const seats = await seatsRepository.getSeats(gameTableId);
    const aide =
      seats.find((seat) => seat.hands.find((card) => card.equals(aideCard)))
        ?.seatName || napoleon;

    const turn = await seatsRepository.getTurn(gameTableId);
    const hands = seats
      .find((seat) => seat.seatName === napoleon)
      ?.hands.concat(turn.openCards as [Card, Card])
      .filter(
        (card) => !card.equals(openCards[0]) && !card.equals(openCards[1])
      );
    console.log("hands", hands);
    console.log("opens", openCards);
    if (!hands) {
      throw new Error(
        `ナポレオンを特定できませんでした. [napoleon: ${napoleon}]`
      );
    }

    await declarationRepository.declareNapoleon(
      gameTableId,
      turn.turnCount,
      faceCardNumber,
      trump,
      napoleon,
      aide,
      openCards
    );
    await seatsRepository.handOutSeat(gameTableId, napoleon, hands);
    const declaration = new Declaration(
      faceCardNumber,
      trump,
      napoleon,
      aide,
      openCards
    );
    return { gameTableId, declaration };
  } catch (error) {
    return { errorMessage: error.message };
  }
}

export function setDeclarationEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("read_declaration", async (declarationRequests) => {
    const { gameTableId } = declarationRequests[0]; //一つ送ってもArrayになるので
    const declarationResponse = await getDeclaration(gameTableId);
    io.emit("declaration", declarationResponse);
  });
}

export function setDeclareTrumpEvent(
  socket: socketIO.Socket,
  io: SocketIO.Server
): void {
  socket.on("declare_trump", async (playCardRequests) => {
    const {
      gameTableId,
      trump,
      faceCardNumber,
      aideCard,
      napoleon,
      openCards,
    } = playCardRequests[0]; //一つ送ってもArrayになるので

    const declarationResponse = await declareTrump(
      gameTableId,
      trump,
      faceCardNumber,
      new Card(aideCard.suit, aideCard.number),
      napoleon,
      [
        new Card(openCards[0].suit, openCards[0].number),
        new Card(openCards[1].suit, openCards[1].number),
      ]
    );
    io.emit("declaration", declarationResponse);
  });
}
