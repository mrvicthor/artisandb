import type { Request, Response, NextFunction } from 'express';

import { UserModel } from '@/models/user.model';
import { generateVerificationCode } from '@/utils/generateVerification';
import { Verification } from '@/models/verification.model';
import sendEmail from '@/services/emailService';
import { logger } from '@/lib/winston';

export const forgotPssword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      return next({
        status: 400,
        code: 'MissingEmail',
        message: 'Email is required',
      });
    }
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return next({
        status: 404,
        code: 'UserNotFound',
        message: 'User with this email does not exist',
      });
    }
    const resetCode = generateVerificationCode();
    await Verification.create({
      code: resetCode,
      user_id: user.id,
      verification_type: 'password_reset',
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
    });
    await sendEmail(user.first_name, user.email, resetCode, 'password_reset');
    res.status(200).json({
      message: 'Password reset code sent to your email',
    });
  } catch (error) {
    logger.error('Error in forgot password:', error);
    return next({
      status: 500,
      code: 'InternalServerError',
      message: 'An error occurred while processing your request',
    });
  }
};
