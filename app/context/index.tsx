"use client";
import React, { createContext, useContext, ReactNode } from "react";

interface SessionContextProps {
  session: any; // Cambia `any` a un tipo más específico si lo conoces
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context.session;
};

export const SessionProvider = ({
  children,
  session,
}: {
  children: ReactNode;
  session: any;
}) => {
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};
