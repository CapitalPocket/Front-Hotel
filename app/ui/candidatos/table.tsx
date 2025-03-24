'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { hotelMapping } from '@/app/lib/utils';
import { fetchFilteredUsers, fetchEmployeeSchedules } from '@/app/lib/data';
import UserStatus from './status';
import EmployeeModal from '@/app/ui/candidatos/EmployeeModal'; // Importa el modal

export default function InvoicesTable({
  query,
  currentPage,
  status,
}: {
  query: string;
  currentPage: number;
  status: string;
}) {
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedCandidatos = await fetchFilteredUsers(query, currentPage, status);
        const fetchedSchedules = await fetchEmployeeSchedules(query, status);
        
        setCandidatos(fetchedCandidatos);
        setSchedules(fetchedSchedules);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [query, currentPage, status]);

  // Función para abrir el modal al hacer clic en un empleado
  const handleRowClick = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Mapa de horarios de empleados
  const employeeSchedulesMap = schedules.reduce((map: any, schedule: any) => {
    if (schedule.employeeId) {
      map[schedule.employeeId] = schedule;
    }
    return map;
  }, {});

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-100 p-2 md:pt-0">
          
          {/* MODAL */}
          {isModalOpen && selectedEmployee && (
            <EmployeeModal employee={selectedEmployee} onClose={() => setIsModalOpen(false)} />
          )}

          {/* VISTA MÓVIL */}
          <div className="md:hidden">
            {candidatos.map((candidato: any) => {
              const schedule = employeeSchedulesMap[candidato.id_employee];
              return (
                <div
                  key={candidato.id_employee}
                  className="mb-2 w-full rounded-md bg-white p-4 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRowClick(candidato)}
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="mx-auto w-[100%] rounded-md p-2">
                      <p className="font-semibold">{`${candidato.rol}`}</p>
                      <UserStatus status={candidato.statusprofile} />
                      <p className="text-sm text-gray-500">{candidato.name}</p>
                      <p className="text-sm text-gray-500">{candidato.email}</p>
                    </div>
                  </div>
                  {schedule && (
                    <div className="flex justify-between">
                      <p>Clock In: {schedule.start_time}</p>
                      <p>Clock Out: {schedule.end_time}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* TABLA DE ESCRITORIO */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Nombre</th>
                <th className="px-3 py-5 font-medium">Rol</th>
                <th className="px-3 py-5 font-medium">Propiedad</th>
                <th className="px-3 py-5 font-medium">Clock In</th>
                <th className="px-3 py-5 font-medium">Clock Out</th>
                <th className="px-3 py-5 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {candidatos.map((candidato: any) => {
                const schedule = employeeSchedulesMap[candidato.id_employee];
                return (
                  <tr
                    key={candidato.id_employee}
                    className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRowClick(candidato)}
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={'/customers/usuario.png'}
                          className="rounded-full"
                          width={28}
                          height={28}
                          alt={`profile picture`}
                        />
                        <p>{candidato.name}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{candidato.role}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {hotelMapping[candidato.current_hotel_id] || 'Unknown Hotel'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {schedule ? schedule.start_time : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {schedule ? schedule.end_time : '-'}
                    </td>
                    <td className="whitespace-nowrap px-1 py-3">
                      <UserStatus status={candidato.statusprofile} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
