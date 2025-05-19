"use client";

import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Select from "react-select";
import { motion } from "framer-motion";

const Page = () => {
  const [employees, setEmployees] = useState<{ id_employee: string; name: string; phone_number: string }[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<{ value: string; label: string; phone: string } | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<{ value: string; label: string } | null>(null);
  const [entryType, setEntryType] = useState<{ value: string; label: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedRole, setSelectedRole] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
      const fetchEmployees = async () => {
        try {
          const response = await fetch(
            'http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllEmployees',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({})  // No filtramos por rol
            }
          );
    
          if (!response.ok) throw new Error("Error fetching employees");
    
          const data = await response.json();
          setEmployees(data);
        } catch (error) {
          console.error("Error:", error);
        }
      };
    
      fetchEmployees();
    }, []);
    

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
  };

  const sendVerificationCodeToAPI = async (phone: string, code: string, role: string) => {
    try {
      const response = await fetch("http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/handleQRCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, qrCode: code, role }),
      });

      if (!response.ok) throw new Error("Error enviando el código QR al servidor");
      console.log("✅ Código enviado con éxito");
    } catch (error) {
      console.error("❌ Error al enviar el código:", error);
    }
  };

  useEffect(() => {
    if (selectedEmployee && selectedHotel && entryType) {
      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      sendVerificationCodeToAPI(selectedEmployee.phone, newCode, selectedRole?.value || "");
    }
  }, [selectedEmployee, selectedHotel, entryType, selectedRole?.value]);

  const generateWhatsAppLink = () => {
    if (!selectedEmployee || !selectedHotel || !entryType) return "";
    const actionCode = entryType.value === "ingreso" ? "Clock In" : "Clock Out";
    const message = `${actionCode}: ${verificationCode}`;
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

        {/* Selectores */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Empleado</label>
            <Select
              options={employees.map((emp) => ({
                value: emp.id_employee,
                label: emp.name,
                phone: emp.phone_number,
              }))}
              onChange={setSelectedEmployee}
              value={selectedEmployee}
              placeholder="Seleccionar..."
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  height: "50px",
                  borderColor: "#aaa",
                }),
              }}
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Rol</label>
            <Select
              options={[
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
                { value: "Laundry", label: "Laundry" }

              ]}
              onChange={setSelectedRole}
              value={selectedRole}
              placeholder="Seleccionar..."
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  height: "50px",
                  borderColor: "#aaa",
                }),
              }}
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Propiedades</label>
            <Select
              options={[
                { value: "1", label: "Heron I" },
                { value: "2", label: "Heron II" },
              ]}
              onChange={setSelectedHotel}
              value={selectedHotel}
              placeholder="Seleccionar..."
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  height: "50px",
                  borderColor: "#aaa",
                }),
              }}
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
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  height: "50px",
                  borderColor: "#aaa",
                }),
              }}
            />
          </div>
        </div>

        

        {/* Sección QR */}
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
