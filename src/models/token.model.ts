import { queryOne } from '@/lib/query';
import { v4 as uuidv4 } from 'uuid';

interface IToken {
  id: string;
  token: string;
  user_id: string;
}

export class Token {
  static async create(
    data: Pick<IToken, 'token' | 'user_id'>,
  ): Promise<IToken> {
    if (!data.token.trim() || !data.user_id.trim()) {
      throw new Error('Token and user_id are required');
    }
    const id = uuidv4();

    try {
      const userToken = await queryOne<IToken>({
        text: `
        INSERT INTO tokens(
        id, token, user_id
        ) VALUES ($1, $2, $3)
         RETURNING *
        `,
        values: [id, data.token, data.user_id],
      });
      if (!userToken) {
        throw new Error('Database returned no result after token creation');
      }
      return userToken;
    } catch (error) {
      throw new Error(`Token creation failed: ${error}`);
    }
  }

  // Periodic cleanup of old refresh tokens (run as cron job)
  static async cleanupExpiredTokens(daysOld: number = 30): Promise<void> {
    await queryOne({
      text: 'DELETE FROM tokens WHERE created_at < NOW() - INTERVAL $1 DAY',
      values: [daysOld],
    });
  }

  static async findByToken(token: string): Promise<IToken | null> {
    if (!token.trim()) {
      throw new Error('Token is required');
    }
    const tokenData = await queryOne<IToken>({
      text: 'SELECT * FROM tokens WHERE token = $1',
      values: [token],
    });

    return tokenData;
  }

  static async upsert(
    data: Pick<IToken, 'token' | 'user_id'>,
  ): Promise<IToken> {
    const tokenData = await queryOne<IToken>({
      text: `
        INSERT INTO tokens (token, user_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET token = EXCLUDED.token, updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `,
      values: [data.token, data.user_id],
    });

    if (!tokenData) {
      throw new Error('Database returned no result after token upsert');
    }
    return tokenData;
  }

  static async deleteOne(token: string): Promise<void> {
    if (!token.trim()) {
      throw new Error('Token is required');
    }
    await queryOne({
      text: 'DELETE FROM tokens WHERE token = $1',
      values: [token],
    });
  }
}
