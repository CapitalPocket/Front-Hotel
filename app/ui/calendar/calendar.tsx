'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Employee {
  employeeName: string;
  hotelName: string;
  currentRoom: string; // Incluye la categoría como "101A" o "101B"
}

interface HotelViewProps {
  park: string; // Recibimos el nombre del hotel
}

const floors = [
  { floor: 7, rooms: [701, 702, 703, 704, 705, 706] },
  { floor: 6, rooms: [601, 602, 603, 604, 605, 606] },
  { floor: 5, rooms: [501, 502, 503, 504, 505, 506, 507, 508] },
  { floor: 4, rooms: [401, 402, 403, 404, 405, 406, 407, 408, 409, 410] },
  { floor: 3, rooms: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310] },
  { floor: 2, rooms: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210] },
  { floor: 1, rooms: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110] },
];

const HotelView: React.FC<HotelViewProps> = ({ park }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null); // Identificador único de la habitación y categoría seleccionada

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          'https://9b0lctjk-80.use.devtunnels.ms/api/hotel/getemployeGetRoom',
          { params: { park } }
        );
        setEmployees(response.data.employees || []);
      } catch (error) {
        console.error('Error al obtener empleados:', error);
      }
    };

    fetchEmployees();
  }, [park]);

  const handleCategoryClick = (roomId: string) => {
    setSelectedRoom((prev) => (prev === roomId ? null : roomId)); // Alternar selección de la misma tarjeta
  };

  return (
    <div className="hotel-container space-y-4 px-4">
      {floors.map(({ floor, rooms }) => (
        <div key={floor} className="floor flex flex-col items-center mb-8">
          <h2 className="font-bold text-lg mb-3">Piso {floor}</h2>
          <div className="rooms-container grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {rooms.map((room) => {
              const employeesInRoom = employees.filter(
                (emp) => emp.hotelName === park && emp.currentRoom.startsWith(`${room}`)
              );

              const employeeA = employeesInRoom.find((emp) => emp.currentRoom.endsWith('A'));
              const employeeB = employeesInRoom.find((emp) => emp.currentRoom.endsWith('B'));

              return (
                <div
                  key={room}
                  className="room relative w-32 h-56 border rounded-lg flex flex-col items-center justify-between bg-gray-50 shadow-sm"
                >
                  {/* Número de habitación */}
                  <div className="room-number text-center text-sm font-bold bg-black text-white py-1 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    Hab. {room}
                  </div>

                  {/* Empleados */}
                  <div className="employee flex flex-col items-center justify-center flex-1 p-2">
                    {employeeA && (
                      <div className="employee-category flex flex-col items-center mb-2">
                        <div className="icon mb-1">
                          <img
                            src="/customers/usuario.png"
                            alt="Empleado A"
                            className="w-10 h-10 rounded-full border border-gray-150"
                          />
                        </div>
                        <p className="text-xs font-medium">{employeeA.employeeName}</p>
                      </div>
                    )}

                    {employeeB && (
                      <div className="employee-category flex flex-col items-center">
                        <div className="icon mb-1">
                          <img
                            src="/customers/usuario.png"
                            alt="Empleado B"
                            className="w-10 h-10 rounded-full border border-gray-150"
                          />
                        </div>
                        <p className="text-xs font-medium">{employeeB.employeeName}</p>
                      </div>
                    )}

                    {!employeeA && !employeeB && <p className="text-gray-400 text-xs">Vacío</p>}
                  </div>

                  {/* Categorías A y B en la parte inferior */}
                  <div className="categories flex w-full">
                    <button
                      className={`w-1/2 text-xs font-bold py-1 text-center ${
                        employeeA ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}
                      onClick={() => handleCategoryClick(`${room}-A`)}
                    >
                      A
                    </button>
                    <button
                      className={`w-1/2 text-xs font-bold py-1 text-center ${
                        employeeB ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}
                      onClick={() => handleCategoryClick(`${room}-B`)}
                    >
                      B
                    </button>
                  </div>

                  {/* Mostrar información del empleado seleccionado */}
                  {selectedRoom === `${room}-A` && employeeA && (
                    <div className="employee-info absolute bottom-0 left-0 w-full bg-white p-2 text-xs shadow-lg">
                      <p className="font-bold">Empleado A</p>
                      <p>{employeeA.employeeName}</p>
                    </div>
                  )}
                  {selectedRoom === `${room}-B` && employeeB && (
                    <div className="employee-info absolute bottom-0 left-0 w-full bg-white p-2 text-xs shadow-lg">
                      <p className="font-bold">Empleado B</p>
                      <p>{employeeB.employeeName}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HotelView;
