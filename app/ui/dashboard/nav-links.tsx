'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { FaRegCalendarAlt, FaHotel, FaMoneyBillWave, FaUsers, FaUserCheck } from 'react-icons/fa';
import { LiaHotelSolid } from "react-icons/lia";
import { GrAction } from "react-icons/gr";

export const links = [
  {
    name: 'Horarios',
    href: '/dashboard/invoices',
    icon: FaRegCalendarAlt,
    roles: ['administrador', 'marketing'],
  },
  {
    name: 'Estado de Habitación',
    href: '/dashboard/parks',
    icon: FaHotel,
    roles: ['administrador', 'marketing'],
  },
  {
    name: 'Pagos Empleados',
    href: '/dashboard/portfolio',
    icon: FaMoneyBillWave,
    roles: ['administrador', 'marketing'],
  },
  {
    name: 'Empleados',
    href: '/dashboard/candidatos',
    icon: FaUsers,
    roles: ['administrador'],
  },
  {
    name: 'Propiedades',
    href: '/dashboard/redenciones',
    icon: LiaHotelSolid,
    roles: ['administrador'],
  },
  {
    name: "Ingreso/Salida",
    href: "/dashboard/graphs-sales",
    icon: GrAction,
    roles: ['administrador', 'marketing'],
  },
  {
    name: "Asignaciones",
    href: "/dashboard/asignacion",
    icon: FaUserCheck,
    roles: ['administrador'],
  },
];

export default function NavLinks({ rol }: { rol: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 w-full">
      {links
        .filter((link) => link.roles.includes(rol))
        .map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300 text-slate-300 hover:bg-slate-800/70 hover:text-white',
                {
                  'bg-gradient-to-r from-slate-700 to-slate-600 text-white font-semibold shadow-md': pathname === link.href,
                }
              )}
            >
              <span
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/70 text-base transition-colors',
                  { 'bg-white/20': pathname === link.href }
                )}
              >
                <Icon />
              </span>
              <p className="text-sm">{link.name}</p>
            </Link>
          );
        })}
    </nav>
  );
}
