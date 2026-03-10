import React, { useMemo, useState } from "react";
import axios from "axios";
import { notifyError, notifySuccess } from "@/app/utils/toast";

interface Assignment {
  assignment_id: number;
  status: string;
}

interface EditStatusModalProps {
  assignment: Assignment;
  onClose: () => void;
  onUpdated?: () => Promise<void>;
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

const sanitizeEnv = (rawValue: string | undefined) =>
  typeof rawValue === "string" ? rawValue.replace(/[`'"\s]/g, "").trim() : "";

const EditStatusModal: React.FC<EditStatusModalProps> = ({ assignment, onClose, onUpdated }) => {
  const [status, setStatus] = useState(assignment.status);
  const [loading, setLoading] = useState(false);
  const endpoint = "/api/hotel/updateRoomStatus";
  const headers = useMemo(() => {
    const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_REMINDERS_API_KEY || "";
    const apiKey = sanitizeEnv(rawApiKey);
    return apiKey
      ? {
          "x-api-key": apiKey,
          Authorization: `Api-Key ${apiKey}`,
        }
      : undefined;
  }, []);

  const payload = {
    assignment_id: assignment.assignment_id,
    status,
  };

  const updateStatus = async () => {
    try {
      await axios.put(endpoint, payload, headers ? { headers } : undefined);
      return;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        await axios.post(endpoint, payload, headers ? { headers } : undefined);
        return;
      }
      throw error;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateStatus();
      if (onUpdated) {
        await onUpdated();
      }
      notifySuccess("Estado de habitación actualizado correctamente.");
      onClose();
    } catch {
      notifyError("No se pudo actualizar el estado de la habitación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-800">Editar estado de habitación</h2>
        <p className="mt-1 text-sm text-slate-500">
          Asignación #{assignment.assignment_id}
        </p>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Nuevo estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-500"
          >
            {Object.keys(statusColors).map((key) => (
              <option key={key} value={key} style={{ backgroundColor: statusColors[key], color: "#fff" }}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`h-10 rounded-xl px-4 text-sm font-semibold text-white transition ${
              loading ? "cursor-not-allowed bg-slate-300" : "bg-slate-900 hover:bg-slate-700"
            }`}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStatusModal;
