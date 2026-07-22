import { Request, Response, NextFunction, RequestHandler } from "express";
import { NotFoundError } from "../shared/errors/NotFoundError";

export const notFoundMiddleware: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl || req.url} not found`));
};
