# Artisan App API

A Node.js/Express REST API for an artisan-client platform, supporting user registration, authentication, profile management, and secure token-based sessions.

---

## Features

- User registration and email verification
- Login with JWT access and refresh tokens
- Secure logout (refresh token revocation)
- Role-based authorization (client, provider)
- Profile completion for clients and service providers
- PostgreSQL database with raw SQL queries
- Modular route and controller structure

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL
- Yarn or npm

### Installation

```bash
git clone https://github.com/your-username/artisan-app.git
cd artisan-app/artisan-api
yarn install
# or
npm install
```

### Environment Variables

Create a `.env` file in the root of `artisan-api` with the following (example):

```
PORT=3000
DATABASE_URL=your_db_link
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
```

### Database Setup

Ensure your PostgreSQL database is running and the connection string is correct.

Run the table creation scripts (see `/src/lib/query.ts` for schema):

```sql
-- Example for tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

> **Tip:** Run all table creation functions or use a migration tool for full setup.

---

## Running the API

```bash
yarn dev
# or
npm run dev
```

API will be available at `http://localhost:3000/api/v1/`

---

## API Endpoints

### Auth

- `POST /api/v1/auth/register` — Register a new user
- `POST /api/v1/auth/login` — Login and receive tokens
- `POST /api/v1/auth/logout` — Logout (requires access token, removes refresh token)
- `POST /api/v1/auth/verify` — Verify email with code
- `POST /api/v1/auth/refresh-token` — Get new access token using refresh token

### Client

- `GET /api/v1/client/profile` — Get client profile (requires authentication)
- `POST /api/v1/client/profile` — Complete/update client profile

### Provider

- `GET /api/v1/provider/profile` — Get provider profile (requires authentication)
- `POST /api/v1/provider/profile` — Complete/update provider profile

---

## Authentication

- **Access Token:** Sent in `Authorization: Bearer <token>` header for protected routes.
- **Refresh Token:** Sent as an HTTP-only cookie.

---

## Development Notes

- Use Postman or similar tools to test endpoints.
- For protected routes, always set the `Authorization` header with your access token.
- Refresh tokens are stored in the database and revoked on logout.

---

## How to Query with Pagination

First page: /users?limit=20&offset=0
Second page: /users?limit=20&offset=20
Third page: /users?limit=20&offset=40
...and so on.
