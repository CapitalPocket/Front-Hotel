import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import Select from 'react-select';

interface EmployeeScheduleProps {
  park: string;
}

const EmployeeSchedule: React.FC<EmployeeScheduleProps> = ({ park }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [employees, setEmployees] = useState<{ id_employee: number; name: string }[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [selectedHotels, setSelectedHotels] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pockiaction.xyz';
  const base = typeof rawBase === 'string' ? rawBase.replace(/[`'"\s]/g, '').trim() : rawBase;

  const roles = [
 
      { value: "Housekeeper", label: "Housekeeper" },
      { value: "Houseman", label: "Houseman" },
      { value: "Maintenance Tech", label: "Maintenance Tech" },
      { value: "Painter", label: "Painter" },
      { value: "Remodeling Official", label: "Remodeling Official" },
      { value: "HK Supervisor", label: "HK Supervisor" },
      { value: "MT Supervisor", label: "MT Supervisor" },
      { value: "Remo Supervisor", label: "Remo Supervisor" },
      { value: "Quality Control", label: "Quality Control" },
      { value: "Building Manager", label: "Building Manager" },
      { value: "Room control", label: "Room control" },
      { value: "Front desk", label: "Front desk" },
      { value: "Lost & Found/Inventory", label: "Lost & Found/Inventory" },
      { value: "Assistant Manager", label: "Assistant Manager" },
      { value: "Operations Manager", label: "Operations Manager" },
      { value: "General Manager", label: "General Manager" },
      { value: "Resort Manager", label: "Resort Manager" },
      { value: "Laundry", label: "Laundry" }

    
  ];

  const fetchData = async (role: string | null = null) => {
    try {
      const employeeResponse = await axios.post(
        `${base}/api/hotel/getAllEmployees`,
        role ? { role } : {}

      );

      if (Array.isArray(employeeResponse.data)) {
        const employeeData = employeeResponse.data.map((emp) => ({
          id_employee: emp.id_employee,
          name: emp.name,
        }));
        setEmployees(employeeData);

        const allEvents: any[] = [];

        for (const emp of employeeData) {
          const scheduleResponse = await axios.get(
            `${base}/api/hotel/getAllWorkShedule/${emp.id_employee}`
          );

          if (Array.isArray(scheduleResponse.data)) {
            const employeeEvents = scheduleResponse.data.map((schedule: any) => {
              const workDate = new Date(schedule.work_date);
              const start = new Date(`${workDate.toISOString().split('T')[0]}T${schedule.start_time.split(' ')[1]}`);
              const end = new Date(`${workDate.toISOString().split('T')[0]}T${schedule.end_time.split(' ')[1]}`);

              return {
                id: `${emp.id_employee}-${schedule.id_workdays}`,
                title: `${emp.name} - ${schedule.start_time} a ${schedule.end_time}`,
                start: start.toISOString(),
                end: end.toISOString(),
                color: "#20b2aa",
                extendedProps: {
                  employee_name: emp.name,
                  start_time: schedule.start_time,
                  end_time: schedule.end_time,
                }
              };
            });

            allEvents.push(...employeeEvents);
          }
        }

        setEvents(allEvents);
      } else {
        console.error('La respuesta de empleados no es un array.');
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };
  const [hotels, setHotels] = useState<{ id_hotel: number; name: string }[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get(`${base}/api/hotel/getAllHotel`);
        if (Array.isArray(response.data)) {
          setHotels(response.data);
        } else {
          console.error('La respuesta de hoteles no es un array.');
        }
      } catch (error) {
        console.error('Error al obtener hoteles:', error);
      }
    };

    fetchHotels();
  }, [base]);

  const handleEmployeeSelect = (selectedOptions: any) => {
    setSelectedEmployees(selectedOptions);
  };

  const handleHotelSelect = (selectedOptions: any) => {
    setSelectedHotels(selectedOptions);
  };

  const handleRoleSelect = (selectedOption: any) => {
    setSelectedRole(selectedOption);
    fetchData(selectedOption?.value || null);
  };
  


  const handleSaveSchedule = async () => {
    try {
      const employeeIds = selectedEmployees.map((emp: any) => emp.value);
      if (employeeIds.length === 0 || selectedDays.length === 0) {
        alert('Selecciona al menos un empleado y un día.');
        return;
      }

      for (const id_employee of employeeIds) {
        const updateData = {
          start_time: startTime,
          end_time: endTime,
        };

        await axios.put(
          `${base}/api/hotel/updateEmployeeSchedule/${id_employee}`,
          updateData
        );
      }

      const dataToSend = {
        employeeId: employeeIds,
        workDates: selectedDays,
        hotelIds: selectedHotels.map((hotel: any) => hotel.value),
      };

      const response = await axios.post(
        `${base}/api/hotel/postWorkDays`,
        dataToSend
      );

      if (response.status === 200) {
        alert('Horarios guardados correctamente.');
      } else {
        console.error('Error al guardar los horarios:', response.data);
        alert('Hubo un error al guardar los horarios.');
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      alert('Hubo un error al enviar los datos al servidor.');
    }
  };

  const handleDayClick = (arg: any) => {
    const clickedDate = arg.dateStr;
    setSelectedDays((prev) =>
      prev.includes(clickedDate)
        ? prev.filter((day) => day !== clickedDate)
        : [...prev, clickedDate]
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
  <h2 className="mb-8 text-4xl font-bold text-gray-800 text-center">🗓️ Gestión de Horarios</h2>

  {/* Filtros */}
  <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <label className="block text-md font-medium text-gray-700 mb-2">🎯 Filtrar por Rol:</label>
      <Select
        options={roles}
        onChange={handleRoleSelect}
        value={selectedRole}
        placeholder="Seleccionar rol..."
        className="w-full"
      />
    </div>

    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <label className="block text-md font-medium text-gray-700 mb-2">👥 Seleccionar Empleados:</label>
      <Select
        isMulti
        options={employees.map((emp) => ({
          value: emp.id_employee,
          label: emp.name,
        }))}
        onChange={handleEmployeeSelect}
        placeholder="Buscar empleados..."
        className="w-full"
      />
    </div>

    <div className="bg-white p-4 rounded-xl shadow-sm border">
        <label className="block text-md font-medium text-gray-700 mb-2">🏨 Seleccionar Propiedades:</label>
        <Select
          isMulti
          options={hotels.map(hotel => ({
            value: hotel.id_hotel,
            label: hotel.name,
          }))}
          onChange={handleHotelSelect}
          value={selectedHotels}
          placeholder="Seleccionar hoteles..."
          className="w-full"
        />
      </div>
  </div>

  {/* Horarios */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <label className="block text-md font-medium text-gray-700 mb-2">🕒 Hora de inicio:</label>
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-lg shadow-sm"
      />
    </div>
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <label className="block text-md font-medium text-gray-700 mb-2">🕓 Hora de finalización:</label>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-lg shadow-sm"
      />
    </div>
  </div>

  {/* Botón guardar */}
  <button
    onClick={handleSaveSchedule}
    className="w-full bg-gray-600 hover:bg-gray-700 transition text-white font-bold py-3 text-xl rounded-lg shadow-md mb-8"
  >
    Guardar Horarios
  </button>

  {/* Calendario */}
  <div className="w-full overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white p-6">
    <div className="min-w-[320px]">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
        editable
        selectable
        events={events}
        eventColor="#20b2aa"
        height="auto"
        dayMaxEventRows={true}
        buttonText={{ month: 'Mes', week: 'Semana', day: 'Día' }}
        locale="es"
        firstDay={1}
        dateClick={handleDayClick}
        dayCellContent={(info) => {
          const day = info.date.toISOString().split('T')[0];
          const dayEvents = events.filter((event) => event.start.includes(day));
          const dayNumberClass = selectedDays.includes(day) ? 'bg-gray-300 rounded-full' : '';

          return (
            <div className={`${dayNumberClass} p-2 text-sm`}>
              {info.dayNumberText}
              {dayEvents.map((event) => (
                <div key={event.id} className="mt-1 text-xs bg-gray-200 p-1 rounded-lg text-center">
                  <strong>{event.extendedProps.employee_name}</strong>
                  <div>{`${event.extendedProps.start_time} - ${event.extendedProps.end_time}`}</div>
                </div>
              ))}
            </div>
          );
        }}
        eventContent={(eventInfo) => {
          const { employee_name, start_time, end_time } = eventInfo.event.extendedProps;
          return (
            <div className="bg-gray-600 text-white p-2 rounded-lg text-center text-xs">
              <strong>{employee_name}</strong>
              <div>{`Inicio: ${start_time}`}</div>
              <div>{`Fin: ${end_time}`}</div>
            </div>
          );
        }}
      />
    </div>
  </div>
</div>
  );
}

export default EmployeeSchedule;
