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
import { useMemo, useState } from 'react';

const COUNTRY_CODES = [
  { label: 'Colombia (+57)', value: '57' },
  { label: 'México (+52)', value: '52' },
  { label: 'Perú (+51)', value: '51' },
  { label: 'Chile (+56)', value: '56' },
  { label: 'Argentina (+54)', value: '54' },
  { label: 'Ecuador (+593)', value: '593' },
  { label: 'Estados Unidos (+1)', value: '1' },
];

export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
  const [countryCode, setCountryCode] = useState('57');
  const [phoneLocal, setPhoneLocal] = useState('');
  const normalizedPhone = useMemo(
    () => `${countryCode}${phoneLocal.replace(/\D/g, '')}`,
    [countryCode, phoneLocal],
  );

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Autenticación</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Iniciar sesión</h2>
        <p className="mt-2 text-sm text-slate-300">Accede con tu número de teléfono y contraseña</p>
      </div>

      <div className="w-full space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-200" htmlFor="phone_local">
            Teléfono
          </label>
          <input type="hidden" name="phone_number" value={normalizedPhone} />
          <div className="mt-2 flex gap-2">
            <select
              className="w-40 rounded-md border border-white/15 bg-slate-900/70 px-2 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
              name="country_code"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
            >
              {COUNTRY_CODES.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <input
                className="peer block w-full rounded-md border border-white/15 bg-slate-900/70 py-2 pl-10 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
                id="phone_local"
                type="tel"
                name="phone_local"
                value={phoneLocal}
                onChange={(event) => setPhoneLocal(event.target.value)}
                placeholder="3224563243"
                required
                minLength={6}
              />
              <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 peer-focus:text-cyan-300" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200" htmlFor="password">
            Contraseña
          </label>
          <div className="relative mt-2">
            <input
              className="peer block w-full rounded-md border border-white/15 bg-slate-900/70 py-2 pl-10 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
              id="password"
              type="password"
              name="password"
              placeholder="Ingrese contraseña"
              required
              minLength={6}
            />
            <KeyIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 peer-focus:text-cyan-300" />
          </div>
        </div>
      </div>

      <LoginButton />
      {errorMessage && (
        <div className="flex items-center space-x-2 text-sm text-rose-300">
          <ExclamationCircleIcon className="h-5 w-5" />
          <p>{errorMessage}</p>
        </div>
      )}
      <p className="border-t border-white/10 pt-4 text-xs text-slate-400">
        Usa el código de país y tu número sin espacios para iniciar sesión.
      </p>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full rounded-md bg-cyan-400 py-2 text-slate-900 transition hover:bg-cyan-300 disabled:bg-cyan-700 disabled:text-slate-200" aria-disabled={pending}>
      {pending ? 'Cargando...' : 'Entrar'}
      <ArrowRightIcon className="ml-2 h-5 w-5" />
    </Button>
  );
}
