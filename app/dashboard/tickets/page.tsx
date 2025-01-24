import Pagination from '@/app/ui/tickets/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/tickets/table';
import { CreateInvoice } from '@/app/ui/tickets/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchTicketsCount } from '@/app/lib/data';
import { Metadata } from 'next';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Crear Ticket ',
};
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    grupo?: string;
  };
}) {
   const session = await auth();
  const grupo = "Metroparques"
  const query = searchParams?.query && searchParams.query.length > 3 ? searchParams.query : '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchTicketsCount(query, session?.user||"");
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl text-center`}>Todos los Tickets</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar Ticket..." />
        {/* <CreateInvoice grupo={grupo} /> */}
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} user={session?.user||""} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}