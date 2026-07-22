import { ApiError } from "./ApiError";
import { HTTP_STATUS, API_MESSAGES } from "../constants/api.constants";

export class UnauthorizedError extends ApiError {
  constructor(message: string = API_MESSAGES.UNAUTHORIZED, details?: unknown) {
    super(HTTP_STATUS.UNAUTHORIZED, message, details);
  }
}
