'use client';
import { CustomerField, CandidatosTable } from '@/app/lib/definitions';
import { Breadcrumb } from '@/app/ui/candidatos/breadcrumbs';
import Link from 'next/link';
import {
  AtSymbolIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  IdentificationIcon,
  UserCircleIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createCandidato } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function Form({
  candidato,
  breadcrumbs,
}: {
  candidato?: CandidatosTable[];

  breadcrumbs: Breadcrumb[];
}) {
  const initialState = { message: null, errors: {}, fecha_envio: null };
  const [state, dispatch] = useFormState(createCandidato, initialState);
  const [estadoProceso, setEstadoProceso] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedPark, setSelectedPark] = useState<string>('');

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };
  const handleParkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPark(event.target.value);
  };
  const notify = (state: any) => {
    if (state.message === 'Faltan campos.') {
      toast.error(state.message, {
        position: 'top-center',
        autoClose: 3000, // Increase autoClose for errors
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.success(state.message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  useEffect(() => {
    if (state?.message) {
      notify(state);

      if (state?.message == 'Usuario creado con exito') {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  }, [state]);

  useEffect(() => {
    if (selectedRole === 'administrador' || selectedRole === 'marketing') {
      setSelectedPark('3'); // 3 representa "Todos los parques"
    } else {
      setSelectedPark('');
    }
  }, [selectedRole]);

  return (
    <div className='md:w-[50%] w-[100%] mx-auto h-screen flex flex-col justify-center'>
      <ToastContainer />
      <form action={dispatch}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          {/* Candidato Nombre */}
          <div className="mb-4">
            <label htmlFor="nombre" className="mb-2 block text-sm font-medium">
              Nombre completo
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Nombre apellido"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="amount-error"
                />
                <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              <div id="amount-error" aria-live="polite" aria-atomic="true">
                {state.errors?.nombre &&
                  state.errors.nombre.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Candidato Cargo */}
          <div className="mb-4">
            <label
              htmlFor="nombreUser"
              className="mb-2 block text-sm font-medium"
            >
              Nombre de Usuario
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="nombreUser"
                  name="nombreUser"
                  type="text"
                  min={3}
                  placeholder="Usuario"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="amount-error"
                />
                <ClipboardDocumentCheckIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              <div id="amount-error" aria-live="polite" aria-atomic="true">
                {state.errors?.nombreUser &&
                  state.errors.nombreUser.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
          {/* Candidato Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Contraseña
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  min={3}
                  placeholder="*******"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="amount-error"
                />
                <ClipboardDocumentCheckIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              <div id="amount-error" aria-live="polite" aria-atomic="true">
                {state.errors?.password &&
                  state.errors.password.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
          {/* Candidato tipo de identificacion */}
          <div className="mb-4">
            <label htmlFor="rol" className="mb-2 block text-sm font-medium">
              Rol del Perfil
            </label>
            <div className="relative">
              <select
                id="rol"
                name="rol"
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                defaultValue=""
                aria-describedby="customer-error"
                onChange={handleRoleChange}
              >
                <option value="" disabled>
                  Seleccione Rol del Usuario
                </option>
                <option key={'taquillero'} value={'taquillero'}>
                  Taquillero
                </option>
                <option key={'supervisor'} value={'supervisor'}>
                  Supervisor
                </option>
                <option key={'marketing'} value={'marketing'}>
                  Marketing
                </option>
                <option key={'administrador'} value={'administrador'}>
                  Administrador
                </option>
              </select>
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            <div id="customer-error" aria-live="polite" aria-atomic="true">
              {state.errors?.rol &&
                state.errors.rol.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* Lista de parques (solo para "taquillero" o "supervisor") */}
          {(selectedRole === 'taquillero' ||
            selectedRole === 'supervisor' ||
            selectedRole === 'administrador' ||
            selectedRole === 'marketing') && (
            <div className="mb-4">
              <label htmlFor="park" className="mb-2 block text-sm font-medium">
                Seleccione el parque
              </label>
              <div className="relative">
                <select
                  id="park"
                  name="park"
                  className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm"
                  value={selectedPark}
                  onChange={handleParkChange}
                >
                  <option value="" disabled>
                    Seleccione el Parque
                  </option>
                  <option value="1">Parque Norte</option>
                  <option value="2">Aero Parque Juan Pablo ll</option>
                  <option value="3">Todos los parques</option>
                </select>
                <BuildingOffice2Icon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              <div id="customer-error" aria-live="polite" aria-atomic="true">
                {state.errors?.park &&
                  state.errors?.park.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href={breadcrumbs[0].href}
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>

          <Button type="submit" onClick={notify}>
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
