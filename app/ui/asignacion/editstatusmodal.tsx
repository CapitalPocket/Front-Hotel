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
  'V/C': '#1B5E20',       // Verde bosque
  'O': '#FF6F00',         // Naranja intenso
  'V/D': '#B71C1C',       // Rojo sangre
  'OOO': '#424242',       // Gris carbón
  'CLEAN/IN': '#0D47A1',  // Azul fuerte
  'P/S': '#4A148C',       // Púrpura profundo
  'DEV': '#FDD835',       // Amarillo vibrante
  'RM': '#3E2723',        // Marrón muy oscuro
  'S/O': '#00695C',       // Verde azulado
  'E/CH': '#0288D1',      // Azul cielo fuerte
  'MT/IN': '#558B2F',     // Verde oliva
  'MT/OUT': '#AFB42B',    // Amarillo oliva
  'DEP': '#BF360C',       // Naranja quemado
  'CALL': '#263238',      // Azul grisáceo muy oscuro
  'REMO PROJECT': '#AD1457', // Rosa oscuro
  'F/S': '#1A237E',       // Azul marino fuerte
  'N/A': '#9E9E9E'        // Gris neutro
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
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-100"
          >
            {Object.keys(statusColors).map((key) => (
              <option
                key={key}
                value={key}
                style={{ backgroundColor: statusColors[key], color: '#fff' }}
              >
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-medium transition-all duration-200"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStatusModal;
