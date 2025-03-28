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
  nombre: z.string().nonempty({ message: 'Nombre es Requerido.' }),
  password: z.string().nonempty({ message: 'password es Requerido.' }),
  rol: z.string().min(1, { message: 'Rol del usurio es requerido.' }),
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
      `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/taquilla/createUser`,
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
    const response = await axios.post(
      `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/taquilla/validateTicket`,
      ticketCode,
    );
    return response.data.message;
  } catch (error) {
    console.error('Error al validar el ticket:', error);
    throw error; // Propagar el error
  }
}

// const UpdateCandidato = FormSchemaa.omit({ id: true });

// export async function updateCandidato(
//   id: string,
//   prevState: Statee,
//   formData: FormData,
// ) {
//   const formObject = Object.fromEntries(formData.entries());
//   const validatedFields = UpdateCandidato.safeParse({
//     tipoid: formObject.tipoid,
//     nombre: formObject.nombre,
//     celular: formObject.celular,
//     cargo: formObject.cargo,
//     correo: formObject.correo,
//     motivo: formObject.motivo,
//     estado_proceso: formObject.estado_proceso,
//     fecha_envio: formObject.fecha_envio,
//     fecha_ingreso: formObject.fecha_ingreso,
//     grupo: formObject.grupo,
//     estadoCandidato: formObject.estadoCandidato
//       ? Number(formObject.estadoCandidato)
//       : undefined,
//     user_creo: formObject.user_creo ? Number(formObject.user_creo) : undefined,
//     page: formObject.page,
//     keyword: formObject.keyword,
//   });

//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: 'Missing Fields. Failed to Update Candidate.',
//     };
//   }

//   const {

//   } = validatedFields.data;

//   try {

//   } catch (error) {
//     return { message: 'Database Error: Failed to Update Candidate.' };
//   }

// }

export async function updateUser(user: any) {
  try {
    console.log(user);
    const response = await axios.post(
      `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/updateStatus`,
      user,
    );
    revalidatePath('/dashboard/candidatos');
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Candidate' };
  }
}
