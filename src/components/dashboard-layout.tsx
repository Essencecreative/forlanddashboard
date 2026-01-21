import type React from "react"

import { useState } from "react"
import { SidebarProvider } from "./ui/sidebar"
import DashboardSidebar from "./dashboard-sidebar"
import DashboardHeader from "./dashboard-header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [pageTitle] = useState("Dashboard")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex w-full flex-1 flex-col">
          <DashboardHeader title={pageTitle} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
