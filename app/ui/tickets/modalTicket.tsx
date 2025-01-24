'use client';

import { validateTicket } from '@/app/lib/actions';
import { ModalProps } from '@/app/lib/interface';
import React from 'react';

export default function Modal({
  isOpen,
  onClose,
  children,
  status,
  selectedTicket,
  onValidate,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        {children}
        <div className="mt-4 flex gap-2">
          {status === 'Valido' && (
            <>
              <button
                className="flex-1 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                onClick={onValidate}
              >
                Validar Entrada
              </button>
              <button
                className="flex-1 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                onClick={onClose}
              >
                Cerrar
              </button>
            </>
          )}
          {['Usado', 'Cancelado', 'Devolucion'].includes(status) && (
            <button
              className="w-full rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              onClick={onClose}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
