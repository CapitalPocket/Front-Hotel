import dotenv from 'dotenv';

dotenv.config();
import { sql } from '@vercel/postgres';
import { User, CandidatosTable, Ticket, UserProfile } from './definitions';

import { unstable_noStore as noStore } from 'next/cache';
import axios from 'axios';

export async function fetchCardDataCandidatos(grupo: string) {
  noStore();
  try {
    let totalCandidatosPromise = sql`SELECT COUNT(*) FROM candidato  WHERE  grupo= ${grupo}`;
    let candidatosEnProcesoPromise = sql`SELECT COUNT(*) FROM candidato WHERE estado_proceso = 'En Proceso' and  grupo=${grupo} `;
    let candidatosEnviadosPromise = sql`SELECT COUNT(*) FROM candidato WHERE estado_proceso = 'Enviado' and  grupo= ${grupo}`;
    let candidatosNoPasaronPromise = sql`SELECT COUNT(*) FROM candidato WHERE estado_proceso = 'No paso' and  grupo= ${grupo}`;

    if (grupo == 'Total') {
      totalCandidatosPromise = sql`SELECT COUNT(*) FROM candidato `;
      candidatosEnProcesoPromise = sql`SELECT COUNT(*) FROM candidato WHERE estado_proceso = 'En Proceso'`;
      candidatosEnviadosPromise = sql`SELECT COUNT(*) FROM candidato WHERE estado_proceso = 'Enviado'`;
      candidatosNoPasaronPromise = sql`SELECT COUNT(*) FROM candidato WHERE estado_proceso = 'No paso'`;
    }

    const data = await Promise.all([
      totalCandidatosPromise,
      candidatosEnProcesoPromise,
      candidatosEnviadosPromise,
      candidatosNoPasaronPromise,
    ]);

    const totalCandidatos = Number(data[0].rows[0].count ?? '0');
    const candidatosEnProceso = Number(data[1].rows[0].count ?? '0');
    const candidatosEnviados = Number(data[2].rows[0].count ?? '0');
    const candidatosNoPasaron = Number(data[3].rows[0].count ?? '0');

    return {
      totalCandidatos,
      candidatosEnProceso,
      candidatosEnviados,
      candidatosNoPasaron,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
export async function fetchCardDataCandidatosTotal(grupo: string) {
  noStore();
  try {
    const totalCandidatosPromise = sql`SELECT COUNT(*) FROM candidato and `;
    const candidatosEnProcesoPromise = sql`SELECT COUNT(*) FROM candidato WHERE estado_proceso = 'En Proceso'`;
    const candidatosEnviadosPromise = sql`SELECT COUNT(*) FROM candidato WHERE estado_proceso = 'Enviado'`;
    const candidatosNoPasaronPromise = sql`SELECT COUNT(*) FROM candidato WHERE estado_proceso = 'No paso'`;

    const data = await Promise.all([
      totalCandidatosPromise,
      candidatosEnProcesoPromise,
      candidatosEnviadosPromise,
      candidatosNoPasaronPromise,
    ]);

    const totalCandidatos = Number(data[0]?.rows[0]?.count ?? '0');
    const candidatosEnProceso = Number(data[1]?.rows[0]?.count ?? '0');
    const candidatosEnviados = Number(data[2]?.rows[0]?.count ?? '0');
    const candidatosNoPasaron = Number(data[3]?.rows[0]?.count ?? '0');

    return {
      totalCandidatos,
      candidatosEnProceso,
      candidatosEnviados,
      candidatosNoPasaron,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 9;

export async function fetchInvoices(idpark: string, month: string) {
  noStore();
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BACK_LINK}/api/marketing/generateInovice`;
    const { data: tickets } = await axios.post(apiUrl, {
      idpark: idpark,
      month: month,
    });

    return tickets;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch facturas.');
  }
}

export async function getUser(email: string) {
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

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

export async function fetchFilteredCandidatos(
  query: string,
  currentPage: number,
  user: any,
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BACK_LINK}/api/marketing/getAllTicketsTwo`;
    const { data: tickets } = await axios.post(apiUrl, {
      idpark: user?.park,
    });

    const filteredTickets = tickets.filter((ticket: Ticket) => {
      if (user?.role === 'taquillero' && !query.trim()) {
        return false;
      }

      const searchString = query.toLowerCase();
      return (
        ticket.name?.toLowerCase().includes(searchString) ||
        ticket.lastname?.toLowerCase().includes(searchString) ||
        ticket.email_person?.toLowerCase().includes(searchString) ||
        ticket.phone_number?.toLowerCase().includes(searchString) ||
        ticket.date_ticket?.toLowerCase().includes(searchString) ||
        ticket.status?.toLowerCase().includes(searchString) ||
        ticket.identity_number?.toLowerCase().includes(searchString)
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

export async function fetchTicketsCount(query: string, user: any) {
  noStore();
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BACK_LINK}/api/marketing/getAllTicketsTwo`;
    const { data: tickets } = await axios.post(apiUrl, {
      idpark: user?.park,
    });

    console.log(tickets);

    const searchString = query.toLowerCase();
    const count = tickets.filter((ticket: Ticket) => {
      if (user?.role === 'taquillero' && !query.trim()) {
        return false;
      }
      return (
        ticket.name?.toLowerCase().includes(searchString) ||
        ticket.lastname?.toLowerCase().includes(searchString) ||
        ticket.email_person?.toLowerCase().includes(searchString) ||
        ticket.phone_number?.toLowerCase().includes(searchString) ||
        ticket.date_ticket?.toLowerCase().includes(searchString) ||
        ticket.status?.toLowerCase().includes(searchString) ||
        ticket.identity_number?.toLowerCase().includes(searchString)
      );
    }).length;

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of tickets.');
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
        user.phone_number?.toLowerCase().includes(searchString) ||
        user.rol?.toLowerCase().includes(searchString) ||
        user.statusprofile?.toLowerCase().includes(searchString) ||
        user.hourly_wage?.toString().includes(searchString)
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
        user.phone_number?.toLowerCase().includes(searchString) ||
        user.rol?.toLowerCase().includes(searchString) ||
        user.statusprofile?.toLowerCase().includes(searchString) ||
        user.hourly_wage?.toString().includes(searchString)
      );
    }).length;

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of Users.'+error);
  }
}
