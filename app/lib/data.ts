import dotenv from 'dotenv';

dotenv.config();
import { sql } from '@vercel/postgres';
import { User, CandidatosTable, UserProfile } from './definitions';

import { unstable_noStore as noStore } from 'next/cache';
import axios from 'axios';

const ITEMS_PER_PAGE = 9;
const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.pockiaction.xyz';
const API_BASE_URL =
  typeof RAW_BASE_URL === 'string'
    ? RAW_BASE_URL.replace(/[`'"\s]/g, '').trim()
    : RAW_BASE_URL;

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

export async function fetchFilteredCandidatos(
  query: string,
  currentPage: number,
  user: any,
): Promise<Ticket[]> {
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

export async function fetchFilteredUsers(
  query: string,
  currentPage: number,
  status: string = 'Habilitado',
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const effectiveStatus = status || 'Habilitado';
    if (!API_BASE_URL) {
      console.error('API base URL not configured');
      return [];
    }
    const apiUrl = `${API_BASE_URL}/api/hotel/getAllEmployees`;
    const response = await axios.post(apiUrl);

    if (response.data.message) {
      console.warn(response.data.message);
      return 0;
    }
    const users = response.data;
    const filteredUsers = users.filter((user: UserProfile) => {
      const searchString = query.toLowerCase();
      return (
        user.statusprofile === effectiveStatus &&
        (user.name?.toLowerCase().includes(searchString) ||
          user.rol?.toLowerCase().includes(searchString) ||
          user.statusprofile?.toLowerCase().includes(searchString))
      );
    });

    const paginatedUsers = filteredUsers.slice(offset, offset + ITEMS_PER_PAGE);
    return paginatedUsers;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.response?.data || error.message);
      return [];
    }
    console.error('Error:', error);
    return [];
  }
}

export async function fetchFilteredUsersPage(
  query: string,
  status: string = 'Habilitado',
) {
  noStore();

  try {
    const effectiveStatus = status || 'Habilitado';
    if (!API_BASE_URL) {
      console.error('API base URL not configured');
      return 0;
    }
    const apiUrl = `${API_BASE_URL}/api/hotel/getAllEmployees`;
    const response = await axios.post(apiUrl);
    if (response.data.message) {
      console.warn(response.data.message);
      return 0;
    }
    const users = response.data;

    const count = users.filter((user: UserProfile) => {
      const searchString = query.toLowerCase();
      return (
        user.statusprofile === effectiveStatus &&
        (user.name?.toLowerCase().includes(searchString) ||
          user.rol?.toLowerCase().includes(searchString) ||
          user.statusprofile?.toLowerCase().includes(searchString))
      );
    }).length;

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Error fetching total number of Users:', error);
    return 0;
  }
}

export async function fetchEmployeeSchedules(
  query: string,
  status: string = 'Habilitado',
) {
  try {
    if (!API_BASE_URL) {
      console.error('API base URL not configured');
      return [];
    }
    const employeesApiUrl = `${API_BASE_URL}/api/hotel/getAllEmployees`;
    const employeesRes = await axios.post(employeesApiUrl);

    if (!employeesRes.data || !Array.isArray(employeesRes.data)) {
      console.warn('La respuesta de empleados no es válida.');
      return [];
    }

    const enabledEmployees = employeesRes.data
      .filter((emp: any) => emp.statusprofile === status)
      .map((emp: any) => ({ id_employee: emp.id_employee }));

    const schedulesApiUrl = `${API_BASE_URL}/api/hotel/getEmployeeWorkSchedule`;
    let schedulesData: any[] = [];
    try {
      const schedulesRes = await axios.get(schedulesApiUrl);
      schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
    } catch (error: any) {
      if (error?.response?.status === 404) {
        schedulesData = [];
      } else {
        throw error;
      }
    }

    const enabledIds = new Set(enabledEmployees.map((e: any) => e.id_employee));
    const filtered = schedulesData.filter((s: any) =>
      enabledIds.has(s.employee_id),
    );

    const allSchedules = filtered.map((schedule: any) => ({
      employeeId: schedule.employee_id,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
    }));

    return allSchedules;
  } catch (error) {
    console.error('Error fetching employees or schedules:', error);
    return [];
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
  },
) {
  try {
    if (!API_BASE_URL) {
      console.error('API base URL not configured');
      throw new Error('API base URL not configured');
    }
    const apiUrl = `${API_BASE_URL}/api/hotel/updateEmployeeDetails/${employee_id}`;
    const normalize = (t: string) =>
      t && /^\d{1,2}:\d{2}$/.test(t) ? `${t}:00` : t;
    const response = await axios.patch(apiUrl, {
      ...employeeData,
      start_time: normalize(employeeData.start_time),
      end_time: normalize(employeeData.end_time),
      lunch_start_time: normalize(employeeData.lunch_start_time),
      lunch_end_time: normalize(employeeData.lunch_end_time),
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const msg = error.response?.data?.error || error.message;
      if (status === 500) {
        try {
          const scheduleUrl = `${API_BASE_URL}/api/hotel/updateEmployeeSchedule/${employee_id}`;
          await axios.put(scheduleUrl, {
            start_time: employeeData.start_time,
            end_time: employeeData.end_time,
          });
          if (employeeData.statusprofile) {
            const statusUrl = `${API_BASE_URL}/api/hotel/updateStatus`;
            await axios.post(statusUrl, {
              id_employee: employee_id,
              statusprofile: employeeData.statusprofile,
            });
          }
          return {
            message: 'Partial update applied: schedule and status updated',
          };
        } catch (fallbackError) {
          console.error('Fallback update failed:', fallbackError);
          throw new Error(`Failed to update employee details: ${msg}`);
        }
      }
      console.error('Axios Error:', error.response?.data || error.message);
      throw new Error(`Failed to update employee details: ${error.message}`);
    }
    console.error('Error:', error);
    throw new Error('Failed to update employee details.');
  }
}

export async function fetchEmployeeWorkSchedule(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    if (!API_BASE_URL) {
      console.error('API base URL not configured');
      return [];
    }
    const apiUrl = `${API_BASE_URL}/api/hotel/getEmployeeWorkSchedule`;
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
      offset + ITEMS_PER_PAGE,
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
