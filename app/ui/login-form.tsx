'use client';
import {
  KeyIcon,
  ExclamationCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';

export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
  return (
    <form action={dispatch} className="space-y-6 max-w-sm mx-auto">
      <div className="rounded-lg bg-gray-800 p-8 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-200 text-center">Iniciar sesión</h2>
        <p className="text-sm text-gray-400 text-center mb-6">Accede a tu cuenta</p>
        <div className="w-full">
          <div>

            <label className="block text-sm font-medium text-gray-300" htmlFor="email">
              Nombre de usuario

            </label>
            <div className="relative mt-1">
              <input

                className="peer block w-full rounded-md border border-gray-600 bg-gray-700 py-2 pl-10 text-sm text-gray-200 shadow-sm focus:border-gray-400 focus:ring focus:ring-gray-500"
                id="email"

                type="text"
                name="phone_number"
                placeholder="Ingrese usuario"
                required
              />
              <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-gray-300" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300" htmlFor="password">
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                className="peer block w-full rounded-md border border-gray-600 bg-gray-700 py-2 pl-10 text-sm text-gray-200 shadow-sm focus:border-gray-400 focus:ring focus:ring-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Ingrese contraseña"
                required
                minLength={6}
              />
              <KeyIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-gray-300" />
            </div>
          </div>
        </div>
        <LoginButton />
        {errorMessage && (
          <div className="mt-3 flex items-center space-x-2 text-red-400 text-sm">
            <ExclamationCircleIcon className="h-5 w-5" />
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="mt-6 w-full flex items-center justify-center bg-gray-700 text-gray-200 py-2 rounded-md shadow-md hover:bg-gray-600 transition-all duration-300 disabled:bg-gray-500" aria-disabled={pending}>
      {pending ? 'Cargando...' : 'Entrar'}
      <ArrowRightIcon className="ml-2 h-5 w-5 text-gray-200" />
    </Button>
  );
}
