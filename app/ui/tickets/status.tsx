import { CheckIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function TicketStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-green-500 text-white': status === 'Valido', // Verde para tickets válidos
          'bg-blue-500 text-white': status === 'Usado', // Azul para tickets usados
          'bg-red-500 text-white': status === 'Cancelado', // Rojo para tickets cancelados
          'bg-amber-500 text-white': status === 'Devolucion', // Ámbar para devoluciones
        },
      )}
    >
      {status === 'Valido' ? (
        <>
         Valido
         <CheckIcon className="ml-1 w-4 text-white" />
         
        </>
      ) : null}
      {status === 'Usado' ? (
        <>
         Usado
         
        </>
      ) : null}
      {status === 'Cancelado' ? (
        <>
          Cancelado
          <XMarkIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
       {status === 'Devolucion' ? (
        <>
          Devolucion
          <ClockIcon className="ml-1 w-4  text-gray-600" />
         
        </>
      ) : null}
    </span>
  );
}
