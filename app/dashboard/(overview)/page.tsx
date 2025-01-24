import Marketing from '@/app/ui/dashboard/marketing';

const Page = ({ children }: any) => {

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <Marketing />
    </main>
  );
};

export default Page;
