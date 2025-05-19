import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Repeat } from 'lucide-react';
import EditStatusModal from './editstatusmodal'; 
import RessignModal from './ressignmodal'; 

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

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getTodayAssignments');
      setAssignments(response.data);
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Compara la fecha UTC (fecha sin considerar zona horaria del navegador)
  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();

    return (
      date.getUTCFullYear() === now.getUTCFullYear() &&
      date.getUTCMonth() === now.getUTCMonth() &&
      date.getUTCDate() === now.getUTCDate()
    );
  };

  const handleEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleReassign = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsReassignModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAssignment(null);
    setIsReassignModalOpen(false);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      {assignments.filter((a) => isToday(a.created_at)).length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No hay asignaciones para hoy...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments
            .filter((assignment) => isToday(assignment.created_at))
            .map((assignment) => (
              <div
                key={assignment.assignment_id}
                className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{assignment.employee_name}</h2>
                  <p className="text-sm text-gray-500">{assignment.hotel_name}</p>
                </div>

                <div className="space-y-1 text-gray-700 text-sm">
                  <p><strong>Habitación:</strong> {assignment.room_number}</p>
                  <p><strong>Estado:</strong> {assignment.status}</p>
                  <p><strong>Categoría:</strong> {assignment.category}</p>
                  <p><strong>Fecha:</strong> {new Date(assignment.created_at).toLocaleDateString()}</p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleEdit(assignment)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition"
                  >
                    <Pencil size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleReassign(assignment)}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm transition"
                  >
                    <Repeat size={16} /> Reasignar
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {selectedAssignment && !isReassignModalOpen && selectedAssignment.room_number && (
        <EditStatusModal
          assignment={selectedAssignment}
          onClose={closeModal}
          onUpdated={fetchAssignments}
        />
      )}

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
