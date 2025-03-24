import LoginPage from './login/page';
export default function Page() {
  return (
    <main className="flex items-center justify-center md:h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <LoginPage/>
      </div>
    </main>
  );
}