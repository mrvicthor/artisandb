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
        data.current_latitude ?? null,
        data.current_longitude ?? null,
        data.preferred_service_time ?? null,
        data.notification_preferences
          ? JSON.stringify(data.notification_preferences)
          : null,
        data.emergency_contact_name ?? null,
        data.emergency_contact_phone ?? null,
      ],
    };

    const client = await queryOne<ClientProfile>(config);
    if (!client) {
      throw new Error('Failed to create or update client profile');
    }
    return client;
  }

  static async updateClient(
    userId: string,
    data: Partial<ClientProfile>,
  ): Promise<ClientProfile> {
    const config = {
      text: `
        UPDATE clients SET
          current_latitude = COALESCE($2, current_latitude),
          current_longitude = COALESCE($3, current_longitude),
          preferred_service_time = COALESCE($4, preferred_service_time),
          notification_preferences = COALESCE($5, notification_preferences),
          emergency_contact_name = COALESCE($6, emergency_contact_name),
          emergency_contact_phone = COALESCE($7, emergency_contact_phone),
          last_location_update = COALESCE($8, last_location_update),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *;
      `,
      values: [
        userId,
        data.current_latitude ?? null,
        data.current_longitude ?? null,
        data.preferred_service_time ?? null,
        data.notification_preferences
          ? JSON.stringify(data.notification_preferences)
          : null,
        data.emergency_contact_name ?? null,
        data.emergency_contact_phone ?? null,
        data.last_location_update ?? null,
      ],
    };

    const client = await queryOne<ClientProfile>(config);
    if (!client) {
      throw new Error('Failed to update client profile');
    }
    return client;
  }
}
