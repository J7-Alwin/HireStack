import { ApiError } from "./ApiError";
import { HTTP_STATUS, API_MESSAGES } from "../constants/api.constants";

export class NotFoundError extends ApiError {
  constructor(message: string = API_MESSAGES.NOT_FOUND, details?: any) {
    super(HTTP_STATUS.NOT_FOUND, message, details);
  }
}
