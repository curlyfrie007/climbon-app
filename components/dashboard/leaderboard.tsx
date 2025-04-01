"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useParticipants, StartClassType, Result } from "@/hooks/useParticipants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LeaderboardTable() {
    const { participants, loading, error } = useParticipants();
    const [rankedParticipants, setRankedParticipants] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (participants && participants.length > 0) {
            // Calculate total score for each participant
            const participantsWithScore = participants.map(participant => {
                const score = calculateTotalScore(participant);
                return {
                    ...participant,
                    totalScore: score,
                };
            });

            // Sort by score (descending)
            const sorted = [...participantsWithScore].sort((a, b) => b.totalScore - a.totalScore);

            // Add rank property
            const ranked = sorted.map((participant, index) => ({
                ...participant,
                rank: index + 1
            }));

            setRankedParticipants(ranked);
        }
    }, [participants]);

    // Calculate total score (zone - attempts for each route)
    const calculateTotalScore = (participant: any) => {
        const results = participant.results;
        let totalScore = 0;

        for (let i = 1; i <= 8; i++) {
            const routeKey = `Route${i}` as keyof Result;
            totalScore += Math.max(0, results[routeKey].zone - results[routeKey].attempts);
        }

        return totalScore;
    }

    // Function to map start class to a more readable format
    const formatStartClass = (startclass: StartClassType) => {
        switch (startclass) {
            case "Maennlich": return "Männlich";
            case "Weiblich": return "Weiblich";
            case "Maennlich_Ue40": return "Männlich Ü40";
            case "Weiblich_Ue40": return "Weiblich Ü40";
            default: return startclass;
        }
    }

    return (
        <>
            <Tabs defaultValue="männlich" className="w-[400px] pt-5">
                <TabsList>
                    <TabsTrigger value="männlich">Männlich</TabsTrigger>
                    <TabsTrigger value="weiblich">Weiblich</TabsTrigger>
                    <TabsTrigger value="männlichü40">Männlich Ü40</TabsTrigger>
                    <TabsTrigger value="weiiblichü40">Weiblich Ü40</TabsTrigger>
                </TabsList>
                <TabsContent value="männlich">
                    <CardHeader>
                    <CardTitle></CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pt-4">
                        {loading ? (
                            <div className="flex justify-center p-4">Lädt...</div>
                        ) : error ? (
                            <div className="text-red-500 p-4">Fehler beim Laden der Teilnehmer</div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">Rang</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Punkte</TableHead>
                                            <TableHead>Startklasse</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rankedParticipants.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    Keine Teilnehmer gefunden.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            rankedParticipants.map((participant) => (
                                                <TableRow key={participant.id}>
                                                    <TableCell className="font-medium">
                                                        {participant.rank}
                                                    </TableCell>
                                                    <TableCell>{participant.name}</TableCell>
                                                    <TableCell>{participant.totalScore}</TableCell>
                                                    <TableCell>{formatStartClass(participant.startclass)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </TabsContent>
                <TabsContent value="weiblich">Change your password here.</TabsContent>
                <TabsContent value="männlichü40">Make changes to your account here.</TabsContent>
                <TabsContent value="weiblichü40">Change your password here.</TabsContent>
            </Tabs>
        </>
    )
}