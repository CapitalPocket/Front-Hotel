
'use client';

import Link from 'next/link';

export function CreateHotel({ grupo }: { grupo: string }) {
  return (
    <Link href="/dashboard/redenciones/edit">
      <button
        type="button"
        className="bg-gray-500 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg transition"
      >
        Editar Hotel
      </button>
    </Link>
  );
}
