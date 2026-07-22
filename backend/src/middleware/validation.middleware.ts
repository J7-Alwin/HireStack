import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";

export interface ValidationSchemas {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}

export function validateRequest(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, unknown> as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, unknown> as typeof req.params;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
