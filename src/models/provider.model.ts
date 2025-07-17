import { queryOne } from '@/lib/query';
import { v4 as uuidv4 } from 'uuid';

export interface Provider {
  id: string;
  user_id: string;
  business_name: string;
  current_longitude?: number;
  bio?: string;
  current_latitude?: number;
  service_radius?: number;
  is_online?: boolean;
  is_available?: boolean;
  last_location_update?: Date;
}

export class ProviderModel {
  static async create(data: Omit<Provider, 'id'>): Promise<Provider> {
    const id = uuidv4();
    const config = {
      text: `
        INSERT INTO service_providers (
          id, user_id, business_name, current_longitude, bio, current_latitude, service_radius, is_online, is_available
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id) DO UPDATE SET
          business_name = EXCLUDED.business_name,
          current_longitude = EXCLUDED.current_longitude,
          bio = EXCLUDED.bio,
          current_latitude = EXCLUDED.current_latitude,
          service_radius = EXCLUDED.service_radius,
          is_online = EXCLUDED.is_online,
          is_available = EXCLUDED.is_available,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `,
      values: [
        id,
        data.user_id,
        data.business_name,
        data.current_longitude ?? null,
        data.bio ?? null,
        data.current_latitude ?? null,
        data.service_radius ?? null,
        data.is_online ?? false,
        data.is_available ?? false,
      ],
    };
    const provider = await queryOne<Provider>(config);
    if (!provider) {
      throw new Error('Failed to create or update provider profile');
    }
    return provider;
  }
}
