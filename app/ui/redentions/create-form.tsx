'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation'; // Para obtener el ID de la URL
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ButtonMap } from '@/app/ui/button';

export default function EditHotelPage() {
  const { id } = useParams(); // Obtiene el ID del hotel desde la URL
  const router = useRouter();
  const [hotel, setHotel] = useState({ name: '', latitude: '', longitude: '' });

  useEffect(() => {
    if (id) {
      fetchHotelData();
    }
  }, [id]);

  const fetchHotelData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotels/${id}`);
      const data = await response.json();
      if (response.ok) {
        setHotel(data);
      } else {
        toast.error('Error al obtener los datos del hotel');
      }
    } catch (error) {
      toast.error('Error de servidor');
    }
  };

  interface Hotel {
    name: string;
    latitude: string;
    longitude: string;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHotel((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotel),
      });
      if (response.ok) {
        toast.success('Hotel actualizado con éxito');
        router.push('/'); // Redirige a la lista de hoteles después de editar
      } else {
        toast.error('Error al actualizar hotel');
      }
    } catch (error) {
      toast.error('Error de servidor');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <ToastContainer />
      <h1 className="text-2xl font-semibold text-center mb-6">Editar Hotel</h1>
      <label className="block mb-2">Nombre</label>
      <input type="text" name="name" value={hotel.name} onChange={handleChange} className="block w-full p-2 border" />
      <label className="block mb-2 mt-4">Longitud</label>
      <input type="text" name="longitude" value={hotel.longitude} onChange={handleChange} className="block w-full p-2 border" />
      <label className="block mb-2 mt-4">Latitud</label>
      <input type="text" name="latitude" value={hotel.latitude} onChange={handleChange} className="block w-full p-2 border" />
      <div className="mt-4 flex gap-4">
        <ButtonMap onClick={() => router.push('/')}>Cancelar</ButtonMap>
        <ButtonMap onClick={handleUpdate}>Guardar</ButtonMap>
      </div>
    </div>
  );
}
