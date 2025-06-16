import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import axios from 'axios';
import { z } from 'zod';
import type { ApiResponse, LoginResponse } from '@/app/lib/definitions';

type Role = 'administrador' | 'supervisor' | 'marketing' | 'taquillero';

async function getUser(email: string, password: string): Promise<LoginResponse | undefined> {
  try {
    const response = await axios.post<ApiResponse>(
      `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/taquilla/loginUser`,
      { email, password },
    );

    const apiResponse = response.data;
    const { message, token } = apiResponse;

    if (apiResponse.user) {
      const user = apiResponse.user;
      return {
        user: {
          idUser: user.id_user.toString(),
          name: user.name,
          email: user.email,
          password: user.password,
          rol: user.rol,
          park: user.idpark,
          changePass: user.changepassword,
          statusprofile: user.statusprofile,
        },
        message,
        token,
      };
    }
    return { message };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().min(3), password: z.string().min(4) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const response = await getUser(email, password);

          if (!response?.user) return null;

          if (response.user.statusprofile === 'Deshabilitado' || response.user.statusprofile === 'Eliminado') {
            throw new Error('User is disabled.');
          }

          return {
            idUser: response.user.idUser,
            name: response.user.name,
            email: response.user.email,
            role: response.user?.rol,
            park: response.user?.park,
            changePass: response.user?.changePass,
            token: response.token,
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 4 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.idUser = user.idUser;
        token.role = user.role;
        token.park = user.park;
        token.changePass = user.changePass;
        token.accessToken = user.token;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && typeof token.role === 'string') {
        (session.user as any).role = token.role;
        (session.user as any).park = token.park;
        (session.user as any).idUser = token.idUser;
        (session.user as any).changePass = token.changePass;
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const userRole = auth?.user?.role as Role | null;

      const rolePermissions: Record<Role, string[]> = {
        administrador: [
          '/dashboard',
          '/dashboard/tickets',
          '/dashboard/graphs-sales',
          '/dashboard/graphs-interactions',
          '/dashboard/invoices',
          '/dashboard/parks',
          '/dashboard/portfolio',
          '/dashboard/candidatos',
          '/dashboard/candidatos/create',
          '/dashboard/redenciones',
          '/dashboard/generar-excel',
          '/dashboard/devoluciones',
          '/dashboard/candidatos/*/edit',
        ],
        taquillero: ['/dashboard', '/dashboard/tickets'],
        supervisor: ['/dashboard', '/dashboard/tickets', '/dashboard/redenciones'],
        marketing: [
          '/dashboard',
          '/dashboard/graphs-sales',
          '/dashboard/graphs-interactions',
          '/dashboard/invoices',
          '/dashboard/parks',
          '/dashboard/portfolio',
          '/dashboard/generar-excel',
        ],
      };

      if (isOnDashboard) {
        const path = nextUrl.pathname;

        const allowedRoutes = userRole ? rolePermissions[userRole] ?? [] : [];

        const wildcardMatch = allowedRoutes.some(route =>
          route.endsWith('*') && path.startsWith(route.replace('*', ''))
        );

        const isExactMatch = allowedRoutes.includes(path);

        const isEditCandidato = userRole === 'administrador' && /^\/dashboard\/candidatos\/\d+\/edit$/.test(path);

        if (wildcardMatch || isExactMatch || isEditCandidato) return true;

        return Response.redirect(new URL('/login', nextUrl));
      }

      if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));

      return true;
    },
  },
} satisfies NextAuthConfig;
