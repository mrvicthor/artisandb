import { logger } from '@/lib/winston';
import { UserModel } from '@/models/user.model';
import { Verification } from '@/models/verification.model';
import type { NextFunction, Request, Response } from 'express';

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.code) {
      return next({
        status: 400,
        code: 'InvalidVerificationCode',
        message: 'Verification code is required',
      });
    }
    const verifyUser = await Verification.findByCode(req.body.code);
    if (!verifyUser) {
      return next({
        status: 404,
        code: 'VerificationNotFound',
        message: 'Verification code not found',
      });
    }
    const user = await UserModel.findById(verifyUser.user_id);

    if (!user) {
      return next({
        status: 404,
        code: 'UserNotFound',
        message: 'User not found for this verification code',
      });
    }
    if (user.email_verified) {
      return next({
        status: 409,
        code: 'AlreadyVerified',
        message: 'User is already verified',
      });
    }
    const now = new Date();
    if (now > verifyUser?.expires_at) {
      logger.error('Code has expired');
      return next({
        status: 410,
        code: 'VerificationCodeExpired',
        message: 'Verification code has expired',
      });
    }
    await UserModel.updateUser(verifyUser.user_id, { email_verified: true });
    res.status(200).json({
      message: 'User verification successful',
    });
  } catch (error) {
    logger.error('Error validating user');
    return next(error);
  }
};

export default verifyEmail;
