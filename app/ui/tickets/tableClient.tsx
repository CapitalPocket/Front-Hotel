'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import TicketStatus from '@/app/ui/tickets/status';
import { Ticket } from '@/app/lib/definitions';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import Modal from './modalTicket';
import { validateTicket } from '@/app/lib/actions';
import { toast, ToastContainer } from 'react-toastify';

interface InvoicesTableClientProps {
  tickets: Ticket[];
  user: any;
}

export default function InvoicesTableClient({
  tickets,
  user,
}: InvoicesTableClientProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (ticketId: Ticket) => {
    setSelectedTicket(ticketId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };
  const handleValidateTicket = async () => {
    if (selectedTicket) {
      try {
        const data = {
          type_document: selectedTicket.identity_type,
          document: selectedTicket.identity_number,
          park:user?.park,
          id_user:user?.idUser,
        };
        const response = await validateTicket(data);
        notify({ message: response });
        closeModal();
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } catch (error) {
        notify({ message: 'Error al validar el ticket' });
      }
    } else {
      notify({ message: 'Faltan campos.' });
    }
  };

  const notify = (state: any) => {
    if (state.message === 'El ticket existe pero se encuentra vencido') {
      toast.error(state.message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.success(state.message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              {tickets?.map((ticket: Ticket) => (
                <div
                  key={ticket.idticket}
                  className="mb-2 w-full rounded-md bg-white p-4"
                  onClick={() => handleRowClick(ticket)}
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="mb-2 flex justify-between items-center">
                        <p className='font-semibold'>{ticket.namepark} - {ticket?.id_operation } &nbsp; &nbsp; &nbsp; &nbsp; </p>
                        <TicketStatus status={ticket.status} />
                      </div>
                      <p className="text-sm text-gray-500">
                        {`${ticket.name} ${ticket.lastname}`} &nbsp; &nbsp;
                        {`${ticket.identity_type == 'CedulaDeCiudadania' ? 'CC' : 'OTRO' } : ${ticket.identity_number}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(ticket.price_ticket)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateToLocal(ticket.date_ticket)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Parque
                  </th>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    Nombre
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Identificación
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Orden
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Valor
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Factura Electrónica
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {tickets.map((ticket: Ticket) => (
                  <tr
                    key={ticket.idticket}
                    className="w-full cursor-pointer border-b py-3 text-sm last-of-type:border-none hover:bg-gray-100"
                    onClick={() => handleRowClick(ticket)}
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={'/customers/emil-kowalski.png'}
                          className="rounded-full"
                          width={28}
                          height={28}
                          alt={`profile picture`}
                        />
                        <p>{ticket.namepark}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {ticket.name + ' ' + ticket.lastname}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {`${ticket.identity_type == 'CedulaDeCiudadania' ? 'CC' : 'OTRO' } : ${ticket.identity_number}`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                    {ticket?.id_operation }
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {formatCurrency(ticket.price_ticket)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                    <TicketStatus status={ticket.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {!!ticket.invoice_electronic ? 'Sí' : 'No'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {formatDateToLocal(ticket.date_ticket)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        status={selectedTicket?.status || ''}
        selectedTicket={selectedTicket || null}
        onValidate={handleValidateTicket}
      >
        <h2 className="text-lg font-bold">Detalles del Ticket</h2>
        <div className="mt-4">
          {/* Datos del cliente */}
          <h3 className="text-md font-semibold">Datos del Cliente</h3>
          <ul className="mt-2 text-sm text-gray-700">
            <li>
              <strong>Nombre:</strong>{' '}
              {selectedTicket?.name + ' ' + selectedTicket?.lastname}
            </li>
            <li>
              <strong>Tipo de Identificación:</strong>
              {selectedTicket?.identity_type}
            </li>
            <li>
              <strong>Número de Identificación:</strong>{' '}
              {selectedTicket?.identity_number}
            </li>
            <li>
              <strong>Email:</strong>
              {selectedTicket?.email_person}
            </li>
            <li>
              <strong>Teléfono:</strong> {selectedTicket?.phone_number}
            </li>
          </ul>
          {/* Detalles del ticket */}
          <h3 className="text-md mt-4 font-semibold">Detalles del Ticket</h3>
          <ul className="mt-2 text-sm text-gray-700">
            <li>
              <strong>ID del Ticket:</strong> {selectedTicket?.ticket_code}
            </li>
            <li>
              <strong>Parque: </strong> {selectedTicket?.namepark}
            </li>
            <li>
              <strong>Fecha: </strong>
              {formatDateToLocal(selectedTicket?.date_ticket || '')}
            </li>
            <li>
              <strong>Estado: </strong>{' '}
              <TicketStatus status={selectedTicket?.status || ''} />
            </li>
          </ul>
          {/* Resumen */}
          <h3 className="text-md mt-4 font-semibold">Resumen</h3>
          <ul className="mt-2 text-sm text-gray-700">
            {selectedTicket?.ticket_info?.map((info, index) => (
              <li key={index}>
                <strong>Tipo:</strong> {info?.type}, <strong>Cantidad:</strong>{' '}
                <span className="text-2xl font-bold text-green-600">
                  {info?.count}{' '}
                </span>
              </li>
            ))}
            <li className="mt-2">
              <strong>Factura Electrónica:</strong>{' '}
              {selectedTicket?.invoice_electronic === 1 ? 'Sí' : 'No'}
            </li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
