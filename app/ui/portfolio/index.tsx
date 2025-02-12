"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Popover, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Pagination from "./Pagination"; 

interface PortfolioProps {
  park: string;
}

const Portfolio: React.FC<PortfolioProps> = ({ park }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const employeesPerPage = 9;

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });

  // 🔍 Muestra las fechas en la consola cuando cambian
  useEffect(() => {
    if (dateRange?.from) {
      console.log("📅 Fecha seleccionada:");
      console.log("➡ Inicio:", format(dateRange.from, "yyyy-MM-dd"));
      console.log("➡ Fin:", dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "No seleccionada");
    }
  }, [dateRange]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("https://9b0lctjk-80.use.devtunnels.ms/api/hotel/getAllEmployees");
      return response.data;
    } catch (err) {
      console.error("❌ Error obteniendo empleados:", err);
      return [];
    }
  };

  const fetchEmployeeSalary = async (phone_number: string) => {
    try {
        const salaryResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotel/CalculateEmployeeSalary/${phone_number}`
        );
        return salaryResponse.data ?? {};
    } catch (error) {
        console.error(`❌ Error obteniendo salario para el empleado con teléfono ${phone_number}:`, error);
        return {};
    }
};

  const handleApply = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      console.warn("⚠️ Debes seleccionar un rango de fechas antes de aplicar.");
      return;
    }
  
    const payload = {
      startDate: format(dateRange.from, "yyyy-MM-dd"), // 📅 Asegura formato correcto
      endDate: format(dateRange.to, "yyyy-MM-dd"),     // 📅 Evita valores undefined
    };
  
    console.log("📤 Enviando payload:", JSON.stringify(payload, null, 2));
  
    try {
      const response = await axios.post(
        "https://9b0lctjk-80.use.devtunnels.ms/api/hotel/GetEmployeesWorkAndSalary",
        payload,
        { headers: { "Content-Type": "application/json" } } // 🛠 Asegura que el backend lo interprete bien
      );
      console.log("✅ Respuesta del servidor:", response.data);
    } catch (error: any) {
      console.error("❌ Error al enviar las fechas:", error?.response?.data || error.message);
    }
  };
  
  

  useEffect(() => {
    const fetchData = async () => {
      const employeeList = await fetchEmployees();
      let updatedEmployees: any[] = [];
  
      for (const employee of employeeList) {
          const salaryData = await fetchEmployeeSalary(employee.phone_number); // Cambiado a phone_number
          updatedEmployees.push({
              ...employee,
              total_hours: salaryData.total_hours ?? "0:00:00",
              rooms_cleaned_A: salaryData.rooms_cleaned_A ?? 0,
              rooms_cleaned_B: salaryData.rooms_cleaned_B ?? 0,
              total_salary: salaryData.total_salary ?? "0.00",
          });
      }
  
      setEmployees(updatedEmployees);
  };
  
  fetchData();
  
  }, []);

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
      {/* 📅 Selector de rango de fechas */}
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-base font-semibold"> Rango de fecha:</h3>
        <Popover className="relative flex">
          {({ open }) => (
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
                    <div className="flex gap-4">
                      <DayPicker
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        classNames={{
                          months: "flex flex-row gap-4",
                        }}
                      />
                      
                    </div>
                    {/* 🔘 Botones de acción */}
                    <div className="mt-3 flex justify-end gap-2 p-3">
                    <button
                      onClick={handleApply} // ⬅️ Llama a la función al hacer clic
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
      

      {/* 💰 Total a pagar + Buscador */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Total a pagar por todos los empleados: ${totalSalaryToPay.toFixed(2)} US
        </h3>
        
        <input
          type="text"
          placeholder="Buscar empleado..."
          className="border p-2 rounded-md"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
      </div>

      {/* 🏨 Tabla de empleados */}
      <div className="overflow-x-auto w-full max-w-full">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 w-1/6">Nombre</th>
              <th className="py-2 px-4 w-1/6">Rol</th>
              <th className="py-2 px-4">Valor/Hora</th>
              <th className="py-2 px-4">Horas Trabajadas</th>
              <th className="py-2 px-4">Habitación/A</th>
              <th className="py-2 px-4">Habitación/B</th>
              <th className="py-2 px-4">Salario Total</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map((employee) => (
              <tr key={employee.id_employee} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4 w-1/6">{employee.name}</td>
                <td className="py-2 px-4 w-1/6">{employee.role}</td>
                <td className="py-2 px-4">$ {employee.hourly_wage}US</td>
                <td className="py-2 px-4 text-center">{employee.total_hours}</td>
                <td className="py-2 px-4 text-center">{employee.rooms_cleaned_A}</td>
                <td className="py-2 px-4 text-center">{employee.rooms_cleaned_B}</td>
                <td className="py-2 px-4 font-bold">$ {parseFloat(employee.total_salary).toFixed(2)}US</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📌 Paginación */}
      <div className="mt-4 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
};

export default Portfolio;
