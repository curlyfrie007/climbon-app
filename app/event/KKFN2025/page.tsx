"use client"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from 'react-markdown';

import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { NavigationBar } from "@/components/navigation-bar"
import { Calendar, Trophy } from "lucide-react";
import { usePathname } from "next/navigation";
import { LeaderboardTable } from "@/components/dashboard/leaderboard";

const eventInfo = {
    "title": "Keine Kraft Für Niemand 2025",
    "type": "Boulderwettkampf",
}

export default function Page() {
    const pathname = usePathname()
    return (
        <div>
            <section className="grid items-center gap-6 pb-8 w-screen">
                <div className="flex flex-col items-start w-screen">
                    <div>
                        <div className="px-6 py-12 md:px-20 lg:px-40 md:py-20 w-screen bg-[url('/kkfnkachel.JPG')] md:h-[300px] bg-cover bg-center aspect-[2/1.8] flex flex-col items-start justify-end">
                            {/* <div className="pt-4 flex flex-col text-left sm:flex-row sm:text-center gap-4">
                            <Link
                                href={"#"}
                                target="_blank"
                                rel="noreferrer"
                                className={buttonVariants()}
                            >
                                Documentation
                            </Link>
                            <Link
                                target="_blank"
                                rel="noreferrer"
                                href={"#"}
                                className={buttonVariants({ variant: "outline" })}
                            >
                                GitHub
                            </Link>
                        </div> */}
                            <div className="flex flex-col items-stretch gap-2 pt-5 ">
                                <Link href={pathname + "/participant/register"}><Button variant={"outline"} className="shadow-xl shadow-neutral-400">Registrierung</Button></Link>
                                <Link href={pathname + "/participant/editor"}><Button variant={"default"} className="shadow-xl shadow-neutral-400">zum Ergebnisportal</Button></Link>
                            </div>
                        </div>
                        <Separator></Separator>
                    </div>
                    <div className="px-4 md:px-20 lg:px-40 flex flex-col w-screen pt-6">
                        {/* <Card className="-mt-14">
                            <CardHeader>
                                <CardTitle>Wann?</CardTitle>
                                <CardDescription className="flex flex-row items-center gap-1"><Calendar size={"16"} />Samstag, 12.04.2025</CardDescription>
                            </CardHeader>
                            <CardHeader>
                                <CardTitle>Ablauf</CardTitle>
                                <CardDescription className="flex flex-row items-center gap-1">Qualifikation: 13:00 Uhr</CardDescription>
                                <CardDescription className="flex flex-row items-center gap-1">Finale: 18:00 Uhr</CardDescription>
                            </CardHeader>
                            <CardFooter>

                            </CardFooter>
                        </Card> */}

                        {/* <div className="flex flex-row ">
                            <NavigationBar></NavigationBar>
                            <div className="text-lg text-muted-foreground pt-4">
                                <h1>Infos</h1>
                            </div>
                        </div> */}
                        <h1 className="text-4xl text-bold">Teilnehmer und Ergebnisse</h1>
                        <LeaderboardTable></LeaderboardTable>
                    </div>
                </div>

            </section >
        </div >
    )
}