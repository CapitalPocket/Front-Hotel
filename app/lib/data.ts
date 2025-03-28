import dotenv from 'dotenv';

dotenv.config();
import { sql } from '@vercel/postgres';
import { User, CandidatosTable, UserProfile } from './definitions';

import { unstable_noStore as noStore } from 'next/cache';
import axios from 'axios';

const ITEMS_PER_PAGE = 9;


export async function fetchCandidatoById(id: string) {
  noStore();
  try {
    const data = await sql<CandidatosTable>`
      SELECT
        candidato.id,
        candidato.tipoid,
        candidato.nombre,
        candidato.celular,
        candidato.cargo,
        candidato.correo,
        candidato.motivo,
        candidato.estado_proceso,
        candidato.fecha_envio,
        candidato.fecha_ingreso,
        candidato.grupo,
        candidato.estadoCandidato,
        candidato.user_creo
      FROM candidato
      WHERE candidato.id = ${id};
    `;

    const candidato = data.rows.map((candidato) => ({
      ...candidato,
    }));

    return candidato[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch candidate.');
  }
}


// Add or ensure the export for fetchInvoices exists
export async function fetchInvoices(idpark: string, month: string) {
  // Implementation of fetchInvoices
  return []; // Replace with actual logic
}
// Add or verify the export for fetchFilteredCandidatos
export type Ticket = { id: string; name: string; [key: string]: any }; // Define Ticket type

export async function fetchFilteredCandidatos(query: string, currentPage: number, user: any): Promise<Ticket[]> {
  // Ensure this function returns a Ticket[] instead of void
  const tickets: Ticket[] = []; // Replace with actual logic to fetch tickets
  return tickets;
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
  grupo: string,
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const apiUrl = `/api/marketing/getAllInvoices`;
    const { data: tickets } = await axios.get(apiUrl);
    const filteredTickets = tickets.filter((invoice: any) => {
      const searchString = query.toLowerCase();
      return (
        invoice.Mes?.toLowerCase().includes(searchString) ||
        invoice.Total?.toLowerCase().includes(searchString)
      );
    });

    const paginatedTickets = filteredTickets.slice(
      offset,
      offset + ITEMS_PER_PAGE,
    );
    return paginatedTickets;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }
    console.error('Error:', error);
    throw new Error('Failed to fetch tickets.');
  }
}


export async function fetchFilteredUsers(query: string, currentPage: number, status: string = 'Habilitado',) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const effectiveStatus = status || 'Habilitado';
    const apiUrl = `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllEmployees`;
    const response = await axios.get(apiUrl);
    if (response.data.message) {
      console.warn(response.data.message); 
      return 0;
    }
    const users = response.data;
    const filteredUsers = users.filter((user: UserProfile) => {
      const searchString = query.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchString) ||
        user.rol?.toLowerCase().includes(searchString) ||
        user.statusprofile?.toLowerCase().includes(searchString) 
      );
    });

    const paginatedUsers = filteredUsers.slice(offset, offset + ITEMS_PER_PAGE);
    return paginatedUsers;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Users: ${error.message}`);
    }
    console.error('Error:', error);
    throw new Error('Failed to fetch Users.');
  }
}

export async function fetchFilteredUsersPage(
  query: string,
  status: string = 'Habilitado',
) {
  noStore();

  try {
    
    const effectiveStatus = status || 'Habilitado';
    const apiUrl = `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllEmployees`;
    const response = await axios.get(apiUrl);
    if (response.data.message) {
      console.warn(response.data.message); 
      return 1;
    }
    const users = response.data;

    const count = users.filter((user: UserProfile) => {
      const searchString = query.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchString) ||
        user.rol?.toLowerCase().includes(searchString) ||
        user.statusprofile?.toLowerCase().includes(searchString) 
      );
    }).length;
    

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of Users.'+error);
  }
}




export async function fetchEmployeeSchedules(query: string, status: string = 'Habilitado') {
  try {
    // 1️⃣ Obtener empleados
    const employeesApiUrl = `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllEmployees`;
    const response = await axios.get(employeesApiUrl);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn("La respuesta de empleados no es válida.");
      return [];
    }

    const employees = response.data.filter((emp: any) => emp.statusprofile === status);

    // 2️⃣ Obtener los horarios de cada empleado
    const scheduleRequests = employees.map(async (employee: any) => {
      const employeeId = employee.id_employee;
      const schedulesApiUrl = `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getAllShedule/${employeeId}`;

      try {
        const scheduleResponse = await axios.get(schedulesApiUrl);
        
        if (!scheduleResponse.data || !Array.isArray(scheduleResponse.data)) {
          console.warn(`No schedules found for employee ${employeeId}`);
          return [];
        }

        return scheduleResponse.data.map((schedule: any) => ({
          employeeId,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          range_hours: schedule.range_hours,
        }));
      } catch (error) {
        console.error(`Error fetching schedules for employee ${employeeId}:`, error);
        return [];
      }
    });

    // 3️⃣ Esperar todas las solicitudes y aplanar resultados
    const allSchedules = (await Promise.all(scheduleRequests)).flat();

    console.log("All Employee Schedules:", allSchedules);
    
    return allSchedules;

  } catch (error) {
    console.error('Error fetching employees or schedules:', error);
    throw new Error('Failed to fetch employee schedules');
  }
 
  
}
export async function updateEmployeeDetails(
  employee_id: string,
  employeeData: {
    current_hotel_id: number;
    hourly_wage: number;
    start_time: string;
    end_time: string;
    lunch_start_time: string;
    lunch_end_time: string;
    role: string;
    statusprofile: string;
    birthdate: string;
    address: string;
    social_number: string;
  }
) {
  try {
    const apiUrl = `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/updateEmployeeDetails/${employee_id}`;
    const response = await axios.patch(apiUrl, employeeData);

    // Manejar la respuesta exitosa
    console.log('Employee details updated successfully', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.response?.data || error.message);
      throw new Error(`Failed to update employee details: ${error.message}`);
    }
    console.error('Error:', error);
    throw new Error('Failed to update employee details.');
  }

  
}

export async function fetchEmployeeWorkSchedule(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // Construir la URL de la API
    const apiUrl = `http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/hotel/getEmployeeWorkSchedule`;
    
    // Hacer la petición a la API
    const { data: schedules } = await axios.get(apiUrl);

    // Filtrar resultados según la consulta de búsqueda
    const filteredSchedules = schedules.filter((schedule: any) => {
      const searchString = query.toLowerCase();
      return (
        schedule.work_date?.toLowerCase().includes(searchString) ||
        schedule.start_time?.toLowerCase().includes(searchString) ||
        schedule.end_time?.toLowerCase().includes(searchString)
      );
    });

    // Formatear la respuesta para que incluya la información requerida
    const formattedSchedules = filteredSchedules.map((schedule: any) => ({
      employee_id: schedule.employee_id,
      employee_name: schedule.employee_name,
      work_date: new Date(schedule.work_date).toISOString(), // Si la fecha no está en formato ISO
      start_time: new Date(schedule.start_time).toLocaleString(), // Asegúrate de que el formato sea adecuado
      end_time: new Date(schedule.end_time).toLocaleString(), // Asegúrate de que el formato sea adecuado
    }));

    // Aplicar paginación a los resultados formateados
    const paginatedSchedules = formattedSchedules.slice(
      offset,
      offset + ITEMS_PER_PAGE
    );

    return paginatedSchedules;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch schedules: ${error.message}`);
    }
    console.error('Error:', error);
    throw new Error('Failed to fetch schedules.');
  }
}
