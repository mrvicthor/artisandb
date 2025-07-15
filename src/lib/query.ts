import pool from './db-connection';
import { QueryResult } from 'pg';
import { logger } from './winston';

export interface QueryConfig {
  text: string;
  values?: any[];
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function query(config: QueryConfig): Promise<QueryResult> {
  const client = await pool.connect();
  try {
    const result = await client.query(config.text, config.values);
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw new DatabaseError('Database query failed', error as Error);
  } finally {
    client.release();
  }
}

export async function queryOne<T>(config: QueryConfig): Promise<T | null> {
  const result = await query(config);
  return result.rows[0] || null;
}

export async function queryMany<T>(config: QueryConfig): Promise<T[]> {
  const result = await query(config);
  return result.rows;
}

export async function transaction<T>(
  callback: (client: any) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Tokens Table
async function createTokensTable() {
  const queryText = `
      CREATE TABLE IF NOT EXISTS tokens (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         token TEXT NOT NULL,
         user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         UNIQUE(user_id)
      );
  `;

  try {
    await pool.query(queryText);
    logger.info('Tokens table created successfully');
  } catch (error) {
    logger.error('Failed to create tokens table:', error);
    throw error;
  }
}

async function createVerificationsTable() {
  const queryText = `
     CREATE TABLE IF NOT EXISTS verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL,
        verification_type VARCHAR(20) NOT NULL CHECK (verification_type IN ('email_verification', 'password_reset')),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
     );
  `;

  try {
    await pool.query(queryText);
    logger.info('Verifications table created successfully');
  } catch (error) {
    logger.error('Failed to create verifications table:', error);
    throw error;
  }
}

// Users Table
async function createUsersTable() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       email VARCHAR(255) NOT NULL UNIQUE,
       password_hash VARCHAR(128) NOT NULL,
       phone VARCHAR(20),
       first_name VARCHAR(50) NOT NULL,
       last_name VARCHAR(50) NOT NULL,
       user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'provider')),
       profile_image_url TEXT,
       email_verified BOOLEAN DEFAULT false,
       status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'suspended', 'inactive')) DEFAULT 'active',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
  try {
    await pool.query(queryText);
    logger.info('Users table created successfully');
  } catch (error) {
    logger.error('Error creating user table:', error);
    throw error;
  }
}

// Clients Table
async function createClientsTable() {
  const queryText = `
     CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        -- Current location (updated in real-time)
        current_latitude DECIMAL(10, 8),
        current_longitude DECIMAL(11, 8),
        last_location_update TIMESTAMP WITH TIME ZONE,

        -- Client preferences
        preferred_service_time VARCHAR(50),
        notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),

        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
  );
  `;

  try {
    await pool.query(queryText);
    logger.info('Clients table created successfully');
  } catch (error) {
    logger.error('Error creating clients table:', error);
    throw error;
  }
}

// Service Providers Table
async function createServiceProvidersTable() {
  const queryText = `
     CREATE TABLE IF NOT EXISTS service_providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255),
        bio TEXT,

        -- Real-time location tracking
        current_latitude DECIMAL(10, 8),
        current_longitude DECIMAL(11, 8),
        last_location_update TIMESTAMP WITH TIME ZONE,

        -- Service area and availability
        service_radius INTEGER DEFAULT 10, -- km radius they serve
        is_online BOOLEAN DEFAULT false,
        is_available BOOLEAN DEFAULT true,

        -- Ratings and verification
        average_rating DECIMAL(3, 2) DEFAULT 0.00,
        total_reviews INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
  );
  `;

  try {
    await pool.query(queryText);
    logger.info('Service providers table created successfully');
  } catch (error) {
    logger.error('Error creating service providers table:', error);
    throw error;
  }
}

// Service Categories Table
async function createServiceCategoriesTable() {
  const queryText = `
     CREATE TABLE IF NOT EXISTS service_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon_url VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
  `;

  try {
    await pool.query(queryText);
    logger.info('Service categories table created successfully');
  } catch (error) {
    logger.error('Error creating service categories table:', error);
    throw error;
  }
}

//  Provider Services Junction Table
async function createProviderServicesTable() {
  const queryText = `
     CREATE TABLE IF NOT EXISTS provider_services(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
        service_category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
        base_price DECIMAL(10, 2),
        price_per_hour DECIMAL(10, 2),
        estimated_duration INTEGER, -- in minutes
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(service_provider_id, service_category_id)
  );
  `;

  try {
    await pool.query(queryText);
    logger.info('Provider services table created successfully');
  } catch (error) {
    logger.error('Error creating provider services table:', error);
    throw error;
  }
}

//  Service Requests Table (The main booking table)
async function createServiceRequestsTable() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS service_requests (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
       service_provider_id UUID REFERENCES service_providers(id) ON DELETE SET NULL,
       service_category_id UUID NOT NULL REFERENCES service_categories(id),

       -- Client location for this request
       service_address TEXT NOT NULL,
       service_latitude DECIMAL(10, 8) NOT NULL,
       service_longitude DECIMAL(11, 8) NOT NULL,
       address_notes TEXT,

       -- Service details
       description TEXT,
       requested_date TIMESTAMP WITH TIME ZONE,
       estimated_duration INTEGER, -- in minutes

       -- Pricing
       estimated_price DECIMAL(10, 2),
       final_price DECIMAL(10, 2),

       -- Uber-like tracking
       status VARCHAR(20) DEFAULT 'searching' CHECK (status IN
          ('searching', 'accepted', 'provider_en_route', 'provider_arrived', 'in_progress', 'completed', 'cancelled')),

       -- Time tracking
       accepted_at TIMESTAMP WITH TIME ZONE,
       started_at TIMESTAMP WITH TIME ZONE,
       completed_at TIMESTAMP WITH TIME ZONE,

       -- Distance and ETA (calculated when provider accepts)
       distance_km DECIMAL(5, 2),
       estimated_arrival_time INTEGER, -- in minutes

       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  `;

  try {
    await pool.query(queryText);
    logger.info('Service requests table created successfully');
  } catch (error) {
    logger.error('Error creating service requests table:', error);
    throw error;
  }
}

// Real-time Location Updates Table
async function createLocationUpdatesTable() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS location_updates (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
       service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
       latitude DECIMAL(10, 8) NOT NULL,
       longitude DECIMAL(11, 8) NOT NULL,
       timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

       -- For calculating ETA updates
       distance_to_client DECIMAL(5, 2),
       estimated_arrival_minutes INTEGER
    );
  `;

  try {
    await pool.query(queryText);
    logger.info('Location updates table created successfully');
  } catch (error) {
    logger.error('Error creating location updates table:', error);
    throw error;
  }
}

// Client Saved Addresses Table
async function createCLientAddressesTable() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS client_addresses (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
       address_label VARCHAR(50) NOT NULL, -- 'HOME', 'WORK', 'Mom's House'
       full_address TEXT NOT NULL,
       latitude DECIMAL(10, 8) NOT NULL,
       longitude DECIMAL(11, 8) NOT NULL,
       is_default BOOLEAN DEFAULT false,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(queryText);
    logger.info('Client addresses table created successfully');
  } catch (error) {
    logger.error('Error creating client addresses table:', error);
    throw error;
  }
}

// Reviews and Ratings Table
async function createReviewsTable() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS reviews (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
       client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
       service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
       rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
       review_text TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       UNIQUE(service_request_id) -- One review per service request
    );
 `;

  try {
    await pool.query(queryText);
    logger.info('Reviews table created successfully');
  } catch (error) {
    logger.error('Error creating reviews table:', error);
    throw error;
  }
}

// Create all indexes for optimal performance
async function createAllIndexes() {
  const indexQueries = [
    // Users table indexes
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
    'CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);',
    'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);',

    // Client and provider relationship
    'CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);',

    // Location-based indexes (most important for nearby searches)
    'CREATE INDEX IF NOT EXISTS idx_service_providers_location ON service_providers(current_latitude, current_longitude);',
    'CREATE INDEX IF NOT EXISTS idx_clients_location ON clients(current_latitude, current_longitude);',
    'CREATE INDEX IF NOT EXISTS idx_service_requests_location ON service_requests(service_latitude, service_longitude);',

    // Status and availability indexes
    'CREATE INDEX IF NOT EXISTS idx_service_providers_online_available ON service_providers(is_online, is_available);',
    'CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);',

    // Foreign key indexes
    'CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id);',
    'CREATE INDEX IF NOT EXISTS idx_service_requests_provider_id ON service_requests(service_provider_id);',
    'CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON provider_services(service_provider_id);',
    'CREATE INDEX IF NOT EXISTS idx_provider_services_category_id ON provider_services(service_category_id);',

    // Time-based indexes
    'CREATE INDEX IF NOT EXISTS idx_service_requests_requested_date ON service_requests(requested_date);',
    'CREATE INDEX IF NOT EXISTS idx_location_updates_timestamp ON location_updates(timestamp);',

    // Rating and review indexes
    'CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON service_providers(average_rating);',
    'CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(service_provider_id);',

    // Client addresses indexes
    'CREATE INDEX IF NOT EXISTS idx_client_addresses_client_id ON client_addresses(client_id);',
    'CREATE INDEX IF NOT EXISTS idx_client_addresses_location ON client_addresses(latitude, longitude);',
  ];

  try {
    for (const query of indexQueries) {
      await pool.query(query);
    }
    logger.info('All indexes created successfully');
  } catch (error) {
    logger.error('Error creating indexes:', error);
    throw error;
  }
}

//  Master function to create all tables
export async function createAllTables() {
  try {
    await createUsersTable();
    await createTokensTable();
    await createVerificationsTable();
    await createClientsTable();
    await createServiceProvidersTable();
    await createServiceCategoriesTable();
    await createProviderServicesTable();
    await createServiceRequestsTable();
    await createLocationUpdatesTable();
    await createCLientAddressesTable();
    await createReviewsTable();
    await createAllIndexes();
    logger.info('All tables and indexes created successfully');
  } catch (error) {
    logger.error('Error creating tables:', error);
    throw error;
  }
}
