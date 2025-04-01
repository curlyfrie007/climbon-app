import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import data from "./data.json"
import { Suspense } from "react"

export default function DashboardLayout({ children, }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="sidebar" />
            <SidebarInset className="max-h-screen">
                <SiteHeader />
                <Suspense fallback="<p>Loading</p>">
                {children}
                </Suspense>
            </SidebarInset>
        </SidebarProvider>
    )
}