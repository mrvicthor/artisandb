import { queryOne } from '@/lib/query';
import { UserValidator } from '@/validation/userValidation';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  phone?: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  user_type: 'client' | 'provider';
  email_verified: boolean;
  phone_verified: boolean;
  status: 'active' | 'suspended' | 'inactive';
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  last_login?: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  phone?: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'provider';
  profile_image_url?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  phone?: string;
  first_name?: string;
  last_name?: string;
  password_hash?: string;
  profile_image_url?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  status?: 'active' | 'suspended' | 'inactive';
}

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const user = await queryOne<User>({
      text: 'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      values: [id],
    });
    return user;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await queryOne<User>({
      text: 'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      values: [email.toLowerCase()],
    });

    return user;
  }

  static async findByPhone(phone: string): Promise<User | null> {
    const user = await queryOne<User>({
      text: 'SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL',
      values: [phone],
    });
    return user;
  }
  static async create(userData: CreateUserInput): Promise<User> {
    const validatedData = UserValidator.validateCreateUser(userData);
    await UserValidator.validateUniquePhone(validatedData.phone as string);
    UserValidator.validateBusinessRules(validatedData);
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(userData.password, 12);

    const user = await queryOne<User>({
      text: `
        INSERT INTO users(
        id, email, password_hash, phone, first_name, last_name, user_type, profile_image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *
        `,
      values: [
        id,
        validatedData.email.toLowerCase(),
        passwordHash,
        validatedData.phone,
        validatedData.first_name,
        validatedData.last_name,
        validatedData.user_type,
        validatedData.profile_image_url ?? null,
      ],
    });

    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  }

  static async verifyUser(code: string, email: string): Promise<void> {
    if (!code.trim() || !email.trim()) {
      throw new Error('Valid code is required');
    }
  }

  static async updateUser(id: string, updates: UpdateUserInput) {
    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No fields to update');
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const user = await queryOne<User>({
      text: `
         UPDATE users
         SET ${setClause.join(', ')}
         WHERE id = $${paramCount} AND deleted_at IS NULL
         RETURNING *
      `,
      values,
    });
    return user;
  }
}
