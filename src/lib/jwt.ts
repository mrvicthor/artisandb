import jwt from 'jsonwebtoken';
import config from '@/config';

export const generateAccessToken = (userId: string): string => {
  if (!userId?.trim()) {
    throw new Error('Valid userId is required');
  }
  if (!config.JWT_ACCESS_SECRET || !config.ACCESS_TOKEN_EXPIRY) {
    throw new Error('JWT access token configuration is missing');
  }

  try {
    return jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
      expiresIn: config.ACCESS_TOKEN_EXPIRY,
      subject: 'accessApi',
    });
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error}`);
  }
};

export const generateRefreshToken = (userId: string): string => {
  if (!userId?.trim()) {
    throw new Error('Valid userId is required');
  }
  if (!config.REFRESH_TOKEN_EXPIRY || !config.REFRESH_TOKEN_EXPIRY) {
    throw new Error('JWT configuration is missing');
  }

  try {
    return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.REFRESH_TOKEN_EXPIRY,
      subject: 'refreshToken',
    });
  } catch (error) {
    throw new Error(`Failed to generate refresh token: ${error}`);
  }
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
