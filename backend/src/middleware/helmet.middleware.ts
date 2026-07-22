import { RequestHandler } from "express";
import helmet from "helmet";

export const helmetMiddleware = (): RequestHandler => {
  return helmet() as RequestHandler;
};
