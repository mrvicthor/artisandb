import { CreateUserInput, UserModel } from '@/models/user.model';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { Token } from '@/models/token.model';
import { Verification } from '@/models/verification.model';
import { logger } from '@/lib/winston';

type LoginData = Pick<CreateUserInput, 'email' | 'password'>;
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: LoginData = req.body;
    // Login logic here
    if (!email || !password) {
      return next({
        status: 400,
        code: 'MissingCredentials',
        message: 'Email and password are required',
      });
    }

    const existingUser = await UserModel.findByEmail(email);

    if (!existingUser) {
      return next({
        status: 401,
        code: 'InvalidCredentials',
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password_hash,
    );

    if (!isPasswordValid) {
      return next({
        status: 401,
        code: 'InvalidCredentials',
        message: 'Invalid email or password',
      });
    }
    const existingVerification = await Verification.findByUserId(
      existingUser.id,
    );
    // If the user has a verification code, delete it
    if (existingVerification) {
      await Verification.deleteById(existingVerification.id);
      logger.info(
        `Deleted existing verification code for user: ${existingUser.id}`,
      );
    }

    const accessToken = generateAccessToken({
      id: existingUser.id,
      user_type: existingUser.user_type,
    });
    const refreshToken = generateRefreshToken({
      id: existingUser.id,
      user_type: existingUser.user_type,
    });

    await Token.upsert({
      token: refreshToken,
      user_id: existingUser.id,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    // Generate tokens and respond
    res.status(200).json({
      message: 'Login successful',
      user: {
        email: existingUser.email,
        user_type: existingUser.user_type,
      },
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export default login;
