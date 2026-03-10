"use client";
import Link from "next/link";
import React from "react";
import { useSession } from "@/app/context";
import { FaCalendarAlt, FaHotel, FaMoneyBillWave, FaUsers, FaUserCheck } from "react-icons/fa";
import { LiaHotelSolid } from "react-icons/lia";
import { GrAction } from "react-icons/gr";

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
    name: "Propiedades",
    href: "/dashboard/redenciones",
    icon: LiaHotelSolid,
    description: "Administra la información de hoteles y ubicaciones.",
    roles: ["administrador"],
  },
  {
    name: "Ingreso/Salida",
    href: "/dashboard/graphs-sales",
    icon: GrAction,
    description: "Consulta y gestiona los horarios disponibles.",
    roles: ["administrador", "marketing"],
  },
  {
    name: "Asignaciones",
    href: "/dashboard/asignacion",
    icon: FaUserCheck,
    description: "Revisa qué habitaciones tiene asignadas cada empleado.",
    roles: ["administrador"],
  },
];

const Marketing = () => {
  const session = useSession();
  const userRole = session?.user?.role || "invitado";
  const userName = session?.user?.name || "Usuario";
  const availableModules = links.filter((module) => module.roles.includes(userRole));

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-4 space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-8 md:px-10 md:py-10 text-white shadow-xl">
        <div className="relative z-10 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-200">Dashboard Hotelero</p>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight">Hola {userName}, gestiona tu operación desde un solo lugar</h1>
          <p className="text-slate-200 max-w-3xl">Accede rápido a módulos de habitaciones, personal, horarios y pagos según tu rol.</p>
        </div>
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Módulos habilitados</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800">{availableModules.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Rol activo</p>
          <p className="mt-2 text-xl font-semibold capitalize text-slate-800">{userRole}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Estado</p>
          <p className="mt-2 text-xl font-semibold text-emerald-600">Operativo</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800">Accesos rápidos</h2>
          <p className="text-sm text-slate-500">Selecciona un módulo para continuar</p>
        </div>
        <div className="grid w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {availableModules.map((element) => {
            const Icon = element.icon;
            return (
              <Link href={element.href} key={element.href} className="group">
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
                  <div className="mb-4 inline-flex rounded-xl bg-slate-900 p-3 text-white">
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900">{element.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{element.description}</p>
                  <p className="mt-5 text-sm font-medium text-slate-700">Abrir módulo →</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Marketing;
