"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { CreateHotel } from "../tickets/buttons";
import { AppToastContainer, notifyError, notifySuccess } from "@/app/utils/toast";

const MapComponent = dynamic(() => import("@/app/ui/Map"), { ssr: false });

const Invoices: React.FC = () => {
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [hotelName, setHotelName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleMapClick = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
    };

    const handleSaveHotel = async () => {
        if (isSaving) return;
        const trimmedHotelName = hotelName.trim();
        if (!trimmedHotelName || latitude === null || longitude === null) {
            notifyError("Ingresa un nombre y selecciona una ubicación.");
            return;
        }

        setIsSaving(true);
        try {
            await axios.post(`/api/hotel/createHotel`, {
                name: trimmedHotelName,
                latitude,
                longitude,
            });
            notifySuccess("Hotel guardado correctamente.");
            setHotelName("");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const backendMessage =
                    typeof error.response?.data?.message === "string" ? error.response.data.message : null;
                notifyError(backendMessage || "Hubo un error al guardar el hotel.");
            } else {
                notifyError("Hubo un error al guardar el hotel.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-6">
            <AppToastContainer />
            <h1 className="text-2xl font-bold my-4 text-center">Registrar Nuevo Hotel</h1>

            <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="Nombre del hotel"
                className="border-2 border-gray-300 rounded-lg p-2 mb-4 w-full max-w-md"
            />

            <div className="w-full h-[500px] mb-4">
                <MapComponent 
                    onMapClick={handleMapClick} 
                    initialLatitude={latitude || 0} 
                    initialLongitude={longitude || 0} 
                />
            </div>

            {latitude !== null && longitude !== null && (
                <p className="text-lg">
                    Ubicación seleccionada: <strong>{latitude}, {longitude}</strong>
                </p>
            )}

            <div className="flex gap-4 mt-4">
                <button
                    onClick={handleSaveHotel}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg text-white transition ${
                        isSaving ? "cursor-not-allowed bg-slate-400" : "bg-black hover:bg-slate-900"
                    }`}
                >
                    {isSaving ? "Guardando..." : "Guardar Hotel"}
                </button>
                <CreateHotel grupo="Buen Comienzo"/>
                </div>

        </div>
    );
};

export default Invoices;
