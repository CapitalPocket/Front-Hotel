import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Pencil, Repeat } from 'lucide-react';
import EditStatusModal from './editstatusmodal'; 
import RessignModal from './ressignmodal'; // Asegúrate de que la ruta sea correcta

interface Assignment {
  assignment_id: number;
  room_number: string;
  status: string;
  category: string;
  created_at: string;
  employee_name: string;
  id_employee: number;
  room_category: string;
  room_status: string;
  hotel_name: string;
}

const AssignmentsView = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState<boolean>(false);
  const [selectedHotel, setSelectedHotel] = useState<string>(''); // hotel seleccionado para filtro
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pockiaction.xyz';

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await axios.get(`${base}/api/hotel/getTodayAssignments`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
    }
  }, [base]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);


  // Obtener hoteles únicos para el filtro
  const hotels = Array.from(new Set(assignments.map(a => a.hotel_name)));

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleReassign = (assignment: Assignment) => {
    if (assignment) {
      setSelectedAssignment(assignment);  // Solo establecer si el assignment no es null
      setIsReassignModalOpen(true); // Abrir el modal de reasignación
    }
  };

  const closeModal = () => {
    setSelectedAssignment(null);
    setIsReassignModalOpen(false); // Cerrar el modal de reasignación
  };

  // Filtrar asignaciones de hoy y por hotel seleccionado
  const todayAssignments = assignments.filter(a => isToday(a.created_at));
  const filteredAssignments = selectedHotel ? todayAssignments.filter(a => a.hotel_name === selectedHotel) : todayAssignments;

  // Agrupar por empleado
  const groupedAssignments: Record<string, Assignment[]> = filteredAssignments.reduce((acc, assignment) => {
    if (!acc[assignment.employee_name]) {
      acc[assignment.employee_name] = [];
    }
    acc[assignment.employee_name].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">

      
          <div className="mb-6">
      <label htmlFor="hotelFilter" className="block mb-1 text-sm font-semibold text-gray-700">
        Filtrar por hotel
      </label>
      <div className="relative w-full md:w-64">
        <select
          id="hotelFilter"
          className="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
        >
          <option value="">Todos los hoteles</option>
          {hotels.map(hotel => (
            <option key={hotel} value={hotel}>{hotel}</option>
          ))}
        </select>
        {/* Ícono de flecha abajo */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>



      {Object.keys(groupedAssignments).length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No hay asignaciones para hoy...</p>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedAssignments).map(([employee, assignments]) => {
            const [first, ...rest] = assignments;
            return (
              <div
                key={first.assignment_id}
                className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{employee}</h2>
                  <p className="text-sm text-gray-500">{first.hotel_name}</p>
                </div>

                <div className="mb-3">
                  <h3 className="font-semibold text-gray-700">Primera habitación:</h3>
                  <div className="text-sm text-gray-800 space-y-1">
                    <p><strong>Habitación:</strong> {first.room_number}</p>
                    <p><strong>Estado:</strong> {first.status}</p>
                    <p><strong>Categoría:</strong> {first.category}</p>
                    <p><strong>Fecha:</strong> {new Date(first.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => handleEdit(first)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition"
                    >
                      <Pencil size={16} /> Editar
                    </button>
                    <button
                      onClick={() => handleReassign(first)}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm transition"
                    >
                      <Repeat size={16} /> Reasignar
                    </button>
                  </div>
                </div>

                {rest.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <h4 className="font-semibold text-gray-600 mb-2">Otras habitaciones:</h4>
                    {rest.map((assignment) => (
                      <div key={assignment.assignment_id} className="mb-2 text-sm text-gray-700 bg-gray-100 p-2 rounded-xl">
                        <p><strong>Habitación:</strong> {assignment.room_number}</p>
                        <p><strong>Estado:</strong> {assignment.status}</p>
                        <p><strong>Categoría:</strong> {assignment.category}</p>
                        <p><strong>Fecha:</strong> {new Date(assignment.created_at).toLocaleDateString()}</p>
                        <div className="mt-1 flex gap-2">
                          <button
                            onClick={() => handleEdit(assignment)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-xl text-xs transition"
                          >
                            <Pencil size={14} /> Editar
                          </button>
                          <button
                            onClick={() => handleReassign(assignment)}
                            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-xl text-xs transition"
                          >
                            <Repeat size={14} /> Reasignar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edición */}
      {selectedAssignment && !isReassignModalOpen && selectedAssignment.room_number && (
        <EditStatusModal
          assignment={selectedAssignment}
          onClose={closeModal}
          onUpdated={fetchAssignments}
        />
      )}

      {/* Modal de reasignación */}
      {selectedAssignment && isReassignModalOpen && selectedAssignment.room_number && (
        <RessignModal
          assignment={selectedAssignment}
          onClose={closeModal}
          onReassigned={fetchAssignments}
        />
      )}
    </div>
  );
};

export default AssignmentsView;
