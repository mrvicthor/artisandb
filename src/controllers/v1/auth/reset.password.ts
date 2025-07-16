import { UserModel } from '@/models/user.model';
import { Verification } from '@/models/verification.model';
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword, code } = req.body;
    if (!email || !newPassword || !code) {
      return next({
        status: 400,
        code: 'MissingCredentials',
        message: 'Email, new password, and verification code are required',
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
    // Verify the code and reset the password
    const isValidCode = await Verification.findByCode(code);
    if (!isValidCode) {
      return next({
        status: 400,
        code: 'InvalidCode',
        message: 'Invalid or expired verification code',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await UserModel.updateUser(user.id, {
      password_hash: passwordHash,
    });
    await Verification.deleteById(isValidCode.id);
    res.status(200).json({
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};
