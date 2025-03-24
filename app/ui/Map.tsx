"use client";
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LiaHotelSolid } from "react-icons/lia";
import ReactDOMServer from "react-dom/server";

interface MapProps {
    onMapClick: (lat: number, lng: number) => void;
}

const MapComponent: React.FC<MapProps> = ({ onMapClick }) => {
    const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);

    // Convertimos el icono de `react-icons` en un string HTML para Leaflet
    const hotelIcon = new L.DivIcon({
        className: "custom-icon",
        html: ReactDOMServer.renderToString(<LiaHotelSolid size={32} color="red" />), // Renderiza el icono como HTML
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto de anclaje
        popupAnchor: [0, -32], // Posición del popup
    });

    // Manejo de clics en el mapa
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setSelectedPosition({ lat, lng });
                onMapClick(lat, lng);
            },
        });
        return null;
    };

    return (
        <MapContainer
            center={[4.6097, -74.0817]} // Bogotá como punto inicial
            zoom={12}
            className="h-full w-full rounded-lg shadow-lg"
            scrollWheelZoom={true}
        >
            {/* Google Maps estilo */}
            <TileLayer
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            />

            <MapClickHandler />

            {/* Marcador con icono de hotel cuando el usuario selecciona una ubicación */}
            {selectedPosition && (
                <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={hotelIcon}>
                    <Popup>
                        🏨 Hotel seleccionado <br />
                        Lat: {selectedPosition.lat.toFixed(5)}, Lng: {selectedPosition.lng.toFixed(5)}
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MapComponent;
