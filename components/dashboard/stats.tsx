"use client"

import * as React from "react"
import { useParticipantManager, StartClassType, Result } from "@/hooks/useParticipants"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue 
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

// Import recharts components for shadcn charts
import {
    Bar,
    BarChart,
    CartesianGrid,
    Label,
    Pie,
    PieChart,
    XAxis,
    YAxis
} from "recharts"

// Import shadcn chart components
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart"

export function CompetitionStatistics() {
    const { participants, participantsLoading, participantsError } = useParticipantManager()
    const [selectedClass, setSelectedClass] = React.useState<StartClassType | "all">("all")

    // Derived statistics
    const [stats, setStats] = React.useState({
        totalParticipants: 0,
        participantsByClass: {} as Record<StartClassType, number>,
        routeCompletionStats: {} as Record<string, number>,
        routeCompletionByClass: {} as Record<string, Record<StartClassType, number>>,
        averageZonesByRoute: {} as Record<string, number>,
        topPerformers: [] as { name: string, score: number, startclass: StartClassType }[],
        participantsWithAllRoutes: 0,
        averageAttemptsPerRoute: {} as Record<string, number>,
        zoneDistribution: {} as Record<number, number>,
    })

    // Format label for display
    const formatStartClass = (startclass: StartClassType) => {
        switch (startclass) {
            case "Maennlich": return "Männlich";
            case "Weiblich": return "Weiblich";
            case "Maennlich_Ue40": return "Männlich Ü40";
            case "Weiblich_Ue40": return "Weiblich Ü40";
            default: return startclass;
        }
    }

    // Class colors for charts
    const classColors = {
        "Maennlich": "hsl(var(--chart-1))",
        "Weiblich": "hsl(var(--chart-2))",
        "Maennlich_Ue40": "hsl(var(--chart-3))",
        "Weiblich_Ue40": "hsl(var(--chart-4))",
    }

    // Define chart config for donut chart
    const participantsChartConfig = {
        Maennlich: {
            label: "Männlich",
            color: classColors.Maennlich,
        },
        Weiblich: {
            label: "Weiblich",
            color: classColors.Weiblich,
        },
        Maennlich_Ue40: {
            label: "Männlich Ü40",
            color: classColors.Maennlich_Ue40,
        },
        Weiblich_Ue40: {
            label: "Weiblich Ü40",
            color: classColors.Weiblich_Ue40,
        },
    } satisfies ChartConfig

    // Define chart config for route charts
    const routeChartConfig = {
        value: {
            label: "Teilnehmer",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig

    // Define chart config for average charts
    const zoneChartConfig = {
        value: {
            label: "Durchschnittliche Zone",
            color: "hsl(var(--chart-3))",
        },
    } satisfies ChartConfig

    const attemptChartConfig = {
        value: {
            label: "Durchschnittliche Versuche",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig

    // Calculate statistics when participants data changes
    React.useEffect(() => {
        if (participantsLoading || !participants.length) return;

        const participantsByClass: Record<StartClassType, number> = {
            "Maennlich": 0,
            "Weiblich": 0,
            "Maennlich_Ue40": 0,
            "Weiblich_Ue40": 0
        };

        const routeCompletionStats: Record<string, number> = {};
        const routeCompletionByClass: Record<string, Record<StartClassType, number>> = {};
        const averageZonesByRoute: Record<string, number> = {};
        const averageAttemptsPerRoute: Record<string, number> = {};
        const zoneDistribution: Record<number, number> = {};

        let participantsWithAllRoutes = 0;

        // Initialize route stats
        for (let i = 1; i <= 8; i++) {
            const routeKey = `Route${i}`;
            routeCompletionStats[routeKey] = 0;
            routeCompletionByClass[routeKey] = {
                "Maennlich": 0,
                "Weiblich": 0,
                "Maennlich_Ue40": 0,
                "Weiblich_Ue40": 0
            };
            averageZonesByRoute[routeKey] = 0;
            averageAttemptsPerRoute[routeKey] = 0;
        }

        // Process each participant
        participants.forEach(participant => {
            // Count by class
            participantsByClass[participant.startclass]++;

            // Check if completed all routes
            let completedRoutes = 0;

            // Process each route
            for (let i = 1; i <= 8; i++) {
                const routeKey = `Route${i}` as keyof Result;
                const { zone, attempts } = participant.results[routeKey];

                // Count completed routes (zone > 0)
                if (zone > 0) {
                    routeCompletionStats[routeKey]++;
                    routeCompletionByClass[routeKey][participant.startclass]++;
                    completedRoutes++;

                    // Accumulate route scores and attempts for averages
                    averageZonesByRoute[routeKey] += zone;
                    averageAttemptsPerRoute[routeKey] += attempts;

                    // Track zone distribution
                    zoneDistribution[zone] = (zoneDistribution[zone] || 0) + 1;
                }
            }

            if (completedRoutes === 8) {
                participantsWithAllRoutes++;
            }
        });

        // Calculate averages
        for (let i = 1; i <= 8; i++) {
            const routeKey = `Route${i}`;
            const completions = routeCompletionStats[routeKey];
            if (completions > 0) {
                averageZonesByRoute[routeKey] = averageZonesByRoute[routeKey] / completions;
                averageAttemptsPerRoute[routeKey] = averageAttemptsPerRoute[routeKey] / completions;
            }
        }

        // Calculate top performers (by total score)
        const topPerformers = participants
            .map(p => {
                let totalScore = 0;
                for (let i = 1; i <= 8; i++) {
                    const routeKey = `Route${i}` as keyof Result;
                    const { zone, attempts } = p.results[routeKey];
                    totalScore += Math.max(0, zone - attempts);
                }
                return { name: p.name, score: totalScore, startclass: p.startclass };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        setStats({
            totalParticipants: participants.length,
            participantsByClass,
            routeCompletionStats,
            routeCompletionByClass,
            averageZonesByRoute,
            topPerformers,
            participantsWithAllRoutes,
            averageAttemptsPerRoute,
            zoneDistribution,
        });

    }, [participants, participantsLoading]);

    // Prepare chart data
    const prepareParticipantsByClassData = () => {
        return Object.entries(stats.participantsByClass).map(([startclass, count]) => ({
            browser: startclass,
            visitors: count,
            fill: `var(--color-${startclass})`,
        }));
    };

    const prepareRouteCompletionData = (startClass: StartClassType | "all") => {
        return Object.entries(stats.routeCompletionByClass).map(([route, classCounts]) => {
            const routeNumber = route.replace('Route', '');
            return {
                month: `R${routeNumber}`,
                desktop: startClass === "all" 
                    ? stats.routeCompletionStats[route]
                    : classCounts[startClass],
            };
        });
    };

    const prepareAverageZonesByRouteData = () => {
        return Object.entries(stats.averageZonesByRoute).map(([route, zone]) => ({
            month: route.replace('Route', 'R'),
            desktop: parseFloat(zone.toFixed(2))
        }));
    };

    const prepareAverageAttemptsByRouteData = () => {
        return Object.entries(stats.averageAttemptsPerRoute).map(([route, attempts]) => ({
            month: route.replace('Route', 'R'),
            desktop: parseFloat(attempts.toFixed(2))
        }));
    };

    // Loading state
    if (participantsLoading) {
        return (
            <div className="w-full p-8 text-center">
                <h1 className="text-2xl font-semibold mb-4">Wettbewerb Statistik</h1>
                <p>Lade Statistiken...</p>
            </div>
        );
    }

    // Error state
    if (participantsError) {
        return (
            <div className="w-full p-8 text-center">
                <h1 className="text-2xl font-semibold mb-4">Wettbewerb Statistik</h1>
                <p className="text-red-500">Fehler beim Laden der Statistiken.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h1 className="text-4xl font-bold mb-6">Statistik</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Participants Donut Chart */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle className="text-2xl">Teilnehmer</CardTitle>
                        <CardDescription>Aufschlüsselung nach Startklasse</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                            config={participantsChartConfig}
                            className="mx-auto aspect-square max-h-[250px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={prepareParticipantsByClassData()}
                                    dataKey="visitors"
                                    nameKey="browser"
                                    innerRadius={60}
                                    strokeWidth={5}
                                >
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            className="fill-foreground text-3xl font-bold"
                                                        >
                                                            {stats.totalParticipants}
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={(viewBox.cy || 0) + 24}
                                                            className="fill-muted-foreground"
                                                        >
                                                            Teilnehmer Gesamt
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                            return null;
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                    <CardContent className="text-center text-muted-foreground mt-2">
                        {stats.participantsWithAllRoutes} haben alle Routen abgeschlossen
                    </CardContent>
                </Card>

                {/* Top Performers Table */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl">Top Performer</CardTitle>
                        <CardDescription>Bestenliste nach Punkten</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Platz</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Klasse</TableHead>
                                    <TableHead className="text-right">Punkte</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.topPerformers.map((performer, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{performer.name}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                style={{ borderColor: classColors[performer.startclass] }}
                                            >
                                                {formatStartClass(performer.startclass)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{performer.score}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="route-completion" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="route-completion">Routen Fortschritt</TabsTrigger>
                    <TabsTrigger value="performance-metrics">Performance Metriken</TabsTrigger>
                </TabsList>

                {/* Route Completion Tab */}
                <TabsContent value="route-completion" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Routen Abschlussrate</CardTitle>
                                    <CardDescription>Anzahl der Teilnehmer, die jede Route abgeschlossen haben</CardDescription>
                                </div>
                                <Select
                                    value={selectedClass}
                                    onValueChange={(value) => setSelectedClass(value as StartClassType | "all")}
                                >
                                    <SelectTrigger className="w-44">
                                        <SelectValue placeholder="Alle Klassen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Alle Klassen</SelectItem>
                                        {Object.keys(stats.participantsByClass).map((startclass) => (
                                            <SelectItem key={startclass} value={startclass}>
                                                {formatStartClass(startclass as StartClassType)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={routeChartConfig}>
                                <BarChart
                                    accessibilityLayer
                                    data={prepareRouteCompletionData(selectedClass as StartClassType | "all")}
                                    layout="vertical"
                                    margin={{
                                        left: -20,
                                    }}
                                >
                                    <XAxis type="number" dataKey="desktop" hide />
                                    <YAxis
                                        dataKey="month"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={5} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Performance Metrics Tab */}
                <TabsContent value="performance-metrics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Average Zones Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Durchschnittlich erreichte Zone pro Route</CardTitle>
                                <CardDescription>Vergleich der durchschnittlich erreichten Zonenhöhe</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={zoneChartConfig}>
                                    <BarChart accessibilityLayer data={prepareAverageZonesByRouteData()}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Average Attempts Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Durchschnittliche Versuche pro Route</CardTitle>
                                <CardDescription>Vergleich der durchschnittlichen Anzahl an Versuchen</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={attemptChartConfig}>
                                    <BarChart accessibilityLayer data={prepareAverageAttemptsByRouteData()}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}