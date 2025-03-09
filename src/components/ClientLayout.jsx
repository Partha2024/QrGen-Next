"use client";

import { useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner";

export default function ClientLayout({ children }) {
  const { user } = useContext(AuthContext);

  return (
    <>
      {user && <AppSidebar />}
      <main>
        {user && <SidebarTrigger className="absolute" />}
        {children}
      </main>
      <Toaster richColors />
    </>
  );
}
