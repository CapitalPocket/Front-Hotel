"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Select from "react-select";
import { motion } from "framer-motion";
import axios from "axios";

type SelectOption = { value: string; label: string };
type EmployeeOption = SelectOption & { phone: string; role?: string | null };
type EmployeeRecord = { id_employee: string; name: string; phone_number: string; role?: string | null };
type HotelRecord = { id_hotel: number; name: string };
type MessageState = { type: "error" | "success"; text: string } | null;

const roleOptions: SelectOption[] = [
  { value: "Housekeeper", label: "Housekeeper" },
  { value: "Houseman", label: "Houseman" },
  { value: "Maintenance Tech", label: "Maintenance Tech" },
  { value: "Painter", label: "Painter" },
  { value: "Remodeling Official", label: "Remodeling Official" },
  { value: "HK Supervisor", label: "HK Supervisor" },
  { value: "MT Supervisor", label: "MT Supervisor" },
  { value: "Remo Supervisor", label: "Remo Supervisor" },
  { value: "Quality Control", label: "Quality Control" },
  { value: "Building Manager", label: "Building Manager" },
  { value: "Room control", label: "Room control" },
  { value: "Front desk", label: "Front desk" },
  { value: "Lost & Found/Inventory", label: "Lost & Found/Inventory" },
  { value: "Assistant Manager", label: "Assistant Manager" },
  { value: "Operations Manager", label: "Operations Manager" },
  { value: "General Manager", label: "General Manager" },
  { value: "Resort Manager", label: "Resort Manager" },
  { value: "Laundry", label: "Laundry" },
];

const Page = () => {
  const apiKey = useMemo(() => {
    const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || "";
    return typeof rawApiKey === "string" ? rawApiKey.replace(/[`'"\s]/g, "").trim() : "";
  }, []);
  const hotelHeaders = useMemo(
    () =>
      apiKey
        ? {
            "x-api-key": apiKey,
            Authorization: `Api-Key ${apiKey}`,
          }
        : undefined,
    [apiKey]
  );
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [hotels, setHotels] = useState<HotelRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<SelectOption | null>(null);
  const [entryType, setEntryType] = useState<SelectOption | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedRole, setSelectedRole] = useState<SelectOption | null>(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const employeesEndpoint = "/api/hotel/getAllEmployees";
  const hotelsEndpoint = "/api/hotel/getAllHotel";
  const qrEndpoint = "/api/hotel/handleQRCode";

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const response = await axios.post(
          employeesEndpoint,
          {},
          hotelHeaders ? { headers: hotelHeaders } : undefined
        );
        const data = response.data;
        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          setEmployees([]);
          setMessage({ type: "error", text: "No pudimos cargar la lista de empleados." });
        }
      } catch {
        setEmployees([]);
        setMessage({ type: "error", text: "No pudimos cargar la lista de empleados. Verifica conexión del backend." });
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [employeesEndpoint, hotelHeaders]);

  useEffect(() => {
    if (!selectedEmployee?.role) return;
    const foundRole = roleOptions.find(
      (option) => option.value.toLowerCase() === String(selectedEmployee.role).toLowerCase(),
    );
    if (foundRole) {
      setSelectedRole(foundRole);
    }
  }, [selectedEmployee]);

  const rawWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '17863403034';
  const whatsappNumber = typeof rawWhatsApp === 'string' ? rawWhatsApp.replace(/[`'"\s]/g, '').trim() : rawWhatsApp;

  const generateWhatsAppLink = useCallback(() => {
    if (!selectedEmployee || !selectedHotel || !entryType || !verificationCode) return "";
    const actionCode = entryType.value === "ingreso" ? "Clock In" : "Clock Out";
    const qrMessage = `${actionCode}: ${verificationCode}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(qrMessage)}`;
  }, [entryType, selectedEmployee, selectedHotel, verificationCode, whatsappNumber]);

  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoadingHotels(true);
      try {
        const response = await axios.post(
          hotelsEndpoint,
          {},
          hotelHeaders ? { headers: hotelHeaders } : undefined
        );
        if (Array.isArray(response.data)) {
          setHotels(response.data);
        } else {
          setHotels([]);
          setMessage({ type: "error", text: "No pudimos cargar la lista de propiedades." });
        }
      } catch {
        setHotels([]);
        setMessage({ type: "error", text: "No pudimos cargar la lista de propiedades. Verifica conexión del backend." });
      } finally {
        setIsLoadingHotels(false);
      }
    };

    fetchHotels();
  }, [hotelHeaders, hotelsEndpoint]);

  const employeeOptions = useMemo(
    () =>
      [...employees]
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
        .map((emp) => ({
          value: emp.id_employee,
          label: emp.name,
          phone: emp.phone_number,
          role: emp.role,
        })),
    [employees],
  );

  const hotelOptions = useMemo(
    () =>
      [...hotels]
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
        .map((hotel) => ({
          value: hotel.id_hotel.toString(),
          label: hotel.name,
        })),
    [hotels],
  );

  const isReadyToGenerate = Boolean(selectedEmployee && selectedHotel && selectedRole && entryType);

  const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const syncVerificationCode = useCallback(async (phone: string, code: string, role: string) => {
    const response = await fetch(qrEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(hotelHeaders || {}),
      },
      body: JSON.stringify({ phone, qrCode: code, role }),
    });

    if (!response.ok) {
      throw new Error("No se pudo sincronizar el código con el servidor.");
    }
  }, [hotelHeaders, qrEndpoint]);

  const handleGenerateCode = useCallback(async () => {
    if (!selectedEmployee || !selectedRole || !selectedHotel || !entryType) {
      setMessage({ type: "error", text: "Completa empleado, rol, propiedad y acción para generar el QR." });
      return;
    }

    setIsSendingCode(true);
    const newCode = generateVerificationCode();
    try {
      await syncVerificationCode(selectedEmployee.phone, newCode, selectedRole.value);
      setVerificationCode(newCode);
      setLastSyncedAt(new Date().toLocaleTimeString("es-CO"));
      setMessage({ type: "success", text: "Código QR generado y sincronizado correctamente." });
    } catch {
      setVerificationCode("");
      setMessage({ type: "error", text: "No pudimos sincronizar el código QR con el servidor." });
    } finally {
      setIsSendingCode(false);
    }
  }, [entryType, selectedEmployee, selectedHotel, selectedRole, syncVerificationCode]);

  const handleClear = () => {
    setSelectedEmployee(null);
    setSelectedHotel(null);
    setSelectedRole(null);
    setEntryType(null);
    setVerificationCode("");
    setLastSyncedAt(null);
    setMessage(null);
  };

  const handleCopyCode = async () => {
    if (!verificationCode) return;
    await navigator.clipboard.writeText(verificationCode);
    setMessage({ type: "success", text: "Código copiado al portapapeles." });
  };

  return (
    <div className="w-full space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ingreso y salida</p>
          <h1 className="text-3xl font-bold text-slate-800">Generación de código QR</h1>
          <p className="max-w-3xl text-sm text-slate-500 md:text-base">
            Selecciona colaborador, rol, propiedad y acción para generar y sincronizar el QR de marcación.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Empleados</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{employees.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Propiedades</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{hotels.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Estado</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">{verificationCode ? "QR listo" : "Pendiente"}</p>
        </div>
      </section>

      <motion.section
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {message && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Empleado</label>
            <Select
              options={employeeOptions}
              onChange={(value) => setSelectedEmployee(value as EmployeeOption | null)}
              value={selectedEmployee}
              isLoading={isLoadingEmployees}
              isDisabled={isLoadingEmployees}
              placeholder={isLoadingEmployees ? "Cargando..." : "Seleccionar..."}
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: "12px",
                  minHeight: "46px",
                  borderColor: "#cbd5e1",
                }),
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Rol</label>
            <Select
              options={roleOptions}
              onChange={(value) => setSelectedRole(value as SelectOption | null)}
              value={selectedRole}
              isDisabled={isLoadingEmployees || !selectedEmployee}
              placeholder="Seleccionar..."
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: "12px",
                  minHeight: "46px",
                  borderColor: "#cbd5e1",
                }),
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Propiedad</label>
            <Select
              options={hotelOptions}
              onChange={(value) => setSelectedHotel(value as SelectOption | null)}
              value={selectedHotel}
              isLoading={isLoadingHotels}
              isDisabled={isLoadingHotels}
              placeholder={isLoadingHotels ? "Cargando..." : "Seleccionar..."}
              className="w-full"
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: "12px",
                  minHeight: "46px",
                  borderColor: "#cbd5e1",
                }),
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Acción</label>
            <Select
              options={[
                { value: "ingreso", label: "Ingreso" },
                { value: "salida", label: "Salida" },
              ]}
              onChange={(value) => setEntryType(value as SelectOption | null)}
              value={entryType}
              placeholder="Seleccionar..."
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: "12px",
                  minHeight: "46px",
                  borderColor: "#cbd5e1",
                }),
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={handleClear}
            className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Limpiar formulario
          </button>
          <button
            onClick={handleGenerateCode}
            disabled={!isReadyToGenerate || isSendingCode}
            className={`h-11 rounded-xl px-5 text-sm font-semibold transition ${
              isReadyToGenerate && !isSendingCode
                ? "bg-slate-900 text-white hover:bg-slate-700"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {isSendingCode ? "Generando..." : verificationCode ? "Regenerar QR" : "Generar QR"}
          </button>
        </div>

        {verificationCode && selectedEmployee && selectedHotel && entryType && selectedRole && (
          <motion.div
            className="mt-8 grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-[260px_minmax(0,1fr)]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mx-auto rounded-2xl bg-white p-4 shadow-sm">
              <QRCodeCanvas value={generateWhatsAppLink()} size={220} />
            </div>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-slate-800">
                QR listo para <span className="text-slate-900">{selectedEmployee.label}</span> en{" "}
                <span className="text-slate-900">{selectedHotel.label}</span>.
              </p>
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-700">Acción:</span> {entryType.label}</p>
                <p><span className="font-semibold text-slate-700">Rol:</span> {selectedRole.label}</p>
                <p><span className="font-semibold text-slate-700">Código:</span> {verificationCode}</p>
                {lastSyncedAt && <p><span className="font-semibold text-slate-700">Sincronizado:</span> {lastSyncedAt}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopyCode}
                  className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Copiar código
                </button>
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Abrir en WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
};

export default Page;


