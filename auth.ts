import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { ApiResponse, LoginResponse } from '@/app/lib/definitions';
import axios from 'axios';

async function getUser(
  name: string,
  password: string,
): Promise<LoginResponse | undefined> {
  try {
    const response = await axios.post<ApiResponse>(
      `${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotel/loginUser`,
      { name, password },
    );

    const apiResponse = response.data;
    const { message } = apiResponse;

    if (apiResponse.user) {
      const user = apiResponse.user;
      return {
        user: {
          idUser: user.id_user.toString(),
          name: user.name,
          password: user.password,
          role: user.rol,
          changePass: user.changepassword,
          statusprofile: user.statusprofile,
        },
        message,
      };
    }
    return { message };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || 'some-random-secret-key',
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ name: z.string().min(3), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { name, password } = parsedCredentials.data;
          const response = await getUser(name, password);

          if (!response?.user) return null;

          if (response.user.statusprofile === 'Deshabilitado') {
            throw new Error('User is disabled.');
          }
          if (response.user.statusprofile === 'Eliminado') {
            throw new Error('User is disabled.');
          }
          return {
            idUser: response.user.idUser,
            name: response.user.name,
            role: response.user?.role,
            changePass: response.user?.changePass,
          };
        }
        return null;
      },
    }),
  ],


    
});
