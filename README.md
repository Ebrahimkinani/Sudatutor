# Chat Teaching App (Sudatutor)

A Next.js App Router application for student teaching via chat.

## Features
- **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui.
- **Database**: MongoDB with Prisma.
- **Auth**: Secure authentication with NextAuth (Credentials).
- **UI**: Modern, responsive dashboard and chat interface.

## Setup

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd sudatutor
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root based on the example:
   ```env
   DATABASE_URL="mongodb://localhost:27017/sudatutor"
   AUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database Setup**
   Ensure your MongoDB instance is running.
   ```bash
   npx prisma generate
   # Optional: Seed data
   npx tsx prisma/seed.ts
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Demo Credentials
(If seeded)
- **Email**: demo@example.com
- **Password**: password123

## Structure
- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components.
- `lib/`: Utilities, database client, auth config.
- `prisma/`: Database schema and seed script.
