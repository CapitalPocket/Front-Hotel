'use client';

import {
  BackspaceIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { updateUser } from '@/app/lib/actions';
import { useState } from 'react';

export function CreateInvoice({ grupo }: { grupo: string }) {
  const href =
    grupo === 'Buen Comienzo'
      ? '/dashboard/customers/create'
      : '/dashboard/candidatos/create';

  return (
    <Link
      href={href}
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Crear Candidato</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id, page }: { id: string; page: number }) {
  const href = '/dashboard/candidatos/' + id + '/edit?page=' + page;
  return (
    <Link href={href} className="rounded-md border p-2 hover:bg-gray-100">
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function Enable({ id_employee }: { id_employee: string }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setConfirmDelete(true); 
  };

  const handleConfirmDelete = () => {
    const payload = {
      id: id_employee, 
      updates: {
        statusprofile: "Habilitado", 
      },
    };
  
    updateUser(payload)
      .then(() => {
        window.location.reload(); 
      })
      .catch((error) => {
        console.error('Error al Habilitado el usuario: ', error);
      });
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false); 
  };

  return (
    <div>
      {confirmDelete ? (
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center rounded-md bg-green-500 px-4 py-2 text-sm text-white transition-colors hover:bg-green-400"
            onClick={handleConfirmDelete}
          >
            <UserPlusIcon className="mr-2 w-5" />
            Habilitar
          </button>

          <button
            className="rounded-md border p-2 hover:bg-gray-100"
            onClick={handleCancelDelete}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <form>
          <button
            className="rounded-md border bg-green-500/20 p-2 hover:bg-green-200 "
            onClick={handleDeleteClick}
          >
            <span className=" ">Habilitar User</span>
          </button>
        </form>
      )}
    </div>
  );
}

export function Desabled({ id_employee }: { id_employee: string }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    const payload = {
      id: id_employee, 
      updates: {
        statusprofile: "Deshabilitado", 
      },
    };
  
    updateUser(payload)
      .then(() => {
        window.location.reload(); 
      })
      .catch((error) => {
        console.error('Error al deshabilitar el usuario: ', error);
      });
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false); 
  };

  return (
    <div>
      {confirmDelete ? (
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center rounded-md  bg-yellow-400 px-4 py-2 text-sm text-white transition-colors hover:bg-yellow-500"
            onClick={handleConfirmDelete}
          >
            <UserMinusIcon className="mr-2 w-5" />
            Deshabilitar
          </button>

          <button
            className="rounded-md border p-2 hover:bg-gray-100"
            onClick={handleCancelDelete}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <form>
          <button
            className="rounded-md border  bg-yellow-400/30 p-2 hover:bg-yellow-500 "
            onClick={handleDeleteClick}
          >
            <span className=" ">Deshabilitar Empleado</span>
          </button>
        </form>
      )}
    </div>
  );
}


export function DeleteInvoice({ id_employee }: { id_employee: string }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setConfirmDelete(true); 
  };

  const handleConfirmDelete = () => {
    const payload = {
      id: id_employee, 
      updates: {
        statusprofile: "Eliminado", 
      },
    };
  
    updateUser(payload)
      .then(() => {
        window.location.reload(); 
      })
      .catch((error) => {
        console.error('Error al Eliminado el usuario: ', error);
      });
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false); 
  };

  return (
    <div>
      {confirmDelete ? (
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center rounded-md bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-400"
            onClick={handleConfirmDelete}
          >
            <TrashIcon className="mr-2 w-5" />
            Eliminar
          </button>

          <button
            className="rounded-md border p-2 hover:bg-gray-100"
            onClick={handleCancelDelete}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <form>
          <button
            className="rounded-md border bg-red-200 p-2 hover:bg-red-300 "
            onClick={handleDeleteClick}
          >
            <span className="hidden">Desahabilitar User</span>
            <TrashIcon className=" w-5  " />
          </button>
        </form>
      )}
    </div>
  );
}

export function UpdatePass({ id_employee }: { id_employee: string }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setConfirmDelete(true); 
  };

  const handleConfirmDelete = () => {
    console.log(id_employee);
    // deleteCandidato(id).then(() => {
    //   window.location.reload(); 
    // })
    //   .catch((error) => {
    //     console.error("Error eliminando el candidato: ", error);
    //   }); // Llamar a la acción de eliminar
    setConfirmDelete(false); 
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false); 
  };

  return (
    <div>
      {confirmDelete ? (
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center rounded-md bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-400"
            onClick={handleConfirmDelete}
          >
            <BackspaceIcon className="mr-2 w-5" />
            Restablecer
          </button>

          <button
            className="rounded-md border p-2 hover:bg-gray-100"
            onClick={handleCancelDelete}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <form>
          <button
            className="rounded-md border bg-blue-200 p-2 hover:bg-blue-300"
            onClick={handleDeleteClick}
          >
            <span className="">Restablecer Contraseña</span>
          </button>
        </form>
      )}
    </div>
  );
}