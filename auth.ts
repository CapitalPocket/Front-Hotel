import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import type { ApiResponse } from '@/app/lib/definitions';
// Define the structure of the response from the API
interface LoginResponse {
  user?: {
    idUser: string;
    name: string;
    email: string;
    password: string;
    rol: string;
    park: string;
    changePass: boolean;
    statusprofile: string;
  };
  message: string;
  token?: string;
}

import axios from 'axios';

async function getUser(
  phone_number: string,
  email: string,
  password: string,
): Promise<LoginResponse | undefined> {
  try {
    const response = await axios.post<ApiResponse>(

      `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/taquilla/loginUser`,
      { email, password },

    );

    const apiResponse = response.data;
    const { message } = apiResponse;
    
    if (apiResponse.user) {
      
      const user = apiResponse.user;
      return {
        user: {
          id_employee: user.id_employee.toString(),
          name: user.name,
          phone_number: user.phone_number,
          role: user.role,
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
          .object({ phone_number: z.string().min(3), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { phone_number, password } = parsedCredentials.data;
          const response = await getUser(phone_number, phone_number, password);

          if (!response?.user) return null;

          if (response.user.statusprofile === 'Deshabilitado') {
            throw new Error('User is disabled.');
          }
          if (response.user.statusprofile === 'Eliminado') {
            throw new Error('User is disabled.');
          }
          return {
            id_employee: response.user.id_employee,
            name: response.user.name,
            phone_number: response.user.phone_number,
            role: response.user?.role,
            statusprofile: response.user.statusprofile,
          };
        }
        return null;
      },
    }),
  ],


    
});
