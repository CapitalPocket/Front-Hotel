"use client";
import Link from "next/link";
import React from "react";
import { useSession } from "@/app/context";
import { FaCalendarAlt, FaHotel, FaMoneyBillWave, FaUsers } from "react-icons/fa";
import { LiaHotelSolid } from "react-icons/lia";
import { GrAction } from "react-icons/gr";
// Enlaces con iconos correctos y descripciones
const links = [
  {
    name: "Horarios",
    href: "/dashboard/invoices",
    icon: FaCalendarAlt,
    description: "Consulta y gestiona los horarios disponibles.",
    roles: ["administrador", "marketing"],
  },
  {
    name: "Estado de Habitación",
    href: "/dashboard/parks",
    icon: FaHotel,
    description: "Monitorea la disponibilidad y limpieza de habitaciones.",
    roles: ["administrador", "marketing"],
  },
  {
    name: "Pagos Empleados",
    href: "/dashboard/portfolio",
    icon: FaMoneyBillWave,
    description: "Administra los pagos y sueldos del personal.",
    roles: ["administrador", "marketing"],
  },
  {
    name: "Empleados",
    href: "/dashboard/candidatos",
    icon: FaUsers,
    description: "Gestiona información y contratación de empleados.",
    roles: ["administrador"],
  },
  {
    name: "Hoteles",
    href: "/dashboard/redentions",
    icon: LiaHotelSolid,
    description: "Administra la creación y almacenamiento de hoteles, gestionando su información de manera eficiente.",
    roles: ["administrador"],
  },
  {
    name: "Ingreso/Salida",
    href: "/dashboard/graphs-sales",
    icon: GrAction,
    description: "Consulta y gestiona los horarios disponibles.",
    roles: ["administrador", "marketing"],
  },

];

const Marketing = () => {
  const session = useSession();
  const userRole = session?.user?.role || "invitado"; // Evitar errores si session no está cargada

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mx-auto px-4">
      {links
        .filter((permision) => permision.roles.includes(userRole))
        .map((element) => {
          const Icon = element.icon;
          return (
            <Link href={element.href} key={element.href} className="w-full">
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-105 border border-gray-200 h-48">
              <Icon className="text-5xl text-gray-700 mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">{element.name}</h3>
                <p className="text-sm text-gray-500 text-center">{element.description}</p>
              </div>
            </Link>
          );
        })}
    </div>

  );
};

export default Marketing;
