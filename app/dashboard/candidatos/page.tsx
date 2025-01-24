import Pagination from '@/app/ui/tickets/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/candidatos/table';
import { CreateInvoice } from '@/app/ui/tickets/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchFilteredUsers, fetchFilteredUsersPage } from '@/app/lib/data';
import { Metadata } from 'next';
import StatusButton from '@/app/ui/candidatos/statusButton';

export const metadata: Metadata = {
  title: 'Hotel',
};
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    statusPerfil?:string;
  };
}) {
  const grupo = "Hotel"
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const validStatuses = ['Habilitado', 'Deshabilitado', 'Eliminado'];
  const status = searchParams?.statusPerfil||"Habilitado";
  
  // Validar el estado
  if (!status || !validStatuses.includes(status)) {
    console.warn('Estado inválido o no proporcionado. No se realizará la búsqueda.');
    return []; // O maneja la respuesta vacía de manera adecuada
  }
  const totalPages = await fetchFilteredUsersPage(query,status);
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`font-bold text-2xl`}>Empleados</h1>
      </div>
      <StatusButton/> 
      <div className="mt-4 flex items-center justify-between gap-2 ">
        <Search placeholder="Buscar Empleado..." />
        <CreateInvoice grupo={grupo} />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} status={status} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}