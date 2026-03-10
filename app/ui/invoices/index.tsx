import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { DayPicker } from 'react-day-picker';
import { format, isBefore, isValid, parseISO, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppToastContainer, notifyError, notifySuccess } from '@/app/utils/toast';
import 'react-day-picker/dist/style.css';

interface EmployeeScheduleProps {
  park: string;
}

type SelectOption = {
  value: number | string;
  label: string;
  phone?: string;
};

type EmployeeRecord = {
  id_employee: number;
  name: string;
  role: string | null;
};

type HotelRecord = {
  id_hotel: number;
  name: string;
};

type ScheduleApiItem = {
  id_workdays?: number | string;
  employee_id?: number | string;
  employee_name?: string;
  work_date?: string | Date;
  start_time?: string;
  end_time?: string;
};

type ScheduleEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps: {
    employee_id: number;
    employee_name: string;
    work_date: string;
    start_time: string;
    end_time: string;
  };
};

const extractClockToken = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const match = value.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : null;
};

const extractDayToken = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];
    const asDate = new Date(trimmed);
    if (!Number.isNaN(asDate.getTime())) return asDate.toISOString().split('T')[0];
    return null;
  }
  const asDate = new Date(value as Date);
  if (Number.isNaN(asDate.getTime())) return null;
  return asDate.toISOString().split('T')[0];
};

const openTimePicker = (input: HTMLInputElement | null) => {
  if (!input) return;
  (input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
  input.focus();
};

const toDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

const EmployeeSchedule: React.FC<EmployeeScheduleProps> = ({ park: _park }) => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [employeesCatalog, setEmployeesCatalog] = useState<EmployeeRecord[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<SelectOption[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [selectedHotels, setSelectedHotels] = useState<SelectOption[]>([]);
  const [selectedRole, setSelectedRole] = useState<SelectOption | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState<boolean>(false);
  const today = useMemo(() => startOfToday(), []);
  const employeesEndpoint = '/api/hotel/getAllEmployees';
  const scheduleEndpoint = '/api/hotel/getEmployeeWorkSchedule';
  const hotelsEndpoint = '/api/hotel/getAllHotel';
  const updateScheduleEndpoint = '/api/hotel/updateEmployeeSchedule';
  const createWorkdaysEndpoint = '/api/hotel/postWorkDays';
  const rawApiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_REMINDERS_API_KEY || '';
  const apiKey = typeof rawApiKey === 'string' ? rawApiKey.replace(/[`'"\s]/g, '').trim() : '';
  const hotelHeaders = useMemo(
    () =>
      apiKey
        ? {
            'x-api-key': apiKey,
            Authorization: `Api-Key ${apiKey}`,
          }
        : undefined,
    [apiKey],
  );
  const roleOptions = useMemo(() => {
    const rolesMap = new Map<string, string>();
    for (const employee of employeesCatalog) {
      const role = typeof employee.role === 'string' ? employee.role.trim() : '';
      if (!role) continue;
      const roleKey = role.toLowerCase();
      if (!rolesMap.has(roleKey)) rolesMap.set(roleKey, role);
    }
    return Array.from(rolesMap.values())
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map((role) => ({ value: role, label: role }));
  }, [employeesCatalog]);
  const employeeOptions = useMemo(
    () =>
      [...employees]
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))
        .map((employee) => ({ value: employee.id_employee, label: employee.name })),
    [employees],
  );

  const fetchData = useCallback(async (role: string | null = null) => {
    setIsLoadingData(true);
    try {
      const employeeResponse = await axios.post(
        employeesEndpoint,
        role ? { role } : {},
        hotelHeaders ? { headers: hotelHeaders } : undefined

      );

      if (Array.isArray(employeeResponse.data)) {
        const employeeData: EmployeeRecord[] = employeeResponse.data.map((emp: Record<string, unknown>) => ({
          id_employee: Number(emp.id_employee),
          name: typeof emp.name === 'string' ? emp.name : `Empleado ${String(emp.id_employee ?? '')}`,
          role: typeof emp.role === 'string' ? emp.role : null,
        }));
        setEmployees(employeeData);
        try {
          const schedulesResponse = await axios.get(
            scheduleEndpoint,
            {
              ...(hotelHeaders ? { headers: hotelHeaders } : {}),
              params: { _ts: Date.now() },
            },
          );

          const schedules: ScheduleApiItem[] = Array.isArray(schedulesResponse.data) ? schedulesResponse.data : [];
          const allowedEmployeeIds = new Set(employeeData.map((emp) => Number(emp.id_employee)));
          const employeeNameById = new Map(employeeData.map((emp) => [Number(emp.id_employee), emp.name]));

          const allEvents = schedules
            .filter((schedule) => allowedEmployeeIds.has(Number(schedule.employee_id)))
            .map((schedule) => {
              const employeeId = Number(schedule.employee_id);
              const employeeName = employeeNameById.get(employeeId) || schedule.employee_name || 'Empleado';
              const rawStartTime = typeof schedule.start_time === 'string' ? schedule.start_time.trim() : '';
              const rawEndTime = typeof schedule.end_time === 'string' ? schedule.end_time.trim() : '';
              const workDateKey = extractDayToken(schedule.work_date);
              const startTimeToken = extractClockToken(rawStartTime);
              const endTimeToken = extractClockToken(rawEndTime);

              if (!workDateKey || !startTimeToken || !endTimeToken) {
                return null;
              }

              const workDate = new Date(workDateKey);
              if (Number.isNaN(workDate.getTime())) {
                return null;
              }

              const start = new Date(`${workDate.toISOString().split('T')[0]}T${startTimeToken}`);
              const end = new Date(`${workDate.toISOString().split('T')[0]}T${endTimeToken}`);
              if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                return null;
              }

              return {
                id: `${employeeId}-${schedule.id_workdays}`,
                title: `${employeeName} - ${rawStartTime || 'Sin hora inicio'} a ${rawEndTime || 'Sin hora fin'}`,
                start: start.toISOString(),
                end: end.toISOString(),
                color: '#20b2aa',
                extendedProps: {
                  employee_id: employeeId,
                  employee_name: employeeName,
                  work_date: workDateKey,
                  start_time: rawStartTime || 'Sin hora inicio',
                  end_time: rawEndTime || 'Sin hora fin',
                },
              } as ScheduleEvent;
            })
            .filter((event): event is ScheduleEvent => event !== null);

          setEvents(allEvents);
        } catch (error: any) {
          if (error?.response?.status === 404) {
            setEvents([]);
          } else {
            throw error;
          }
        }
      } else {
        setEmployees([]);
        setEvents([]);
        notifyError('La respuesta de empleados no fue válida.');
      }
    } catch (error) {
      setEvents([]);
      setEmployees([]);
      notifyError('No pudimos cargar los empleados y horarios. Intenta nuevamente.');
    } finally {
      setIsLoadingData(false);
    }
  }, [employeesEndpoint, hotelHeaders, scheduleEndpoint]);
  const [hotels, setHotels] = useState<HotelRecord[]>([]);
  const hotelOptions = useMemo(
    () =>
      [...hotels]
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))
        .map((hotel) => ({ value: hotel.id_hotel, label: hotel.name })),
    [hotels],
  );

  useEffect(() => {
    const fetchEmployeesCatalog = async () => {
      try {
        const response = await axios.post(
          employeesEndpoint,
          {},
          hotelHeaders ? { headers: hotelHeaders } : undefined,
        );
        if (!Array.isArray(response.data)) {
          return;
        }
        const employeesData: EmployeeRecord[] = response.data.map((emp: Record<string, unknown>) => ({
          id_employee: Number(emp.id_employee),
          name: typeof emp.name === 'string' ? emp.name : `Empleado ${String(emp.id_employee ?? '')}`,
          role: typeof emp.role === 'string' ? emp.role : null,
        }));
        setEmployeesCatalog(employeesData);
      } catch {
        setEmployeesCatalog([]);
      }
    };

    fetchEmployeesCatalog();
  }, [employeesEndpoint, hotelHeaders]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.post(
          hotelsEndpoint,
          {},
          hotelHeaders ? { headers: hotelHeaders } : undefined
        );
        if (Array.isArray(response.data)) {
          const hotelData: HotelRecord[] = response.data.map((hotel: Record<string, unknown>) => ({
            id_hotel: Number(hotel.id_hotel),
            name: typeof hotel.name === 'string' ? hotel.name : `Hotel ${String(hotel.id_hotel ?? '')}`,
          }));
          setHotels(hotelData);
        } else {
          setHotels([]);
          notifyError('La respuesta de hoteles no fue válida.');
        }
      } catch {
        setHotels([]);
        notifyError('No pudimos cargar los hoteles disponibles.');
      }
    };

    fetchHotels();
  }, [hotelHeaders, hotelsEndpoint]);

  const handleEmployeeSelect = (selectedOptions: readonly SelectOption[] | null) => {
    setSelectedEmployees(selectedOptions ? [...selectedOptions] : []);
  };

  const handleHotelSelect = (selectedOptions: readonly SelectOption[] | null) => {
    setSelectedHotels(selectedOptions ? [...selectedOptions] : []);
  };

  const handleRoleSelect = (selectedOption: SelectOption | null) => {
    setSelectedRole(selectedOption);
    setSelectedEmployees([]);
  };
 
  useEffect(() => {
    fetchData(selectedRole?.value ? String(selectedRole.value) : null);
  }, [fetchData, selectedRole]);

  const handleSaveSchedule = async () => {
    if (isSavingSchedule) return;
    try {
      const employeeIds = selectedEmployees.map((emp) => Number(emp.value));
      if (employeeIds.length === 0 || selectedDays.length === 0) {
        notifyError('Selecciona al menos un empleado y un día.');
        return;
      }
      if (selectedHotels.length === 0) {
        notifyError('Selecciona al menos una propiedad.');
        return;
      }
      if (startTime >= endTime) {
        notifyError('La hora de inicio debe ser menor que la hora de finalización.');
        return;
      }

      setIsSavingSchedule(true);

      for (const id_employee of employeeIds) {
        const updateData = {
          start_time: startTime,
          end_time: endTime,
        };

        await axios.put(
          `${updateScheduleEndpoint}/${id_employee}`,
          updateData,
          hotelHeaders ? { headers: hotelHeaders } : undefined
        );
      }

      const dataToSend = {
        employeeId: employeeIds,
        workDates: selectedDays,
        hotelIds: selectedHotels.map((hotel) => Number(hotel.value)),
      };

      const response = await axios.post(
        createWorkdaysEndpoint,
        dataToSend,
        hotelHeaders ? { headers: hotelHeaders } : undefined
      );

      if (response.status === 200) {
        const successMessage =
          typeof response.data?.message === 'string' && response.data.message.trim()
            ? response.data.message
            : 'Horarios guardados correctamente.';
        notifySuccess(successMessage);
        setSelectedEmployees([]);
        setSelectedDays([]);
        setSelectedHotels([]);
        setSelectedRole(null);
        setStartTime('09:00');
        setEndTime('17:00');
        await fetchData(null);
      } else {
        notifyError('Hubo un error al guardar los horarios.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage =
          typeof error.response?.data?.message === 'string' && error.response.data.message.trim()
            ? error.response.data.message
            : null;
        notifyError(backendMessage || 'Hubo un error al enviar los datos al servidor.');
      } else {
        notifyError('Hubo un error al enviar los datos al servidor.');
      }
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const selectedDates = useMemo(
    () =>
      selectedDays
        .map((day) => parseISO(day))
        .filter((day) => isValid(day) && !isBefore(day, today)),
    [selectedDays, today],
  );

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, ScheduleEvent[]>();
    for (const event of events) {
      const key =
        extractDayToken(event.extendedProps?.work_date) ||
        (typeof event.start === 'string' ? event.start.split('T')[0] : '');
      if (!key) continue;
      const current = grouped.get(key) || [];
      current.push(event);
      grouped.set(key, current);
    }
    return grouped;
  }, [events]);

  const assignmentPreview = useMemo(
    () =>
      selectedDays.map((day) => ({
        day,
        employees: selectedEmployees
          .map((employee) => employee.label)
          .filter((label) => typeof label === 'string' && label.trim()),
      })),
    [selectedDays, selectedEmployees],
  );

  const handleSelectedDates = (dates: Date[] | undefined) => {
    if (!dates || dates.length === 0) {
      setSelectedDays([]);
      return;
    }
    setSelectedDays(
      dates
        .filter((date) => !isBefore(date, today))
        .map((date) => toDateKey(date))
        .sort((a, b) => a.localeCompare(b, 'es')),
    );
  };

  return (
    <div className="min-h-full w-full space-y-6 px-0 py-4 md:py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Planificación operativa</p>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Gestión de horarios</h1>
          <p className="text-slate-500">Filtra por rol real del sistema, selecciona propiedades y publica turnos en el calendario.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{employees.length} empleados visibles</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{roleOptions.length} roles activos</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{selectedDays.length} días seleccionados</span>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Filtrar por rol</label>
            <Select
              instanceId="schedule-role-select"
              inputId="schedule-role-select"
              options={roleOptions}
              onChange={handleRoleSelect}
              value={selectedRole}
              isClearable
              placeholder={roleOptions.length > 0 ? 'Seleccionar rol...' : 'No hay roles disponibles'}
              className="w-full"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Seleccionar empleados</label>
            <Select
              instanceId="schedule-employees-select"
              inputId="schedule-employees-select"
              isMulti
              options={employeeOptions}
              onChange={handleEmployeeSelect}
              value={selectedEmployees}
              placeholder="Buscar empleados..."
              className="w-full"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Seleccionar propiedades</label>
            <Select
              instanceId="schedule-hotels-select"
              inputId="schedule-hotels-select"
              isMulti
              options={hotelOptions}
              onChange={handleHotelSelect}
              value={selectedHotels}
              placeholder="Seleccionar hoteles..."
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Hora de inicio</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              onClick={(event) => openTimePicker(event.currentTarget)}
              className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-700 focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Hora de finalización</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              onClick={(event) => openTimePicker(event.currentTarget)}
              className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-700 focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSaveSchedule}
          disabled={isSavingSchedule || isLoadingData}
          className="mt-5 w-full rounded-xl bg-slate-800 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSavingSchedule ? 'Guardando horarios...' : 'Guardar horarios'}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-800">Calendario de turnos</h2>
          <p className="text-sm text-slate-500">{events.length} eventos cargados</p>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="schedule-date-picker rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6">
            {isLoadingData ? (
              <div className="py-10 text-center text-sm text-slate-500">Cargando horarios...</div>
            ) : (
              <DayPicker
                locale={es}
                mode="multiple"
                numberOfMonths={1}
                selected={selectedDates}
                onSelect={handleSelectedDates}
                weekStartsOn={1}
                fromDate={today}
                disabled={{ before: today }}
                modifiers={{
                  hasEvents: (day) => eventsByDate.has(toDateKey(day)),
                }}
                classNames={{
                  months: 'rdp-months',
                  month: 'rdp-month',
                  nav: 'rdp-nav',
                  button_previous: 'rdp-nav_button rdp-nav_button-previous',
                  button_next: 'rdp-nav_button rdp-nav_button-next',
                  chevron: 'rdp-chevron',
                  month_caption: 'rdp-month_caption',
                  weekdays: 'rdp-weekdays',
                  weekday: 'rdp-weekday',
                  week: 'rdp-week',
                  day: 'rdp-day',
                  day_button: 'rdp-day_button',
                  selected: 'rdp-selected',
                  today: 'rdp-today',
                  disabled: 'rdp-disabled',
                }}
                footer={
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                    Solo se permiten fechas desde hoy en adelante.
                  </div>
                }
                className="w-full"
              />
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Resumen de selección</p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {selectedDays.length} días
              </span>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <p className="text-[11px] text-slate-500">Empleados</p>
                <p className="text-sm font-semibold text-slate-800">{selectedEmployees.length}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <p className="text-[11px] text-slate-500">Propiedades</p>
                <p className="text-sm font-semibold text-slate-800">{selectedHotels.length}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <p className="text-[11px] text-slate-500">Horario</p>
                <p className="text-sm font-semibold text-slate-800">{startTime} - {endTime}</p>
              </div>
            </div>
            {assignmentPreview.length === 0 || selectedEmployees.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Selecciona días y empleados para ver exactamente cómo quedará la asignación antes de guardar.
              </div>
            ) : (
              <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                {assignmentPreview.map((day) => (
                  <div key={day.day} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-800">
                      {format(parseISO(day.day), "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{startTime} - {endTime}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {day.employees.map((employeeName) => (
                        <span key={`${day.day}-${employeeName}`} className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-700">
                          {employeeName}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <AppToastContainer />
    </div>
  );
}

export default EmployeeSchedule;
