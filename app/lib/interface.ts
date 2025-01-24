// types/next-auth.d.ts
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Ticket } from './definitions';

declare module 'next-auth' {
  interface Session {
    user: {
      idUser?: string;
      park?: string;
      role?: string;
      changePass?: string;
    };
  }
  interface User {
    idUser?: string;
    park?: string;
    role?: string;
    changePass?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: {
      role?: string;
      idUser?: string;
      park?: string;
      changePass?: string;
    };
  }
}
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  status: string;
  selectedTicket: Ticket | null;
  onValidate: () => void;
}
