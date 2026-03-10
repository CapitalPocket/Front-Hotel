"use client";
import axios from "axios";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AppToastContainer, notifyError, notifySuccess } from "@/app/utils/toast";

const Map = dynamic(() => import("@/app/ui/Map"), { ssr: false });

const Page = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [hotelName, setHotelName] = useState("");
  const [floors, setFloors] = useState<number | null>(null);
  const [roomsPerFloor, setRoomsPerFloor] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleFloorsChange = (value: number) => {
    setFloors(value);
    setRoomsPerFloor(Array(value).fill(1));
    setExpanded(null);
  };

  const toggleExpand = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  const totalRooms = useMemo(
    () => roomsPerFloor.reduce((sum, num) => sum + (Number.isFinite(num) ? num : 0), 0),
    [roomsPerFloor],
  );

  const handleSaveHotel = async () => {
    const cleanName = hotelName.trim();
    if (!cleanName) {
      notifyError("El nombre de la propiedad es obligatorio.");
      return;
    }
    if (latitude === null || longitude === null) {
      notifyError("Debes seleccionar la ubicación en el mapa.");
      return;
    }
    if (floors === null || floors < 1) {
      notifyError("La propiedad debe tener al menos 1 piso.");
      return;
    }
    if (roomsPerFloor.some((value) => value < 1)) {
      notifyError("Cada piso debe tener al menos 1 habitación.");
      return;
    }
    if (totalRooms < 1) {
      notifyError("La propiedad debe tener habitaciones.");
      return;
    }

    setLoading(true);
    try {
      const hotelPayload = {
        name: cleanName,
        latitude,
        longitude,
        floors,
        roomsPerFloor,
        totalRooms,
      };

      const hotelResponse = await axios.post(
        `/api/hotel/createHotel`,
        hotelPayload
      );

      const hotelId = hotelResponse?.data?.id;
      if (!hotelId) throw new Error("No se obtuvo un ID del hotel al crearlo.");

      const roomsPayload = {
        hotelId,
        floors,
        roomsPerFloor,
      };
      await axios.post(
        `/api/hotel/createRoomsWithLastHotel`,
        roomsPayload
      );

      notifySuccess("Propiedad y habitaciones guardadas correctamente.");

      setHotelName("");
      setLatitude(null);
      setLongitude(null);
      setFloors(null);
      setRoomsPerFloor([]);
      setExpanded(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "No se pudo guardar la propiedad. Intenta de nuevo.";
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    hotelName.trim() &&
    latitude !== null &&
    longitude !== null &&
    floors !== null && floors > 0 &&
    roomsPerFloor.every((num) => num > 0);

  return (
    <div className="w-full space-y-6">
      <AppToastContainer />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gestión de propiedades</p>
            <h1 className="text-3xl font-bold text-slate-800">Registro y configuración de hoteles</h1>
            <p className="max-w-2xl text-sm text-slate-500 md:text-base">
              Crea nuevas propiedades con ubicación, estructura por pisos y distribución total de habitaciones.
            </p>
          </div>
          <Link
            href="/dashboard/redenciones/edit"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Administrar propiedades existentes
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pisos</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{floors ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Habitaciones</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{totalRooms}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Ubicación</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {latitude !== null && longitude !== null ? "Definida" : "Pendiente"}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div>
              <label htmlFor="hotelName" className="mb-2 block text-sm font-semibold text-slate-700">Nombre de la propiedad</label>
              <input
                id="hotelName"
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="Ej: Heron III"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label htmlFor="floors" className="mb-2 block text-sm font-semibold text-slate-700">Número de pisos</label>
              <input
                id="floors"
                type="text"
                inputMode="numeric"
                value={floors !== null ? floors.toString() : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const numberVal = val === "" ? 0 : Number(val);
                  handleFloorsChange(numberVal);
                }}
                onBlur={() => {
                  if (!floors || floors < 1) {
                    handleFloorsChange(1);
                  }
                }}
                placeholder="Ej: 5"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500"
              />
            </div>

            {floors !== null && (
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Habitaciones por piso</p>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {roomsPerFloor.map((rooms, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between"
                        onClick={() => toggleExpand(index)}
                      >
                        <span className="text-sm font-semibold text-slate-800">Piso {index + 1}</span>
                        {expanded === index ? (
                          <ChevronUp className="h-5 w-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-500" />
                        )}
                      </button>

                      {expanded === index && (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={rooms.toString()}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newRooms = [...roomsPerFloor];
                            newRooms[index] = val === "" ? 0 : Number(val);
                            setRoomsPerFloor(newRooms);
                          }}
                          onBlur={() => {
                            const newRooms = [...roomsPerFloor];
                            if (!newRooms[index] || Number.isNaN(newRooms[index]) || newRooms[index] < 1) {
                              newRooms[index] = 1;
                              setRoomsPerFloor(newRooms);
                            }
                          }}
                          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                onClick={handleSaveHotel}
                disabled={!isFormValid || loading}
                className={`h-11 rounded-xl px-5 text-sm font-semibold transition ${
                  isFormValid
                    ? "bg-slate-900 text-white hover:bg-slate-700"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                {loading ? "Guardando..." : "Guardar propiedad"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Ubicación de la propiedad</p>
            <div className="h-[460px] overflow-hidden rounded-2xl border border-slate-200">
              <Map
                onMapClick={handleMapClick}
                initialLatitude={latitude !== null ? latitude : 4.711}
                initialLongitude={longitude !== null ? longitude : -74.0721}
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {latitude !== null && longitude !== null ? (
                <span>
                  Coordenadas seleccionadas: <strong>{latitude.toFixed(6)}</strong>, <strong>{longitude.toFixed(6)}</strong>
                </span>
              ) : (
                <span>Haz clic en el mapa para definir la ubicación del hotel.</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
