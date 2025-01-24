import Image from 'next/image';
import {
  UpdateInvoice,
  DeleteInvoice,
  UpdatePass,
  Desabled,
  Enable,
} from '@/app/ui/candidatos/buttons';
import { formatDateToLocal, formatCurrency, hotelMapping } from '@/app/lib/utils';
import { fetchFilteredUsers, fetchFilteredUsersPage } from '@/app/lib/data';
import UserStatus from './status';

export default async function InvoicesTable({
  query,
  currentPage,
  status,
}: {
  query: string;
  currentPage: number;
  status: string;
}) {
  const candidatos = await fetchFilteredUsers(query, currentPage, status);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-100 p-2 md:pt-0">
          <div className="md:hidden">
          {candidatos?.map((candidato: any) => (
            <div
              key={candidato.id_employee}
              className="mb-2 w-full rounded-md bg-white p-4"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className='w-[100%] mx-auto rounded-md p-2'>
                  <div className="mb-2 flex justify-between items-center">
                    <p className='font-semibold'>
                      {`${candidato.rol}`} &nbsp; &nbsp;
                    </p>
                    <UserStatus status={candidato.statusprofile} />
                  </div>
                  <p className="text-sm text-gray-500">
                      {candidato.name} &nbsp; &nbsp; 
                  </p>
                  <p className="text-sm text-gray-500">
                    {candidato.email}
                  </p>
                  <div className="flex justify-between gap-1">
                    {candidato.statusprofile === 'Habilitado' && (
                      <>
                        <Desabled id={candidato.id_employee} />
                        <DeleteInvoice id={candidato.id_employee} />
                      </>
                    )}
                    {candidato.statusprofile === 'Deshabilitado' && (
                      <>
                        <Enable id={candidato.id_employee} />
                        <DeleteInvoice id={candidato.id_employee} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Nombre
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Telefono
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Rol
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha de ingreso
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Valor/Hora
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Hotel
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Estado
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {candidatos?.map((candidatos: any) => (
                <tr
                  key={candidatos.id_employee}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={'/customers/usuario.png'}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`profile picture`}
                      />
                      <p>{candidatos.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {candidatos.phone_number}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {candidatos.role}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(candidatos.created_at)}
                  </td>
                  
                  <td className="whitespace-nowrap px-3 py-3">
                    {candidatos.hourly_wage}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                      {hotelMapping[candidatos.current_hotel_id] || "Unknown Hotel"}
                  </td>


                  <td className="whitespace-nowrap px-1 py-3">
                    <UserStatus status={candidatos.statusprofile} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-1 pr-3">
                    <div className="flex justify-end gap-1">
                      {candidatos.statusprofile === 'Habilitado' && (
                        <>
                          <Desabled id={candidatos.id_employee} />
                          <DeleteInvoice id={candidatos.id_employee} />
                        </>
                      )}
                      {candidatos.statusprofile === 'Deshabilitado' && (
                        <>
                          <Enable id={candidatos.id_employee} />
                          <DeleteInvoice id={candidatos.id_employee} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
