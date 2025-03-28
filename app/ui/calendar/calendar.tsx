import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
interface Employee {
  employeeName: string;
  hotelName: string;
  currentRoom: string; // Incluye la categoría como "101A" o "101B"
}

interface RoomStatus {
  id_room: number;
  hotel_id: number;
  room_number: string;
  category: 'A' | 'B';
  status: string; // El estado de la habitación, por ejemplo, "V/C" o "Ocupado"
  created_at: string; // Fecha de creación del estado de la habitación
}

interface HotelViewProps {
  park: string; // Recibimos el nombre del hotel
}
const statusColors = {
  'V/C': '#4CAF50',  // 🟢 Verde (Vacant and Clean)
  'O': '#FF9800',    // 🟠 Naranja (Occupied)
  'V/D': '#F44336',  // 🔴 Rojo (Vacant and Dirty)
  'OOO': '#9E9E9E',  // ⚪ Gris (Out of Service)
  'CLEAN/IN': '#2196F3',  // 🔵 Azul (Cleaning Start)
  'P/S': '#673AB7',  // 🟣 Morado (Cleaning Out)
  'DEV': '#FFEB3B',  // 🟡 Amarillo (Devolution)
  'RM': '#795548',   // 🟤 Café (Removed)
  'S/O': '#009688',  // 🟢 Verde-azulado (Stay Over)
  'E/CH': '#03A9F4', // 🔷 Azul claro (Early Check Out)
  'MT/IN': '#8BC34A', // 🟢 Verde lima (Maintenance In)
  'MT/OUT': '#CDDC39', // 🟡 Verde lima más claro (Maintenance Out)
  'DEP': '#FF5722',  // 🟥 Rojo oscuro (Linen Remove)
  'CALL': '#607D8B', // 🟦 Gris azulado (Call for Guest Need)
  'REMO PROJECT': '#E91E63', // 💖 Rosa (Remodeling Project)
  'F/S': '#3F51B5',  // 🔷 Azul índigo (Full Service)
  'N/A': '#808080'   // ⚫ Gris oscuro (Default)
};

  
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
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [activeCategory, setActiveCategory] = useState<{ [room: string]: 'A' | 'B' | null }>({});
  
  const hotelViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desplazamiento al cargar la página para ver desde la parte superior
    if (hotelViewRef.current) {
      hotelViewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotel/getemployeGetRoom`,
          { params: { park } }
        );
        setEmployees(response.data.employees || []);
      } catch (error) {
        console.error('Error al obtener empleados:', error);
      }
    };

    const fetchRoomStatuses = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotel/getAllRoomStatus`,
          { params: { hotel_id: park } }
        );
    
        const allStatuses: RoomStatus[] = response.data || [];
    
        // Filtrar el estado más reciente por cada habitación y categoría
        const latestRoomStatuses = Object.values(
          allStatuses.reduce((acc, room) => {
            const key = `${room.room_number}-${room.category}`;
            if (!acc[key] || new Date(room.created_at) > new Date(acc[key].created_at)) {
              acc[key] = room;
            }
            return acc;
          }, {} as Record<string, RoomStatus>)
        );
    
        setRoomStatuses(latestRoomStatuses);
      } catch (error) {
        console.error('Error al obtener el estado de las habitaciones:', error);
      }
    };
    

    fetchEmployees();
    fetchRoomStatuses();
  }, [park]);

  const handleCategoryClick = (room: number, category: 'A' | 'B') => {
    setActiveCategory((prevState) => ({
      ...prevState,
      [room]: prevState[room] === category ? null : category, // Alternar entre mostrar y ocultar
    }));
  };

  const getRoomStatusCounts = (floors: { floor: number; rooms: number[] }[], rooms: RoomStatus[]): Record<string, number> => {
    return rooms
      .filter(room => floors.some(floor => room.room_number.startsWith(`${floor.floor}`)))
      .reduce((acc: Record<string, number>, room: RoomStatus) => {
        const estado = room.status;
        const alias = statusColors[estado as keyof typeof statusColors] || "N/A";
        acc[alias] = (acc[alias] || 0) + 1;
        return acc;
      }, {});
  };
  

  return (
    <div ref={hotelViewRef} className="hotel-container space-y-4 px-4">
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

              const active = activeCategory[room]; // Categoría activa para esta habitación

              const roomStatusA = roomStatuses.find(
                (status) => status.room_number === room.toString() && status.category === 'A'
              );
              const roomStatusB = roomStatuses.find(
                (status) => status.room_number === room.toString() && status.category === 'B'
              );

              return (
                <div
                  key={room}
                  className="room relative w-32 h-56 border rounded-lg flex flex-col items-center bg-gray-50 shadow-sm"
                >
                  {/* Parte superior: Estado de la habitación */}
                  <div className="room-status flex w-full">
                    <div className="w-1/2 bg-gray-200 py-1 text-center font-medium text-sm border-r border-white">
                      {roomStatusA ? roomStatusA.status : '...'}
                    </div>
                    <div className="w-1/2 bg-gray-200 py-1 text-center font-medium text-sm">
                      {roomStatusB ? roomStatusB.status : '...'}
                    </div>
                  </div>
                  
                  {/* Contenido de la tarjeta (empleados, número de habitación, categorías) */}
                  <div className="flex flex-col items-center justify-between p-2 w-full flex-1">
                    {/* Empleados */}
                    <div className="employee flex flex-col items-center justify-center flex-1 mb-2">
                      {active === 'A' && employeeA && (
                        <div className="employee-category flex flex-col items-center mb-2">
                          <div className="icon mb-1">
                            <Image
                              src="/customers/usuario.png"
                              alt="Empleado A"
                              className="w-10 h-10 rounded-full border border-gray-150"
                            />
                          </div>
                          <p className="text-xs font-medium">{employeeA.employeeName}</p>
                        </div>
                      )}

                      {active === 'B' && employeeB && (
                        <div className="employee-category flex flex-col items-center">
                          <div className="icon mb-1">
                            <Image
                              src="/customers/usuario.png"
                              alt="Empleado B"
                              className="w-10 h-10 rounded-full border border-gray-150"
                            />
                          </div>
                          <p className="text-xs font-medium">{employeeB.employeeName}</p>
                        </div>
                      )}

                      {!active && !employeeA && !employeeB && (
                        <p className="text-gray-400 text-xs">Vacío</p>
                      )}
                    </div>

                    
                  </div>
                  {/* Número de habitación */}
                  <div className="room-number text-center text-sm font-bold border-neutral-200 bg-gray-100 border text-gray-700 py-1 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      Hab. {room}
                    </div>

                    {/* Categorías A y B */}
                    <div className="categories flex w-full">
                    <button
                      className={`w-1/2 text-xs font-bold py-1 text-center ${employeeA ? 'border-red-600 bg-red-100 border text-red-600' : 'border-green-600 bg-green-100 border text-green-600'} rounded-bl-lg`}
                      onClick={() => handleCategoryClick(room, 'A')}
                    >
                      A
                    </button>

                      <button

                      className={`w-1/2 text-xs font-bold py-1 text-center ${employeeB ? 'border-red-600 bg-red-100 border text-red-600' : 'border-green-600 bg-green-100 border text-green-600'} rounded-br-lg`}
                      onClick={() => handleCategoryClick(room, 'B')}
                      >
                      B
                      </button>


                    </div>
                    
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
