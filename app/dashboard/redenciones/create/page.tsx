"use client";

import Form from '@/app/ui/redentions/create-form';
import Breadcrumbs from '@/app/ui/tickets/breadcrumbs';

export default function Page() {
  const breadcrumbs = [
    { label: 'Hoteles', href: '/dashboard/redenciones' },
    { label: 'Editar Hotel', href: '/dashboard/redenciones/create', active: true },
  ];

  return (
    <main>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <Form />
    </main>
  );
}
