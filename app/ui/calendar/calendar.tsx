import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface RoomStatus {
  id_room: number;
  hotel_id: number;
  room_number: string;
  category: 'A' | 'B';
  status: string;
  created_at: string;
}

interface HotelViewProps {
  hotelId: string;
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

const HotelView: React.FC<HotelViewProps> = ({ hotelId }) => {
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const hotelViewRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const resolvedHotelId = parseInt(hotelId, 10) || 0;

    if (hotelViewRef.current) {
      hotelViewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const fetchRoomStatuses = async () => {
      try {
        const response = await axios.post(
          `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllRoomStatus`,
          { hotel_id: resolvedHotelId }
        );

        const allStatuses: RoomStatus[] = response.data || [];

        // Obtener el último estado por habitación y categoría
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
  }, [hotelId]);

  // Función para agrupar habitaciones por piso (primer dígito del room_number)
  const groupedRoomsByFloor = React.useMemo(() => {
    const groups: Record<number, number[]> = {};

    // Obtenemos sólo los números de habitación únicos
    const uniqueRooms = Array.from(
      new Set(roomStatuses.map(r => parseInt(r.room_number)))
    );

    uniqueRooms.forEach(roomNum => {
      const floor = Math.floor(roomNum / 100); // primer dígito (ej: 701 -> 7)
      if (!groups[floor]) groups[floor] = [];
      groups[floor].push(roomNum);
    });

    // Ordenamos pisos y habitaciones
    const sortedFloors = Object.keys(groups)
      .map(Number)
      .sort((a, b) => b - a); // pisos descendentes

    return sortedFloors.map(floor => ({
      floor,
      rooms: groups[floor].sort((a, b) => a - b),
    }));
  }, [roomStatuses]);

  // Dividir en dos columnas
  const half = Math.ceil(groupedRoomsByFloor.length / 2);
  const [leftFloors, rightFloors] = [
    groupedRoomsByFloor.slice(0, half),
    groupedRoomsByFloor.slice(half),
  ];

  // Obtener color de estado para la habitación y categoría
  const getStatusColor = (room: number, category: 'A' | 'B') => {
    const status = roomStatuses.find(
      r => r.room_number === room.toString() && r.category === category
    )?.status;
    return statusColors[status || 'N/A'] || '#ccc';
  };

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

      {/* Habitaciones dinámicas agrupadas por piso */}
      <div className="room-columns">
        {[leftFloors, rightFloors].map((column, i) => (
          <div key={i} className="room-column">
            {column.map(group => (
              <div key={group.floor} className="floor-row">
                {group.rooms.map(room => (
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

      {/* Estilos igual que antes */}
      <style jsx>{`
        .hotel-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
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
      `}</style>
    </div>
  );
};

export default HotelView;
