import { queryOne } from './query';

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
