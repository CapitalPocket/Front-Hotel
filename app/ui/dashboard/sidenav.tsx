import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import Image from 'next/image';

export default function SideNav(user: any) {
  return (

    <div className="flex h-full flex-col px-4 py-6 bg-gray-900 shadow-xl  md:px-3">
      {/* Perfil de Usuario */}
      <div className="mb-6 flex flex-col items-center p-4  bg-gray-800 shadow-md">
        <div className="relative w-20 h-20">

          <Image
            src={'/customers/usuario.png'}
            className="rounded-full border-2 border-gray-400 shadow-md"
            width={80}
            height={80}
            alt="profile picture"
          />
        </div>

        <div className="mt-3 text-center text-white">
          <p className="text-lg font-semibold">{user?.user?.name}</p>
          <p className="text-sm text-gray-400 capitalize">{user?.user?.role}</p>
          

        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex flex-col space-y-2">
        <NavLinks rol={user?.user?.role} />
      </nav>

      {/* Botón de Cerrar Sesión */}
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}
        className="mt-auto"
      >
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all duration-300 shadow-md">
          <PowerIcon className="w-6 h-6" />
          <span>Cerrar sesión</span>
        </button>
      </form>
    </div>
  );
}
