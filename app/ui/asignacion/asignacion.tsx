"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Building2, Pencil, RefreshCcw, Repeat, Search, Users } from "lucide-react";
import EditStatusModal from "./editstatusmodal";
import RessignModal from "./ressignmodal";
import { AppToastContainer, notifyError } from "@/app/utils/toast";

interface Assignment {
  assignment_id: number;
  room_number: string;
  status: string;
  category: string;
  created_at: string;
  employee_name: string;
  id_employee: number;
  room_category: string;
  room_status: string;
  hotel_name: string;
}

const sanitizeEnv = (rawValue: string | undefined) =>
  typeof rawValue === "string" ? rawValue.replace(/[`'"\s]/g, "").trim() : "";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const AssignmentsView = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState<boolean>(false);
  const [selectedHotel, setSelectedHotel] = useState<string>("");
  const [employeeQuery, setEmployeeQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const assignmentsEndpoint = "/api/hotel/getTodayAssignments";
  const headers = useMemo(() => {
    const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_REMINDERS_API_KEY || "";
    const apiKey = sanitizeEnv(rawApiKey);
    return apiKey
      ? {
          "x-api-key": apiKey,
          Authorization: `Api-Key ${apiKey}`,
        }
      : undefined;
  }, []);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(assignmentsEndpoint, headers ? { headers } : undefined);
      setAssignments(Array.isArray(response.data) ? response.data : []);
      setLastUpdated(new Date().toLocaleTimeString("es-CO"));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setAssignments([]);
        setLastUpdated(new Date().toLocaleTimeString("es-CO"));
      } else {
        setAssignments([]);
        notifyError("No pudimos cargar las asignaciones. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [assignmentsEndpoint, headers]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const hotels = useMemo(
    () =>
      Array.from(new Set(assignments.map((assignment) => assignment.hotel_name))).sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [assignments],
  );

  const normalizedEmployeeQuery = employeeQuery.trim().toLowerCase();

  const filteredAssignments = useMemo(() => {
    const filteredByHotel = selectedHotel
      ? assignments.filter((assignment) => assignment.hotel_name === selectedHotel)
      : assignments;
    if (!normalizedEmployeeQuery) {
      return filteredByHotel;
    }
    return filteredByHotel.filter((assignment) =>
      assignment.employee_name.toLowerCase().includes(normalizedEmployeeQuery),
    );
  }, [assignments, normalizedEmployeeQuery, selectedHotel]);

  const groupedAssignments = useMemo(
    () =>
      filteredAssignments.reduce(
        (accumulator, assignment) => {
          if (!accumulator[assignment.employee_name]) {
            accumulator[assignment.employee_name] = [];
          }
          accumulator[assignment.employee_name].push(assignment);
          return accumulator;
        },
        {} as Record<string, Assignment[]>,
      ),
    [filteredAssignments],
  );

  const totalRooms = filteredAssignments.length;
  const totalEmployees = Object.keys(groupedAssignments).length;

  const closeModal = () => {
    setSelectedAssignment(null);
    setIsReassignModalOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      <AppToastContainer />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Operación diaria</p>
            <h2 className="text-3xl font-bold text-slate-800">Asignaciones de habitaciones</h2>
            <p className="text-sm text-slate-500">
              Visualiza, edita y reasigna habitaciones de forma centralizada.
            </p>
          </div>
          <button
            onClick={fetchAssignments}
            disabled={isLoading}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
              isLoading
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-700"
            }`}
          >
            <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Habitaciones</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{totalRooms}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Empleados</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{totalEmployees}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Última actualización</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">{lastUpdated || "Sin sincronizar"}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            <label htmlFor="hotelFilter" className="mb-2 block text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2">
                <Building2 size={16} /> Hotel
              </span>
            </label>
            <select
              id="hotelFilter"
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-500"
              value={selectedHotel}
              onChange={(event) => setSelectedHotel(event.target.value)}
            >
              <option value="">Todos los hoteles</option>
              {hotels.map((hotel) => (
                <option key={hotel} value={hotel}>
                  {hotel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="employeeFilter" className="mb-2 block text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2">
                <Users size={16} /> Buscar empleado
              </span>
            </label>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="employeeFilter"
                value={employeeQuery}
                onChange={(event) => setEmployeeQuery(event.target.value)}
                placeholder="Ej. Maria, Carlos..."
                className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-500"
              />
            </div>
          </div>
        </div>
      </section>

      {totalEmployees === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-700">No hay asignaciones para los filtros seleccionados.</p>
          <p className="mt-2 text-sm text-slate-500">Prueba limpiando filtros o actualizando la vista.</p>
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(groupedAssignments).map(([employee, employeeAssignments]) => (
            <article
              key={employee}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{employee}</h3>
                  <p className="text-sm text-slate-500">{employeeAssignments[0].hotel_name}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {employeeAssignments.length} hab.
                </span>
              </div>

              <div className="space-y-3">
                {employeeAssignments.map((assignment) => (
                  <div key={assignment.assignment_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">
                        {assignment.room_number}
                        {assignment.category}
                      </p>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600">
                        {assignment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(assignment.created_at)}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setIsReassignModalOpen(false);
                        }}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setIsReassignModalOpen(true);
                        }}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-white transition hover:bg-amber-600"
                      >
                        <Repeat size={13} />
                        Reasignar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {selectedAssignment && !isReassignModalOpen && (
        <EditStatusModal assignment={selectedAssignment} onClose={closeModal} onUpdated={fetchAssignments} />
      )}

      {selectedAssignment && isReassignModalOpen && (
        <RessignModal assignment={selectedAssignment} onClose={closeModal} onReassigned={fetchAssignments} />
      )}
    </div>
  );
};

export default AssignmentsView;
