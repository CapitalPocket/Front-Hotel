"use client";
import Asignacion from "@/app/ui/asignacion/asignacion";
import React from "react";

const Page = () => {
  return (
    <div className="w-full bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <Asignacion />
      </div>
    </div>
  );
};

export default Page;
