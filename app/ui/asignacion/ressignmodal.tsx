import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { notifyError, notifySuccess } from "@/app/utils/toast";

interface Assignment {
  assignment_id: number;
  room_number: string;
  category: string;
}

interface ReassignModalProps {
  assignment: Assignment;
  onClose: () => void;
  onReassigned: () => Promise<void>;
}

const sanitizeEnv = (rawValue: string | undefined) =>
  typeof rawValue === "string" ? rawValue.replace(/[`'"\s]/g, "").trim() : "";

const RessignModal: React.FC<ReassignModalProps> = ({ assignment, onClose, onReassigned }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const employeesEndpoint = "/api/hotel/getAllEmployees";
  const reassignmentEndpoint = "/api/hotel/updateEmployeeAssignment";
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

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const response = await axios.post(
          employeesEndpoint,
          { role: "Housekeeper" },
          headers ? { headers } : undefined,
        );
        const data = Array.isArray(response.data) ? response.data : [];
        setEmployees(data);
      } catch {
        setEmployees([]);
        notifyError("No pudimos cargar la lista de housekeepers.");
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [employeesEndpoint, headers]);

  const handleReassignEmployee = async () => {
    if (selectedEmployeeId === null) {
      notifyError("Selecciona un empleado para reasignar.");
      return;
    }

    const payload = {
      assignment_id: assignment.assignment_id,
      new_employee_id: selectedEmployeeId,
    };

    setIsSubmitting(true);
    try {
      try {
        await axios.put(reassignmentEndpoint, payload, headers ? { headers } : undefined);
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.response?.status === 405) {
          await axios.post(reassignmentEndpoint, payload, headers ? { headers } : undefined);
        } else {
          throw error;
        }
      }
      await onReassigned();
      notifySuccess("Habitación reasignada correctamente.");
      onClose();
    } catch {
      notifyError("No se pudo reasignar la habitación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-800">
          Reasignar habitación {assignment.room_number}
          {assignment.category}
        </h2>
        <p className="mt-1 text-sm text-slate-500">Selecciona el nuevo housekeeper.</p>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Empleado</label>
          <select
            onChange={(event) => setSelectedEmployeeId(Number(event.target.value))}
            value={selectedEmployeeId ?? ""}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-500"
            disabled={isLoadingEmployees || isSubmitting}
          >
            <option value="">--Seleccione--</option>
            {employees.map((employee) => (
              <option key={employee.id_employee} value={employee.id_employee}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleReassignEmployee}
            disabled={isSubmitting || isLoadingEmployees}
            className={`h-10 rounded-xl px-4 text-sm font-semibold text-white transition ${
              isSubmitting || isLoadingEmployees
                ? "cursor-not-allowed bg-slate-300"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {isSubmitting ? "Reasignando..." : "Reasignar"}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RessignModal;
