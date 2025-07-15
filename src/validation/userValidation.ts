import {
  CreateUserInput,
  UpdateUserInput,
  UserModel,
} from '@/models/user.model';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from './schema';

export class UserValidator {
  static validateCreateUser(data: CreateUserInput) {
    try {
      return createUserSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid user data', error.errors);
      }
      throw error;
    }
  }

  static validateUpdateUser(data: UpdateUserInput) {
    try {
      return updateUserSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid user data', error.errors);
      }
      throw error;
    }
  }

  static async validateUniqueEmail(email: string) {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }
  }

  static async validateUniquePhone(phone: string, excludeId?: string) {
    const existingUser = await UserModel.findByPhone(phone);
    if (existingUser && existingUser.id !== excludeId) {
      throw new ValidationError('Phone number already exists');
    }
  }

  static validateBusinessRules(userData: CreateUserInput | UpdateUserInput) {
    if (
      'user_type' in userData &&
      userData.user_type === 'provider' &&
      !userData.phone
    ) {
      throw new ValidationError('Phone number is required for providers');
    }

    if (userData.profile_image_url) {
      const allowedDomains = ['amazonaws.com', 'cloudinary.com', 'imgur.com'];
      const url = new URL(userData.profile_image_url);
      if (!allowedDomains.some((domain) => url.hostname.includes(domain))) {
        throw new ValidationError(
          'Profile image must be from an allowed domain',
        );
      }
    }
  }
}

export class ValidationError extends Error {
  public errors?: any[];
  public statusCode: number;
  public code: string;

  constructor(message: string, errors?: any[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
    this.code = 'ValidationError';
  }
}
