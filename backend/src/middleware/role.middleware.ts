import { Request, Response, NextFunction, RequestHandler } from "express";
import { Role } from "../shared/enums/role.enum";
import { ForbiddenError } from "../shared/errors/ForbiddenError";
import { UnauthorizedError } from "../shared/errors/UnauthorizedError";

export function authorizeRoles(...allowedRoles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError("You do not have permission to access this resource"));
    }

    next();
  };
}
