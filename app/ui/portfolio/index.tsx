"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Popover, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Pagination from "./Pagination";
import ModalPago from "./ModalPago";

interface PortfolioProps {
  park: string;
}

const Portfolio: React.FC<PortfolioProps> = ({ park }) => {
  const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pockiaction.xyz';
  const base = typeof rawBase === 'string' ? rawBase.replace(/[`'"\s]/g, '').trim() : rawBase;
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const employeesPerPage = 9;

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const openModal = (employee: any) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.post(
        `${base}/api/hotel/getAllEmployees`,
        { role: '' }
      );
      return response.data;
    } catch (err) {
      console.error('❌ Error obteniendo empleados:', err);
      return [];
    }
    
  };

  const fetchEmployeeSalary = async (phone_number: string) => {
    if (!dateRange?.from || !dateRange?.to) return {};

    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      const salaryResponse = await axios.get(
        `${base}/api/hotel/CalculateEmployeeSalary/${phone_number}?start_date=${startDate}&end_date=${endDate}`
      );
      return salaryResponse.data ?? {};
    } catch (error) {
      console.error(`❌ Error obteniendo salario para el empleado ${phone_number}:`, error);
      return {};
    }
  };

  const handleApply = async () => {
    const employeeList = await fetchEmployees();
    let updatedEmployees: any[] = [];

    for (const employee of employeeList) {
      const salaryData = await fetchEmployeeSalary(employee.phone_number);
      updatedEmployees.push({
        ...employee,
        total_hours: salaryData.total_hours ?? "00:00",
        rooms_cleaned_A: salaryData.rooms_cleaned_A ?? 0,
        rooms_cleaned_B: salaryData.rooms_cleaned_B ?? 0,
        extra_hours: salaryData.extra_hours ?? "00:00",
        total_salary: salaryData.total_salary ?? "0.00",
      });
    }
    setEmployees(updatedEmployees);
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSalaryToPay = filteredEmployees.reduce(
    (acc, employee) => acc + (parseFloat(employee.total_salary) || 0),
    0
  );

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-base font-semibold">Rango de fecha:</h3>
        <Popover className="relative flex">
          {({ open, close }) => (
            <>
              <Popover.Button className="border px-3 py-1.5 rounded-md shadow bg-white text-sm hover:bg-gray-100">
                {dateRange?.from
                  ? `${format(dateRange.from, "dd MMM, yyyy")} - ${format(dateRange.to || dateRange.from, "dd MMM, yyyy")}`
                  : "Seleccionar rango"}
              </Popover.Button>
              <Transition
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Popover.Panel className="absolute left-0 mt-2 z-10 w-[650px] origin-top-left rounded-lg border bg-white shadow-lg">
                  <div className="p-3">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      classNames={{ months: "flex flex-row gap-4" }}
                    />
                    <div className="mt-3 flex justify-end gap-2 p-3">
                      <button
                        onClick={() => {
                          handleApply();
                          close();
                        }}
                        className="border-green-600 bg-green-100 border text-green-600 rounded-md px-4 py-1 text-sm hover:bg-green-200 transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Total a pagar: ${totalSalaryToPay.toFixed(2)}</h3>
        <input
          type="text"
          placeholder="Buscar empleado..."
          className="border p-2 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="min-w-full bg-white border border-gray-300 shadow rounded-lg overflow-hidden">
  <thead className="bg-gray-100 text-gray-800 text-sm font-medium">
          <tr>
            <th className="text-left px-4 py-3">Nombre</th>
            <th className="text-left px-4 py-3">Rol</th>
            <th className="text-right px-4 py-3">Valor/Hora</th>
            <th className="text-center px-4 py-3">Horas Trabajadas</th>
            <th className="text-center px-4 py-3">Habitación A</th>
            <th className="text-center px-4 py-3">Habitación B</th>
            <th className="text-center px-4 py-3">Horas Extra</th>
            <th className="text-left px-4 py-3">Supervisor</th>
            <th className="text-right px-4 py-3">Salario Total</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map((employee, index) => (
            <tr key={employee.id_employee} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td
                className="px-4 py-2 text-sm text-black cursor-pointer hover:underline font-bold
"
                onClick={() => openModal(employee)}
              >
                {employee.name}
              </td>
              <td className="px-4 py-2 text-sm">{employee.role}</td>
              <td className="px-4 py-2 text-sm text-right">${employee.hourly_wage}</td>
              <td className="px-4 py-2 text-sm text-center">{employee.total_hours}</td>
              <td className="px-4 py-2 text-sm text-center">{employee.rooms_cleaned_A}</td>
              <td className="px-4 py-2 text-sm text-center">{employee.rooms_cleaned_B}</td>
              <td className="px-4 py-2 text-sm text-center">{employee.extra_hours}</td>
              <td className="px-4 py-2 text-sm">{employee.supervisor}</td>
              <td className="px-4 py-2 text-sm text-right font-semibold text-green-600">
                ${parseFloat(employee.total_salary).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>

      {modalOpen && selectedEmployee && (
        <ModalPago
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
};

export default Portfolio;
