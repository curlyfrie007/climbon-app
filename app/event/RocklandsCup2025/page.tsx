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
    "title": "Rocklands Cup 2025",
    "type": "Wettkampf - Lead Climbing",
    "description": "🚀Endlich wieder Rocklandscup!🚀\nAm 12.04.2025 ist es soweit -- der beste, schönste, wildeste, legendärste Seilkletterwettkampf aller Zeiten steht an!🎉\nMotto? 'All you need is lead.' (Denn 'All you need is Magnesium und gute Ausreden' passte leider nicht auf die Plakate.) \nIhr wollt Action? Ihr bekommt sie! \nHier unsere 4 Kategorien:\n- Männlich\n- Weiblich\n- Ü40 männlich\n- Ü40 weiblich\n🧗‍♀️Die Quali -- ab 13:00 wird geliefert:\nVon 13:00 bis 18:00 Uhr könnt ihr euch an 8 epischen Wettkampfrouten so richtig austoben.\nJede Route hat 5 Zonengriffe -- klingt nach Spaß, oder?\nDie Summe eurer besten Ergebnisse minus die Anzahl der Versuche bis an die Zone/Top-Griffe pro Route ergibt am Ende eure Quali-Punktzahl.\nDas Ziel der Quali?\nEin Gesamtergebnis, das dir den goldenen Platz unter den besten 5 deiner Kategorie sichert.\nUnd wenn das klappt?\n🧗Zack, Finale, Baby!\n 19 Uhr, knallt's richtig!\nDie besten 5 aus jeder Kategorie kämpfen im Finale um Ruhm, Ehre und -- wie könnte es anders sein -- ein paar coole Preise unserer großartigen Sponsoren.\nWeil ein episches Finale auch"
}

export default function Page() {
    const pathname = usePathname()
    return (
        <div>
            <section className="grid items-center gap-6 pb-8 w-screen">
                <div className="flex flex-col items-start w-screen">
                    <div>
                        <div className="px-6 py-12 md:px-20 lg:px-40 md:py-20 w-screen bg-slate-100">
                            <p className="text-muted-foreground">{eventInfo.type}</p>
                            <h1 className="text-5xl font-extrabold leading-tight tracking-tighter md:text-7xl">
                                {eventInfo.title}
                            </h1>
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
                            <div className="flex gap-2 pt-5">
                                <Link href={pathname + "/participant/register"}><Button>Registrierung</Button></Link>
                                <Link href={pathname + "/participant/editor"}><Button variant={"outline"}>zum Ergebnisportal</Button></Link>
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
                        <h1 className="text-4xl text-bold">Teilnehmer</h1>
                        <LeaderboardTable></LeaderboardTable>
                    </div>
                </div>

            </section >
        </div >
    )
}