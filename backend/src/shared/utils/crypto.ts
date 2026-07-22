import crypto from "crypto";

export const cryptoUtils = {
  randomBytes: (length = 32): string => {
    return crypto.randomBytes(length).toString("hex");
  },

  hashString: (str: string, algorithm = "sha256"): string => {
    return crypto.createHash(algorithm).update(str).digest("hex");
  },
};
