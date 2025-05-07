import React, { useState, useEffect } from "react";

interface ModalPagoProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

interface CleaningData {
  date: string;
  room_category: string;
  rooms_cleaned: number;
  normal_hours: string | null;
  extra_hours: string;
}

const ModalPago: React.FC<ModalPagoProps> = ({ isOpen, onClose, employee }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [cleaningData, setCleaningData] = useState<CleaningData[]>([]);

  const fetchCleaningData = async () => {
    if (!startDate || !endDate) return;

    try {
      const response = await fetch("http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getEmployeeDailyWorkAndRoomCleaning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employee.id_employee,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al obtener los datos.");
      }

      const data = await response.json();
      setCleaningData(data);
    } catch (error) {
      console.error("Error fetching cleaning data:", error);
    }
  };

  const handleSearch = () => {
    fetchCleaningData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">Detalles del Pago</h2>

        {/* Información del empleado */}
        <div className="mb-6 space-y-2">
          <p className="text-lg font-medium text-gray-300"><strong>Nombre:</strong> {employee.name}</p>
          <p className="text-lg font-medium text-gray-300"><strong>Total a pagar:</strong> {employee.total_salary}</p>
        </div>

        {/* Selector de fecha */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Fecha de inicio:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-2 px-4 py-2 border border-gray-600 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Fecha de fin:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full mt-2 px-4 py-2 border border-gray-600 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Botón de búsqueda */}
        <div className="mb-6">
          <button
            onClick={handleSearch}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Buscar
          </button>
        </div>

        {/* Tabla de datos de limpieza */}
        {cleaningData.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4 text-white">Datos de Limpieza</h3>
            <table className="min-w-full bg-gray-700 border border-gray-600 rounded-md">
              <thead className="bg-gray-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Fecha</th>
                  <th className="px-6 py-3 text-left">Categoría</th>
                  <th className="px-6 py-3 text-left">Habitaciones Limpiadas</th>
                </tr>
              </thead>
              <tbody>
                {cleaningData.map((data, index) => (
                  <tr key={index} className={`border-t border-gray-600 ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}`}>
                    <td className="px-6 py-4 text-sm text-gray-300">{new Date(data.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{data.room_category}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{data.rooms_cleaned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Botón de Cerrar */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPago;
