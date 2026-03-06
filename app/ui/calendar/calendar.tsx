import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  'V/C': '#1B5E20',
  'O': '#FF6F00',
  'V/D': '#B71C1C',
  'OOO': '#424242',
  'CLEAN/IN': '#0D47A1',
  'P/S': '#4A148C',
  'DEV': '#FDD835',
  'RM': '#3E2723',
  'S/O': '#00695C',
  'E/CH': '#0288D1',
  'MT/IN': '#558B2F',
  'MT/OUT': '#AFB42B',
  'DEP': '#BF360C',
  'CALL': '#263238',
  'REMO PROJECT': '#AD1457',
  'F/S': '#1A237E',
  'N/A': '#9E9E9E'
};

const HotelView: React.FC<HotelViewProps> = ({ hotelId }) => {
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const hotelViewRef = useRef<HTMLDivElement>(null);
  const resolvedHotelId = parseInt(hotelId, 10) || 0;

  useEffect(() => {
    if (hotelViewRef.current) {
      hotelViewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const fetchRoomStatuses = async () => {
      try {
        const response = await axios.post(
          `/api/hotel/getAllRoomStatus`,
          { hotel_id: resolvedHotelId }
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
  }, [resolvedHotelId]);

  const groupedRoomsByFloor = useMemo(() => {
    const groups: Record<number, number[]> = {};
    const uniqueRooms = Array.from(
      new Set(roomStatuses.map(r => parseInt(r.room_number)))
    );

    uniqueRooms.forEach(roomNum => {
      const floor = Math.floor(roomNum / 100); // primer dígito (ej: 701 -> 7)
      if (!groups[floor]) groups[floor] = [];
      groups[floor].push(roomNum);
    });

    const sortedFloors = Object.keys(groups)
      .map(Number)
      .sort((a, b) => b - a);

    return sortedFloors.map(floor => ({
      floor,
      rooms: groups[floor].sort((a, b) => a - b),
    }));
  }, [roomStatuses]);

  const getStatusColor = (room: number, category: 'A' | 'B') => {
    const status = roomStatuses.find(
      r => r.room_number === room.toString() && r.category === category
    )?.status;
    return statusColors[status || 'N/A'] || '#ccc';
  };

  return (
    <div ref={hotelViewRef} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base md:text-lg font-semibold text-slate-800">Leyenda de estados</h3>
          <p className="text-sm text-slate-500">{groupedRoomsByFloor.length} pisos detectados</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Object.entries(statusColors).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <div className="h-4 w-4 rounded-md border border-slate-300" style={{ backgroundColor: color }} />
              <span className="text-xs font-medium text-slate-700">{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {groupedRoomsByFloor.map((group) => (
          <div key={group.floor} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-800">Piso {group.floor}</h4>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {group.rooms.length} habitaciones
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {group.rooms.map((room) => (
                <div key={room} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-slate-700">
                    Hab. {room}
                  </div>
                  <div className="grid grid-cols-2 text-white">
                    <div
                      className="flex h-11 items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: getStatusColor(room, 'A') }}
                    >
                      A
                    </div>
                    <div
                      className="flex h-11 items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: getStatusColor(room, 'B') }}
                    >
                      B
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelView;
