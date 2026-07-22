import { ApiError } from "./ApiError";
import { HTTP_STATUS, API_MESSAGES } from "../constants/api.constants";

export class ValidationError extends ApiError {
  constructor(message: string = API_MESSAGES.VALIDATION_FAILED, details?: unknown) {
    super(HTTP_STATUS.BAD_REQUEST, message, details);
  }
}
