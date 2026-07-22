import { ApiError } from "./ApiError";
import { HTTP_STATUS, API_MESSAGES } from "../constants/api.constants";

export class ForbiddenError extends ApiError {
  constructor(message: string = API_MESSAGES.FORBIDDEN, details?: unknown) {
    super(HTTP_STATUS.FORBIDDEN, message, details);
  }
}
