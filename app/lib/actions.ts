'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
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
  name: z.string().nonempty({ message: 'Nombre es Requerido.' }),
  password: z.string().nonempty({ message: 'password es Requerido.' }),
  role: z.string().min(1, { message: 'Rol del usurio es requerido.' }),
  phone_number: z.string().nonempty({ message: 'Número de teléfono es Requerido.' }),
  
});

export type Statee = {
  errors?: {
    name?: string[];
    nombreUser?: string[];
    password?: string[];
    role?: string[];
    
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
    phone_number: formObject.phone_number,
    park: formObject.park,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos.',
    };
  }
  const { name, password, role, phone_number} = validatedFields.data;

  try {
    const response = await axios.post(
      `/api/hotel/getAllEmployees`,
      {
        name: name,
      
        phone_number: phone_number,
        password: password,
        rol: role,
        
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
    const response = await axios.post(
      `/api/taquilla/validateTicket`,
      ticketCode,
    );
    return response.data.message;
  } catch (error) {
    console.error('Error al validar el ticket:', error);
    throw error; // Propagar el error
  }
}


export async function updateUser(user: any) {
  try {
    console.log(user);
    const response = await axios.post(

      `${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotel/updateStatus`,

      user,
    );
    revalidatePath('/dashboard/candidatos');
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Candidate' };
  }
}
