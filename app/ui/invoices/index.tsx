import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import Select from 'react-select';
import{fetchEmployeeWorkSchedule} from '../../lib/data';

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

  

  const fetchData = async () => {
    try {
      const employeeResponse = await axios.get(
        `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllEmployees`
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
            `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllWorkShedule/${emp.id_employee}`
          );
  
          if (Array.isArray(scheduleResponse.data)) {
            const employeeEvents = scheduleResponse.data.map((schedule: any) => {
              const workDate = new Date(schedule.work_date); // work_date en formato ISO
              const startTime = new Date(`${workDate.toISOString().split('T')[0]}T${schedule.start_time.split(' ')[1]}`);
              const endTime = new Date(`${workDate.toISOString().split('T')[0]}T${schedule.end_time.split(' ')[1]}`);
  
              return {
                id: `${emp.id_employee}-${schedule.id_workdays}`,
                title: `${emp.name} - ${schedule.start_time} a ${schedule.end_time}`, 
                start: startTime.toISOString(),
                end: endTime.toISOString(),
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
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleEmployeeSelect = (selectedOptions: any) => {
    setSelectedEmployees(selectedOptions);
  };

  const handleHotelSelect = (selectedOptions: any) => {
    setSelectedHotels(selectedOptions);
  };

  const handleSaveSchedule = async () => {
    try {
      const employeeIds = selectedEmployees.map((emp: any) => emp.value);
      if (employeeIds.length === 0) {
        alert('Por favor, selecciona al menos un empleado.');
        return;
      }

      if (selectedDays.length === 0) {
        alert('Por favor, selecciona al menos un día en el calendario.');
        return;
      }

      for (const id_employee of employeeIds) {
        const updateData = {
          start_time: startTime,
          end_time: endTime,
        };

        await axios.put(
          `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/updateEmployeeSchedule/${id_employee}`,
          updateData
        );
      }

      const dataToSend = {
        employeeId: employeeIds,
        workDates: selectedDays,
        hotelIds: selectedHotels.map((hotel: any) => hotel.value),
      };

      console.log('Datos a enviar:', dataToSend);

      const response = await axios.post(
        `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/postWorkDays`,
        dataToSend
      );

      if (response.status === 200) {
        alert('Horarios guardados correctamente.');
      } else {
        console.error('Error al guardar los horarios:', response.data);
        alert('Hubo un error al guardar los horarios.');
      }
    } catch (error) {
      if ((error as any).response) {
        console.error('Detalles del error:', (error as any).response);
        alert('Error al enviar los datos: ' + JSON.stringify((error as any).response.data));
      } else {
        console.error('Error:', (error as Error).message);
        alert('Hubo un error al enviar los datos al servidor.');
      }
    }
  };

  const handleDayClick = (arg: any) => {
    const clickedDate = arg.dateStr;
    if (selectedDays.includes(clickedDate)) {
      setSelectedDays((prevDays) => prevDays.filter((day) => day !== clickedDate));
    } else {
      setSelectedDays((prevDays) => [...prevDays, clickedDate]);
    }
  };

  const dayNumberClass = (day: string) => {
    if (selectedDays.includes(day)) {
      return 'w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center';
    }
    return '';
  };

  

  return (
    <div className="p-6">
       <h2 className="mb-6 text-3xl font-bold text-gray-700 text-center">
        Gestión de Horarios
      </h2>

     {/* Contenedor de selectores en fila */}
        <div className="mb-6 flex space-x-4">
          {/* Selector de empleados */}
          <div className="w-1/2">
            <label className="block text-lg font-semibold mb-2">Seleccionar Empleados:</label>
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

          {/* Selector de hoteles */}
          <div className="w-1/2">
            <label className="block text-lg font-semibold mb-2">Seleccionar Propiedades:</label>
            <Select
              isMulti
              options={[
                { value: '1', label: 'Heron I' },
                { value: '2', label: 'Heron II' },
              ]}
              onChange={handleHotelSelect}
              value={selectedHotels}
              placeholder="Seleccionar hoteles..."
              className="w-full"
            />
          </div>
        </div>

      {/* Selector de horas */}
     
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-xl font-semibold">Hora de inicio:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg"
          />
        </div>
        <div>
          <label className="block text-xl font-semibold">Hora de finalización:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg"
          />
        </div>
      </div>



      <button
        onClick={handleSaveSchedule}
        className="w-full bg-gray-600 hover:bg-gray-800 text-white font-bold py-3 text-xl rounded-lg"
      >
        Guardar Horarios
      </button>
      
      <div className="mt-8 h-[85vh] max-h-[700px] overflow-auto border border-gray-300 rounded-lg p-6 shadow-lg bg-white">
      <FullCalendar
       plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
          editable={true}
          selectable={true}
          events={events}
          eventColor="#20b2aa"
          height="100%"
          dayMaxEventRows={true}
          buttonText={{ month: 'Mes', week: 'Semana', day: 'Día' }}
          locale="es"
          firstDay={1}
          dateClick={handleDayClick}
          dayCellContent={(info) => {
            const day = info.date.toISOString().split('T')[0];
            const dayEvents = events.filter((event) => event.start.includes(day));
          return (
            <div className={`${dayNumberClass(day)} p-2 text-lg font-semibold`}>
               {info.dayNumberText}
                {dayEvents.map((event) => (
                  <div key={event.id} className="mt-1 text-sm bg-gray-200 p-1 rounded-lg text-center">
                    <strong>{event.extendedProps.employee_name}</strong>
                    <div>{`${event.extendedProps.start_time} - ${event.extendedProps.end_time}`}</div>
                  </div>
                ))}
            </div>
          );
        }}
        
        eventContent={(eventInfo) => {
          const { event } = eventInfo;
          const { employee_name, start_time, end_time } = event.extendedProps;
          return (
            <div className="bg-teal-500 text-white p-2 rounded-lg text-center text-sm">
              <strong>{employee_name}</strong>
              <div>{`Inicio: ${start_time}`}</div>
              <div>{`Fin: ${end_time}`}</div>
            </div>
          );
        }}
        
        
      />
      </div>
    </div>
  );
};

export default EmployeeSchedule;
