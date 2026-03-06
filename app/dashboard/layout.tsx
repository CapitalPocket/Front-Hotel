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
      <div className="flex min-h-screen flex-col bg-slate-100 md:flex-row">
        <div className="w-full flex-none md:h-screen md:w-72 md:sticky md:top-0">
          <SideNav user={session?.user || ''} />
        </div>
        <div className="flex-grow overflow-y-auto p-4 md:p-8">{children}</div>
      </div>
    </SessionProvider>
  );
}
