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
import { useParticipantsByStartclass, StartClassType, Result } from "@/hooks/useParticipants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define a mapping for our tab values to StartClassType
const tabToStartClassMap: Record<string, StartClassType> = {
    "männlich": "Maennlich",
    "weiblich": "Weiblich",
    "männlichü40": "Maennlich_Ue40",
    "weiiblichü40": "Weiblich_Ue40"
};

// Function to format start class to a more readable format
const formatStartClass = (startclass: StartClassType) => {
    switch (startclass) {
        case "Maennlich": return "Männlich";
        case "Weiblich": return "Weiblich";
        case "Maennlich_Ue40": return "Männlich Ü40";
        case "Weiblich_Ue40": return "Weiblich Ü40";
        default: return startclass;
    }
}

// Component to display leaderboard for a specific start class
function ClassLeaderboard({ startClass }: { startClass: StartClassType }) {
    const { participants, loading, error } = useParticipantsByStartclass(startClass);
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

    return (
        <>
            
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rankedParticipants.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
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
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </>
    );
}

export function LeaderboardTable() {
    const [activeTab, setActiveTab] = React.useState("männlich");

    return (
        <Tabs 
            defaultValue="männlich" 
            className="pt-5"
            onValueChange={setActiveTab}
        >
            <TabsList>
                <TabsTrigger value="männlich">Männlich</TabsTrigger>
                <TabsTrigger value="weiblich">Weiblich</TabsTrigger>
                <TabsTrigger value="männlichü40">Männlich Ü40</TabsTrigger>
                <TabsTrigger value="weiiblichü40">Weiblich Ü40</TabsTrigger>
            </TabsList>
            <TabsContent value="männlich">
                <ClassLeaderboard startClass="Maennlich" />
            </TabsContent>
            <TabsContent value="weiblich">
                <ClassLeaderboard startClass="Weiblich" />
            </TabsContent>
            <TabsContent value="männlichü40">
                <ClassLeaderboard startClass="Maennlich_Ue40" />
            </TabsContent>
            <TabsContent value="weiiblichü40">
                <ClassLeaderboard startClass="Weiblich_Ue40" />
            </TabsContent>
        </Tabs>
    )
}