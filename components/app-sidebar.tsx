"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavSecondary } from "@/components/nav-secondary"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "./team-switcher"
import { url } from "inspector"
import { Folder, ChartNoAxesGantt, UsersRound, Users } from "lucide-react"
import { Separator } from "./ui/separator"

const data = {
  user: {
    name: "Dean Fünffrock",
    short: "DF",
    email: "deanfuenffrock@outlook.de",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Rocklands Saarlouis",
      logo: Users,
      plan: "Plan: Free Solo",
    },
    {
      name: "Rocklands St. Wendel",
      logo: Users,
      plan: "Plan: Toprope",
    },
  ],
  navMain: [
    {
      title: "Rocklands Cup 2025",
      url: "/dashboard/event/RocklandsCup2025",
      icon: ChartNoAxesGantt,
      isActive: false,
      items: [
        {
          title: "Übersicht",
          url: "/dashboard/event/RocklandsCup2025"
        },
      ]
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  archive: [
    {
      title: "Saarlouis Open 2024",
      url: "#",
      icon: Folder,
      isActive: false,
      items: [
        {
          title: "Teilnehmer",
          url: "#"
        },
        {
          title: "Ergebnisse",
          url: "#"
        },
        {
          title: "Statistik",
          url: "#"
        },
      ]
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/*<h1 className="font-bold text-3xl px-3 py-3 text-slate-700">NextisaJUG</h1>
      <Separator></Separator>*/}
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.archive} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
