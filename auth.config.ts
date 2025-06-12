import type { NextAuthConfig } from 'next-auth';

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
        token.id_employee = user.idUser;
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
        (session.user as any).idUser = token.id_employee;
        (session.user as any).changePass = token.changePass;
      }

      session.accessToken = token.accessToken;
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
          '/dashboard/tickets',
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
        supervisor: ['/dashboard', '/dashboard/tickets', '/dashboard/redenciones'],
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
        const currentPath = nextUrl.pathname;
        const allowedRoutes = userRole ? rolePermissions[userRole] : [];

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
              currentPath.startsWith(route.replace('*', ''))
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
    maxAge: 4 * 60 * 60, // 4 horas
  },
} satisfies NextAuthConfig;
