import crypto from "crypto";

export const randomUtils = {
  generateString: (length = 16): string => {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  },

  generateNumber: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};
