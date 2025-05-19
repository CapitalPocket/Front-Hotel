// types/next-auth.d.ts
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Define or import the Ticket type
export interface Ticket {
  id: string;
  name: string;
  selectedTicket: Ticket | null; // Ensure Ticket is defined or imported
}
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  status: string;
  selectedTicket: Ticket | null;
  onValidate: () => void;
}

declare module 'next-auth' {
  interface Session {
    user: {
      idUser?: string;
      park?: string;
      role?: string;
      changePass?: string;
    };
    accessToken ?: string;
  }
  interface User {
    idUser?: string;
    park?: string;
    role?: string;
    changePass?: string;
    token?: string;
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
      
  


