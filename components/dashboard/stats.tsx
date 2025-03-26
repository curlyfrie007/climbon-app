"use client"

import * as React from "react"
import { useParticipantManager, StartClassType, Result } from "@/hooks/useParticipants"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    LineChart,
    Line
} from "recharts"

export function CompetitionStatistics() {
    const { participants, participantsLoading, participantsError } = useParticipantManager()

    // Derived statistics
    const [stats, setStats] = React.useState({
        totalParticipants: 0,
        participantsByClass: {} as Record<StartClassType, number>,
        routeCompletionStats: {} as Record<string, number>,
        routeCompletionByClass: {} as Record<string, Record<StartClassType, number>>,
        averageScoresByRoute: {} as Record<string, number>,
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
        "Maennlich": "#2563eb", // blue
        "Weiblich": "#db2777", // pink
        "Maennlich_Ue40": "#1e40af", // indigo
        "Weiblich_Ue40": "#9d174d", // fuchsia
    }

    // Route colors for charts
    const routeColors = [
        "#ef4444", // red
        "#f97316", // orange
        "#f59e0b", // amber
        "#84cc16", // lime
        "#10b981", // emerald
        "#06b6d4", // cyan
        "#3b82f6", // blue
        "#8b5cf6", // violet
    ]

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
        const averageScoresByRoute: Record<string, number> = {};
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
            averageScoresByRoute[routeKey] = 0;
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
                    averageScoresByRoute[routeKey] += Math.max(0, zone - attempts);
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
                averageScoresByRoute[routeKey] = averageScoresByRoute[routeKey] / completions;
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
            averageScoresByRoute,
            topPerformers,
            participantsWithAllRoutes,
            averageAttemptsPerRoute,
            zoneDistribution,
        });

    }, [participants, participantsLoading]);

    // Prepare chart data
    const prepareParticipantsByClassData = () => {
        return Object.entries(stats.participantsByClass).map(([startclass, count]) => ({
            name: formatStartClass(startclass as StartClassType),
            value: count,
            color: classColors[startclass as keyof typeof classColors],
        }));
    };

    const prepareRouteCompletionData = () => {
        return Object.entries(stats.routeCompletionStats).map(([route, count]) => ({
            name: route.replace('Route', 'R'),
            value: count,
            total: stats.totalParticipants,
            percentage: (count / stats.totalParticipants) * 100,
        }));
    };

    const prepareRouteCompletionByClassData = () => {
        const categories = Object.keys(stats.routeCompletionByClass).map(route =>
            route.replace('Route', 'R')
        );

        const series = Object.keys(stats.participantsByClass).map(startclass => ({
            name: formatStartClass(startclass as StartClassType),
            data: categories.map((_, index) => {
                const routeKey = `Route${index + 1}`;
                return stats.routeCompletionByClass[routeKey][startclass as StartClassType];
            }),
            color: classColors[startclass as keyof typeof classColors]
        }));

        return { categories, series };
    };

    const prepareAverageScoresByRouteData = () => {
        return Object.entries(stats.averageScoresByRoute).map(([route, score], index) => ({
            name: route.replace('Route', 'R'),
            score: parseFloat(score.toFixed(2)),
            attempts: parseFloat(stats.averageAttemptsPerRoute[route].toFixed(2)),
            fill: routeColors[index]
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
            <h1 className="text-4xl font-bold mb-6">Wettbewerb Statistik</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Total Participants Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl">Gesamt Teilnehmer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.totalParticipants}</div>
                        <p className="text-muted-foreground">
                            {stats.participantsWithAllRoutes} haben alle Routen abgeschlossen
                        </p>
                    </CardContent>
                </Card>

                {/* Participants by Class Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl">Teilnehmer pro Klasse</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.participantsByClass).map(([startclass, count]) => (
                                <Badge
                                    key={startclass}
                                    variant="outline"
                                    className="text-base py-1 px-2"
                                    style={{ borderColor: classColors[startclass as keyof typeof classColors] }}
                                >
                                    {formatStartClass(startclass as StartClassType)}: {count}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performers Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl">Top Performer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.topPerformers.slice(0, 3).map((performer, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div>
                                        <span className="font-semibold text-base">{performer.name}</span>
                                        <Badge
                                            variant="outline"
                                            className="ml-2"
                                            style={{ borderColor: classColors[performer.startclass] }}
                                        >
                                            {formatStartClass(performer.startclass)}
                                        </Badge>
                                    </div>
                                    <span className="font-bold">{performer.score} Punkte</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="route-completion" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="route-completion">Routen Fortschritt</TabsTrigger>
                    <TabsTrigger value="class-analysis">Klassen Analyse</TabsTrigger>
                    <TabsTrigger value="performance-metrics">Performance Metriken</TabsTrigger>
                </TabsList>

                {/* Route Completion Tab */}
                <TabsContent value="route-completion" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Route Completion Progress Bars */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Routen Abschlussrate</CardTitle>
                                <CardDescription>Prozentsatz der Teilnehmer, die jede Route abgeschlossen haben</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(stats.routeCompletionStats).map(([route, count], index) => {
                                        const percentage = Math.round((count / stats.totalParticipants) * 100);
                                        return (
                                            <div key={route} className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium">{route}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {count}/{stats.totalParticipants} ({percentage}%)
                                                    </span>
                                                </div>
                                                <Progress value={percentage} className="h-2" style={{
                                                    "--progress-foreground": routeColors[index]
                                                } as React.CSSProperties} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Route Completion Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Routen Abschlussraten</CardTitle>
                                <CardDescription>Visueller Vergleich der Abschlussraten</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={prepareRouteCompletionData()}>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number, name: string, props: any) => [
                                                    `${value} Teilnehmer (${props.payload.percentage.toFixed(1)}%)`,
                                                    'Abschlüsse'
                                                ]}
                                            />
                                            <Bar dataKey="value" fill="#8884d8">
                                                {prepareRouteCompletionData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={routeColors[index]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Class Analysis Tab */}
                <TabsContent value="class-analysis" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Distribution by Class Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Teilnehmer nach Startklasse</CardTitle>
                                <CardDescription>Verteilung der Teilnehmer nach Startklasse</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={prepareParticipantsByClassData()}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                                label={({ name, value }) => `${name}: ${value}`}
                                            >
                                                {prepareParticipantsByClassData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} Teilnehmer`, '']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Route Completion by Class */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Routen Abschluss nach Klasse</CardTitle>
                                <CardDescription>Vergleich der Abschlussraten nach Startklasse</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={prepareRouteCompletionData()}
                                            layout="vertical"
                                            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" />
                                            <Tooltip />
                                            <Legend />
                                            {Object.keys(stats.participantsByClass).map((startclass, index) => {
                                                const routeData = Array(8).fill(0).map((_, i) => {
                                                    const routeKey = `Route${i + 1}`;
                                                    return {
                                                        name: routeKey.replace('Route', 'R'),
                                                        [startclass]: stats.routeCompletionByClass[routeKey][startclass as StartClassType]
                                                    };
                                                });

                                                return (
                                                    <Bar
                                                        key={startclass}
                                                        dataKey={startclass}
                                                        stackId="a"
                                                        fill={classColors[startclass as keyof typeof classColors]}
                                                        name={formatStartClass(startclass as StartClassType)}
                                                    />
                                                );
                                            })}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Performance Metrics Tab */}
                <TabsContent value="performance-metrics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Average Scores Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Durchschnittliche Punktzahlen pro Route</CardTitle>
                                <CardDescription>Vergleich der durchschnittlichen Punktzahl (Zone - Versuche)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={prepareAverageScoresByRouteData()}>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number) => [`${value.toFixed(1)}`, 'Ø Punktzahl']}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="score"
                                                name="Ø Punktzahl"
                                            >
                                                {prepareAverageScoresByRouteData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Average Attempts Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Durchschnittliche Versuche pro Route</CardTitle>
                                <CardDescription>Vergleich der durchschnittlichen Anzahl an Versuchen</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={prepareAverageScoresByRouteData()}>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number) => [`${value.toFixed(1)}`, 'Ø Versuche']}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="attempts"
                                                stroke="#ff7300"
                                                name="Ø Versuche"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}