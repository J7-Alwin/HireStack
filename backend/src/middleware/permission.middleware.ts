import { Request, Response, NextFunction, RequestHandler } from "express";
import { Permission } from "../shared/permissions/permissions";
import { permissionHelper } from "../shared/permissions/access";
import { ForbiddenError } from "../shared/errors/ForbiddenError";
import { UnauthorizedError } from "../shared/errors/UnauthorizedError";

export function checkPermission(permission: Permission): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const hasAccess = permissionHelper.hasPermission(req.user.role, permission);

    if (!hasAccess) {
      return next(new ForbiddenError("You do not have permission to perform this action"));
    }

    next();
  };
}
