import { logger } from '@/lib/winston';
import config from '@/config';
import type { NextFunction, Request, Response } from 'express';
import { CreateUserInput, UserModel } from '@/models/user.model';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { Token } from '@/models/token.model';
import { Verification } from '@/models/verification.model';
import { generateVerificationCode } from '@/utils/generateVerification';
import sendEmail from '@/services/emailService';
import { UserValidator } from '@/validation/userValidation';

const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user_type } = req.body;
    if (!['provider', 'client'].includes(user_type)) {
      return next({
        status: 400,
        code: 'InvalidUserType',
        message: 'User type must be provider or client',
      });
    }
    await UserValidator.validateUniqueEmail(req.body.email);
    const user = await UserModel.create(req.body as CreateUserInput);

    const accessToken = generateAccessToken({
      id: user.id,
      user_type: user.user_type,
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      user_type: user.user_type,
    });
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await Token.create({ token: refreshToken, user_id: user.id });
    const verificationToken = await Verification.create({
      code: verificationCode,
      user_id: user.id,
      verification_type: 'email_verification',
      expires_at: expiresAt,
    });
    await sendEmail(user.first_name, user.email, verificationToken.code);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      user: {
        name: user.first_name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
      },
      accessToken,
    });

    logger.info('User registered successfully', {
      name: user.first_name,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
    });
  } catch (error: unknown) {
    logger.error('Error during user registration', error);
    next(error);
  }
};

export default register;
