import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { ApiResponse, LoginResponse } from '@/app/lib/definitions';
import axios from 'axios';

const normalizeHotelRole = (role: string | undefined): string => {
  const normalized = (role || '').trim().toLowerCase();
  if (normalized === 'administrador') return 'administrador';
  if (normalized === 'hk supervisor') return 'supervisor';
  if (normalized === 'housekeeper') return 'taquillero';
  return normalized;
};

async function getUser(
  phone_number: string,
  password: string,
): Promise<LoginResponse | undefined> {
  try {
    const sanitizeEnv = (rawValue: string | undefined) =>
      typeof rawValue === 'string' ? rawValue.replace(/[`'"\s]/g, '').trim() : '';

    const rawBase =
      process.env.NEXT_PUBLIC_HOTEL_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:8000';
    const base = sanitizeEnv(rawBase);
    const rawApiKey =
      process.env.NEXT_PUBLIC_API_KEY ||
      process.env.NEXT_PUBLIC_REMINDERS_API_KEY ||
      process.env.API_KEY ||
      '';
    const apiKey = sanitizeEnv(rawApiKey);

    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['x-api-key'] = apiKey;
      headers.Authorization = `Api-Key ${apiKey}`;
    }

    const response = await axios.post<ApiResponse>(
      `${base}/api/hotel/loginUser`,
      { phone_number, password },
      { headers },
    );

    const apiResponse = response.data;
    const { message, token } = apiResponse;

    if (apiResponse.user) {
      const user = apiResponse.user;
      const normalizedRole = normalizeHotelRole(user.role);
      return {
        user: {
          idUser: user.id_employee.toString(),
          name: user.name,
          email: user.phone_number,
          password: user.password,
          rol: normalizedRole,
          park: String(user.current_hotel_id || ''),
          statusprofile: user.statusprofile,
        },
        message,
        token: token,
      };
    }
    return { message };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    if (axios.isAxiosError(error)) {
      const backendMessage = error.response?.data?.message;
      if (typeof backendMessage === 'string' && backendMessage.trim()) {
        throw new Error(backendMessage);
      }
      throw new Error('No fue posible autenticar con el servicio de hoteles.');
    }
    throw new Error('No fue posible autenticar con el servicio de hoteles.');
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || 'some-random-secret-key',
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ phone_number: z.string().min(8), password: z.string().min(4) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { phone_number, password } = parsedCredentials.data;
          const response = await getUser(phone_number, password);

          if (!response?.user) {
            throw new Error(response?.message || 'Credenciales incorrectas.');
          }

          if (response.user.statusprofile === 'Deshabilitado') {
            throw new Error('El usuario está deshabilitado.');
          }
          if (response.user.statusprofile === 'Eliminado') {
            throw new Error('El usuario ha sido eliminado.');
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
});
