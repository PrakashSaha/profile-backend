# Prakash Saha Portfolio - Backend

This is the production-ready backend for the Prakash Saha Portfolio. It is built with Node.js, Express, Prisma, and PostgreSQL (Neon).

## 🚀 Key Features & Improvements

### 1. Production Diagnostics & Reliability
- **Singleton Connection Pool**: Refactored database access to use a `pg` singleton pool, significantly reducing connection overhead and cold-start delays on Neon.
- **Neon-Ready**: Configured to work specifically with Neon's pooled connection endpoints.
- **Structured Logging**: Replaced standard `console.log` with **Pino**, providing high-performance JSON logs for production observability.
- **Request Tracing**: Integrated `pino-http` to automatically track request IDs and performance metrics.

### 2. Security & Stability
- **Refined Security Headers**: Implemented a strict **Content Security Policy (CSP)** via `helmet` to protect against XSS and injection.
- **Global Error Handling**: Standardized error responses and internal logging of full error stacks.
- **Fail-Safe Startup**: Added guards for unhandled rejections and uncaught exceptions.

### 3. Clean Architecture
- **Repository Pattern**: Refactored the `blog` and `project` modules from monolithic handlers into a clearly layered `Controller -> Service -> Repository` structure.
- **Engineering Guidelines**: Established project-wide standards for naming, folder structure, and database interaction.

## 🛠️ Tech Stack
- **Runtime**: Node.js (via `tsx` in development)
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Logging**: Pino / Pino-HTTP
- **Validation**: Zod

## 📖 How to Run

1. **Prerequisites**: Node.js, `npm`, and a PostgreSQL database (Neon recommended).
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup**: Create a `.env` file with the following:
   ```env
   DATABASE_URL="your-neon-pooled-connection-url"
   JWT_SECRET="your-secret"
   ADMIN_EMAIL="admin@example.com"
   FRONTEND_URL="http://localhost:3000"
   ```
4. **Database Sync**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 📈 Monitoring
Logs are output in JSON format in production. In development, logs are formatted by `pino-pretty` for readability.
