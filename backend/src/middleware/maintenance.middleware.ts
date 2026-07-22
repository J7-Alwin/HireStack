import { Request, Response, NextFunction, RequestHandler } from "express";
import { HTTP_STATUS } from "../shared/constants/api.constants";
import { errorResponse } from "../shared/responses/error.response";

let isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

export const setMaintenanceMode = (enabled: boolean): void => {
  isMaintenanceMode = enabled;
};

export const maintenanceMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  // Allow health endpoints and admin routes to bypass maintenance mode
  const path = req.path || req.url || "";
  if (path === "/health" || path === "/api/health" || path.startsWith("/admin")) {
    return next();
  }

  if (isMaintenanceMode) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse("The server is currently undergoing maintenance. Please check back later.")
    );
    return;
  }

  next();
};
