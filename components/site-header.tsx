"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NavigationBar } from "@/components/navigation-bar"
import { usePathname } from 'next/navigation'

export function SiteHeader() {
  const pathname = usePathname().split('/');
  return (
    <header className="flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-baseline px-6 py-5 gap-2 md:px-10">
        {/* <SidebarTrigger className="-ml-1" /> 
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />*/}
        <h1 className="text-3xl font-extrabold">Rocklands Cup 2025</h1>
        {/* <h1 className="text-base font-light text-muted-foreground"> \ Event</h1> */}
        {/* <NavigationBar></NavigationBar> */}
      </div>
    </header>
  )
}
