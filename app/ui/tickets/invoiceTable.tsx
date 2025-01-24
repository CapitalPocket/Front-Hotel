import Image from 'next/image';
import TicketStatus from '@/app/ui/tickets/status';
import { formatDateToLocal } from '@/app/lib/utils';
import { fetchFilteredInvoices } from '@/app/lib/data';
import { Ticket } from '@/app/lib/definitions';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default async function TableInvoices({
  query,
  currentPage,
  grupo,
}: {
  query: string;
  currentPage: number;
  grupo: string;
}) {
  const tickets = await fetchFilteredInvoices(query, currentPage, grupo);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Invoice Number
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Period
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Category
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Download
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {tickets?.map((ticket: any, id: number) => (
                <tr
                  key={ticket.Mes}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>PNDEC13_00{id + 1}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{ticket.Mes}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    Parque Norte
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    13 de {ticket.Mes}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {ticket.Total}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 cursor-pointer">
                    <ArrowDownTrayIcon width={20} />
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
