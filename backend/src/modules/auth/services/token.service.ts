import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../shared/jwt";
import { JwtPayload } from "../../../shared/jwt/token.types";

export const tokenService = {
  generateAccess: (payload: JwtPayload): string => {
    return generateAccessToken(payload);
  },

  generateRefresh: (payload: JwtPayload): string => {
    return generateRefreshToken(payload);
  },

  verifyAccess: (token: string): JwtPayload => {
    return verifyAccessToken(token);
  },

  verifyRefresh: (token: string): JwtPayload => {
    return verifyRefreshToken(token);
  },

  rotateTokens: (oldRefreshToken: string): { accessToken: string; refreshToken: string } => {
    const payload = verifyRefreshToken(oldRefreshToken);
    const cleanPayload: JwtPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      companyId: payload.companyId,
      recruiterId: payload.recruiterId,
    };

    return {
      accessToken: generateAccessToken(cleanPayload),
      refreshToken: generateRefreshToken(cleanPayload),
    };
  },
};
