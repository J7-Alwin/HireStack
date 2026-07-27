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
        _res.locals.query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        _res.locals.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}