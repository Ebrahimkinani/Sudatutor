# SudaTutor Auth Setup Instructions

## 1. Environment Variables

Create a `.env.local` file in the root directory (if it doesn't exist) and add the following keys. 

```env
# MongoDB Connection String (from Compass or Atlas)
DATABASE_URL="mongodb+srv://..."

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars"
```

**Note:**
- Generate a secret using `openssl rand -base64 32` or just a long random string.
- For production, set these variables in your hosting provider (Vercel, etc.).

## 2. Database Setup

Ensure your MongoDB instance is running. Then, push the Prisma schema to your database to create necessary indexes:

```bash
npx prisma db push
```

If you change the schema later:
```bash
npx prisma generate
npx prisma db push
```

## 3. Running the App

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 4. Auth Flow Verification

1. Go to `http://localhost:3000` (Redirects to `/auth/login`).
2. Click "Sign up".
3. Enter details. You should see a success toast and be redirected to login.
4. Log in with the new credentials.
5. You should be redirected to the dashboard (`/`).
6. Click "Log out" to return to login.

## 5. Security Notes

- **Password Hashing:** Uses `bcryptjs` with salt rounds 12.
- **Rate Limiting:** IP-based rate limiting is implemented on the register route.
- **Validation:** Server-side validation with Zod.
- **Middleware:** Protects app routes and redirects unauthenticated users.
