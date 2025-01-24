import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Calendar,
  momentLocalizer,
} from 'react-big-calendar';
import moment from 'moment';
import { stringOrDate } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const DragAndDropCalendar = withDragAndDrop(Calendar);

const localizer = momentLocalizer(moment);

interface EmployeeScheduleProps {
  park: string;
}

const EmployeeSchedule: React.FC<EmployeeScheduleProps> = ({ park }) => {
  interface Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [markedDays, setMarkedDays] = useState<string[]>([]); // Días "tachados"
  const [employees, setEmployees] = useState<string[]>([]); // Lista de empleados
  const [selectedEmployee, setSelectedEmployee] = useState<string>(''); // Empleado seleccionado

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const parkId = park === 'Parque Norte' ? 1 : 2;
        const response = await axios.post('/api/employees/schedules', {
          idpark: parkId,
        });

        interface Schedule {
          id: number;
          employeeName: string;
          startTime: string;
          endTime: string;
        }

        setEvents(
          (response?.data as Schedule[])?.map((schedule) => ({
            id: schedule.id,
            title: schedule.employeeName,
            start: new Date(schedule.startTime),
            end: new Date(schedule.endTime),
          })) || []
        );

        // Suponiendo que hay un endpoint para obtener empleados
        const employeeResponse = await axios.get('/api/employees');
        setEmployees(employeeResponse.data);
      } catch (error) {
        console.error('Error fetching schedules or employees:', error);
      }
    };

    fetchSchedules();
  }, [park]);

  const handleDayClick = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setMarkedDays((prevDays) =>
      prevDays.includes(formattedDate)
        ? prevDays.filter((day) => day !== formattedDate)
        : [...prevDays, formattedDate]
    );
  };

  const handleSelectEmployee = (employee: string) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold">Gestión de Horarios de Empleados</h2>
      <div className="mb-4">
        <label className="mr-2">Seleccionar Empleado:</label>
        <select
          value={selectedEmployee}
          onChange={(e) => handleSelectEmployee(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">-- Seleccionar --</option>
          {employees.map((employee, index) => (
            <option key={index} value={employee}>
              {employee}
            </option>
          ))}
        </select>
      </div>
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event) => (event as Event).start}
        endAccessor={(event) => (event as Event).end}
        style={{ height: '80vh' }}
        selectable
        onSelectSlot={({ start }) => handleDayClick(start as Date)}
        dayPropGetter={(date) => {
          const formattedDate = date.toISOString().split('T')[0];
          return markedDays.includes(formattedDate)
            ? { style: { backgroundColor: '#ffcccc', textDecoration: 'line-through' } }
            : {};
        }}
        messages={{
          today: 'Hoy',
          previous: 'Anterior',
          next: 'Siguiente',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          agenda: 'Agenda',
          noEventsInRange: 'No hay eventos en este rango.',
        }}
      />
    </div>
  );
};

export default EmployeeSchedule;
