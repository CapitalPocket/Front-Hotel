'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/auth';
import { AuthError } from 'next-auth';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CallbackRouteError':
          return 'Cuenta inhabilitada';
        case 'CredentialsSignin':
          return 'Usuario invalido.';
        default:
          return 'Algo salió mal.';
      }
    }

    throw error;
  }
}

const FormSchemaa = z.object({
  nombreUser: z
    .string()
    .nonempty({ message: 'Nombre de usuario es Requerido.' }),
  nombre: z.string().nonempty({ message: 'Nombre es Requerido.' }),
  password: z.string().nonempty({ message: 'password es Requerido.' }),
  rol: z.string().min(1, { message: 'Rol del usuario es requerido.' }),
  park: z.string().nonempty({ message: 'Seleccione un parque.' }),
});

export type Statee = {
  errors?: {
    nombre?: string[];
    nombreUser?: string[];
    password?: string[];
    rol?: string[];
    park?: string[];
  };
  message?: string | null;
};

const CreateCandidato = FormSchemaa.omit({});

export async function createCandidato(prevState: Statee, formData: FormData) {
  const formObject = Object.fromEntries(formData.entries());
  const validatedFields = CreateCandidato.safeParse({
    nombre: formObject.nombre,
    nombreUser: formObject.nombreUser,
    password: formObject.password,
    rol: formObject.rol,
    park: formObject.park,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos.',
    };
  }
  const { nombre, nombreUser, password, rol, park } = validatedFields.data;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_LINK}/api/taquilla/createUser`,
      {
        name: nombre,
        email: nombreUser,
        password: password,
        rol: rol,
        idpark: park,
      },
    );

    return {
      message: response.data.message,
    };
  } catch (error) {
    return {
      message: 'Database Error: error al crear el usuario.' + error,
    };
  }
}

export async function validateTicket(ticketCode: any) {
  try {
    const session = await auth();
    const token = session?.accessToken;
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_LINK}/api/taquilla/validateTicketNew`,
      ticketCode,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data.message;
  } catch (error) {
    console.error('Error al validar el ticket:', error);
    throw error; // Propagar el error
  }
}

const FormSchemaUser = z.object({
  nombreUser: z
    .string()
    .nonempty({ message: 'Nombre de usuario es Requerido.' }),
  nombre: z.string().nonempty({ message: 'Nombre es Requerido.' }),
  rol: z.string().min(1, { message: 'Rol del usuario es requerido.' }),
});

const updateuser = FormSchemaUser.omit({});
export async function updateCandidato(
  id: number,
  prevState: Statee,
  formData: FormData,
) {
  const formObject = Object.fromEntries(formData.entries());
  const validatedFields = updateuser.safeParse({
    nombre: formObject.nombre,
    nombreUser: formObject.nombreUser,
    rol: formObject.rol,
    park: formObject.park,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos. No se ha podido actualizar el Usuario.',
    };
  }
  try {
    const { nombre, nombreUser, rol } = validatedFields.data;
    const session = await auth();
    const token = session?.accessToken;
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_LINK}/api/taquilla/updateUserByIdTaquilla`,
      {
        id: id,
        updates: {
          name: nombre,
          email: nombreUser,
          rol: rol,
        },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    revalidatePath('/dashboard/candidatos');
    redirect('/dashboard/candidatos');
  } catch (error) {
    return { message: 'Database Error: Failed to Update Candidate' };
  }
}

export async function updateUser(user: any) {
  try {
    const session = await auth();
    const token = session?.accessToken;
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_LINK}/api/taquilla/updateUserByIdTaquilla`,
      { user },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    revalidatePath('/dashboard/candidatos');
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Candidate' };
  }
}