'use client';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LiaHotelSolid } from 'react-icons/lia';
import ReactDOMServer from 'react-dom/server';

interface MapProps {
    onMapClick: (lat: number, lng: number) => void;
    initialLatitude: number;
    initialLongitude: number;
}

const MapComponent: React.FC<MapProps> = ({ onMapClick, initialLatitude, initialLongitude }) => {
    const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);

    // Convertimos el icono de `react-icons` en un string HTML para Leaflet
    const hotelIcon = new L.DivIcon({
        className: 'custom-icon',
        html: ReactDOMServer.renderToString(<LiaHotelSolid size={32} color="red" />), // Renderiza el icono como HTML
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto de anclaje
        popupAnchor: [0, -32], // Posición del popup
    });

    // Asegurarse de que las coordenadas iniciales son válidas
    const validLatitude = !isNaN(initialLatitude) && initialLatitude !== undefined;
    const validLongitude = !isNaN(initialLongitude) && initialLongitude !== undefined;

    // Si las coordenadas son válidas, usarlas como posición inicial
    useEffect(() => {
        if (validLatitude && validLongitude) {
            setSelectedPosition({ lat: initialLatitude, lng: initialLongitude });
        }
    }, [initialLatitude, initialLongitude, validLatitude, validLongitude]);

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
            center={validLatitude && validLongitude ? [initialLatitude, initialLongitude] : [0, 0]} // Fallback a [0,0] si las coordenadas no son válidas
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
                        Lat: {typeof selectedPosition.lat === 'number' ? selectedPosition.lat.toFixed(6) : '—'}, 
                        Lng: {typeof selectedPosition.lng === 'number' ? selectedPosition.lng.toFixed(6) : '—'}
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MapComponent;
