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
import { toast } from "sonner"
// Import the correct types and hooks
import { useParticipants, useParticipantsByStartclass, StartclassKKFN, ResultKKFN, ParticipantKKFN } from "@/hooks/useParticipants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { Loader2 } from "lucide-react" // Import Loader

// Function to format start class (already correct)
const formatStartClass = (startclass: StartclassKKFN) => {
    switch (startclass) {
        case "Männlich": return "Männlich";
        case "Weiblich": return "Weiblich";
        default: return startclass;
    }
}

// --- Updated Score Calculation ---
// Calculate score based on completed boulders
const calculateScore = (participant: ParticipantKKFN): number => {
    return participant.results?.boulders?.filter(b => b).length ?? 0;
};

// Helper to get the timestamp for sorting (earlier is better)
// Returns milliseconds since epoch, or Infinity if no time (ranks last in ties)
const getSortableTimestamp = (participant: ParticipantKKFN): number => {
    if (!participant.results?.lastUpdateTime) {
        return Infinity; // Participants with no updates rank last in ties
    }
    try {
        return new Date(participant.results.lastUpdateTime).getTime();
    } catch (e) {
        return Infinity; // Handle invalid date strings
    }
};


// Component to display leaderboard for a specific start class
function ClassLeaderboard({ startClass }: { startClass: StartclassKKFN }) {
    const { participants, loading, error } = useParticipantsByStartclass(startClass);
    // State should hold ranked participants with the correct type
    const [rankedParticipants, setRankedParticipants] = React.useState<Array<ParticipantKKFN & { rank: number; score: number }>>([]);
    const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);

    React.useEffect(() => {
        if (participants && participants.length > 0) {
            // Calculate score for each participant
            const participantsWithScore = participants.map(participant => {
                const score = calculateScore(participant); // Use updated function
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

            // Add rank property - handle ties correctly (same rank for same score/time)
            let currentRank = 0;
            let lastScore = -1;
            let lastTime = Infinity;
            const ranked = sorted.map((participant, index) => {
                 if (participant.score !== lastScore || participant.sortTime !== lastTime) {
                    currentRank = index + 1;
                    lastScore = participant.score;
                    lastTime = participant.sortTime;
                }
                return {
                    ...participant,
                    rank: currentRank
                };
            });

            setRankedParticipants(ranked);
        } else {
            setRankedParticipants([]);
        }
    }, [participants]);


    const handleDownloadPdf = async () => {
        setIsPdfGenerating(true);
        try {
            const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // A4

            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            const fontSize = 11; // Slightly smaller font for potentially more rows
            const headerFontSize = 14;
            const titleFontSize = 18;
            const rowHeight = 25; // Adjusted row height
            const tableTop = page.getHeight() - 120; // Start table lower
            const tableLeft = 50;
            const colWidths = [40, 280, 60, 100]; // Adjusted widths: Rank, Name, Tops, Last Update
            const tableWidth = colWidths.reduce((a, b) => a + b, 0);

            // --- PDF Header ---
            page.drawText("KKFN2025 Rangliste", { // Updated Title
                x: tableLeft,
                y: page.getHeight() - 50,
                size: titleFontSize, font: helveticaBold, color: rgb(0, 0, 0),
            });
            page.drawText(`Kategorie: ${formatStartClass(startClass)}`, {
                x: tableLeft,
                y: page.getHeight() - 75,
                size: headerFontSize, font: helveticaBold, color: rgb(0, 0, 0),
            });
            const currentDate = new Date().toLocaleString('de-DE'); // Include time
            page.drawText(`Erstellt am: ${currentDate}`, {
                x: tableLeft,
                y: page.getHeight() - 95,
                size: 10, font: helveticaFont, color: rgb(0.5, 0.5, 0.5),
            });

            // --- PDF Table Headers ---
            let currentX = tableLeft;
            page.drawText("Rang", { x: currentX + 5, y: tableTop, size: fontSize, font: helveticaBold }); currentX += colWidths[0];
            page.drawText("Name", { x: currentX + 5, y: tableTop, size: fontSize, font: helveticaBold }); currentX += colWidths[1];
            page.drawText("Tops", { x: currentX + 5, y: tableTop, size: fontSize, font: helveticaBold }); currentX += colWidths[2]; // Updated Header
            page.drawText("Letztes Update", { x: currentX + 5, y: tableTop, size: fontSize, font: helveticaBold }); // New Header

            page.drawLine({ start: { x: tableLeft, y: tableTop - 5 }, end: { x: tableLeft + tableWidth, y: tableTop - 5 }, thickness: 1, color: rgb(0, 0, 0) });

            // --- PDF Table Rows ---
            rankedParticipants.forEach((participant, index) => {
                const rowY = tableTop - 20 - (index * rowHeight);
                if (rowY < 40) return; // Stop if near bottom margin

                let currentX = tableLeft;
                page.drawText(participant.rank.toString(), { x: currentX + 5, y: rowY, size: fontSize, font: helveticaFont }); currentX += colWidths[0];
                page.drawText(participant.name, { x: currentX + 5, y: rowY, size: fontSize, font: helveticaFont }); currentX += colWidths[1];
                // Use score (which is now completed boulders count)
                const totalTarget = participant.startclass === 'Weiblich' ? 28 : 35;
                page.drawText(`${participant.score}/${totalTarget}`, { x: currentX + 5, y: rowY, size: fontSize, font: helveticaFont }); currentX += colWidths[2]; // Updated Cell
                // Format and add last update time
                const lastUpdateStr = participant.results?.lastUpdateTime
                    ? new Date(participant.results.lastUpdateTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
                    : 'N/A';
                page.drawText(lastUpdateStr, { x: currentX + 5, y: rowY, size: fontSize, font: helveticaFont }); // New Cell

                page.drawLine({ start: { x: tableLeft, y: rowY - 5 }, end: { x: tableLeft + tableWidth, y: rowY - 5 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
            });

            // --- PDF Saving ---
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Updated filename
            link.download = `kkfn2025-leaderboard-${formatStartClass(startClass).toLowerCase().replace(' ', '-')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('PDF Generierung fehlgeschlagen', { description: 'Es gab einen Fehler beim Erstellen des PDFs.' });
        } finally {
            setIsPdfGenerating(false);
        }
    };

    return (
        <>
            <CardHeader className="flex flex-row items-center justify-end px-0 pt-0 pb-4"> {/* Adjusted padding and alignment */}
                <Button
                    onClick={handleDownloadPdf}
                    disabled={loading || !!error || rankedParticipants.length === 0 || isPdfGenerating}
                    size="sm"
                    variant="outline"
                >
                    {isPdfGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    {isPdfGenerating ? 'Generiere...' : `PDF (${formatStartClass(startClass)})`}
                </Button>
            </CardHeader>
            <CardContent className="px-0 pt-0"> {/* Removed padding */}
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
                                    <TableHead className="text-center">Letztes Update</TableHead> {/* New Header */}
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
                                            {/* Use score (completed boulders) */}
                                            <TableCell className="text-center">{participant.score}/{participant.startclass === 'Weiblich' ? 28 : 35}</TableCell> {/* Updated Cell */}
                                            {/* Add last update time cell */}
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


export function LeaderboardTableDashboard() {
    const [activeTab, setActiveTab] = React.useState<StartclassKKFN>("Männlich"); // Use enum type
    const [isFullPdfGenerating, setIsFullPdfGenerating] = React.useState(false);
    // Use the main hook to get all participants for the full PDF generation
    const { participants, loading: allParticipantsLoading, error: allParticipantsError } = useParticipants();

    // This function needs to be updated for the new structure
    const getRankedParticipantsByClass = React.useCallback(() => {
        if (!participants || participants.length === 0) {
            return { "Männlich": [], "Weiblich": [] };
        }

        const grouped: Record<StartclassKKFN, Array<ParticipantKKFN & { score: number; sortTime: number }>> = {
            "Männlich": [],
            "Weiblich": []
        };

        participants.forEach(participant => {
            if (participant.startclass === "Männlich" || participant.startclass === "Weiblich") {
                 const score = calculateScore(participant); // Use correct calculation
                 const timestamp = getSortableTimestamp(participant);
                grouped[participant.startclass].push({ ...participant, score, sortTime: timestamp });
            }
        });

        const result: Record<StartclassKKFN, Array<ParticipantKKFN & { rank: number; score: number }>> = {
            "Männlich": [],
            "Weiblich": []
        };

        for (const startClass of (Object.keys(grouped) as StartclassKKFN[])) {
            const classParticipants = grouped[startClass];
            const sorted = [...classParticipants].sort((a, b) => {
                 if (b.score !== a.score) return b.score - a.score;
                 return a.sortTime - b.sortTime; // Earlier time first
            });

             let currentRank = 0;
             let lastScore = -1;
             let lastTime = Infinity;
             result[startClass] = sorted.map((participant, index) => {
                 if (participant.score !== lastScore || participant.sortTime !== lastTime) {
                    currentRank = index + 1;
                    lastScore = participant.score;
                    lastTime = participant.sortTime;
                }
                return { ...participant, rank: currentRank };
            });
        }
        return result;
    }, [participants]);


    const handleGenerateFullPdf = async () => {
        setIsFullPdfGenerating(true);
        try {
            const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
            const rankedByClass = getRankedParticipantsByClass(); // Use updated function
            const pdfDoc = await PDFDocument.create();
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            const startClasses: StartclassKKFN[] = ["Männlich", "Weiblich"]; // Only these classes

            for (const startClass of startClasses) {
                const participants = rankedByClass[startClass] || [];
                if (participants.length === 0) continue;

                let page = pdfDoc.addPage([595.28, 841.89]);
                let yPosition = page.getHeight() - 120; // Initial Y position for table content
                const tableTop = page.getHeight() - 120;
                const tableLeft = 50;
                const colWidths = [40, 280, 60, 100]; // Rank, Name, Tops, Last Update
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);
                const rowHeight = 25;
                const fontSize = 11;
                const headerFontSize = 14;
                const titleFontSize = 18;
                const bottomMargin = 40;

                 // --- Page Header ---
                 page.drawText("KKFN2025 Gesamtergebnisse", { // Updated Title
                    x: tableLeft, y: page.getHeight() - 50, size: titleFontSize, font: helveticaBold, color: rgb(0, 0, 0),
                });
                page.drawText(`Kategorie: ${formatStartClass(startClass)}`, {
                    x: tableLeft, y: page.getHeight() - 75, size: headerFontSize, font: helveticaBold, color: rgb(0, 0, 0),
                });
                 const currentDate = new Date().toLocaleString('de-DE');
                 page.drawText(`Erstellt am: ${currentDate}`, {
                    x: tableLeft, y: page.getHeight() - 95, size: 10, font: helveticaFont, color: rgb(0.5, 0.5, 0.5),
                });

                // --- Draw Table Header ---
                let currentX = tableLeft;
                page.drawText("Rang", { x: currentX + 5, y: tableTop, size: fontSize, font: helveticaBold }); currentX += colWidths[0];
                page.drawText("Name", { x: currentX + 5, y: tableTop, size: fontSize, font: helveticaBold }); currentX += colWidths[1];
                page.drawText("Tops", { x: currentX + 5, y: tableTop, size: fontSize, font: helveticaBold }); currentX += colWidths[2]; // Updated Header
                page.drawText("Letztes Update", { x: currentX + 5, y: tableTop, size: fontSize, font: helveticaBold }); // New Header
                page.drawLine({ start: { x: tableLeft, y: tableTop - 5 }, end: { x: tableLeft + tableWidth, y: tableTop - 5 }, thickness: 1, color: rgb(0, 0, 0) });
                yPosition -= 20; // Position for first row

                // --- Draw Table Rows with Pagination ---
                for (let i = 0; i < participants.length; i++) {
                    const participant = participants[i];
                    // Check if new page is needed
                    if (yPosition < bottomMargin) {
                        page = pdfDoc.addPage([595.28, 841.89]);
                        yPosition = page.getHeight() - 70; // Reset Y for new page (leave space for potential header)
                         // Optional: Redraw headers on new page
                         let currentX = tableLeft;
                         page.drawText("Rang", { x: currentX + 5, y: yPosition, size: fontSize, font: helveticaBold }); currentX += colWidths[0];
                         page.drawText("Name", { x: currentX + 5, y: yPosition, size: fontSize, font: helveticaBold }); currentX += colWidths[1];
                         page.drawText("Tops", { x: currentX + 5, y: yPosition, size: fontSize, font: helveticaBold }); currentX += colWidths[2];
                         page.drawText("Letztes Update", { x: currentX + 5, y: yPosition, size: fontSize, font: helveticaBold });
                         page.drawLine({ start: { x: tableLeft, y: yPosition - 5 }, end: { x: tableLeft + tableWidth, y: yPosition - 5 }, thickness: 1, color: rgb(0, 0, 0) });
                         yPosition -= 20; // Position for first row on new page
                    }

                    // Draw row content
                    let currentX = tableLeft;
                    page.drawText(participant.rank.toString(), { x: currentX + 5, y: yPosition, size: fontSize, font: helveticaFont }); currentX += colWidths[0];
                    page.drawText(participant.name, { x: currentX + 5, y: yPosition, size: fontSize, font: helveticaFont }); currentX += colWidths[1];
                    const totalTarget = participant.startclass === 'Weiblich' ? 28 : 35;
                    page.drawText(`${participant.score}/${totalTarget}`, { x: currentX + 5, y: yPosition, size: fontSize, font: helveticaFont }); currentX += colWidths[2];
                    const lastUpdateStr = participant.results?.lastUpdateTime ? new Date(participant.results.lastUpdateTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                    page.drawText(lastUpdateStr, { x: currentX + 5, y: yPosition, size: fontSize, font: helveticaFont });

                    page.drawLine({ start: { x: tableLeft, y: yPosition - 5 }, end: { x: tableLeft + tableWidth, y: yPosition - 5 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
                    yPosition -= rowHeight; // Move to next row position
                }
            }

            // --- PDF Saving ---
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `kkfn2025-gesamtergebnisse.pdf`; // Updated filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating full PDF:', error);
            toast.error('PDF Generierung fehlgeschlagen', { description: 'Es gab einen Fehler beim Erstellen des vollständigen PDFs.' });
        } finally {
            setIsFullPdfGenerating(false);
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex justify-end items-center"> {/* Align button to the right */}
                <Button
                    onClick={handleGenerateFullPdf}
                    disabled={allParticipantsLoading || !!allParticipantsError || isFullPdfGenerating || !participants || participants.length === 0}
                    variant="secondary"
                    size="sm" // Consistent size
                >
                     {isFullPdfGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <FileText className="h-4 w-4 mr-2" />
                    )}
                    {isFullPdfGenerating ? 'Generiere...' : 'Gesamtergebnisse PDF'}
                </Button>
            </div>

            <Tabs
                // Use controlled state for active tab
                value={activeTab}
                className="pt-2"
                onValueChange={(value) => setActiveTab(value as StartclassKKFN)} // Update state on change
            >
                <TabsList>
                    {/* Only show Männlich and Weiblich tabs */}
                    <TabsTrigger value="Männlich">Männlich</TabsTrigger>
                    <TabsTrigger value="Weiblich">Weiblich</TabsTrigger>
                    {/* Remove Ü40 tabs */}
                    {/* <TabsTrigger value="männlichü40">Männlich Ü40</TabsTrigger> */}
                    {/* <TabsTrigger value="weiiblichü40">Weiblich Ü40</TabsTrigger> */}
                </TabsList>
                <TabsContent value="Männlich">
                    <ClassLeaderboard startClass="Männlich" />
                </TabsContent>
                <TabsContent value="Weiblich">
                    <ClassLeaderboard startClass="Weiblich" />
                </TabsContent>
                {/* Remove Ü40 Tab Contents */}
            </Tabs>
        </div>
    )
}

