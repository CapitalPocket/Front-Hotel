'use client';

import React, { useEffect, useMemo, useState } from 'react';
import HotelView from '@/app/ui/calendar/calendar';

type Hotel = {
  id_hotel: number;
  name: string;
};

const Page = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isLoadingHotels, setIsLoadingHotels] = useState<boolean>(false);
  const [hotelsError, setHotelsError] = useState<string | null>(null);
  const [hotelQuery, setHotelQuery] = useState<string>('');
  const apiKey = useMemo(() => {
    const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    return typeof rawApiKey === 'string' ? rawApiKey.replace(/[`'"\s]/g, '').trim() : '';
  }, []);

  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoadingHotels(true);
      setHotelsError(null);
      try {
        const res = await fetch('/api/hotel/getAllHotel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'x-api-key': apiKey } : {}),
          },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        const data = await res.json();
        const hotelsData = Array.isArray(data) ? data : [];
        setHotels(hotelsData);

        const savedId = localStorage.getItem('hotel_id');
        if (savedId) {
          const hotelFound = hotelsData.find((h: Hotel) => h.id_hotel === Number(savedId));
          if (hotelFound) {
            setSelectedHotel(hotelFound);
            return;
          }
        }
        if (hotelsData.length > 0) {
          setSelectedHotel(hotelsData[0]);
        }
      } catch (err) {
        console.error('Error al obtener hoteles:', err);
        setHotels([]);
        setHotelsError('No fue posible cargar los hoteles. Intenta de nuevo.');
      } finally {
        setIsLoadingHotels(false);
      }
    };

    fetchHotels();
  }, [apiKey]);

  useEffect(() => {
    if (selectedHotel) {
      localStorage.setItem('hotel_id', selectedHotel.id_hotel.toString());
    }
  }, [selectedHotel]);

  const sortedHotels = useMemo(
    () => [...hotels].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [hotels],
  );

  const normalizedHotelQuery = hotelQuery.trim().toLowerCase();

  const filteredHotels = useMemo(
    () =>
      sortedHotels.filter((hotel) =>
        hotel.name.toLowerCase().includes(normalizedHotelQuery) ||
        String(hotel.id_hotel).includes(normalizedHotelQuery),
      ),
    [normalizedHotelQuery, sortedHotels],
  );

  return (
    <div className="min-h-full w-full space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estado de habitaciones</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {selectedHotel ? `Visualización de ${selectedHotel.name}` : 'Selecciona un hotel para comenzar'}
          </h1>
          <p className="text-slate-500">Consulta por piso el estado de cada habitación con una vista más clara y rápida.</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Hoteles disponibles</h2>
          <p className="text-sm text-slate-500">
            {isLoadingHotels ? 'Cargando...' : `${filteredHotels.length} de ${hotels.length}`}
          </p>
        </div>
        {hotelsError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {hotelsError}
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <input
              value={hotelQuery}
              onChange={(event) => setHotelQuery(event.target.value)}
              placeholder="Buscar hotel por nombre o id"
              className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            />
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {!isLoadingHotels && filteredHotels.map((hotel) => (
                <button
                  key={hotel.id_hotel}
                  onClick={() => setSelectedHotel(hotel)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition-all ${
                    selectedHotel?.id_hotel === hotel.id_hotel
                      ? 'border-slate-800 bg-slate-800 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-sm font-semibold">{hotel.name}</p>
                  <p className={`text-xs ${selectedHotel?.id_hotel === hotel.id_hotel ? 'text-slate-100' : 'text-slate-500'}`}>
                    ID #{hotel.id_hotel}
                  </p>
                </button>
              ))}
              {!isLoadingHotels && hotels.length === 0 && !hotelsError && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                  No hay hoteles disponibles para mostrar.
                </div>
              )}
              {!isLoadingHotels && hotels.length > 0 && filteredHotels.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                  No encontramos hoteles con esa búsqueda.
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Hotel seleccionado</p>
            {selectedHotel ? (
              <div className="mt-2 space-y-1">
                <p className="text-xl font-semibold text-slate-800">{selectedHotel.name}</p>
                <p className="text-sm text-slate-500">ID #{selectedHotel.id_hotel}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Selecciona un hotel de la lista para visualizar su estado.</p>
            )}
            {!isLoadingHotels && filteredHotels.length > 1 && selectedHotel && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    const currentIndex = filteredHotels.findIndex((hotel) => hotel.id_hotel === selectedHotel.id_hotel);
                    if (currentIndex > 0) setSelectedHotel(filteredHotels[currentIndex - 1]);
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hotel anterior
                </button>
                <button
                  onClick={() => {
                    const currentIndex = filteredHotels.findIndex((hotel) => hotel.id_hotel === selectedHotel.id_hotel);
                    if (currentIndex >= 0 && currentIndex < filteredHotels.length - 1) {
                      setSelectedHotel(filteredHotels[currentIndex + 1]);
                    }
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hotel siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        {selectedHotel ? (
          <HotelView hotelId={selectedHotel.id_hotel.toString()} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
            <p>Selecciona un hotel para ver la distribución por pisos y categorías.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Page;
