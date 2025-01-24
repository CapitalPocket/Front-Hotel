// import { NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth; 


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

// type Role = 'administrador' | 'supervisor' | 'marketing' | 'taquillero';

// export async function middleware(req: any) {
//   const secret = process.env.NEXTAUTH_SECRET || 'some-random-secret-key';
//   const token = await getToken({ req, secret });
//   const url = req.nextUrl; 
//   if (!token) {
//     if (url.pathname !== '/') {
//       return NextResponse.redirect(new URL('/dashboard', req.url)); 
//     }
//     return NextResponse.next();
//   }
//   const role = token.role as Role;
//   const pathname = url.pathname; 

//   const roleAccess: Record<Role, string[]> = {
//     administrador: [
//       '/dashboard',
//       '/dashboard/tickets',
//       '/dashboard/graphs-sales',
//       '/dashboard/graphs-interactions',
//       '/dashboard/invoices',
//       '/dashboard/parks',
//       '/dashboard/portfolio',
//     ],
//     supervisor: ['/dashboard', '/dashboard/tickets'],
//     marketing: [
//       '/dashboard',
//       '/dashboard/graphs-sales',
//       '/dashboard/graphs-interactions',
//     ],
//     taquillero: [ '/dashboard/tickets'],
//   };

//   const allowedRoutes = roleAccess[role] || [];
//   const isAllowed = allowedRoutes.some((route: string) =>
//     pathname.startsWith(route),
//   );

//   if (!isAllowed) {
//     return NextResponse.redirect(new URL('/dashboard', req.url));
//   }
//   return NextResponse.next();
// }
