import { Request, Response, NextFunction, RequestHandler } from "express";
import { HTTP_STATUS } from "../shared/constants/api.constants";
import { errorResponse } from "../shared/responses/error.response";

export interface MaintenanceService {
  isUnderMaintenance(req: Request): Promise<boolean> | boolean;
}

export const defaultMaintenanceService: MaintenanceService = {
  isUnderMaintenance: () => {
    return process.env.MAINTENANCE_MODE === "true";
  },
};

let currentService = defaultMaintenanceService;

export const setMaintenanceService = (service: MaintenanceService): void => {
  currentService = service;
};

export const maintenanceMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Allow health endpoints and admin routes to bypass maintenance mode
  const path = req.path || req.url || "";
  if (path === "/health" || path === "/api/health" || path.startsWith("/admin")) {
    return next();
  }

  try {
    const isMaintenance = await currentService.isUnderMaintenance(req);

    if (isMaintenance) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          errorResponse("The server is currently undergoing maintenance. Please check back later.")
        );
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
