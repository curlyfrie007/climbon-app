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
// Import the correct types and hooks
import { useParticipantsByStartclass, StartclassKKFN, ResultKKFN, ParticipantKKFN } from "@/hooks/useParticipants" // Ensure ParticipantKKFN is imported if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react" // Import Loader

// --- Updated Score Calculation ---
// Calculate score based on completed boulders
const calculateScore = (participant: ParticipantKKFN): number => {
    // Add defensive check for results and boulders
    return participant?.results?.boulders?.filter(b => b === true).length ?? 0;
};

// Helper to get the timestamp for sorting (earlier is better)
// Returns milliseconds since epoch, or Infinity if no time (ranks last in ties)
const getSortableTimestamp = (participant: ParticipantKKFN): number => {
    // Add defensive check
    if (!participant?.results?.lastUpdateTime) {
        return Infinity; // Participants with no updates rank last in ties
    }
    try {
        const time = new Date(participant.results.lastUpdateTime).getTime();
        // Check if the parsed time is valid
        return isNaN(time) ? Infinity : time;
    } catch (e) {
        console.error("Error parsing lastUpdateTime:", participant.results.lastUpdateTime, e);
        return Infinity; // Handle invalid date strings
    }
};


// Function to format start class (already correct)
const formatStartClass = (startclass: StartclassKKFN) => {
    switch (startclass) {
        case "Männlich": return "Männlich";
        case "Weiblich": return "Weiblich";
        default: return startclass;
    }
}

// Component to display leaderboard for a specific start class
function ClassLeaderboard({ startClass }: { startClass: StartclassKKFN }) {
    // Fetch participants for the specific class
    const { participants, loading, error } = useParticipantsByStartclass(startClass);
    // State should hold ranked participants with the correct type
    const [rankedParticipants, setRankedParticipants] = React.useState<Array<ParticipantKKFN & { rank: number; score: number }>>([]);

    React.useEffect(() => {
        if (participants && participants.length > 0) {
            // Calculate score for each participant
            const participantsWithScore = participants.map(participant => {
                const score = calculateScore(participant); // Use updated score function
                const timestamp = getSortableTimestamp(participant);
                return {
                    ...participant,
                    score: score,
                    sortTime: timestamp, // Add timestamp for sorting
                };
            });

            // Sort by score (descending), then by time (ascending - earlier is better)
            const sorted = [...participantsWithScore].sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score; // Higher score first
                }
                return a.sortTime - b.sortTime; // Earlier time first for ties
            });

            // Add rank property - handle ties correctly
            let currentRank = 0;
            let lastScore = -1;
            let lastTime = Infinity;
            const ranked = sorted.map((participant, index) => {
                 if (participant.score !== lastScore || participant.sortTime !== lastTime) {
                    currentRank = index + 1;
                    lastScore = participant.score;
                    lastTime = participant.sortTime;
                }
                // Ensure the participant object spread here matches ParticipantKKFN structure
                // and includes the calculated rank and score
                return {
                    ...participant, // Spreads ParticipantKKFN fields + score + sortTime
                    rank: currentRank
                };
            });

            setRankedParticipants(ranked);
        } else {
            setRankedParticipants([]); // Clear if no participants
        }
    }, [participants]); // Rerun effect when participants data changes

    return (
        <>
            {/* Removed CardHeader with PDF button from here, moved to parent */}
            <CardContent className="px-0 pt-4">
                {loading ? (
                    <div className="flex justify-center items-center p-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : error ? (
                    <div className="text-red-500 p-4 text-center">Fehler beim Laden: {error}</div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">Rang</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-center">Tops</TableHead> {/* Updated Header */}
                                    <TableHead className="text-center">Zuletzt Aktualisiert</TableHead> {/* New Header */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rankedParticipants.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Keine Teilnehmer in dieser Klasse gefunden.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rankedParticipants.map((participant) => (
                                        <TableRow key={participant.id}>
                                            <TableCell className="font-medium text-center">
                                                {participant.rank}
                                            </TableCell>
                                            <TableCell>{participant.name}</TableCell>
                                            {/* Display score (tops) / target */}
                                            <TableCell className="text-center">{participant.score}/{participant.startclass === 'Weiblich' ? 28 : 35}</TableCell>
                                            {/* Display last update time */}
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                 {participant.results?.lastUpdateTime
                                                    ? new Date(participant.results.lastUpdateTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
                                                    : '-'}
                                            </TableCell>
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

// Main component displayed on the page
export function LeaderboardTable() {
    // Default to 'Männlich', ensure type matches StartclassKKFN
    const [activeTab, setActiveTab] = React.useState<StartclassKKFN>("Männlich");

    return (
        <Tabs
            value={activeTab} // Controlled component
            className="pt-5"
            onValueChange={(value) => setActiveTab(value as StartclassKKFN)} // Update state on change
        >
            <TabsList>
                {/* Use correct values matching StartclassKKFN */}
                <TabsTrigger value="Männlich">Männlich</TabsTrigger>
                <TabsTrigger value="Weiblich">Weiblich</TabsTrigger>
                {/* Remove Ü40 tabs */}
            </TabsList>
            <TabsContent value="Männlich">
                {/* Pass the correct StartclassKKFN value */}
                <ClassLeaderboard startClass="Männlich" />
            </TabsContent>
            <TabsContent value="Weiblich">
                {/* Pass the correct StartclassKKFN value */}
                <ClassLeaderboard startClass="Weiblich" />
            </TabsContent>
            {/* Remove Ü40 Tab Contents */}
        </Tabs>
    )
}

// Note: The LeaderboardTableDashboard component and its PDF generation logic
// were removed as they seemed specific to the admin dashboard context
// and were causing confusion with the separate LeaderboardTable component
// used on the public event page. If PDF generation is needed here,
// it should be added back carefully within the LeaderboardTable structure.
