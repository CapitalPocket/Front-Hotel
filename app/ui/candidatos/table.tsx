'use client';
import Image from 'next/image';
import axios from 'axios';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { hotelMapping } from '@/app/lib/utils';
import UserStatus from './status';
import EmployeeModal from '@/app/ui/candidatos/EmployeeModal';
import EmployeeForm from '@/app/ui/candidatos/create-form';
import { AppToastContainer, notifyError } from '@/app/utils/toast';

type Employee = {
  id_employee: number;
  current_hotel_id: number;
  name: string;
  phone_number: string;
  role: string;
  statusprofile: string;
  birthdate?: string;
  address?: string;
  social_number?: string;
  hourly_wage?: string | number;
};

type Schedule = {
  employee_id: number;
  start_time?: string;
  end_time?: string;
};

const statuses = ['Habilitado', 'Deshabilitado', 'Eliminado'] as const;

export default function InvoicesTable({
  query: initialQuery,
  currentPage: initialPage,
  status: initialStatus,
}: {
  query: string;
  currentPage: number;
  status: string;
}) {
  const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || '';
  const apiKey = useMemo(
    () => (typeof rawApiKey === 'string' ? rawApiKey.replace(/[`'"\s]/g, '').trim() : ''),
    [rawApiKey],
  );

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Record<number, Schedule>>({});
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState(
    statuses.includes(initialStatus as (typeof statuses)[number]) ? initialStatus : 'Habilitado',
  );
  const [currentPage, setCurrentPage] = useState(Math.max(1, initialPage || 1));
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const employeesPerPage = 9;
  const axiosHeaders = useMemo(
    () => (apiKey ? { headers: { 'x-api-key': apiKey } } : undefined),
    [apiKey],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [employeesResponse, schedulesResponse] = await Promise.all([
        axios.post('/api/hotel/getAllEmployees', {}, axiosHeaders),
        axios.get('/api/hotel/getEmployeeWorkSchedule', axiosHeaders),
      ]);

      const employeeRows = Array.isArray(employeesResponse.data) ? employeesResponse.data : [];
      const scheduleRows = Array.isArray(schedulesResponse.data) ? schedulesResponse.data : [];

      const map: Record<number, Schedule> = {};
      for (const schedule of scheduleRows) {
        if (schedule?.employee_id) {
          map[Number(schedule.employee_id)] = schedule;
        }
      }

      setEmployees(employeeRows);
      setSchedules(map);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'No se pudo cargar la lista de empleados.';
      notifyError(message);
      setEmployees([]);
      setSchedules({});
    } finally {
      setLoading(false);
    }
  }, [axiosHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesStatus = employee.statusprofile === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      return (
        String(employee.name || '').toLowerCase().includes(term) ||
        String(employee.role || '').toLowerCase().includes(term) ||
        String(employee.phone_number || '').toLowerCase().includes(term)
      );
    });
  }, [employees, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / employeesPerPage));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * employeesPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage);

  const enabledCount = useMemo(
    () => employees.filter((employee) => employee.statusprofile === 'Habilitado').length,
    [employees],
  );

  const handleRowClick = (employee: Employee) => {
    const schedule = schedules[employee.id_employee];
    setSelectedEmployee({
      ...employee,
      start_time: schedule?.start_time || '',
      end_time: schedule?.end_time || '',
    });
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedEmployee(null);
    loadData();
  };

  const handleCreateSuccess = () => {
    loadData();
    setIsCreateOpen(false);
  };

  const changePage = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
        Cargando empleados...
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <AppToastContainer />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gestión de personal</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-800">Empleados</h2>
            <p className="mt-2 text-sm text-slate-500">Administra estados, horarios y datos clave en un solo módulo.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Nuevo empleado
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total empleados</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{employees.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Habilitados</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{enabledCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Resultados visibles</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{filteredEmployees.length}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre, rol o teléfono"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none md:max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-slate-800">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Propiedad</th>
                <th className="px-4 py-3 text-center">Entrada</th>
                <th className="px-4 py-3 text-center">Salida</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No hay empleados para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee, index) => {
                  const schedule = schedules[employee.id_employee];
                  const rowStyle = index % 2 === 0 ? 'bg-white' : 'bg-slate-50';

                  return (
                    <tr
                      key={employee.id_employee}
                      onClick={() => handleRowClick(employee)}
                      className={`cursor-pointer transition hover:bg-slate-100 ${rowStyle}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Image src="/customers/usuario.png" className="rounded-full" width={34} height={34} alt="Foto empleado" />
                          <div>
                            <p className="text-sm font-semibold">{employee.name || '-'}</p>
                            <p className="text-xs text-slate-500">{employee.phone_number || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{employee.role || '-'}</td>
                      <td className="px-4 py-3 text-sm">{hotelMapping[employee.current_hotel_id] || 'Sin propiedad'}</td>
                      <td className="px-4 py-3 text-center text-sm">{schedule?.start_time || '-'}</td>
                      <td className="px-4 py-3 text-center text-sm">{schedule?.end_time || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <UserStatus status={employee.statusprofile} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-500">
            Página {safePage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => changePage(safePage - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => changePage(safePage + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {isCreateOpen ? (
        <EmployeeForm
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      ) : null}

      {isEditOpen && selectedEmployee ? (
        <EmployeeModal employee={selectedEmployee} onClose={handleCloseEdit} />
      ) : null}

      <div className="md:hidden">
        <div className="space-y-3">
          {paginatedEmployees.map((employee) => {
            const schedule = schedules[employee.id_employee];
            return (
              <button
                key={employee.id_employee}
                type="button"
                onClick={() => handleRowClick(employee)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
              >
                <p className="text-base font-semibold text-slate-800">{employee.name || '-'}</p>
                <p className="mt-1 text-sm text-slate-500">{employee.role || '-'}</p>
                <p className="mt-1 text-xs text-slate-500">{employee.phone_number || '-'}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                  <span>{hotelMapping[employee.current_hotel_id] || 'Sin propiedad'}</span>
                  <span>{schedule?.start_time || '--'} - {schedule?.end_time || '--'}</span>
                </div>
                <div className="mt-3">
                  <UserStatus status={employee.statusprofile} />
                </div>
              </button>
            );
          })}
          {paginatedEmployees.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No hay empleados para este filtro.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
