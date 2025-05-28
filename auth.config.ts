import type { NextAuthConfig, User as NextAuthUser } from 'next-auth';
import type { Response } from 'express';
interface User extends NextAuthUser {
  phone_number?: string;
  statusprofile?: string;
}


type Role = 'administrador' | 'supervisor' | 'marketing' | 'taquillero';

// Validar si un valor es un Role permitido
const isRole = (role: any): role is Role =>
  ['administrador', 'supervisor', 'marketing', 'taquillero'].includes(role);


export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id_employee = user.id_employee;
        token.role = user.role;

        token.park = user.park;
        
        token.accessToken = user.token;

      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && typeof token.role === 'string') {
        (session.user as any).role = token.role;
        (session.user as any).id_employee = token.id_employee;
        (session.user as any).name = token.name;  
        (session.user as any).phone_number = token.phone_number;
        (session.user as any).statusprofile = token.status

      }

      session.accessToken = token.accessToken as string | undefined;

      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const rawRole = auth?.user?.role;
      const userRole = isRole(rawRole) ? rawRole : null;

      const rolePermissions: Record<Role, string[]> = {
        administrador: [
          '/dashboard',
          /*'/dashboard/tickets',*/
          '/dashboard/graphs-sales',
          '/dashboard/graphs-interactions',
          '/dashboard/invoices',
          '/dashboard/parks',
          '/dashboard/portfolio',
          '/dashboard/candidatos',
          '/dashboard/candidatos/create',
          '/dashboard/redenciones',

          '/dashboard/devoluciones',
          '/dashboard/candidatos/*/edit',
        ],
        taquillero: ['/dashboard', '/dashboard/tickets'],
        supervisor: [
          '/dashboard',
          '/dashboard/tickets',
          '/dashboard/redenciones',
        ],
        marketing: [
          '/dashboard',
          '/dashboard/graphs-sales',
          '/dashboard/graphs-interactions',
          '/dashboard/invoices',
          '/dashboard/parks',
          '/dashboard/portfolio',
        ],

      };
      
      if (isOnDashboard) {
        const pathSegments = nextUrl.pathname.split('/');

        const isGenerarExcelRoute = pathSegments[2] === 'generar-excel';

        const allowedRoutes = userRole ? rolePermissions[userRole] : [];
        const currentPath = nextUrl.pathname;

        if (
          userRole === 'administrador' &&
          /^\/dashboard\/candidatos\/\d+\/edit$/.test(currentPath)
        ) {
          return true;
        }

        if (
          allowedRoutes.includes(currentPath) ||
          allowedRoutes.some(
            (route) =>
              route.endsWith('*') &&
              currentPath.startsWith(route.replace('*', '')),
          )
        ) {
          return true;
        }

        return Response.redirect(new URL('/login', nextUrl));
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));

      }

      return true;
    },
  },
  providers: [],

  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60, // 4 hours
  },

} satisfies NextAuthConfig;
