"use client";
import axios from "axios";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { CreateHotel } from "@/app/ui/tickets/buttons";

const Map = dynamic(() => import("@/app/ui/Map"), { ssr: false });

const Page = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [hotelName, setHotelName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSaveHotel = async () => {
    if (!hotelName || latitude === null || longitude === null) return;

    setLoading(true);
    try {
      await axios.post("http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/createHotel", {
        name: hotelName,
        latitude,
        longitude,
      });
      alert("✅ Hotel guardado correctamente");
      setHotelName("");
      setLatitude(null);
      setLongitude(null);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ Error al guardar el hotel.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = hotelName && latitude !== null && longitude !== null;

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

        <div className="h-[500px] rounded-lg overflow-hidden border border-gray-300">
        <Map 
            onMapClick={handleMapClick} 
            initialLatitude={latitude !== null ? latitude : 4.7110} 
            initialLongitude={longitude !== null ? longitude : -74.0721} 
            />

        </div>

        {latitude !== null && longitude !== null && (
          <p className="text-sm text-gray-500 text-center">
            Coordenadas seleccionadas: <span className="font-semibold">{latitude}, {longitude}</span>
          </p>
        )}

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
