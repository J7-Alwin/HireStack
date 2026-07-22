import { ApiError } from "./ApiError";
import { HTTP_STATUS, API_MESSAGES } from "../constants/api.constants";

export class ConflictError extends ApiError {
  constructor(message: string = API_MESSAGES.CONFLICT, details?: any) {
    super(HTTP_STATUS.CONFLICT, message, details);
  }
}
