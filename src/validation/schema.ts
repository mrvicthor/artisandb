import { z } from 'zod';

const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(8, 'Password must be atleast 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  );

const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

const firstNameSchema = z
  .string()
  .min(3, 'First name is required')
  .max(50, 'First name must be less than 50 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'First name can only contain letters, spaces, hyphens, and apostrophes',
  );

const lastNameSchema = z
  .string()
  .min(3, 'Last name is required')
  .max(50, 'Last name must be less than 50 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Last name can only contain letters, spaces, hyphens, and apostrophes',
  );

const userTypeSchema = z.enum(['client', 'provider'], {
  errorMap: () => ({
    message: 'User type must be either client or provider',
  }),
});

const profileImageSchema = z.string().url('Invalid URL format').optional();

export const createUserSchema = z.object({
  email: emailSchema,

  password: passwordSchema,

  phone: phoneSchema,

  first_name: firstNameSchema,

  last_name: lastNameSchema,

  user_type: userTypeSchema,
  profile_image_url: profileImageSchema,
});

export const updateUserSchema = z.object({
  phone: phoneSchema,
  first_name: firstNameSchema,
  last_name: lastNameSchema,
  profile_image_url: profileImageSchema,
  email_verified: z.boolean().optional(),
  phone_verified: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,

  password: passwordSchema,
});
