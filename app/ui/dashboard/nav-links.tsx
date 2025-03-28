'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

// ✅ Aseguramos que los íconos se importan como componentes de React
import { FaRegCalendarAlt, FaHotel, FaMoneyBillWave, FaUsers} from 'react-icons/fa';
import { LiaHotelSolid } from "react-icons/lia";
import { GrAction } from "react-icons/gr";
export const links = [
  {
    name: 'Horarios',
    href: '/dashboard/invoices',
    icon: FaRegCalendarAlt, // ✅ Guardamos la referencia del componente (sin JSX aquí)
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
    name: 'Hoteles',
    href: '/dashboard/redenciones',
    icon: LiaHotelSolid,
    roles: ['administrador'],
  },
  {
    name: "Ingreso/Salida",
    href: "/dashboard/graphs-sales",
    icon: GrAction,
    roles: ['administrador'],
  },
  
];

export default function NavLinks({ rol }: { rol: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 w-full px-4">
      {links
        .filter((link) => link.roles.includes(rol))
        .map((link) => {
          const Icon = link.icon; // ✅ Convertimos el icono en un componente válido
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-gray-300 hover:bg-gray-800 hover:text-white',
                {
                  'bg-gray-700 text-white font-semibold': pathname === link.href,
                }
              )}
            >
              <Icon className="text-lg" /> {/* ✅ Renderizamos el icono como componente */}
              <p className="text-sm">{link.name}</p>
            </Link>
          );
        })}
    </nav>
  );
}
