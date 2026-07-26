import { z } from "zod";

export const normalizedString = (maxLen: number, message?: string) => {
  return z.preprocess((val) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed === "" ? null : trimmed;
    }
    return val;
  }, z.string().max(maxLen, message).nullable().optional());
};
