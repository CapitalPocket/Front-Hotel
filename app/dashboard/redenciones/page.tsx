"use client";
import axios from "axios";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { CreateHotel } from "@/app/ui/tickets/buttons";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  const handleRoomChange = (index: number, value: number) => {
    const newRooms = [...roomsPerFloor];
    newRooms[index] = Math.max(1, value);
    setRoomsPerFloor(newRooms);
  };

  const toggleExpand = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  const totalRooms = roomsPerFloor.reduce((sum, num) => sum + num, 0);

  const handleSaveHotel = async () => {
    if (!hotelName || latitude === null || longitude === null || floors === null || totalRooms === 0) return;

    setLoading(true);
    try {
      const hotelPayload = {
        name: hotelName,
        latitude,
        longitude,
        floors,
        roomsPerFloor,
        totalRooms,
      };
      console.log("📦 Enviando hotel a /createHotel:", hotelPayload);

      const hotelResponse = await axios.post(
        "http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/createHotel",
        hotelPayload
      );

      const hotelId = hotelResponse?.data?.id;
      if (!hotelId) throw new Error("No se obtuvo un ID del hotel al crearlo.");

      const roomsPayload = {
        hotelId,
        floors,
        roomsPerFloor,
      };
      console.log("📦 Enviando habitaciones a /createRoomsWithLastHotel:", roomsPayload);

      await axios.post(
        "http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/createRoomsWithLastHotel",
        roomsPayload
      );

      alert("✅ Hotel y habitaciones guardados correctamente");

      setHotelName("");
      setLatitude(null);
      setLongitude(null);
      setFloors(null);
      setRoomsPerFloor([]);
      setExpanded(null);
    } catch (error: any) {
      console.error("❌ Error al guardar:", error?.response?.data || error.message || error);
      alert("❌ Error al guardar el hotel o las habitaciones.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    hotelName &&
    latitude !== null &&
    longitude !== null &&
    floors !== null &&
    roomsPerFloor.every((num) => num > 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Registrar Nuevo Hotel</h1>

      <div className="flex flex-col gap-6">
        <input
          type="text"
          value={hotelName}
          onChange={(e) => setHotelName(e.target.value)}
          placeholder="Escribe el nombre del hotel"
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
        />

        <input
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
          placeholder="Número de pisos"
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
        />

        {floors !== null && (
          <div className="flex flex-col gap-4">
            {roomsPerFloor.map((rooms, index) => (
              <div key={index} className="border border-gray-200 rounded-lg bg-gray-50 px-4 py-3 shadow-sm">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(index)}
                >
                  <span className="font-semibold text-gray-800">🛗 Piso {index + 1}</span>
                  {expanded === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {expanded === index && (
                  <input
                    type="text"
                    inputMode="numeric"
                    value={roomsPerFloor[index].toString()}
                    onChange={(e) => {
                      const val = e.target.value;
                      const newRooms = [...roomsPerFloor];
                      newRooms[index] = val === "" ? 0 : Number(val);
                      setRoomsPerFloor(newRooms);
                    }}
                    onBlur={() => {
                      const newRooms = [...roomsPerFloor];
                      if (!newRooms[index] || isNaN(newRooms[index]) || newRooms[index] < 1) {
                        newRooms[index] = 1;
                        setRoomsPerFloor(newRooms);
                      }
                    }}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="h-[500px] rounded-lg overflow-hidden border border-gray-300">
          <Map
            onMapClick={handleMapClick}
            initialLatitude={latitude !== null ? latitude : 4.711}
            initialLongitude={longitude !== null ? longitude : -74.0721}
          />
        </div>

        {latitude !== null && longitude !== null && (
          <p className="text-sm text-gray-500 text-center">
            Coordenadas seleccionadas:{" "}
            <span className="font-semibold">{latitude}, {longitude}</span>
          </p>
        )}

        <p className="text-center text-sm text-gray-600">
          Total habitaciones: <strong>{totalRooms}</strong>
        </p>

        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={handleSaveHotel}
            disabled={!isFormValid || loading}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              isFormValid
                ? "bg-gray-700 text-white hover:bg-gray-900"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Guardando..." : "Guardar Hotel"}
          </button>
          <CreateHotel grupo="defaultGroup" />
        </div>
      </div>
    </div>
  );
};

export default Page;
