import React, { useState, useEffect } from 'react';
import { updateEmployeeDetails} from '@/app/lib/data'; // Asegúrate de importar la función
import { fetchFilteredUsers } from '@/app/lib/data'; // Asegúrate de importar la función
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EmployeeModal({
  employee,
  onClose,
}: {
  employee: any;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    current_hotel_id: '',
    hourly_wage: '',
    start_time: '',
    end_time: '',
    lunch_start_time: '',
    lunch_end_time: '',
    role: '',
    statusprofile: '',
    birthdate: '',
    address: '',
    social_number: '',
  });
  const [employees, setEmployees] = useState<any[]>([]);

  // Obtener todos los empleados al cargar el modal
  useEffect(() => {
    const loadEmployees = async () => {
      const employeesList = await fetchFilteredUsers('', 1);
      setEmployees(employeesList);
    };

    loadEmployees();
  }, []); // Se ejecuta solo una vez al cargar el componente

  // Establecer los valores iniciales en formData cuando employee cambie
  useEffect(() => {
    if (employee) {
      setFormData({
        current_hotel_id: employee.current_hotel_id || '',
        hourly_wage: employee.hourly_wage || '',
        start_time: employee.start_time || '',
        end_time: employee.end_time || '',
        lunch_start_time: employee.lunch_start_time || '',
        lunch_end_time: employee.lunch_end_time || '',
        role: employee.role || '',
        statusprofile: employee.statusprofile || '',
        birthdate: employee.birthdate || '',
        address: employee.address || '',
        social_number: employee.social_number || '',
      });
    }
  }, [employee]); // Solo se ejecuta cuando el empleado cambia

  // Manejar el cambio en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manejar el cambio en los campos del formulario para select
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manejar el envío del formulario para actualizar los detalles del empleado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmployeeDetails(employee.id_employee, {
        ...formData,
        hourly_wage: parseFloat(formData.hourly_wage),
        current_hotel_id: parseInt(formData.current_hotel_id, 10),
      });
      onClose(); // Cerrar el modal después de la actualización
    } catch (error) {
      console.error("Error updating employee details:", error);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto z-50">
      <h2 className="text-xl font-semibold mb-6 text-center">Editar {employee.name}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rol y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col w-full space-y-2">
            <label className="text-sm font-medium">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleSelectChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="">Seleccione un rol</option>
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
              {/* Agrega más opciones según sea necesario */}
            </select>
          </div>
          <div className="flex flex-col w-full space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <select
              name="statusprofile"
              value={formData.statusprofile}
              onChange={handleSelectChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="">Seleccione un estado</option>
              <option value="Habilitado">Habilitado</option>
              <option value="Deshabilitado">Deshabilitado</option>
              <option value="Eliminado">Eliminado</option>
              {/* Agrega más opciones según sea necesario */}
            </select>
          </div>
        </div>
  
        {/* Sueldo por hora */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Sueldo por hora</label>
          <input
            type="number"
            name="hourly_wage"
            value={formData.hourly_wage}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
  
        {/* Horario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Hora de inicio</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Hora de fin</label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
  
        {/* Almuerzo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Hora de inicio almuerzo</label>
            <input
              type="time"
              name="lunch_start_time"
              value={formData.lunch_start_time}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Hora de fin almuerzo</label>
            <input
              type="time"
              name="lunch_end_time"
              value={formData.lunch_end_time}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
  
        {/* Fecha de nacimiento (con DatePicker) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Fecha de nacimiento</label>
          <DatePicker
            selected={formData.birthdate ? new Date(formData.birthdate) : null}
            onChange={(date: Date | null) => {
              const event = {
                target: {
                  name: 'birthdate',
                  value: date ? date.toISOString().split('T')[0] : ''
                }
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              handleChange(event);
            }}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Propiedad</label>
            <select
              name="current_hotel_id"
              value={formData.current_hotel_id}
              onChange={handleSelectChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="">Seleccione un estado</option>
              <option value="1">Heron I </option>
              <option value="2">Heron II </option>
              {/* Agrega más opciones según sea necesario */}
            </select>
          </div>
        </div>
        {/* Dirección */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Dirección</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
  
        {/* Número de seguridad social */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Número de seguridad social</label>
          <input
            type="text"
            name="social_number"
            value={formData.social_number}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
  
        {/* Botones */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="border-red-600 bg-red-100 border text-red-600 rounded-md px-6 py-2 hover:bg-red-200 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="border-green-600 bg-green-100 border text-green-600 rounded-md px-6 py-2 hover:bg-green-200 transition"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  </div>
  )
}