'use client';

import React, { useEffect, useState } from 'react';
import HotelView from '@/app/ui/calendar/calendar';

type Hotel = {
  id_hotel: number;
  name: string;
};

const Page = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch(`/api/hotel/getAllHotel`);
        const data: Hotel[] = await res.json();
        setHotels(data);

        const savedId = localStorage.getItem('hotel_id');
        if (savedId) {
          const hotelFound = data.find(h => h.id_hotel === Number(savedId));
          if (hotelFound) setSelectedHotel(hotelFound);
        }
      } catch (err) {
        console.error('Error al obtener hoteles:', err);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      localStorage.setItem('hotel_id', selectedHotel.id_hotel.toString());
    }
  }, [selectedHotel]);

  return (
    <div className="h-screen flex flex-col items-center justify-between bg-gray-100 overflow-y-auto px-4">
      <h1 className="text-2xl font-bold my-[2.5%] text-center text-gray-800">
        Estados en {selectedHotel?.name ?? '...'} por habitación
      </h1>

      <div className="flex flex-wrap justify-center w-full max-w-md mx-auto gap-4 py-3">
        {hotels.map(hotel => (
          <button
            key={hotel.id_hotel}
            onClick={() => setSelectedHotel(hotel)}
            className={`
              h-10
              bg-gray-700
              hover:bg-gray-600
              text-gray-100
              font-semibold
              py-1 px-6
              rounded-lg
              transition
              duration-300
              whitespace-nowrap
              shadow-md
              ${selectedHotel?.id_hotel === hotel.id_hotel ? 'ring-4 ring-gray-400' : ''}
            `}
          >
            {hotel.name}
          </button>
        ))}
      </div>

      <div className="flex-grow w-full max-w-6xl mx-auto mt-8 px-2">
        {selectedHotel ? (
          <HotelView hotelId={selectedHotel.id_hotel.toString()} />
        ) : (
          <div className="text-center text-gray-500">
            <p>Selecciona una opción para ver los pisos y empleados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
