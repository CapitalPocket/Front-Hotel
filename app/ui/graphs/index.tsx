"use client";

import React, { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export interface GraphsProps {
    park: string;
  }

const Page = () => {
  const base = useMemo(() => {
    const rawBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACK_LINK ||
      "http://localhost:8080";
    return typeof rawBase === "string" ? rawBase.replace(/[`'"\s]/g, "").trim() : rawBase;
  }, []);
  const apiKey = useMemo(() => {
    const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || "";
    return typeof rawApiKey === "string" ? rawApiKey.replace(/[`'"\s]/g, "").trim() : "";
  }, []);
  const [park, setPark] = useState<string | null>(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${base}/api/hotel/getAllEmployees`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "x-api-key": apiKey } : {}),
          },
          body: JSON.stringify({}),
        });
        if (!response.ok) throw new Error("Error fetching employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEmployees();
  }, [base, apiKey]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold my-[2.5%] text-center">Empleados {park === "PN" ? "Parque Norte" : "Aeroparque"}</h1>
      <div className="flex items-center p-2 justify-between w-full max-w-sm mx-auto space-x-2">
        <button
          onClick={() => setPark("PN")}
          className={`flex-1 h-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition duration-300 ${park === "PN" ? "ring-2 ring-blue-300" : ""}`}
        >
          Parque Norte
        </button>
        <button
          onClick={() => setPark("AP")}
          className={`flex-1 h-10 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded transition duration-300 ${park === "AP" ? "ring-2 ring-green-300" : ""}`}
        >
          Aeroparque
        </button>
      </div>
      <div className="mt-4">
        <select
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="p-2 border rounded w-64"
          value={selectedEmployee || ""}
        >
          <option value="">Seleccione un empleado</option>
          {employees.map((employee: { id: string; name: string }) => (
            <option key={employee.id} value={employee.id}>{employee.name}</option>
          ))}
        </select>
      </div>
      {selectedEmployee && (
        <div className="mt-6">
          <QRCodeCanvas value={`Empleado: ${selectedEmployee}`} size={200} />
        </div>
      )}
      
    </div>
  );
};

export default Page;
