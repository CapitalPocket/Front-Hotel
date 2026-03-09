"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Popover, Transition } from "@headlessui/react";
import { addDays, endOfMonth, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Pagination from "./Pagination";
import ModalPago from "./ModalPago";
import { AppToastContainer, notifyError, notifySuccess } from "@/app/utils/toast";
import { useSession } from "@/app/context";

interface PortfolioProps {
  park: string;
}

type EmployeePayment = {
  id_employee: number;
  name: string;
  role: string | null;
  phone_number: string;
  supervisor?: string;
  hourly_wage?: number | string;
  total_hours: string;
  rooms_cleaned_A: number;
  rooms_cleaned_B: number;
  extra_hours: string;
  total_salary: string;
};

type ExcelPreviewRow = {
  employee_name: string;
  totalPayment: number | string;
  totalHours?: string;
  extraHours?: string;
  roomsA: number;
  roomsB: number;
};

const parseMoney = (value: unknown): number => {
  const num = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(num) ? num : 0;
};

const parseDurationToMinutes = (value: unknown): number => {
  if (typeof value !== "string") return 0;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
};

const formatMinutes = (totalMinutes: number): string => {
  const safeMinutes = Number.isFinite(totalMinutes) ? Math.max(0, Math.round(totalMinutes)) : 0;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const openDownloadLink = (url: string) => {
  if (!url.trim()) return;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.click();
};

const Portfolio: React.FC<PortfolioProps> = ({ park: _park }) => {
  const session = useSession();
  const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || "";
  const apiKey = typeof rawApiKey === "string" ? rawApiKey.replace(/[`'"\s]/g, "").trim() : "";
  const hotelHeaders = useMemo(
    () => (apiKey ? { "x-api-key": apiKey } : undefined),
    [apiKey],
  );
  const [employees, setEmployees] = useState<EmployeePayment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [adminPhone, setAdminPhone] = useState<string>("");
  const [excelLink, setExcelLink] = useState<string>("");
  const [excelPreview, setExcelPreview] = useState<ExcelPreviewRow[]>([]);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePayment | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const employeesPerPage = 9;

  useEffect(() => {
    const sessionPhone = String(session?.user?.email ?? "").trim();
    if (!sessionPhone) return;
    setAdminPhone((current) => (current.trim() ? current : sessionPhone));
  }, [session?.user?.email]);

  const openModal = (employee: EmployeePayment) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const fetchEmployees = useCallback(async () => {
    const response = await axios.post(
      "/api/hotel/getAllEmployees",
      { role: "" },
      hotelHeaders ? { headers: hotelHeaders } : undefined,
    );
    return Array.isArray(response.data) ? response.data : [];
  }, [hotelHeaders]);

  const fetchEmployeeSalary = useCallback(
    async (phoneNumber: string, startDate: string, endDate: string) => {
      const salaryResponse = await axios.get(
        `/api/hotel/CalculateEmployeeSalary/${phoneNumber}`,
        {
          ...(hotelHeaders ? { headers: hotelHeaders } : {}),
          params: { start_date: startDate, end_date: endDate },
        },
      );
      return salaryResponse.data ?? {};
    },
    [hotelHeaders],
  );

  const handleApply = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      notifyError("Selecciona un rango de fechas válido.");
      return;
    }

    setIsApplying(true);
    setExcelLink("");
    setExcelPreview([]);
    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");
      const employeeList = await fetchEmployees();
      if (!employeeList.length) {
        setEmployees([]);
        notifyError("No encontramos empleados para calcular pagos.");
        return;
      }

      const updatedEmployees = await Promise.all(
        employeeList.map(async (employee: any) => {
          const salaryData = await fetchEmployeeSalary(employee.phone_number, startDate, endDate);
          return {
            id_employee: Number(employee.id_employee),
            name: typeof employee.name === "string" ? employee.name : `Empleado ${employee.id_employee}`,
            role: typeof employee.role === "string" ? employee.role : null,
            phone_number: typeof employee.phone_number === "string" ? employee.phone_number : "",
            supervisor: typeof employee.supervisor === "string" ? employee.supervisor : "-",
            hourly_wage: employee.hourly_wage ?? 0,
            total_hours: salaryData.total_hours ?? "00:00",
            rooms_cleaned_A: Number(salaryData.rooms_cleaned_A ?? 0),
            rooms_cleaned_B: Number(salaryData.rooms_cleaned_B ?? 0),
            extra_hours: salaryData.extra_hours ?? "00:00",
            total_salary: String(salaryData.total_salary ?? "0.00"),
          } as EmployeePayment;
        }),
      );

      setEmployees(updatedEmployees);
      setLastUpdated(new Date());
      notifySuccess(`Pagos actualizados para ${updatedEmployees.length} empleados.`);
    } catch (error) {
      console.error("Error al calcular pagos:", error);
      setEmployees([]);
      notifyError("No pudimos calcular los pagos. Intenta nuevamente.");
    } finally {
      setIsApplying(false);
    }
  }, [dateRange, fetchEmployeeSalary, fetchEmployees]);

  const handleGenerateExcel = async () => {
    if (!adminPhone.trim()) {
      notifyError("Ingresa un teléfono autorizado para generar el Excel.");
      return;
    }
    setIsGeneratingExcel(true);
    try {
      const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
      const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";
      const response = await axios.post(
        "/api/hotel/getExcel",
        { phone: adminPhone.trim(), start_date: startDate, end_date: endDate },
        hotelHeaders ? { headers: hotelHeaders } : undefined,
      );
      const data = response.data || {};
      setExcelPreview(Array.isArray(data.preview) ? data.preview : []);
      if (typeof data.link === "string" && data.link.trim()) {
        setExcelLink(data.link);
        openDownloadLink(data.link);
        notifySuccess("Excel generado. Se abrió el archivo para descarga.");
        return;
      }
      if (data.file?.base64 && data.file?.filename && data.file?.contentType) {
        const binary = atob(String(data.file.base64));
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: String(data.file.contentType) });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = String(data.file.filename);
        anchor.click();
        window.URL.revokeObjectURL(url);
        notifySuccess("Excel generado y descargado.");
        return;
      }
      const message = typeof data.message === "string" ? data.message : "No fue posible generar el Excel.";
      notifyError(message);
    } catch (error) {
      console.error("Error al generar Excel:", error);
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;
        if (typeof backendMessage === "string" && backendMessage.trim()) {
          notifyError(backendMessage);
        } else {
          notifyError("No se pudo generar el Excel de pagos.");
        }
      } else {
        notifyError("No se pudo generar el Excel de pagos.");
      }
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const setQuickRange = (type: "hoy" | "semana" | "mes") => {
    const today = new Date();
    if (type === "hoy") {
      setDateRange({ from: today, to: today });
      return;
    }
    if (type === "semana") {
      setDateRange({ from: today, to: addDays(today, 6) });
      return;
    }
    setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
  };

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [employees, searchTerm],
  );

  const totalSalaryToPay = useMemo(
    () => filteredEmployees.reduce((acc, employee) => acc + parseMoney(employee.total_salary), 0),
    [filteredEmployees],
  );

  const totalWorkedMinutes = useMemo(
    () => filteredEmployees.reduce((acc, employee) => acc + parseDurationToMinutes(employee.total_hours), 0),
    [filteredEmployees],
  );

  const totalExtraMinutes = useMemo(
    () => filteredEmployees.reduce((acc, employee) => acc + parseDurationToMinutes(employee.extra_hours), 0),
    [filteredEmployees],
  );

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / employeesPerPage));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * employeesPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Nómina hotel</p>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Pagos de empleados</h1>
          <p className="text-slate-500">Calcula sueldos por rango de fechas, revisa detalle por empleado y genera el Excel final.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{filteredEmployees.length} empleados</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Total ${totalSalaryToPay.toFixed(2)}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Horas {formatMinutes(totalWorkedMinutes)}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Extra {formatMinutes(totalExtraMinutes)}</span>
          {lastUpdated && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Actualizado {format(lastUpdated, "dd/MM/yyyy HH:mm")}
            </span>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Rango de fecha</p>
            <Popover className="relative">
              {({ close }) => (
                <>
                  <Popover.Button className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700">
                    {dateRange?.from
                      ? `${format(dateRange.from, "dd MMM yyyy", { locale: es })} - ${format(dateRange.to || dateRange.from, "dd MMM yyyy", { locale: es })}`
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
                    <Popover.Panel className="absolute left-0 z-20 mt-2 w-[680px] max-w-[95vw] origin-top-left rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                      <DayPicker
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        classNames={{ months: "flex flex-row gap-4" }}
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            handleApply();
                            close();
                          }}
                          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                          Aplicar rango
                        </button>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setQuickRange("hoy")} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">Hoy</button>
              <button onClick={() => setQuickRange("semana")} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">7 días</button>
              <button onClick={() => setQuickRange("mes")} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">Mes actual</button>
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isApplying ? "Calculando..." : "Actualizar pagos"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Excel de pagos</p>
            <input
              type="text"
              value={adminPhone}
              onChange={(event) => setAdminPhone(event.target.value)}
              placeholder="Teléfono autorizado"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
            />
            <button
              onClick={handleGenerateExcel}
              disabled={isGeneratingExcel}
              className="mt-3 w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingExcel ? "Generando..." : "Generar Excel"}
            </button>
            {excelLink && (
              <a
                href={excelLink}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
              >
                Descargar archivo generado
              </a>
            )}
            {excelPreview.length > 0 && (
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-2 py-2 text-left">Empleado</th>
                      <th className="px-2 py-2 text-right">Total</th>
                      <th className="px-2 py-2 text-center">Horas</th>
                      <th className="px-2 py-2 text-center">Extra</th>
                      <th className="px-2 py-2 text-center">A</th>
                      <th className="px-2 py-2 text-center">B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelPreview.slice(0, 8).map((row, index) => (
                      <tr key={`${row.employee_name}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-2 py-1.5 text-left text-slate-700">{row.employee_name}</td>
                        <td className="px-2 py-1.5 text-right font-semibold text-emerald-700">
                          ${parseMoney(row.totalPayment).toFixed(2)}
                        </td>
                        <td className="px-2 py-1.5 text-center text-slate-700">{row.totalHours || "00:00"}</td>
                        <td className="px-2 py-1.5 text-center text-slate-700">{row.extraHours || "00:00"}</td>
                        <td className="px-2 py-1.5 text-center text-slate-700">{Number(row.roomsA ?? 0)}</td>
                        <td className="px-2 py-1.5 text-center text-slate-700">{Number(row.roomsB ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar empleado..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Detalle de nómina</h2>
          <p className="text-sm text-slate-500">{filteredEmployees.length} registros</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-right">Valor/Hora</th>
                <th className="px-4 py-3 text-center">Horas</th>
                <th className="px-4 py-3 text-center">Hab A</th>
                <th className="px-4 py-3 text-center">Hab B</th>
                <th className="px-4 py-3 text-center">Extra</th>
                <th className="px-4 py-3 text-left">Supervisor</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                    No hay datos para mostrar. Selecciona un rango y actualiza pagos.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee, index) => (
                  <tr key={employee.id_employee} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td
                      className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 hover:underline"
                      onClick={() => openModal(employee)}
                    >
                      {employee.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{employee.role || "-"}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">${parseMoney(employee.hourly_wage).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{employee.total_hours}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{employee.rooms_cleaned_A}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{employee.rooms_cleaned_B}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{employee.extra_hours}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{employee.supervisor || "-"}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-700">
                      ${parseMoney(employee.total_salary).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </section>

      {modalOpen && selectedEmployee && (
        <ModalPago
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          employee={selectedEmployee}
        />
      )}
      <AppToastContainer />
    </div>
  );
};

export default Portfolio;
