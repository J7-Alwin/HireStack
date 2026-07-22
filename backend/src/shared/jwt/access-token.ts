import { jwtHelper } from "./jwt";
import { JwtPayload } from "./token.types";
import { env } from "../../config";

export function generateAccessToken(payload: JwtPayload): string {
  return jwtHelper.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as import("jsonwebtoken").SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwtHelper.verify<JwtPayload>(token, env.JWT_ACCESS_SECRET);
}
