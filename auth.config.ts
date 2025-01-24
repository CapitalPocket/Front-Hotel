import type { NextAuthConfig } from 'next-auth';

type Role = 'administrador' | 'supervisor' | 'marketing' | 'taquillero';
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.idUser = user.idUser;
        token.role = user.role;
        token.park = user.park;
        token.changePass = user.changePass;
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
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const userRole = auth?.user?.role as Role | null;

      // Definir las rutas y roles autorizados
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
        ],
        taquillero: [
          '/dashboard', 
          '/dashboard/tickets'
        ],
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
          '/dashboard/generar-excel',
        ],
      };
      
      if (isOnDashboard) {
        const pathSegments = nextUrl.pathname.split('/');
        const isGenerarExcelRoute = pathSegments[2] === 'generar-excel';

        // Si la ruta es "generar-excel" con parámetros dinámicos
        if (isGenerarExcelRoute) {
          const allowedRoutes = userRole && rolePermissions[userRole] ? rolePermissions[userRole] : [];
          if (allowedRoutes.some(route => route.includes('generar-excel'))) {
            return true; // Acceso permitido
          } else {
            return Response.redirect(new URL('/login', nextUrl)); // Redirigir si no tiene permiso
          }
        }
        if (isLoggedIn) {
          const allowedRoutes = userRole && rolePermissions[userRole] ? rolePermissions[userRole] : [];
          // Verificar si el usuario tiene permiso para acceder a la ruta actual
          if (allowedRoutes.includes(nextUrl.pathname)) {
            return true; // Acceso permitido
          } else {
            // Si el usuario no tiene permiso, redirigir a una ruta de error o al dashboard
            return Response.redirect(new URL('/login', nextUrl));
          }
        } else {
          // Si no está logueado, no permitir el acceso
          return false;
        }
      } else if (isLoggedIn) {
        // Si está logueado, redirigir al dashboard si intenta acceder a rutas no protegidas
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [],
  session: { strategy: 'jwt',maxAge: 4 * 60 * 60 },
} satisfies NextAuthConfig;
