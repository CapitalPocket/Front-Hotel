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
    const apiUrl = `${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotel/getAllEmployees`;
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
    const apiUrl = `${process.env.NEXT_PUBLIC_BACK_LINK}/api/hotel/getAllEmployees`;
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


export async function fetchEmployeeSchedules(query: string,
  status: string = 'Habilitado',) {
  try {
    // Paso 1: Consumir la API para obtener todos los empleados
    const employeesApiUrl = 'https://9b0lctjk-80.use.devtunnels.ms/api/hotel/getAllEmployees';
    const response = await axios.get(employeesApiUrl);

    if (response.data.message) {
      console.warn(response.data.message);
      return;
    }

    const employees = response.data;

    // Paso 2: Obtener los horarios de cada empleado y extraer start_time y end_time
    const allSchedules = await Promise.all(
      employees.map(async (employee: any) => {
        const employeeId = employee.id_employee;
        
        const schedulesApiUrl = `https://9b0lctjk-80.use.devtunnels.ms/api/hotel/getAllShedule/${employeeId}`;
        try {
          const scheduleResponse = await axios.get(schedulesApiUrl);
          
          if (scheduleResponse.data.message) {
            console.warn(scheduleResponse.data.message);
            return []; // Si no hay horarios, retornar un array vacío
          }

          // Extraer los valores de start_time y end_time
          const employeeSchedules = scheduleResponse.data.map((schedule: any) => ({
            employeeId: employeeId,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            range_hours: schedule.range_hours
          }));

          return employeeSchedules;
        } catch (error) {
          console.error(`Error fetching schedules for employee ${employeeId}:`, error);
          return []; // Si hay error, retornar un array vacío
        }
      })
    );

    // Aplanar los resultados y devolverlos
    const flattenedSchedules = allSchedules.flat();

    console.log("All Employee Schedules:", flattenedSchedules);
    
    return flattenedSchedules;

  } catch (error) {
    console.error('Error fetching employees or schedules:', error);
    throw new Error('Failed to fetch employee schedules');
  }
}

