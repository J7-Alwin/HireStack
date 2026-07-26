import { Request, Response } from "express";
import { companiesService } from "./companies.service";
import { companyOnboardingService } from "./company-onboarding.service";
import { successResponse } from "../../shared/responses/success.response";
import { paginationResponse } from "../../shared/responses/pagination.response";
import { HTTP_STATUS } from "../../shared/constants/api.constants";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";
import { COMPANIES_MESSAGES } from "./companies.constants";
import { CompanyQueryFilters, CompanyOnboardingInput } from "./companies.types";
import { AccountStatus } from "../../shared/enums/status.enum";
import { Prisma } from "@prisma/client";

export const companiesController = {
  onboardCompany: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const onboardingInput = req.body as CompanyOnboardingInput;
    const result = await companyOnboardingService.onboardCompany(onboardingInput, currentUser);

    res
      .status(HTTP_STATUS.CREATED)
      .json(successResponse(COMPANIES_MESSAGES.ONBOARDING_SUCCESS, result));
  },

  listCompanies: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const filters = req.query as unknown as CompanyQueryFilters;
    const result = await companiesService.listCompanies(filters, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(paginationResponse(COMPANIES_MESSAGES.COMPANIES_RETRIEVED, result.data, result.meta));
  },

  getCompanyById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const company = await companiesService.getCompanyById(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(COMPANIES_MESSAGES.COMPANY_RETRIEVED, { company }));
  },

  updateCompany: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const updateData = req.body as Partial<Prisma.CompanyUpdateInput>;
    const company = await companiesService.updateCompany(id, updateData, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(COMPANIES_MESSAGES.COMPANY_UPDATED, { company }));
  },

  updateStatus: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { status } = req.body as { status: AccountStatus };
    const company = await companiesService.updateCompanyStatus(id, status, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(COMPANIES_MESSAGES.STATUS_UPDATED, { company }));
  },

  softDelete: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const company = await companiesService.softDeleteCompany(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(COMPANIES_MESSAGES.COMPANY_DELETED, { company }));
  },

  restore: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const company = await companiesService.restoreCompany(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(COMPANIES_MESSAGES.COMPANY_RESTORED, { company }));
  },
};
