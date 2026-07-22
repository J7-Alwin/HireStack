import { hashPassword, comparePassword, passwordHelper } from "../../../shared";

export const passwordService = {
  hash: async (password: string): Promise<string> => {
    return await hashPassword(password);
  },

  compare: async (password: string, hashed: string): Promise<boolean> => {
    return await comparePassword(password, hashed);
  },

  validatePolicy: (password: string): boolean => {
    return passwordHelper.isValidStrength(password);
  },
};
