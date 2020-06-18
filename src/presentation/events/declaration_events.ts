import { DeclarationResponse } from "../response/DeclarationResponse";
import DeclarationRepository from "~/repository/DeclarationRepository";

const declarationRepository = new DeclarationRepository();

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
