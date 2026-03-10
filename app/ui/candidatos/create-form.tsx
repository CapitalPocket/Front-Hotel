'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import { useSession } from '@/app/context';
import { AppToastContainer, notifyError, notifySuccess } from '@/app/utils/toast';

type EmployeeFormProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
};

type EmployeeFormData = {
  current_hotel_id: string;
  name: string;
  phone_number: string;
  hourly_wage: string;
  start_time: string;
  end_time: string;
  lunch_start_time: string;
  lunch_end_time: string;
  social_number: string;
  role: string;
  statusprofile: string;
  birthdate: string;
  address: string;
  password: string;
};

const initialState: EmployeeFormData = {
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
  statusprofile: 'Habilitado',
  birthdate: '',
  address: '',
  password: '',
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

export default function EmployeeForm({ isOpen, onClose, onSuccess }: EmployeeFormProps) {
  const session = useSession();
  const [formData, setFormData] = useState<EmployeeFormData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isModal = typeof isOpen === 'boolean';
  const shouldRender = !isModal || isOpen;

  const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || '';
  const apiKey = useMemo(
    () => (typeof rawApiKey === 'string' ? rawApiKey.replace(/[`'"\s]/g, '').trim() : ''),
    [rawApiKey],
  );

  const requesterPhone = String(session?.user?.email ?? '').trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!requesterPhone) errors.push('No se encontró tu teléfono de sesión para autorizar la creación.');
    if (!formData.name.trim()) errors.push('El nombre completo es obligatorio.');
    if (!formData.phone_number.trim()) errors.push('El número de teléfono es obligatorio.');
    if (!formData.hourly_wage.trim()) errors.push('El salario por hora es obligatorio.');
    if (!formData.start_time.trim() || !formData.end_time.trim()) errors.push('Debes definir horario de entrada y salida.');
    if (!formData.role.trim()) errors.push('Debes seleccionar un rol válido.');
    if (!formData.birthdate.trim()) errors.push('La fecha de nacimiento es obligatoria.');
    if (!formData.address.trim()) errors.push('La dirección es obligatoria.');
    if (!formData.social_number.trim()) errors.push('El número social es obligatorio.');
    if (!formData.current_hotel_id.trim()) errors.push('Debes seleccionar una propiedad.');

    const phoneDigits = formData.phone_number.replace(/\D/g, '');
    if (phoneDigits.length < 10) errors.push('El teléfono debe tener al menos 10 dígitos.');

    const wage = Number(formData.hourly_wage);
    if (!Number.isFinite(wage) || wage <= 0) errors.push('El salario por hora debe ser mayor que cero.');

    const startMinutes = parseTimeToMinutes(formData.start_time);
    const endMinutes = parseTimeToMinutes(formData.end_time);
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      errors.push('La hora de finalización debe ser mayor que la hora de inicio.');
    }

    const lunchStart = parseTimeToMinutes(formData.lunch_start_time);
    const lunchEnd = parseTimeToMinutes(formData.lunch_end_time);
    const hasAnyLunch = !!formData.lunch_start_time || !!formData.lunch_end_time;
    if (hasAnyLunch) {
      if (lunchStart === null || lunchEnd === null || lunchEnd <= lunchStart) {
        errors.push('El horario de almuerzo debe tener inicio y fin válidos.');
      } else if (startMinutes !== null && endMinutes !== null) {
        if (lunchStart < startMinutes || lunchEnd > endMinutes) {
          errors.push('El almuerzo debe estar dentro del horario laboral.');
        }
      }
    }

    return errors;
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      notifyError(errors[0]);
      return;
    }

    const payload = {
      requester_phone_number: requesterPhone,
      current_hotel_id: Number(formData.current_hotel_id),
      name: formData.name.trim(),
      phone_number: formData.phone_number.replace(/\D/g, ''),
      hourly_wage: Number(formData.hourly_wage),
      start_time: formData.start_time,
      end_time: formData.end_time,
      lunch_start_time: formData.lunch_start_time || null,
      lunch_end_time: formData.lunch_end_time || null,
      role: formData.role,
      statusprofile: formData.statusprofile,
      birthdate: formData.birthdate,
      address: formData.address.trim(),
      social_number: formData.social_number.trim(),
      password: formData.password.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/hotel/createEmployee', payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
        },
      });

      notifySuccess(response?.data?.message || 'Empleado creado con éxito.');
      resetForm();
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'No se pudo crear el empleado.';
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={isModal ? 'fixed inset-0 z-50 bg-slate-900/55 p-4 md:p-8' : 'mx-auto w-full max-w-5xl py-6'}>
      <AppToastContainer />
      <div className={`${isModal ? 'mx-auto max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl' : 'rounded-3xl border border-slate-200 bg-white shadow-sm'}`}>
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Alta de personal</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">Crear nuevo empleado</h2>
              <p className="mt-2 text-sm text-slate-500">Completa la información principal y el horario laboral.</p>
            </div>
            {isModal ? (
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cerrar
              </button>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">Nombre completo</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Ej: María González" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="phone_number" className="mb-2 block text-sm font-semibold text-slate-700">Teléfono</label>
              <input id="phone_number" name="phone_number" type="text" value={formData.phone_number} onChange={handleChange} placeholder="Ej: 573001112233" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="social_number" className="mb-2 block text-sm font-semibold text-slate-700">Número social</label>
              <input id="social_number" name="social_number" type="text" value={formData.social_number} onChange={handleChange} placeholder="Documento o seguro social" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="hourly_wage" className="mb-2 block text-sm font-semibold text-slate-700">Salario por hora</label>
              <input id="hourly_wage" name="hourly_wage" type="number" min="0" step="0.01" value={formData.hourly_wage} onChange={handleChange} placeholder="Ej: 15.50" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="birthdate" className="mb-2 block text-sm font-semibold text-slate-700">Fecha de nacimiento</label>
              <input id="birthdate" name="birthdate" type="date" value={formData.birthdate} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-semibold text-slate-700">Dirección</label>
              <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} placeholder="Ej: Calle 10 # 20-30" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
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
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Contraseña inicial</label>
              <input id="password" name="password" type="text" value={formData.password} onChange={handleChange} placeholder="Opcional" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
