import jwt from "jsonwebtoken";

export const jwtHelper = {
  sign: (payload: string | object | Buffer, secret: string, options?: jwt.SignOptions): string => {
    return jwt.sign(payload, secret, options);
  },

  verify: <T extends object>(token: string, secret: string): T => {
    return jwt.verify(token, secret) as T;
  },

  decode: <T extends object>(token: string): T | null => {
    return jwt.decode(token) as T | null;
  },
};
