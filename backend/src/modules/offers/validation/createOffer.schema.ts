import { z } from "zod";
import { Currency, EmploymentType } from "@prisma/client";
import { normalizedString } from "./shared";

export const createOfferSchema = z.object({
  applicationId: z.string().trim().cuid("Invalid Application ID format"),
  salary: z.coerce.number().positive("Salary must be a positive number greater than zero"),
  currency: z.nativeEnum(Currency, { message: "Invalid currency code" }),
  employmentType: z.nativeEnum(EmploymentType, { message: "Invalid employment type" }),
  joiningDate: z.string().trim().refine((val) => !isNaN(Date.parse(val)), "Invalid joining date format"),
  expiryDate: z.string().trim().refine((val) => !isNaN(Date.parse(val)), "Invalid expiry date format"),
  benefits: normalizedString(5000, "Benefits cannot exceed 5000 characters"),
  notes: normalizedString(3000, "Notes cannot exceed 3000 characters"),
  offerLetterUrl: z.string().trim().url("Invalid offer letter URL").max(2048, "Offer letter URL cannot exceed 2048 characters").optional().nullable(),
  offerLetterFileName: normalizedString(500, "Offer letter filename cannot exceed 500 characters"),
}).refine((data) => {
  const join = new Date(data.joiningDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return join >= today;
}, {
  message: "Joining date cannot be in the past",
  path: ["joiningDate"],
}).refine((data) => {
  const expiry = new Date(data.expiryDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return expiry > today;
}, {
  message: "Expiry date must be in the future",
  path: ["expiryDate"],
}).refine((data) => {
  const join = new Date(data.joiningDate);
  const expiry = new Date(data.expiryDate);
  return expiry < join;
}, {
  message: "Expiry date must be before joining date",
  path: ["expiryDate"],
});
