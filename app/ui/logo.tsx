import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function AcmeLogo() {
  return (
    <div
      className={`flex items-center   text-white`}>
      <Image src={'/customers/descarga.png'} alt="Metroparques.png" width={50} height={50} />
      <p className="text-xl">Hotel</p>
    </div>
  );
}
