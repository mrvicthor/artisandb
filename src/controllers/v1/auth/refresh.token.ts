import jwt, {
  JsonWebTokenError,
  TokenExpiredError,
  VerifyErrors,
} from 'jsonwebtoken';
import config from '@/config';
import type { Request, Response, NextFunction } from 'express';
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/jwt';
import { logger } from '@/lib/winston';
import { Token } from '@/models/token.model';

const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return next({
        status: 401,
        code: 'MissingRefreshToken',
        message: 'Refresh token is required',
      });
    }

    const tokenExists = await Token.findByToken(refreshToken);

    if (!tokenExists) {
      return next({
        status: 401,
        code: 'InvalidRefreshToken',
        message: 'Refresh token is invalid or has been revoked',
      });
    }
    let jwtPayload;
    try {
      jwtPayload = verifyRefreshToken(refreshToken) as { userId: string };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next({
          status: 401,
          code: 'RefreshTokenExpired',
          message: 'Refresh token has expired',
        });
      }
      if (error instanceof JsonWebTokenError) {
        return next({
          status: 401,
          code: 'InvalidRefreshToken',
          message: 'Invalid refresh token',
        });
      }
      return next({
        status: 500,
        code: 'InternalServerError',
        message: 'An error occurred while verifying the refresh token',
      });
    }

    if (!jwtPayload || !jwtPayload.userId) {
      return next({
        status: 401,
        code: 'InvalidRefreshToken',
        message: 'Invalid or expired refresh token',
      });
    }

    const newAccessToken = generateAccessToken(jwtPayload.userId);
    res.status(200).json({
      accessToken: newAccessToken,
      message: 'Access token refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default refreshTokenHandler;
