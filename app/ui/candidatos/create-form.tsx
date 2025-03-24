'use client';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/app/ui/button'; // Ajusta esta importación según tu estructura

export default function EmployeeForm() {
  const initialState = {
    current_hotel_id: '',
    name: '',
    phone_number: '',
    hourly_wage: '',
    start_time: '',
    end_time: '',
    lunch_start_time: '',
    lunch_end_time: '',
    social_number: '',
    role: '',
    statusprofile: 'Habilitado', // Por defecto en "Habilitado"
    birthdate: '', // Añadir propiedad birthdate
    address: '', // Añadir propiedad address
  };

  const [formData, setFormData] = useState(initialState);

  // Manejo de cambio en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Función para manejar la creación del empleado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/hotel/createEmployee`, { // Ajusta la URL de la API según corresponda
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Empleado creado con éxito!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
        });
        setFormData(initialState); // Resetear formulario
      } else {
        toast.error(data.message || 'Error al crear empleado', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      toast.error('Error de servidor', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };
  

  return (
    <div className="md:w-[80%] w-[100%] mx-auto mt-20">
      <ToastContainer />
      
      <h1 className="text-2xl font-semibold text-center mb-6">Registro de Empleado</h1>

      <form onSubmit={handleSubmit}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6 shadow-md">
          
          <div className="mb-4 flex space-x-4">
            {/* Nombre */}
            <div className="w-1/2">
              <label htmlFor="name" className="mb-2 block text-sm font-medium">Nombre completo</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre apellido"
                className="block w-full rounded-md border border-gray-200 py-2 text-sm placeholder:text-gray-500"
              />
            </div>

            {/* Teléfono */}
            <div className="w-1/2">
              <label htmlFor="phone_number" className="mb-2 block text-sm font-medium">Número de teléfono</label>
              <input
                id="phone_number"
                name="phone_number"
                type="text"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Número teléfono"
                className="block w-full rounded-md border border-gray-200 py-2 text-sm placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Salario y Número social */}
          <div className="mb-4 flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="hourly_wage" className="mb-2 block text-sm font-medium">Salario por hora</label>
              <input
                id="hourly_wage"
                name="hourly_wage"
                type="number"
                step="0.01"
                value={formData.hourly_wage}
                onChange={handleChange}
                placeholder="Salario por hora"
                className="block w-full rounded-md border border-gray-200 py-2 text-sm placeholder:text-gray-500"
              />
            </div>

            <div className="w-1/2">
              <label htmlFor="social_number" className="mb-2 block text-sm font-medium">Número social</label>
              <input
                id="social_number"
                name="social_number"
                type="text"
                value={formData.social_number}
                onChange={handleChange}
                placeholder="Número social"
                className="block w-full rounded-md border border-gray-200 py-2 text-sm placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Fecha de nacimiento y Dirección */}
          <div className="mb-4 flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="birthdate" className="mb-2 block text-sm font-medium">Fecha de nacimiento</label>
              <input
                id="birthdate"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-200 py-2 text-sm"
              />
            </div>

            <div className="w-1/2">
              <label htmlFor="address" className="mb-2 block text-sm font-medium">Dirección</label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Dirección completa"
                className="block w-full rounded-md border border-gray-200 py-2 text-sm placeholder:text-gray-500"
              />
            </div>
          </div>
 {/* Horarios de trabajo */}
 <div className="mb-6 flex space-x-4">
            <div className="flex flex-col w-full">
              <label htmlFor="start_time" className="mb-2 block text-sm font-medium">Hora de inicio</label>
              <input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                className="border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
              />
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="end_time" className="mb-2 block text-sm font-medium">Hora de finalización</label>
              <input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                className="border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
              />
            </div>
          </div>

          {/* Horarios de comida */}
          <div className="mb-6 flex space-x-4">
            <div className="flex flex-col w-full">
              <label htmlFor="lunch_start_time" className="mb-2 block text-sm font-medium">Inicio de comida</label>
              <input
                id="lunch_start_time"
                name="lunch_start_time"
                type="time"
                value={formData.lunch_start_time}
                onChange={handleChange}
                className="border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
              />
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="lunch_end_time" className="mb-2 block text-sm font-medium">Fin de comida</label>
              <input
                id="lunch_end_time"
                name="lunch_end_time"
                type="time"
                value={formData.lunch_end_time}
                onChange={handleChange}
                className="border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
              />
            </div>
          </div>
          {/* Rol y Estado del perfil */}
          <div className="mb-4 flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="role" className="mb-2 block text-sm font-medium">Rol del empleado</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-200 py-2 text-sm"
              >
                <option value="" disabled>Seleccione un rol</option>
              
                <option value="Housekeeper">Housekeeper</option>
                <option value="Houseman">Houseman</option>
                <option value="Maintenance Tech">Maintenance Tech</option>
                <option value="Painter">Painter</option>
                <option value="Remodeling Official">Remodeling Official</option>
                <option value="HK Supervisor">HK Supervisor</option>
                <option value="MT Supervisor">MT Supervisor</option>
                <option value="Remo Supervisor">Remo Supervisor</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Building Manager">Building Manager</option>
                <option value="Room control">Room control</option>
                <option value="Front desk">Front desk</option>
                <option value="Lost & Found/Inventory">Lost & Found/Inventory</option>
                <option value="Assistant Manager">Assistant Manager</option>
                <option value="Operations Manager">Operations Manager</option>
                <option value="General Manager">General Manager</option>
                <option value="Resort Manager">Resort Manager</option>
              </select>
            </div>

            <div className="w-1/2">
              <label htmlFor="statusprofile" className="mb-2 block text-sm font-medium">Estado del perfil</label>
              <select
                id="statusprofile"
                name="statusprofile"
                value={formData.statusprofile}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-200 py-2 text-sm"
              >
                <option value="Habilitado">Habilitado</option>
                <option value="Deshabilitado">Deshabilitado</option>
                <option value="Eliminado">Eliminado</option>
              </select>
            </div>
          </div>
          <div className="w-1/2">
            <label htmlFor="current_hotel_id" className="mb-2 block text-sm font-medium">Propiedad</label>
            <select
              id="current_hotel_id"
              name="current_hotel_id"
              value={formData.current_hotel_id}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-200 py-2 text-sm"
            >
              <option value="" disabled>Seleccionar Hotel</option>
              <option value="1">Heron I</option>
              <option value="2">Heron II</option>
            </select>
          </div>


          {/* Botones */}
          <div className="mt-6 flex justify-end gap-4">
            <Button type="reset">Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
