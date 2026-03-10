import LoginForm from '@/app/ui/login-form';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-80px] h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[460px] w-[460px] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:flex-row lg:items-stretch lg:px-10">
        <section className="flex flex-1 items-center py-8 lg:py-0">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
              Panel Hoteles
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-5xl">
              Gestión hotelera inteligente para recepción, limpieza y supervisión
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-300 md:text-lg">
              Centraliza habitaciones, personal y operación diaria en un solo panel diseñado para equipos de hotel.
            </p>
          </div>
        </section>

        <section className="mt-8 flex w-full lg:mt-0 lg:w-auto lg:items-center lg:justify-end">
          <div className="w-full border-l-4 border-cyan-300 bg-slate-900/85 px-6 py-8 shadow-2xl shadow-slate-950/70 backdrop-blur md:max-w-[460px] md:px-8 lg:min-h-[540px] lg:w-[460px] lg:py-12">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
