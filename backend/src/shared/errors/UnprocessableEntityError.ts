import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../constants/api.constants";

export class UnprocessableEntityError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, details);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
