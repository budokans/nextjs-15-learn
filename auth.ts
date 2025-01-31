import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { sql } from '@vercel/postgres';
import { authConfig } from '@/auth.config';
import type { User } from '@/app/lib/definitions';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials: unknown) => {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await getUser(parsedCredentials.data.email);
        const passwordsMatch = await bcrypt.compare(
          parsedCredentials.data.password,
          user.password
        );

        if (!passwordsMatch) {
          return null;
        } else {
          return user;
        }
      },
    }),
  ],
});

const getUser = async (email: string): Promise<User> => {
  try {
    const dbResponse =
      await sql<User>`SELECT * FROM users WHERE email=${email}`;

    return dbResponse.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
};

const credentialsSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
  })
  .readonly();
