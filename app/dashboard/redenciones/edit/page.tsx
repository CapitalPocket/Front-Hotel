'use client';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AppToastContainer, notifyError, notifySuccess } from '@/app/utils/toast';

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
  const [hotelQuery, setHotelQuery] = useState<string>('');
  const [isLoadingHotels, setIsLoadingHotels] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const apiKey = useMemo(() => {
    const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    return typeof rawApiKey === 'string' ? rawApiKey.replace(/[`'"\s]/g, '').trim() : '';
  }, []);
  const hotelHeaders = useMemo(
    () =>
      apiKey
        ? {
            headers: {
              'x-api-key': apiKey,
              Authorization: `Api-Key ${apiKey}`,
            },
          }
        : undefined,
    [apiKey],
  );

  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoadingHotels(true);
      try {
        const res = await axios.post(`/api/hotel/getAllHotel`, {}, hotelHeaders);
        const transformedHotels = res.data.map((hotel: any) => ({
          id: hotel.id_hotel,
          name: hotel.name,
          latitude: Number(hotel.latitude),
          longitude: Number(hotel.longitude),
        }));
        setHotels(transformedHotels);
      } catch (err: any) {
        const statusCode = err?.response?.status;
        if (statusCode === 401) {
          notifyError('No autorizado para consultar propiedades. Verifica tu sesión o API key.');
        } else {
          notifyError(err?.response?.data?.message || 'No se pudieron cargar las propiedades.');
        }
      } finally {
        setIsLoadingHotels(false);
      }
    };

    fetchHotels();
  }, [hotelHeaders]);

  const normalizedQuery = hotelQuery.trim().toLowerCase();
  const filteredHotels = useMemo(
    () =>
      hotels
        .filter((hotel) =>
          hotel.name.toLowerCase().includes(normalizedQuery) || String(hotel.id).includes(normalizedQuery),
        )
        .sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [hotels, normalizedQuery],
  );

  const handleEdit = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setHotelName(hotel.name);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!selectedHotel) return;
    setSelectedHotel({
      ...selectedHotel,
      latitude: lat,
      longitude: lng,
    });
  };

  const closeModal = () => {
    setSelectedHotel(null);
    setHotelName('');
  };

  const handleSaveHotel = async () => {
    const cleanName = hotelName.trim();
    if (!selectedHotel || typeof selectedHotel.id !== 'number') {
      notifyError('No se encontró la propiedad que intentas editar.');
      return;
    }
    if (!cleanName) {
      notifyError('El nombre de la propiedad es obligatorio.');
      return;
    }

    setLoading(true);
    axios
      .put(`/api/hotel/updateHotel/${selectedHotel.id}`, {
        name: cleanName,
        latitude: selectedHotel.latitude,
        longitude: selectedHotel.longitude,
      }, hotelHeaders)
      .then(() => {
        notifySuccess('Propiedad actualizada correctamente.');
        setHotels((prevHotels) =>
          prevHotels.map((hotel) =>
            hotel.id === selectedHotel.id
              ? {
                  ...hotel,
                  name: cleanName,
                  latitude: selectedHotel.latitude,
                  longitude: selectedHotel.longitude,
                }
              : hotel,
          ),
        );
        closeModal();
      })
      .catch((error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'No se pudo actualizar la propiedad.';
        notifyError(message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="w-full space-y-6">
      <AppToastContainer />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Propiedades</p>
            <h1 className="text-3xl font-bold text-slate-800">Administrar propiedades existentes</h1>
            <p className="text-sm text-slate-500">
              Actualiza nombre y ubicación de cada hotel desde una vista centralizada.
            </p>
          </div>
          <Link
            href="/dashboard/redenciones"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Crear nueva propiedad
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Listado de propiedades</h2>
          <p className="text-sm text-slate-500">
            {isLoadingHotels ? 'Cargando...' : `${filteredHotels.length} de ${hotels.length}`}
          </p>
        </div>

        <input
          value={hotelQuery}
          onChange={(event) => setHotelQuery(event.target.value)}
          placeholder="Buscar por nombre o id"
          className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {!isLoadingHotels && filteredHotels.map((hotel) => (
            <article key={hotel.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <h3 className="text-lg font-semibold text-slate-800">{hotel.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">ID #{hotel.id}</p>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <p>Lat: {hotel.latitude.toFixed(6)}</p>
                <p>Lng: {hotel.longitude.toFixed(6)}</p>
              </div>
              <button
                onClick={() => handleEdit(hotel)}
                className="mt-4 h-10 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Editar propiedad
              </button>
            </article>
          ))}
          {!isLoadingHotels && hotels.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No hay propiedades registradas.
            </div>
          )}
          {!isLoadingHotels && hotels.length > 0 && filteredHotels.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No encontramos propiedades con esa búsqueda.
            </div>
          )}
        </div>
      </section>

      {selectedHotel && (
        <div className="fixed inset-0 z-50 bg-slate-900/55 p-4 md:p-8" onClick={closeModal}>
          <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Edición de propiedad</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-800">Editar {selectedHotel.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="space-y-4 px-6 py-6">
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500"
                placeholder="Escribe el nombre del hotel"
              />

              <div className="h-80 overflow-hidden rounded-2xl border border-slate-200">
                <Map
                  initialLatitude={selectedHotel.latitude}
                  initialLongitude={selectedHotel.longitude}
                  onMapClick={handleMapClick}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <span>Latitud: {selectedHotel.latitude.toFixed(6)}</span>
                  <span>Longitud: {selectedHotel.longitude.toFixed(6)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeModal}
                  className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveHotel}
                  disabled={loading}
                  className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditHotelPage;
