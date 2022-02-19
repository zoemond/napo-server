import { isError } from "~/util/type-util";

export type ErrorResponse = {
  errorMessage: string;
};

export const toErrorResponse = (error: unknown): ErrorResponse => {
  console.error("error", error);
  if (isError(error)) {
    return { errorMessage: error.message };
  }
  return { errorMessage: "予期せぬエラー" };
};
