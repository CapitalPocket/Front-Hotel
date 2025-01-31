import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import Select from 'react-select';

// Mapeo de hoteles
export const hotelMapping: { [key: string]: string } = {
  '1': 'Heron I',
  '2': 'Heron II'
};

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
  const [selectedHotels, setSelectedHotels] = useState<any[]>([]); // Estado para los hoteles seleccionados

  // Función para obtener el nombre completo del día de la semana en español
  const getDayOfWeek = (date: string): string => {
    const daysInSpanish = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const dayOfWeek = new Date(date).getDay(); // 0 es domingo, 1 es lunes, etc.
    return daysInSpanish[dayOfWeek];
  };

  // Función para obtener los datos de los empleados
  const fetchData = async () => {
    try {
      const employeeResponse = await axios.get(
        'https://9b0lctjk-80.use.devtunnels.ms/api/hotel/getAllEmployees'
      );

      if (Array.isArray(employeeResponse.data)) {
        const employeeData = employeeResponse.data.map((emp) => ({
          id_employee: emp.id_employee,
          name: emp.name,
        }));
        setEmployees(employeeData);

        // Crear eventos iniciales con los horarios de los empleados
        const employeeEvents = employeeResponse.data.map((emp) => ({
          id: emp.id_employee,
          title: emp.name,
          start: `2025-01-24T${emp.start_time}`,
          end: `2025-01-24T${emp.end_time}`,
        }));

        setEvents(employeeEvents);
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

  // Función para manejar la selección de empleados
  const handleEmployeeSelect = (selectedOptions: any) => {
    setSelectedEmployees(selectedOptions);
    console.log('Empleados seleccionados:', selectedOptions); // Verifica los empleados seleccionados
  };

  // Función para manejar la selección de hoteles
  const handleHotelSelect = (selectedOptions: any) => {
    setSelectedHotels(selectedOptions); // Actualiza el estado con los hoteles seleccionados
  };

  const handleSaveSchedule = async () => {
    try {
      // Verifica si hay empleados seleccionados antes de proceder
      const employeeIds = selectedEmployees.map((emp: any) => emp.value); // Asegúrate que sea el 'value' del empleado
      if (employeeIds.length === 0) {
        alert('Por favor, selecciona al menos un empleado.');
        return;
      }

      if (selectedDays.length === 0) {
        alert('Por favor, selecciona al menos un día en el calendario.');
        return;
      }

      // Solo enviar las fechas seleccionadas
      const dataToSend = {
        employeeId: employeeIds,
        workDates: selectedDays,  // Fechas seleccionadas en el calendario
        hotelIds: selectedHotels.map((hotel: any) => hotel.value), // Enviar los IDs de los hoteles seleccionados
      };

      console.log('Datos a enviar:', dataToSend); // Verifica los datos antes de enviarlos

      const response = await axios.post(
        'https://9b0lctjk-80.use.devtunnels.ms/api/hotel/postWorkDays',
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

  // Función para manejar el clic en un día del calendario
  const handleDayClick = (arg: any) => {
    const clickedDate = arg.dateStr;
    const clickedDayOfWeek = getDayOfWeek(clickedDate); // Obtener el nombre completo del día en español
    console.log('Día seleccionado:', clickedDayOfWeek); // Verifica el día

    if (selectedDays.includes(clickedDate)) {
      setSelectedDays((prevDays) => prevDays.filter((day) => day !== clickedDate));
    } else {
      setSelectedDays((prevDays) => [...prevDays, clickedDate]);
    }
  };

  // Función para aplicar una clase especial a los días seleccionados
  const dayNumberClass = (day: string) => {
    if (selectedDays.includes(day)) {
      return 'w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center';
    }
    return '';
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Gestión de Horarios de Empleados</h2>

      {/* Selector de empleados */}
      <div className="mb-6">
        <label className="mr-4 text-lg font-semibold">Seleccionar Empleados:</label>
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
      <div className="mb-6">
        <label className="mr-4 text-lg font-semibold">Seleccionar Propiedades:</label>
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

      {/* Mostrar los hoteles seleccionados */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Hoteles Seleccionados: {selectedHotels.map((hotel) => hotelMapping[hotel.value]).join(', ')}</h3>
      </div>

      {/* Selector de horas */}
      <div className="mb-6 flex space-x-4">
        <div className="flex items-center space-x-4">
          <label className="text-lg font-semibold">Hora de inicio:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div>
          <label className="mr-4 text-lg font-semibold">Hora de finalización:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Botón para guardar horario */}
      <div className="mb-6">
        <button
          onClick={handleSaveSchedule}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Guardar Horarios
        </button>
      </div>

      {/* Calendario */}
      <div className="h-[60vh] overflow-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: '',
          }}
          editable={true}
          selectable={true}
          events={events}
          eventColor="#20b2aa"
          height="100%"
          dayMaxEventRows={true}
          buttonText={{
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
          locale="es"
          firstDay={1}
          dateClick={handleDayClick}
          dayCellContent={(info) => {
            const day = info.date.toISOString().split('T')[0]; // Obtener la fecha en formato YYYY-MM-DD
            return (
              <div className={dayNumberClass(day)}>
                {info.dayNumberText}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default EmployeeSchedule;
