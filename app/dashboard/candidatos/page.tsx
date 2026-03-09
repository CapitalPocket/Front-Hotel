import Table from '@/app/ui/candidatos/table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Empleados',
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
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const status = searchParams?.statusPerfil || 'Habilitado';

  return (
    <div className="w-full">
      <Table query={query} currentPage={currentPage} status={status} />
    </div>
  );
}
