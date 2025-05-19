import React, { useState } from 'react';

interface Assignment {
  assignment_id: number;
  status: string;
}

interface EditStatusModalProps {
  assignment: Assignment;
  onClose: () => void;
  onUpdated?: () => void;
}

const statusColors: { [key: string]: string } = {
  'V/C': '#1B5E20',
  'O': '#FF6F00',
  'V/D': '#B71C1C',
  'OOO': '#424242',
  'CLEAN/IN': '#0D47A1',
  'P/S': '#4A148C',
  'DEV': '#FDD835',
  'RM': '#3E2723',
  'S/O': '#00695C',
  'E/CH': '#0288D1',
  'MT/IN': '#558B2F',
  'MT/OUT': '#AFB42B',
  'DEP': '#BF360C',
  'CALL': '#263238',
  'REMO PROJECT': '#AD1457',
  'F/S': '#1A237E',
  'N/A': '#9E9E9E'
};

const EditStatusModal: React.FC<EditStatusModalProps> = ({ assignment, onClose, onUpdated }) => {
  const [status, setStatus] = useState(assignment.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/updateRoomStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignment.assignment_id,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar el estado');
      }

      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">Editar Estado</h2>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-400">Nuevo estado:</label>
          <div className="bg-gray-700 border border-gray-600 rounded-md max-h-60 overflow-y-auto">
            {Object.keys(statusColors).map((key) => (
              <div
                key={key}
                onClick={() => setStatus(key)}
                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-600 ${
                  key === status ? 'bg-gray-600' : ''
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: statusColors[key] }}
                ></span>
                <span className="text-gray-100">{key}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
        <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={onClose}
             className="bg-gray-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
            disabled={loading}
          >
            Cancelar
          </button>
         
        </div>
      </div>
    </div>
  );
};

export default EditStatusModal;
