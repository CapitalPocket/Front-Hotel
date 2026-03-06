import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import Image from 'next/image';

export default function SideNav(user: any) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-4 py-6 shadow-2xl md:px-4">
      <div className="mb-6 rounded-2xl border border-slate-700/80 bg-slate-800/70 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Capital Pocket</p>
        <p className="mt-1 text-lg font-semibold text-white">Hotel Dashboard</p>
      </div>
      <div className="mb-6 flex flex-col items-center rounded-2xl border border-slate-700 bg-slate-800/60 p-4 shadow-md">
        <div className="relative h-20 w-20">
          <Image
            src={'/customers/usuario.png'}
            className="rounded-full border-2 border-slate-400 shadow-md"
            width={80}
            height={80}
            alt="profile picture"
          />
        </div>
        <div className="mt-3 text-center text-white">
          <p className="text-base font-semibold">{user?.user?.name}</p>
          <p className="text-sm text-slate-400 capitalize">{user?.user?.role}</p>
        </div>
      </div>
      <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="mb-3 px-1 text-xs uppercase tracking-[0.2em] text-slate-500">Módulos</div>
        <nav className="flex flex-col space-y-2">
          <NavLinks rol={user?.user?.role} />
        </nav>
      </div>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}
        className="mt-4"
      >
        <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-400/50 bg-red-500/90 py-3 text-white font-medium hover:bg-red-600 transition-all duration-300 shadow-md">
          <PowerIcon className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </form>
    </div>
  );
}
