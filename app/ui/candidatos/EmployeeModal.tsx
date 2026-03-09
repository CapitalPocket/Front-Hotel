'use client';

import React, { useEffect, useState } from 'react';
import { updateEmployeeDetails } from '@/app/lib/data';
import { AppToastContainer, notifyError, notifySuccess } from '@/app/utils/toast';

type EmployeeModalProps = {
  employee: any;
  onClose: () => void;
};

type EmployeeEditData = {
  current_hotel_id: string;
  hourly_wage: string;
  start_time: string;
  end_time: string;
  lunch_start_time: string;
  lunch_end_time: string;
  role: string;
  statusprofile: string;
  birthdate: string;
  address: string;
  social_number: string;
};

const roleOptions = ['Housekeeper', 'HK Supervisor', 'Administrador'];
const statusOptions = ['Habilitado', 'Deshabilitado', 'Eliminado'];
const hotelOptions = [
  { value: '1', label: 'Heron I' },
  { value: '2', label: 'Heron II' },
];

const parseTimeToMinutes = (timeValue: string): number | null => {
  if (!timeValue) return null;
  const match = timeValue.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const normalizeDate = (value: unknown): string => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export default function EmployeeModal({ employee, onClose }: EmployeeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EmployeeEditData>({
    current_hotel_id: '',
    hourly_wage: '',
    start_time: '',
    end_time: '',
    lunch_start_time: '',
    lunch_end_time: '',
    role: '',
    statusprofile: 'Habilitado',
    birthdate: '',
    address: '',
    social_number: '',
  });

  useEffect(() => {
    if (!employee) return;
    setFormData({
      current_hotel_id: String(employee.current_hotel_id ?? ''),
      hourly_wage: String(employee.hourly_wage ?? ''),
      start_time: String(employee.start_time ?? ''),
      end_time: String(employee.end_time ?? ''),
      lunch_start_time: String(employee.lunch_start_time ?? ''),
      lunch_end_time: String(employee.lunch_end_time ?? ''),
      role: String(employee.role ?? ''),
      statusprofile: String(employee.statusprofile ?? 'Habilitado'),
      birthdate: normalizeDate(employee.birthdate),
      address: String(employee.address ?? ''),
      social_number: String(employee.social_number ?? ''),
    });
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.current_hotel_id.trim()) errors.push('Debes seleccionar una propiedad.');
    if (!formData.role.trim()) errors.push('Debes seleccionar un rol.');
    if (!formData.statusprofile.trim()) errors.push('Debes seleccionar un estado.');
    if (!formData.hourly_wage.trim()) errors.push('El salario por hora es obligatorio.');
    if (!formData.start_time.trim() || !formData.end_time.trim()) errors.push('Debes definir horario de entrada y salida.');
    if (!formData.birthdate.trim()) errors.push('La fecha de nacimiento es obligatoria.');
    if (!formData.address.trim()) errors.push('La dirección es obligatoria.');
    if (!formData.social_number.trim()) errors.push('El número social es obligatorio.');

    const wage = Number(formData.hourly_wage);
    if (!Number.isFinite(wage) || wage <= 0) errors.push('El salario por hora debe ser mayor a cero.');

    const startMinutes = parseTimeToMinutes(formData.start_time);
    const endMinutes = parseTimeToMinutes(formData.end_time);
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      errors.push('La hora de salida debe ser mayor que la hora de entrada.');
    }

    const lunchStart = parseTimeToMinutes(formData.lunch_start_time);
    const lunchEnd = parseTimeToMinutes(formData.lunch_end_time);
    const hasAnyLunch = !!formData.lunch_start_time || !!formData.lunch_end_time;
    if (hasAnyLunch) {
      if (lunchStart === null || lunchEnd === null || lunchEnd <= lunchStart) {
        errors.push('El rango de almuerzo no es válido.');
      } else if (startMinutes !== null && endMinutes !== null) {
        if (lunchStart < startMinutes || lunchEnd > endMinutes) {
          errors.push('El almuerzo debe estar dentro del horario laboral.');
        }
      }
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      notifyError(errors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        current_hotel_id: Number(formData.current_hotel_id),
        hourly_wage: Number(formData.hourly_wage),
        start_time: formData.start_time,
        end_time: formData.end_time,
        lunch_start_time: formData.lunch_start_time,
        lunch_end_time: formData.lunch_end_time,
        role: formData.role,
        statusprofile: formData.statusprofile,
        birthdate: formData.birthdate,
        address: formData.address.trim(),
        social_number: formData.social_number.trim(),
      };
      await updateEmployeeDetails(String(employee.id_employee), payload);
      notifySuccess('Empleado actualizado correctamente.');
      onClose();
    } catch (error: any) {
      const message = error?.message || 'No se pudo actualizar el empleado.';
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/55 p-4 md:p-8" onClick={onClose}>
      <AppToastContainer />
      <div className="mx-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Edición de personal</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">Editar {employee?.name || 'empleado'}</h2>
              <p className="mt-2 text-sm text-slate-500">Actualiza datos de perfil, horario, rol y estado.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cerrar
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="role" className="mb-2 block text-sm font-semibold text-slate-700">Rol</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none">
                <option value="">Seleccionar rol</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="statusprofile" className="mb-2 block text-sm font-semibold text-slate-700">Estado</label>
              <select id="statusprofile" name="statusprofile" value={formData.statusprofile} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none">
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="current_hotel_id" className="mb-2 block text-sm font-semibold text-slate-700">Propiedad</label>
              <select id="current_hotel_id" name="current_hotel_id" value={formData.current_hotel_id} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none">
                <option value="">Seleccionar propiedad</option>
                {hotelOptions.map((hotel) => (
                  <option key={hotel.value} value={hotel.value}>{hotel.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="hourly_wage" className="mb-2 block text-sm font-semibold text-slate-700">Salario por hora</label>
              <input id="hourly_wage" name="hourly_wage" type="number" min="0" step="0.01" value={formData.hourly_wage} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="start_time" className="mb-2 block text-sm font-semibold text-slate-700">Hora de entrada</label>
              <input id="start_time" name="start_time" type="time" value={formData.start_time} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="end_time" className="mb-2 block text-sm font-semibold text-slate-700">Hora de salida</label>
              <input id="end_time" name="end_time" type="time" value={formData.end_time} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="lunch_start_time" className="mb-2 block text-sm font-semibold text-slate-700">Inicio almuerzo</label>
              <input id="lunch_start_time" name="lunch_start_time" type="time" value={formData.lunch_start_time} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="lunch_end_time" className="mb-2 block text-sm font-semibold text-slate-700">Fin almuerzo</label>
              <input id="lunch_end_time" name="lunch_end_time" type="time" value={formData.lunch_end_time} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="birthdate" className="mb-2 block text-sm font-semibold text-slate-700">Fecha de nacimiento</label>
              <input id="birthdate" name="birthdate" type="date" value={formData.birthdate} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="social_number" className="mb-2 block text-sm font-semibold text-slate-700">Número social</label>
              <input id="social_number" name="social_number" type="text" value={formData.social_number} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="mb-2 block text-sm font-semibold text-slate-700">Dirección</label>
              <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
