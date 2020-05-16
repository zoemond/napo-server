import socketIO from "socket.io";
import GameCardsRepository from "~/repository/GameCardsRepository";
import Card from "~/domain/Card";
import { SeatName } from "~/domain/SeatName";
import DeclarationRepository from "~/repository/DeclarationRepository";
import { DeclarationResponse } from "../response/DeclarationResponse";
import { Trump } from "~/domain/Trump";
import { Declaration } from "~/domain/Declaration";
import { readSeats } from "./game_cards_events";

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
  discards: [Card, Card]
): Promise<DeclarationResponse> {
  try {
    const [discard1, discard2] = discards;
    const seats = await seatsRepository.getSeats(gameTableId);
    const turn = await seatsRepository.getTurn(gameTableId);
    const hands = seats
      .find((seat) => seat.seatName === napoleon)
      ?.hands.concat(turn.openCards as [Card, Card])
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
      turn.turnCount,
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
  socket.on("declare_trump", async (declareRequests) => {
    const {
      gameTableId,
      trump,
      faceCardNumber,
      aideCard,
      napoleon,
      discards,
    } = declareRequests[0]; //一つ送ってもArrayになるので
    const [discard1, discard2] = discards;

    const declarationResponse = await declareTrump(
      gameTableId,
      trump,
      faceCardNumber,
      Card.fromObj(aideCard),
      napoleon,
      [Card.fromObj(discard1), Card.fromObj(discard2)]
    );
    io.emit("declaration", declarationResponse);

    // TODO: 責任が分離しないようにうまくやる
    const seatsResponse = await readSeats(gameTableId);
    io.emit("seats", seatsResponse);
  });
}
