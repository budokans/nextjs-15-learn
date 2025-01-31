import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard');
      const isLoggedIn = auth?.user !== undefined;

      if (!isOnDashboard) {
        return isLoggedIn
          ? Response.redirect(new URL('/dashboard', request.nextUrl))
          : true;
      } else {
        return isLoggedIn;
      }
    },
  },
} satisfies NextAuthConfig;
