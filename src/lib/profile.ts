import { queryOne } from './query';

export async function completeClientProfile({
  user_id,
  current_latitude,
  current_longitude,
  preferred_service_time,
  notification_preferences,
  emergency_contact_name,
  emergency_contact_phone,
}: {
  user_id: string;
  current_latitude?: number;
  current_longitude?: number;
  preferred_service_time?: string;
  notification_preferences?: object;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}) {
  const config = {
    text: `
        INSERT INTO clients (
          user_id, current_latitude, current_longitude, preferred_service_time, notification_preferences, emergency_contact_name, emergency_contact_phone)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
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
      user_id,
      current_latitude ?? null,
      current_longitude ?? null,
      preferred_service_time ?? null,
      notification_preferences
        ? JSON.stringify(notification_preferences)
        : null,
      emergency_contact_name ?? null,
      emergency_contact_phone ?? null,
    ],
  };

  await queryOne(config);
}

export async function completeServiceProviderProfile({
  user_id,
  business_name,
  bio,
  current_latitude,
  current_longitude,
  service_radius,
  is_online,
  is_available,
}: {
  user_id: string;
  business_name?: string;
  bio?: string;
  current_latitude?: number;
  current_longitude?: number;
  service_radius?: number;
  is_online?: boolean;
  is_available?: boolean;
}) {
  const config = {
    text: `
         INSERT INTO service_providers (
          user_id, business_name, bio, current_latitude, current_longitude, service_radius, is_online, is_available 
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (user_id) DO UPDATE SET
              business_name = EXCLUDED.business_name,
              bio = EXCLUDED.bio,
              current_latitude = EXCLUDED.current_latitude,
              current_longitude = EXCLUDED.current_longitude,
              service_radius = EXCLUDED.service_radius,
              is_online = EXCLUDED.is_online,
              is_available = EXCLUDED.is_available,
              updated_at = CURRENT_TIMESTAMP
            RETURNING *;
            
        `,
    values: [
      user_id,
      business_name ?? null,
      bio ?? null,
      current_latitude ?? null,
      current_longitude ?? null,
      service_radius ?? null,
      is_online ?? false,
      is_available ?? false,
    ],
  };
  await queryOne(config);
}
