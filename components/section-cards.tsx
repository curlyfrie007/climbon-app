import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { ArrowUpRight, Calendar, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button"
import Link from "next/link"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Aufrufe</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            238
          </CardTitle>
          <CardAction>
            <Link href={"#"}>
              <Badge variant="outline">
                Übersicht
                <ArrowUpRight />
              </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Rocklands Cup <Calendar className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Seit 20.03.2025
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Anmeldungen</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            34
          </CardTitle>
          <CardAction>
            <Link href={"#"}>
              <Badge variant="outline">
                Übersicht
                <ArrowUpRight />
              </Badge>
            </Link>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Rocklands Cup <Calendar className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Seit 20.03.2025
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
