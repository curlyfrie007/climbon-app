"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"



export function NavigationBar() {
  const pathname = usePathname()

  return (
    <NavigationMenu defaultValue="start">
      <NavigationMenuList>
        <NavigationMenuItem value="start">
          <Link href={pathname} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Start
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem value="participants">
          <Link href={pathname + "/participants"} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Teilnehmer
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem value="results">
          <Link href={pathname + "/results"} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Ergebnisse
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
