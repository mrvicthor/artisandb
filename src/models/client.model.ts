import { queryOne } from '@/lib/query';
import { v4 as uuidv4 } from 'uuid';

export interface ClientProfile {
  id: string;
  user_id: string;
  current_latitude?: number;
  current_longitude?: number;
  last_location_update?: Date;
  preferred_service_time?: string;
  notification_preferences?: object;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export class ClientModel {
  static async findByUserId(userId: string): Promise<ClientProfile | null> {
    const client = await queryOne<ClientProfile>({
      text: 'SELECT * FROM clients WHERE user_id = $1',
      values: [userId],
    });
    return client;
  }

  static async create(data: Omit<ClientProfile, 'id'>): Promise<ClientProfile> {
    const id = uuidv4();
    const config = {
      text: `
        INSERT INTO clients (
          id, user_id, current_latitude, current_longitude, preferred_service_time, notification_preferences, emergency_contact_name, emergency_contact_phone)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (user_id) DO UPDATE SET
          current_latitude = EXCLUDED.current_latitude,
          current_longitude = EXCLUDED.current_longitude,
          preferred_service_time = EXCLUDED.preferred_service_time,
          notification_preferences = EXCLUDED.notification_preferences,
          emergency_contact_name = EXCLUDED.emergency_contact_name,
          emergency_contact_phone = EXCLUDED.emergency_contact_phone,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `,
      values: [
        id,
        data.user_id,
        data.current_latitude,
        data.current_longitude,
        data.preferred_service_time,
        data.notification_preferences
          ? JSON.stringify(data.notification_preferences)
          : null,
        data.emergency_contact_name,
        data.emergency_contact_phone,
      ],
    };

    const client = await queryOne<ClientProfile>(config);
    if (!client) {
      throw new Error('Failed to create or update client profile');
    }
    return client;
  }
}
