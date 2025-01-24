import {
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData,fetchCardDataCandidatos } from '@/app/lib/data';

const iconMap = {
  
  Total: UserGroupIcon,
  no_pasaron: XMarkIcon,
  proceso: ClockIcon,
  Enviados: InboxIcon,
};

export default async function CardWrapper({grupo}: {grupo: string;}) {
  const {
    totalCandidatos,
    candidatosEnProceso,
    candidatosEnviados,
    candidatosNoPasaron,
  } = await fetchCardDataCandidatos(grupo);

  return (
    <>
     
      <Card title="Candidatos Total" value={totalCandidatos} type="Total" />
      <Card title="En proceso" value={candidatosEnProceso} type="proceso" />
      <Card title="Enviados " value={candidatosEnviados} type="Enviados" />
      <Card
        title="No pasaron"
        value={candidatosNoPasaron}
        type="no_pasaron"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'Enviados' | 'no_pasaron' | 'proceso' | 'Total';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-2 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
