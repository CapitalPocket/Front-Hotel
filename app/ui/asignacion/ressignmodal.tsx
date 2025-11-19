import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Assignment {
  assignment_id: number;
  room_number: string;
  category: string;
  // Otras propiedades de la asignación
}

interface ReassignModalProps {
  assignment: Assignment;
  onClose: () => void;
  onReassigned: () => Promise<void>;
}

const RessignModal: React.FC<ReassignModalProps> = ({ assignment, onClose, onReassigned }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    axios.post(`/api/hotel/getAllEmployees`, { role: 'Housekeeper' })
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : [];
        setEmployees(data);
      })
      .catch(error => {
        console.error('Error fetching employees:', error);
      });
  }, []);

  const handleReassignEmployee = async () => {
    if (selectedEmployeeId === null) {
      alert('Por favor selecciona un empleado');
      return;
    }

    // Llamada a la API para actualizar la asignación
    try {
      await axios.post(`/api/hotel/updateEmployeeAssignment`, {
        assignment_id: assignment.assignment_id,
        new_employee_id: selectedEmployeeId
      });
      console.log('Empleado reasignado con éxito');
      await onReassigned(); // Llamar la función para actualizar los datos
      onClose(); // Cerrar el modal después de reasignar
    } catch (error) {
      console.error('Error reasignando el empleado:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg p-8 w-96">
        <h2 className="text-2xl font-semibold mb-6 text-gray-100">Reasignar habitación {assignment.room_number}{assignment.category}</h2>
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-2">Selecciona un empleado:</label>
          <select
            onChange={e => setSelectedEmployeeId(Number(e.target.value))}
            value={selectedEmployeeId ?? ''}
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">--Seleccione--</option>
            {employees.map((employee) => (
              <option key={employee.id_employee} value={employee.id_employee}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={handleReassignEmployee}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            Reasignar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RessignModal;
