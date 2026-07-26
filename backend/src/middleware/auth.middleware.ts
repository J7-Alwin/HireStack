import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken } from "../shared/jwt/access-token";
import { UnauthorizedError } from "../shared/errors/UnauthorizedError";
import { AccountStatus } from "../shared/enums/status.enum";
import { AuthenticatedUser } from "../shared/types/api.types";

export const authMiddleware: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Access token is missing or invalid"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);

    if (decoded.status === AccountStatus.SUSPENDED) {
      return next(new UnauthorizedError("Account has been suspended"));
    }

    if (decoded.status === AccountStatus.INACTIVE) {
      return next(new UnauthorizedError("Account is inactive"));
    }

    const user: AuthenticatedUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status,
      companyId: decoded.companyId,
      recruiterId: decoded.recruiterId,
    };

    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired access token", error));
  }
};
