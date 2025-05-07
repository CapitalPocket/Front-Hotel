"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { CreateHotel } from "../tickets/buttons";
// Carga dinámica del mapa para evitar errores en SSR (Next.js)
const MapComponent = dynamic(() => import("@/app/ui/Map"), { ssr: false });

const Invoices: React.FC = () => {
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [hotelName, setHotelName] = useState("");

    // Función para manejar el clic en el mapa y actualizar coordenadas
    const handleMapClick = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
    };

    // Enviar datos del nuevo hotel al backend
    const handleSaveHotel = async () => {
        if (!hotelName || latitude === null || longitude === null) {
            alert("Por favor, ingrese un nombre y seleccione una ubicación.");
            return;
        }

        try {
            const response = await axios.post("http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllHotel", {
                name: hotelName,
                latitude,
                longitude,
            });

            alert("Hotel guardado correctamente");
            console.log(response.data);
        } catch (error) {
            console.error("Error al guardar el hotel:", error);
            alert("Hubo un error al guardar el hotel.");
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold my-4 text-center">Registrar Nuevo Hotel</h1>

            {/* Input para el nombre del hotel */}
            <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="Nombre del hotel"
                className="border-2 border-gray-300 rounded-lg p-2 mb-4 w-full max-w-md"
            />

            {/* Mapa interactivo */}
            <div className="w-full h-[500px] mb-4">
                <MapComponent 
                    onMapClick={handleMapClick} 
                    initialLatitude={latitude || 0} 
                    initialLongitude={longitude || 0} 
                />
            </div>

            {/* Mostrar coordenadas seleccionadas */}
            {latitude !== null && longitude !== null && (
                <p className="text-lg">
                    Ubicación seleccionada: <strong>{latitude}, {longitude}</strong>
                </p>
            )}

            {/* Botón para guardar */}
            <div className="flex gap-4 mt-4">
                <button
                    onClick={handleSaveHotel}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-black transition"
                >
                    Guardar Hotel
                </button>
                <CreateHotel grupo="Buen Comienzo"/>
                </div>

        </div>
    );
};

export default Invoices;
