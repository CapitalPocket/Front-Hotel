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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [roomQuery, setRoomQuery] = useState<string>('');
  const [compactView, setCompactView] = useState<boolean>(true);
  const hotelViewRef = useRef<HTMLDivElement>(null);
  const resolvedHotelId = parseInt(hotelId, 10) || 0;
  const apiKey = useMemo(() => {
    const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    return typeof rawApiKey === 'string' ? rawApiKey.replace(/[`'"\s]/g, '').trim() : '';
  }, []);
  const hotelHeaders = useMemo(
    () => (apiKey ? { 'x-api-key': apiKey } : undefined),
    [apiKey],
  );

  useEffect(() => {
    if (hotelViewRef.current) {
      hotelViewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const fetchRoomStatuses = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const requestConfig = {
          ...(hotelHeaders ? { headers: hotelHeaders } : {}),
          validateStatus: (status: number) => status === 200 || status === 404,
        };
        const response = await axios.post(
          '/api/hotel/getAllRoomStatus',
          { hotel_id: resolvedHotelId },
          requestConfig,
        );

        const allStatuses: RoomStatus[] = Array.isArray(response.data) ? response.data : [];
        if (response.status === 404 || allStatuses.length === 0) {
          setRoomStatuses([]);
          setLoadError('Este hotel no tiene habitaciones configuradas.');
          return;
        }

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
        setRoomStatuses([]);
        setLoadError('No fue posible cargar los estados de habitaciones.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomStatuses();
  }, [hotelHeaders, resolvedHotelId]);

  const roomStatusByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const room of roomStatuses) {
      map.set(`${room.room_number}-${room.category}`, room.status || 'N/A');
    }
    return map;
  }, [roomStatuses]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const room of roomStatuses) {
      const status = room.status || 'N/A';
      counts.set(status, (counts.get(status) || 0) + 1);
    }
    return counts;
  }, [roomStatuses]);

  const filterStatuses = useMemo(() => {
    const keys = Object.keys(statusColors).filter((status) => (statusCounts.get(status) || 0) > 0);
    return ['ALL', ...keys];
  }, [statusCounts]);

  const normalizedRoomQuery = roomQuery.trim().toLowerCase();

  const groupedRoomsByFloor = useMemo(() => {
    const groups: Record<number, number[]> = {};
    const uniqueRooms = Array.from(
      new Set(roomStatuses.map(r => parseInt(r.room_number)))
    );

    uniqueRooms.forEach(roomNum => {
      const floor = Math.floor(roomNum / 100);
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

  const filteredGroupedRoomsByFloor = useMemo(() => {
    return groupedRoomsByFloor
      .map((group) => ({
        floor: group.floor,
        rooms: group.rooms.filter((room) => {
          const roomKey = String(room);
          const statusA = roomStatusByKey.get(`${roomKey}-A`) || 'N/A';
          const statusB = roomStatusByKey.get(`${roomKey}-B`) || 'N/A';
          const matchesRoom = !normalizedRoomQuery || roomKey.toLowerCase().includes(normalizedRoomQuery);
          const matchesStatus = selectedStatus === 'ALL' || statusA === selectedStatus || statusB === selectedStatus;
          return matchesRoom && matchesStatus;
        }),
      }))
      .filter((group) => group.rooms.length > 0);
  }, [groupedRoomsByFloor, normalizedRoomQuery, roomStatusByKey, selectedStatus]);

  const totalRooms = useMemo(
    () => groupedRoomsByFloor.reduce((acc, group) => acc + group.rooms.length, 0),
    [groupedRoomsByFloor],
  );

  const filteredRooms = useMemo(
    () => filteredGroupedRoomsByFloor.reduce((acc, group) => acc + group.rooms.length, 0),
    [filteredGroupedRoomsByFloor],
  );

  const floorCount = filteredGroupedRoomsByFloor.length;

  const getStatusColor = (room: number, category: 'A' | 'B') => {
    const status = roomStatusByKey.get(`${room}-${category}`);
    return statusColors[status || 'N/A'] || '#ccc';
  };

  return (
    <div ref={hotelViewRef} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base md:text-lg font-semibold text-slate-800">Leyenda de estados</h3>
          <p className="text-sm text-slate-500">{floorCount} pisos visibles</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Object.entries(statusColors).map(([key, color]) => (
            <button
              key={key}
              onClick={() => setSelectedStatus((prev) => (prev === key ? 'ALL' : key))}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                selectedStatus === key
                  ? 'border-slate-700 bg-slate-800 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="h-4 w-4 rounded-md border border-slate-300" style={{ backgroundColor: color }} />
              <span className={`text-xs font-medium ${selectedStatus === key ? 'text-white' : 'text-slate-700'}`}>{key}</span>
              <span className={`text-[11px] ${selectedStatus === key ? 'text-slate-100' : 'text-slate-500'}`}>
                {statusCounts.get(key) || 0}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              value={roomQuery}
              onChange={(event) => setRoomQuery(event.target.value)}
              placeholder="Buscar habitación (ej: 701)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            />
            {selectedStatus !== 'ALL' && (
              <button
                onClick={() => setSelectedStatus('ALL')}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Limpiar estado
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompactView((prev) => !prev)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {compactView ? 'Vista cómoda' : 'Vista compacta'}
            </button>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {filteredRooms} de {totalRooms} habitaciones
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Cargando habitaciones...
          </div>
        )}
        {!isLoading && loadError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && filteredGroupedRoomsByFloor.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No encontramos habitaciones con ese filtro.
          </div>
        )}
        {!isLoading && !loadError && filteredGroupedRoomsByFloor.map((group) => (
          <div key={group.floor} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-800">Piso {group.floor}</h4>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {group.rooms.length} habitaciones
              </span>
            </div>
            <div className={`grid gap-2 ${compactView ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-10' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6'}`}>
              {group.rooms.map((room) => (
                <div key={room} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className={`border-b border-slate-200 bg-slate-50 text-center font-semibold text-slate-700 ${compactView ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}`}>
                    Hab. {room}
                  </div>
                  <div className="grid grid-cols-2 text-white">
                    <div
                      className={`flex items-center justify-center font-bold ${compactView ? 'h-8 text-xs' : 'h-11 text-sm'}`}
                      style={{ backgroundColor: getStatusColor(room, 'A') }}
                    >
                      A
                    </div>
                    <div
                      className={`flex items-center justify-center font-bold ${compactView ? 'h-8 text-xs' : 'h-11 text-sm'}`}
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
