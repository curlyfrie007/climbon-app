import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

import data from "./data.json"

export default function Page() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div>
                        <h1 className="px-4 lg:px-6 pt-4 text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">Hey, Dean!</h1>
                        <p className="px-4 lg:px-6 pt-1 max-w-[700px] text-lg text-muted-foreground">Wilkommen zurück bei ClimbOn.</p>
                    </div>

                    <DataTable data={data} />
                </div>
            </div>
        </div>
    )
}
