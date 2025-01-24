import clsx from 'clsx';

export default function UserStatus({ status }: { status: string }) {
 
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'border border-green-500 bg-green-500/10 text-green-500 font-bold':status === 'Habilitado', 
          'border border-yellow-400  bg-yellow-400/10 text-yellow-400 font-bold': status === 'Deshabilitado',
          'border border-red-500 bg-red-500/10 text-red-500 font-bold': status === 'Eliminado'
        },
      )}
    >
      {status === 'Habilitado' ? <>Habilitado</> : null}
      {status === 'Deshabilitado' ? <>Deshabilitado</> : null}
      {status === 'Eliminado' ? <>Eliminado</> : null}
    </span>
  );
}
