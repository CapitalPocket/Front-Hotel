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
  const base = useMemo(() => {
    const rawBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACK_LINK ||
      'http://localhost:8080';
    return typeof rawBase === 'string' ? rawBase.replace(/[`'"\s]/g, '').trim() : rawBase;
  }, []);
  const apiKey = useMemo(() => {
    const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    return typeof rawApiKey === 'string' ? rawApiKey.replace(/[`'"\s]/g, '').trim() : '';
  }, []);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch(`${base}/api/hotel/getAllHotel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'x-api-key': apiKey } : {}),
          },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        const hotelsData = Array.isArray(data) ? data : [];
        setHotels(hotelsData);

        const savedId = localStorage.getItem('hotel_id');
        if (savedId) {
          const hotelFound = hotelsData.find((h: Hotel) => h.id_hotel === Number(savedId));
          if (hotelFound) setSelectedHotel(hotelFound);
        }
      } catch (err) {
        console.error('Error al obtener hoteles:', err);
        setHotels([]);
      }
    };

    fetchHotels();
  }, [base, apiKey]);

  useEffect(() => {
    if (selectedHotel) {
      localStorage.setItem('hotel_id', selectedHotel.id_hotel.toString());
    }
  }, [selectedHotel]);

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
          <p className="text-sm text-slate-500">{hotels.length} cargados</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {hotels.map((hotel) => (
            <button
              key={hotel.id_hotel}
              onClick={() => setSelectedHotel(hotel)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                selectedHotel?.id_hotel === hotel.id_hotel
                  ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {hotel.name}
            </button>
          ))}
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
