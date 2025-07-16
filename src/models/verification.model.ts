import { queryOne } from '@/lib/query';
import { v4 as uuidv4 } from 'uuid';
interface IVerification {
  id: string;
  code: string;
  user_id: string;
  verification_type?: 'email_verification' | 'password_reset';
  expires_at: Date;
}

export class Verification {
  static async create(
    data: Pick<
      IVerification,
      'code' | 'user_id' | 'verification_type' | 'expires_at'
    >,
  ): Promise<IVerification> {
    if (!data.code || !data.user_id) {
      throw new Error('Invalid verification code');
    }
    const id = uuidv4();
    try {
      const user = await queryOne<IVerification>({
        text: `
       INSERT INTO verifications(
       id, code, user_id, verification_type, expires_at
       ) VALUES($1, $2, $3, $4, $5)
        RETURNING *
    `,
        values: [
          id,
          data.code,
          data.user_id,
          data.verification_type,
          data.expires_at,
        ],
      });
      if (!user) {
        throw new Error(
          'Database returned no result after verification creation',
        );
      }
      return user;
    } catch (error) {
      throw new Error(`Verification code creation failed: ${error}`);
    }
  }

  static async findByCode(code: string): Promise<IVerification | null> {
    const user = await queryOne<IVerification>({
      text: 'SELECT * FROM verifications WHERE code = $1',
      values: [code],
    });
    return user;
  }

  static async deleteById(id: string): Promise<void> {
    await queryOne({
      text: 'DELETE FROM verifications WHERE id = $1',
      values: [id],
    });
  }
}
