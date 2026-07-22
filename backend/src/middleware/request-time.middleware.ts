import { Request, Response, NextFunction, RequestHandler } from "express";

export const requestTimeMiddleware: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  req.startTime = Date.now();
  next();
};
