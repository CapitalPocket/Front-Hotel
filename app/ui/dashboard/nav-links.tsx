'use client';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  TicketIcon,
  ClipboardDocumentIcon,
  Cog8ToothIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export const links = [
  /*{
    name: 'Home',
    href: '/dashboard',
    icon: HomeIcon,
    roles: ['administrador', 'supervisor', 'marketing', 'taquillero'],
  },
  {
    name: 'Tickets',
    href: '/dashboard/tickets',
    roles: ['administrador', 'taquillero', 'supervisor'],
    icon: TicketIcon,
  },
  {
    name: 'Ventas',
    href: '/dashboard/graphs-sales',
    icon: ChartBarIcon,
    roles: ['administrador', 'marketing'],
  },
  {
    name: 'Interacciones',
    href: '/dashboard/graphs-interactions',
    icon: ChartPieIcon,
    roles: ['administrador', 'marketing'],
  },
  */{
    name: 'Horarios',
    href: '/dashboard/invoices',
    icon: ClipboardDocumentIcon,
    roles: ['administrador', 'marketing'],
  },
  {
    name: 'Estado de Habitacion',
    href: '/dashboard/parks',
    icon: Cog8ToothIcon,
    roles: ['administrador', 'marketing'],
  },
 
  {
    name: 'Pagos Empleados',
    href: '/dashboard/portfolio',
    icon: CurrencyDollarIcon,
    roles: ['administrador', 'marketing'],
  },
  {
    name: 'Empleados',
    href: '/dashboard/candidatos',
    icon: UserGroupIcon,
    roles: ['administrador'],
  },
  /*{
    name: 'Redenciones',
    href: '/dashboard/redenciones',
    icon: DocumentDuplicateIcon,
    roles: ['administrador', 'supervisor'],
  },*/
];

export default function NavLinks(rol: any) {
  const pathname = usePathname();
 
  return (
    <div className="flex md:flex-col md:w-[90%] gap-1 mx-auto">
      {links
        .filter((link) => link.roles.includes(rol.rol)) // Filtra según el rol del usuario
        .map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex h-[48px] grow items-center justify-center gap-2 rounded-md  p-3 text-gray-500 text-sm font-medium hover:bg-slate-400/20 hover:scale-105 duration-300 hover:font-bold hover:text-gray-900 md:flex-none md:justify-start md:p-2 md:px-3',
                {
                  'bg-slate-400/30 text-gray-900 font-bold scale-105': pathname === link.href,
                },
              )}
            >
              <LinkIcon width={25} height={25} />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        })}
    </div>
  );
}
