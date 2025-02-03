import Form from '@/app/ui/candidatos/create-form';
import Breadcrumbs from '@/app/ui/tickets/breadcrumbs';


export default async function Page() {

  const breadcrumbs = [
    { label: 'Empleados', href: '/dashboard/candidatos' },
    {
      label: 'Nuevo Empleado',
      href: '/dashboard/candidatos/create',
      active: true,
    }
  ];
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={breadcrumbs}
      />
      <Form />
    </main>
  );
}