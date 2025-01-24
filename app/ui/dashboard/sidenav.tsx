import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import Image from 'next/image';

export default function SideNav(user: any) {

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <div className="mb-4 flex transform items-center justify-start rounded-lg bg-gradient-to-r from-gray-300 to-gray-500 p-4 shadow-lg transition-all duration-300 ease-in-out ">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-50">
          <Image
            src={'/customers/usuario.png'}
            className="rounded-full"
            width={100}
            height={100}
            alt={`profile picture`}
          />
        </div>
        <div className="ml-4 text-white">
          <p className="text-xl font-semibold tracking-wide capitalize">
            {user?.user?.name}
          </p>
          <p className="text-xs opacity-80 capitalize">{user?.user?.role}</p>
          <p className="text-xs opacity-80 capitalize">{user?.user?.park > 2 ? '' : user?.user?.park == 1 ? 'Parque Norte' : 'Aeroparque'}</p>
        </div>
      </div>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks rol={user?.user?.role} />
        <div className="hidden h-auto w-full grow rounded-md  md:block"></div>

        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button className="absolute md:relative mb-[2rem] top-[2rem] right-[2rem] md:bottom-4 md:right-0 w-auto flex h-[48px] md:w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-slate-400/30 hover:text-gray-500 md:flex-none md:justify-start md:p-2 md:px-3 shadow-lg">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Salir</div>
          </button>
        </form>
      </div>
    </div>
  );
}
