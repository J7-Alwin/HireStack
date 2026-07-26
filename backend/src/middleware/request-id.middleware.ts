import { Request, Response, NextFunction, RequestHandler } from "express";
import { uuidUtils } from "../shared/utils/uuid";

export const requestIdMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req.headers["x-request-id"] as string) || uuidUtils.generate();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
};
