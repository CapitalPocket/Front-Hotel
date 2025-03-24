"use client";

import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Select from "react-select";
import { motion } from "framer-motion";

const Page = () => {
  const [employees, setEmployees] = useState<{ id_employee: string; name: string }[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<{ value: string; label: string } | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<{ value: string; label: string } | null>(null);
  const [entryType, setEntryType] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotel/getAllEmployees`);
        if (!response.ok) throw new Error("Error fetching employees");
        const data = await response.json();
        if (Array.isArray(data)) {
          setEmployees(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchEmployees();
  }, []);

  const generateWhatsAppLink = () => {
    if (!selectedEmployee || !selectedHotel || !entryType) return "";
    const message = `Empleado: ${selectedEmployee.label}\nHotel: ${selectedHotel.label}\nAcción: ${entryType.label}`;
    return `https://wa.me/17863403034?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-10">
      <motion.div
        className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-4xl border border-gray-300"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Generador de QR para WhatsApp
        </h1>

        {/* Selectores con más espacio y alineados mejor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Empleado</label>
            <Select
              options={employees.map((emp) => ({
                value: emp.id_employee,
                label: emp.name,
              }))}
              onChange={setSelectedEmployee}
              value={selectedEmployee}
              placeholder="Seleccionar..."
              styles={{ control: (base) => ({ ...base, borderRadius: "12px", height: "50px", borderColor: "#aaa" }) }}
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Propiedad</label>
            <Select
              options={[
                { value: "1", label: "Heron I" },
                { value: "2", label: "Heron II" },
              ]}
              onChange={setSelectedHotel}
              value={selectedHotel}
              placeholder="Seleccionar..."
              styles={{ control: (base) => ({ ...base, borderRadius: "12px", height: "50px", borderColor: "#aaa" }) }}
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Acción</label>
            <Select
              options={[
                { value: "ingreso", label: "Ingreso" },
                { value: "salida", label: "Salida" },
              ]}
              onChange={setEntryType}
              value={entryType}
              placeholder="Seleccionar..."
              styles={{ control: (base) => ({ ...base, borderRadius: "12px", height: "50px", borderColor: "#aaa" }) }}
            />
          </div>
        </div>

        {/* Sección QR con más espacio y tamaño mejorado */}
        {selectedEmployee && selectedHotel && entryType && (
          <motion.div
            className="flex flex-col items-center bg-gray-100 p-8 rounded-2xl shadow-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <QRCodeCanvas value={generateWhatsAppLink()} size={220} />
            <p className="mt-6 text-xl font-semibold text-gray-800 text-center">
              Escanea para contactar a <span className="text-blue-600">{selectedEmployee.label}</span> -{" "}
              <span className="text-green-600">{selectedHotel.label}</span> ({entryType.label}) 📲
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Page;
