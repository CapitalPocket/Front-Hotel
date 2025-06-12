import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';


// Extend the ApiResponse type to include the token property
interface ApiResponse {
  user?: {
    idUser: string;
    name: string;
    email: string;
    password: string;
    rol: string;
    idpark: string;
    changepassword: boolean;
    statusprofile: string;
  };
  message: string;
  token?: string;
}
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
  email: string,
  password: string,
): Promise<LoginResponse | undefined> {
  try {
    const response = await axios.post<ApiResponse>(
      `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/taquilla/loginUser`,
      { email, password },
    );

    const apiResponse = response.data;
    const { message , token } = apiResponse;

    if (apiResponse.user) {
      const user = apiResponse.user;
      return {
        user: {
          idUser: String(user.idUser),
          name: user.name,
          email: user.email,
          password: user.password,
          rol: user.rol,
          park: user.idpark,
          changePass: user.changepassword,
          statusprofile: user.statusprofile,
        },
        message,
        token: token,
      };
    }
    return { message };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const {handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || 'some-random-secret-key',
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

          if (response.user.statusprofile === 'Deshabilitado') {
            throw new Error('User is disabled.');
          }
          if (response.user.statusprofile === 'Eliminado') {
            throw new Error('User is disabled.');
          }
          return {
            idUser: response.user.idUser,
            name: response.user.name,
            email: response.user.email,
            role: response.user?.rol,
            park: response.user?.park,
            changePass: Boolean(response.user?.changePass),
            token: response.token,
          };
        }
        return null;
      },
    }),
  ],


    
});