'use client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('@/app/ui/Map'), { ssr: false });

type Hotel = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

const EditHotelPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hotelName, setHotelName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get(`/api/hotel/getAllHotel`)
      .then((res) => {
        const transformedHotels = res.data.map((hotel: any) => ({
          id: hotel.id_hotel, // ← mapeo correcto
          name: hotel.name,
          latitude: hotel.latitude,
          longitude: hotel.longitude,
        }));
        setHotels(transformedHotels);
      })
      .catch((err) => {
        console.error('Error fetching hotels:', err);
      });
  }, []);
  
  const handleEdit = (hotel: Hotel) => {
    console.log('Editando hotel:', hotel); // <-- Asegúrate que tenga ID
    setSelectedHotel(hotel);
    setHotelName(hotel.name);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (selectedHotel) {
      setSelectedHotel({
        ...selectedHotel,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const handleSaveHotel = async () => {
    if (!hotelName || !selectedHotel || typeof selectedHotel.id !== 'number') {
      alert('⚠️ No se puede guardar: hotel inválido.');
      console.warn('Hotel inválido:', selectedHotel);
      return;
    }
  
    setLoading(true);
    try {
      await axios.post(
        `/api/hotel/updateHotel/${selectedHotel.id}`,
        {
          name: hotelName,
          latitude: selectedHotel.latitude,
          longitude: selectedHotel.longitude,
        }
      );
      alert('✅ Hotel actualizado correctamente');
      setHotels((prevHotels) =>
        prevHotels.map((hotel) =>
          hotel.id === selectedHotel.id
            ? {
                ...hotel,
                name: hotelName,
                latitude: selectedHotel.latitude,
                longitude: selectedHotel.longitude,
              }
            : hotel
        )
      );
      setSelectedHotel(null);
      setHotelName('');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('❌ Error al guardar el hotel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Editar Hoteles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-xl shadow-md p-4 space-y-2 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700">{hotel.name}</h2>
            <p className="text-sm text-gray-500">
              Lat: {hotel.latitude}, Lng: {hotel.longitude}
            </p>
            <button
              onClick={() => handleEdit(hotel)}
              className="mt-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {selectedHotel && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative">
            <h2 className="text-xl font-semibold mb-4">Editar {selectedHotel.name}</h2>

            <input
              type="text"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
              placeholder="Escribe el nombre del hotel"
            />

            <div className="h-80 rounded overflow-hidden mb-4">
              <Map
                initialLatitude={selectedHotel.latitude}
                initialLongitude={selectedHotel.longitude}
                onMapClick={handleMapClick}
              />
            </div>

            {typeof selectedHotel.latitude === 'number' &&
                typeof selectedHotel.longitude === 'number' && (
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                    <span>Latitud: {selectedHotel.latitude.toFixed(6)}</span>
                    <span>Longitud: {selectedHotel.longitude.toFixed(6)}</span>
                </div>
                )}


            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedHotel(null)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveHotel}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditHotelPage;
