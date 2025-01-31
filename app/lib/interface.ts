// types/next-auth.d.ts
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';


declare module 'next-auth' {
  interface Session {
    user: {
      idUser?: string;
      park?: string;
      role?: string;
      changePass?: string;
    };
  }
  interface User {
    idUser?: string;
    park?: string;
    role?: string;
    changePass?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: {
      role?: string;
      idUser?: string;
      park?: string;
      changePass?: string;
    };
  }
}

