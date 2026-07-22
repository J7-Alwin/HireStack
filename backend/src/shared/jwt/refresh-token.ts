import { jwtHelper } from "./jwt";
import { JwtPayload } from "./token.types";
import { env } from "../../config";

export function generateRefreshToken(payload: JwtPayload): string {
  return jwtHelper.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwtHelper.verify<JwtPayload>(token, env.JWT_REFRESH_SECRET);
}
