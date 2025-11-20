import SideNav from '@/app/ui/dashboard/sidenav';
import { auth } from '@/auth';
import { SessionProvider } from '../context';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
 
  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen flex-col md:flex-row">
        <div className="w-full flex-none md:w-64 md:sticky md:top-0 md:h-screen">
          <SideNav user={session?.user || ''} />
        </div>
        <div className="flex-grow p-4 overflow-y-auto md:p-6">{children}</div>
      </div>
    </SessionProvider>
  );
}
