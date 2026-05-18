# InsightSphere Backend — Production Architecture

Node.js + Express backend structured for a real SaaS analytics dashboard.

## Features
- Clean architecture with controller/service separation
- MongoDB Atlas via Mongoose
- JWT auth (access + refresh) with cookie support
- Email verification + forgot/reset password (SMTP optional)
- Role-based authorization (admin/user)
- Analytics APIs + filters (Mongo aggregation-ready)
- Notifications + settings APIs
- Centralized error handling + validation (Zod)
- Security: helmet, rate limiting, mongo sanitize, CORS
- Swagger UI: `/docs`

## Structure
- `server/src/app.js` — Express app + middleware order
- `server/src/routes/v1/*` — Versioned routes
- `server/src/controllers/*` — HTTP controllers
- `server/src/services/*` — business logic
- `server/src/models/*` — Mongoose models + indexes
- `server/src/middleware/*` — auth, validation, error handling
- `server/src/utils/*` — JWT, crypto, pagination, response helpers

## Setup
1) Install
- `npm install`

2) Configure env
- Copy `.env.example` → `.env`
- Set `MONGODB_URI`, `JWT_*_SECRET`
  - Generate strong secrets:
    - `npm run gen:secrets`

## Run
- Dev: `npm run dev`
- Prod: `npm start`

## Core Endpoints
- Health: `GET /health`
- Docs: `GET /docs`

Auth:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-email`

Users (admin):
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `PUT /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

Analytics:
- `GET /api/v1/analytics`
- `GET /api/v1/analytics/intensity` (distribution)
- `GET /api/v1/analytics/relevance`
- `GET /api/v1/analytics/likelihood`
- `GET /api/v1/analytics/country`
- `GET /api/v1/analytics/topics`
- `GET /api/v1/analytics/region`
- `GET /api/v1/analytics/year`
- `GET /api/v1/analytics/source`
- `GET /api/v1/analytics/sector`
- `GET /api/v1/analytics/pestle`

Filters:
- `GET /api/v1/filters/topics`
- `GET /api/v1/filters/regions`
- `GET /api/v1/filters/sectors`
- `GET /api/v1/filters/sources`
- `GET /api/v1/filters/countries`
- `GET /api/v1/filters/pestle`
# InsightSphere-backend
