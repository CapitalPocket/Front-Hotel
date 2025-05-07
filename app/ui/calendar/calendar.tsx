import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface Employee {
  employeeName: string;
  hotelName: string;
  currentRoom: string; // Ej: "101A" o "101B"
}

interface RoomStatus {
  id_room: number;
  hotel_id: number;
  room_number: string;
  category: 'A' | 'B';
  status: string;
  created_at: string;
}

interface HotelViewProps {
  park: string;
}

const statusColors: Record<string, string> = {
  
  'V/C': '#1B5E20',       // Verde bosque
  'O': '#FF6F00',         // Naranja intenso
  'V/D': '#B71C1C',       // Rojo sangre
  'OOO': '#424242',       // Gris carbón
  'CLEAN/IN': '#0D47A1',  // Azul fuerte
  'P/S': '#4A148C',       // Púrpura profundo
  'DEV': '#FDD835',       // Amarillo vibrante
  'RM': '#3E2723',        // Marrón muy oscuro
  'S/O': '#00695C',       // Verde azulado
  'E/CH': '#0288D1',      // Azul cielo fuerte
  'MT/IN': '#558B2F',     // Verde oliva
  'MT/OUT': '#AFB42B',    // Amarillo oliva
  'DEP': '#BF360C',       // Naranja quemado
  'CALL': '#263238',      // Azul grisáceo muy oscuro
  'REMO PROJECT': '#AD1457', // Rosa oscuro
  'F/S': '#1A237E',       // Azul marino fuerte
  'N/A': '#9E9E9E'        // Gris neutro
  };
  


const groupedRooms = [
  { floor: 7, rooms: [701, 702, 703, 704, 705, 706] },
  { floor: 6, rooms: [601, 602, 603, 604, 605, 606] },
  { floor: 5, rooms: [501, 502, 503, 504, 505, 506, 507, 508] },
  { floor: 4, rooms: [401, 402, 403, 404, 405, 406, 407, 408, 409, 410] },
  { floor: 3, rooms: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310] },
  { floor: 2, rooms: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210] },
  { floor: 1, rooms: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110] },
];

const HotelView: React.FC<HotelViewProps> = ({ park }) => {
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const hotelViewRef = useRef<HTMLDivElement>(null);

  // Convertir "heron i" a 1 y "heron ii" a 2
  const hotelId = park === 'Heron I' ? 1 : park === 'Heron II' ? 2 : 0;

  useEffect(() => {
    if (hotelViewRef.current) {
      hotelViewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    const fetchRoomStatuses = async () => {
      try {
        const response = await axios.post(
          `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllRoomStatus`,
          {hotel_id: hotelId }  // Usamos el hotelId calculado

        );

        const allStatuses: RoomStatus[] = response.data || [];

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
        console.error('Error al obtener estados de habitaciones:', error);
      }
    };

    fetchRoomStatuses();
  }, [hotelId]); // Cambié de park a hotelId aquí para que reaccione a cambios en hotelId

  const getStatusColor = (room: number, category: 'A' | 'B') => {
    const status = roomStatuses.find(
      (r) => r.room_number === room.toString() && r.category === category
    )?.status;
    return statusColors[status || 'N/A'] || '#ccc';
  };

  const half = Math.ceil(groupedRooms.length / 2);
  const [leftFloors, rightFloors] = [groupedRooms.slice(0, half), groupedRooms.slice(half)];

  return (
    <div ref={hotelViewRef} className="hotel-view">
      {/* Leyenda */}
      <div className="legend">
        {Object.entries(statusColors).map(([key, color]) => (
          <div key={key} className="legend-item">
            <div className="color-box" style={{ backgroundColor: color }}></div>
            <span>{key}</span>
          </div>
        ))}
      </div>

      {/* Habitaciones */}
      <div className="room-columns">
        {[leftFloors, rightFloors].map((column, i) => (
          <div key={i} className="room-column">
            {column.map((group) => (
              <div key={group.floor} className="floor-row">
                {group.rooms.map((room) => (
                  <div key={room} className="hex">
                    <div className="room-number">Hab. {room}</div>
                    <div className="split">
                      <div
                        className="half a"
                        style={{ backgroundColor: getStatusColor(room, 'A') }}
                      >
                        A
                      </div>
                      <div
                        className="half b"
                        style={{ backgroundColor: getStatusColor(room, 'B') }}
                      >
                        B
                      </div>
                    </div>
                  </div>

                ))}
              </div>
            ))}
          </div>
        ))}
      </div>


      <style jsx>{`
        .hotel-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }

        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
          justify-content: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
        }

        .color-box {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }

        .room-columns {
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .room-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .floor-row {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .hex {
          width: 100px;
          background-color: #f9fafb;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          font-size: 0.9rem;
        }

        .room-number {
          font-weight: bold;
          padding-top: 4px;
        }

        .split {
          display: flex;
          height: 40px;
        }

        .half {
          flex: 1;
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .a {
          border-right: 1px solid #fff;
        }

        .b {
          border-left: 1px solid #fff;
        }

        .legend {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
          width: 100%;
          max-width: 800px;
          background: #f0f4f8;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 6px 10px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          font-size: 0.85rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default HotelView;
