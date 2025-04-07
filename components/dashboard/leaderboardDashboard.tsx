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
import { useParticipants, useParticipantsByStartclass, StartClassType, Result } from "@/hooks/useParticipants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

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
    const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);

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
        } else {
            setRankedParticipants([]);
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

    const handleDownloadPdf = async () => {
        setIsPdfGenerating(true);
        try {
            // Dynamic import to reduce bundle size
            const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
            
            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();
            
            // Add a page to the document
            const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
            
            // Get fonts
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            // Set default font size
            const fontSize = 12;
            const headerFontSize = 16;
            const titleFontSize = 20;
            
            // Add title
            page.drawText("Kletterwettkampf Leaderboard", {
                x: 50,
                y: page.getHeight() - 50,
                size: titleFontSize,
                font: helveticaBold,
                color: rgb(0, 0, 0),
            });
            
            // Add subtitle with start class
            page.drawText(`Kategorie: ${formatStartClass(startClass)}`, {
                x: 50,
                y: page.getHeight() - 80,
                size: headerFontSize,
                font: helveticaBold,
                color: rgb(0, 0, 0),
            });
            
            // Add generation date
            const currentDate = new Date().toLocaleDateString('de-DE');
            page.drawText(`Erstellt am: ${currentDate}`, {
                x: 50,
                y: page.getHeight() - 100,
                size: fontSize,
                font: helveticaFont,
                color: rgb(0.5, 0.5, 0.5),
            });
            
            // Draw table headers
            const tableTop = page.getHeight() - 150;
            const colWidths = [50, 250, 80];
            const rowHeight = 30;
            
            // Headers
            page.drawText("Rang", {
                x: 50,
                y: tableTop,
                size: fontSize,
                font: helveticaBold,
            });
            
            page.drawText("Name", {
                x: 50 + colWidths[0],
                y: tableTop,
                size: fontSize,
                font: helveticaBold,
            });
            
            page.drawText("Punkte", {
                x: 50 + colWidths[0] + colWidths[1],
                y: tableTop,
                size: fontSize,
                font: helveticaBold,
            });
            
            // Horizontal line below headers
            page.drawLine({
                start: { x: 50, y: tableTop - 10 },
                end: { x: 50 + colWidths[0] + colWidths[1] + colWidths[2], y: tableTop - 10 },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
            
            // Draw rows
            rankedParticipants.forEach((participant, index) => {
                const rowY = tableTop - 30 - (index * rowHeight);
                
                // Skip if we're going to draw outside the page
                if (rowY < 50) return;
                
                page.drawText(participant.rank.toString(), {
                    x: 50,
                    y: rowY,
                    size: fontSize,
                    font: helveticaFont,
                });
                
                page.drawText(participant.name, {
                    x: 50 + colWidths[0],
                    y: rowY,
                    size: fontSize,
                    font: helveticaFont,
                });
                
                page.drawText(participant.totalScore.toString(), {
                    x: 50 + colWidths[0] + colWidths[1],
                    y: rowY,
                    size: fontSize,
                    font: helveticaFont,
                });
                
                // Draw bottom line for row
                page.drawLine({
                    start: { x: 50, y: rowY - 10 },
                    end: { x: 50 + colWidths[0] + colWidths[1] + colWidths[2], y: rowY - 10 },
                    thickness: 0.5,
                    color: rgb(0.8, 0.8, 0.8),
                });
            });
            
            // Serialize the PDFDocument to bytes
            const pdfBytes = await pdfDoc.save();
            
            // Create a Blob from the PDF bytes
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            // Create a URL for the Blob
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `leaderboard-${formatStartClass(startClass).toLowerCase().replace(' ', '-')}.pdf`;
            
            // Append to the document, click and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Release the URL
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Es gab einen Fehler beim Erstellen des PDFs. Bitte versuchen Sie es später erneut.');
        } finally {
            setIsPdfGenerating(false);
        }
    };

    return (
        <>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{formatStartClass(startClass)}</CardTitle>
                <Button 
                    onClick={handleDownloadPdf} 
                    disabled={loading === true || !!error || rankedParticipants.length === 0 || isPdfGenerating}
                    size="sm"
                    variant="outline"
                >
                    <Download className="h-4 w-4 mr-2" /> 
                    {isPdfGenerating ? 'Generiere PDF...' : 'PDF Download'}
                </Button>
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

export function LeaderboardTable() {
    const [activeTab, setActiveTab] = React.useState("männlich");
    const [isFullPdfGenerating, setIsFullPdfGenerating] = React.useState(false);
    const { participants, loading, error } = useParticipants();

    // Process and rank participants by start class
    const getRankedParticipantsByClass = React.useCallback(async () => {
        if (!participants || participants.length === 0) {
            return {
                "Maennlich": [],
                "Weiblich": [],
                "Maennlich_Ue40": [],
                "Weiblich_Ue40": []
            };
        }
        
        // Group participants by start class
        const grouped: Record<StartClassType, any[]> = {
            "Maennlich": [],
            "Weiblich": [],
            "Maennlich_Ue40": [],
            "Weiblich_Ue40": []
        };

        // First group by start class
        participants.forEach(participant => {
            if (participant.startclass in grouped) {
                grouped[participant.startclass].push(participant);
            }
        });

        // Then process each group
        const result: Record<StartClassType, any[]> = {
            "Maennlich": [],
            "Weiblich": [],
            "Maennlich_Ue40": [],
            "Weiblich_Ue40": []
        };
        
        for (const [startClass, classParticipants] of Object.entries(grouped)) {
            // Calculate total score for each participant
            const participantsWithScore = classParticipants.map(participant => {
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

            result[startClass as StartClassType] = ranked;
        }

        return result;
    }, [participants]);

    const handleGenerateFullPdf = async () => {
        setIsFullPdfGenerating(true);
        try {
            // Dynamic import to reduce bundle size
            const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
            
            // Get ranked participants organized by start class
            const rankedByClass = await getRankedParticipantsByClass();
            
            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();
            
            // Get fonts
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            // Add each start class to the PDF
            const startClasses: StartClassType[] = ["Maennlich", "Weiblich", "Maennlich_Ue40", "Weiblich_Ue40"];
            
            for (const startClass of startClasses) {
                const participants = rankedByClass[startClass] || [];
                
                // Skip if no participants
                if (participants.length === 0) continue;
                
                // Add a page for this start class
                const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
                
                // Set default font size
                const fontSize = 12;
                const headerFontSize = 16;
                const titleFontSize = 20;
                
                // Add main title on first page only
                page.drawText("Kletterwettkampf Gesamtergebnisse", {
                    x: 50,
                    y: page.getHeight() - 50,
                    size: titleFontSize,
                    font: helveticaBold,
                    color: rgb(0, 0, 0),
                });
                
                // Add subtitle with start class
                page.drawText(`Kategorie: ${formatStartClass(startClass)}`, {
                    x: 50,
                    y: page.getHeight() - 80,
                    size: headerFontSize,
                    font: helveticaBold,
                    color: rgb(0, 0, 0),
                });
                
                // Add generation date
                const currentDate = new Date().toLocaleDateString('de-DE');
                page.drawText(`Erstellt am: ${currentDate}`, {
                    x: 50,
                    y: page.getHeight() - 100,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(0.5, 0.5, 0.5),
                });
                
                // Draw table headers
                const tableTop = page.getHeight() - 150;
                const colWidths = [50, 250, 80];
                const rowHeight = 30;
                
                // Headers
                page.drawText("Rang", {
                    x: 50,
                    y: tableTop,
                    size: fontSize,
                    font: helveticaBold,
                });
                
                page.drawText("Name", {
                    x: 50 + colWidths[0],
                    y: tableTop,
                    size: fontSize,
                    font: helveticaBold,
                });
                
                page.drawText("Punkte", {
                    x: 50 + colWidths[0] + colWidths[1],
                    y: tableTop,
                    size: fontSize,
                    font: helveticaBold,
                });
                
                // Horizontal line below headers
                page.drawLine({
                    start: { x: 50, y: tableTop - 10 },
                    end: { x: 50 + colWidths[0] + colWidths[1] + colWidths[2], y: tableTop - 10 },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });
                
                // Calculate how many participants we can fit on this page
                const maxRows = Math.floor((tableTop - 50) / rowHeight);
                
                // Draw rows for this page
                participants.slice(0, maxRows).forEach((participant, index) => {
                    const rowY = tableTop - 30 - (index * rowHeight);
                    
                    page.drawText(participant.rank.toString(), {
                        x: 50,
                        y: rowY,
                        size: fontSize,
                        font: helveticaFont,
                    });
                    
                    page.drawText(participant.name, {
                        x: 50 + colWidths[0],
                        y: rowY,
                        size: fontSize,
                        font: helveticaFont,
                    });
                    
                    page.drawText(participant.totalScore.toString(), {
                        x: 50 + colWidths[0] + colWidths[1],
                        y: rowY,
                        size: fontSize,
                        font: helveticaFont,
                    });
                    
                    // Draw bottom line for row
                    page.drawLine({
                        start: { x: 50, y: rowY - 10 },
                        end: { x: 50 + colWidths[0] + colWidths[1] + colWidths[2], y: rowY - 10 },
                        thickness: 0.5,
                        color: rgb(0.8, 0.8, 0.8),
                    });
                });
                
                // Handle pagination if more participants than fit on one page
                if (participants.length > maxRows) {
                    // Calculate how many additional pages we need
                    const additionalPages = Math.ceil((participants.length - maxRows) / maxRows);
                    
                    for (let i = 0; i < additionalPages; i++) {
                        // Create a continuation page
                        const contPage = pdfDoc.addPage([595.28, 841.89]);
                        
                        // Add subtitle with start class
                        contPage.drawText(`Kategorie: ${formatStartClass(startClass)} (Fortsetzung)`, {
                            x: 50,
                            y: contPage.getHeight() - 50,
                            size: headerFontSize,
                            font: helveticaBold,
                            color: rgb(0, 0, 0),
                        });
                        
                        // Draw table headers
                        const contTableTop = contPage.getHeight() - 100;
                        
                        // Headers
                        contPage.drawText("Rang", {
                            x: 50,
                            y: contTableTop,
                            size: fontSize,
                            font: helveticaBold,
                        });
                        
                        contPage.drawText("Name", {
                            x: 50 + colWidths[0],
                            y: contTableTop,
                            size: fontSize,
                            font: helveticaBold,
                        });
                        
                        contPage.drawText("Punkte", {
                            x: 50 + colWidths[0] + colWidths[1],
                            y: contTableTop,
                            size: fontSize,
                            font: helveticaBold,
                        });
                        
                        // Horizontal line below headers
                        contPage.drawLine({
                            start: { x: 50, y: contTableTop - 10 },
                            end: { x: 50 + colWidths[0] + colWidths[1] + colWidths[2], y: contTableTop - 10 },
                            thickness: 1,
                            color: rgb(0, 0, 0),
                        });
                        
                        // Get participants for this continuation page
                        const startIdx = maxRows + (i * maxRows);
                        const pageParticipants = participants.slice(startIdx, startIdx + maxRows);
                        
                        // Draw rows for this continuation page
                        pageParticipants.forEach((participant, index) => {
                            const rowY = contTableTop - 30 - (index * rowHeight);
                            
                            contPage.drawText(participant.rank.toString(), {
                                x: 50,
                                y: rowY,
                                size: fontSize,
                                font: helveticaFont,
                            });
                            
                            contPage.drawText(participant.name, {
                                x: 50 + colWidths[0],
                                y: rowY,
                                size: fontSize,
                                font: helveticaFont,
                            });
                            
                            contPage.drawText(participant.totalScore.toString(), {
                                x: 50 + colWidths[0] + colWidths[1],
                                y: rowY,
                                size: fontSize,
                                font: helveticaFont,
                            });
                            
                            // Draw bottom line for row
                            contPage.drawLine({
                                start: { x: 50, y: rowY - 10 },
                                end: { x: 50 + colWidths[0] + colWidths[1] + colWidths[2], y: rowY - 10 },
                                thickness: 0.5,
                                color: rgb(0.8, 0.8, 0.8),
                            });
                        });
                    }
                }
            }
            
            // Serialize the PDFDocument to bytes
            const pdfBytes = await pdfDoc.save();
            
            // Create a Blob from the PDF bytes
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            // Create a URL for the Blob
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `kletterwettkampf-gesamtergebnisse.pdf`;
            
            // Append to the document, click and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Release the URL
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating full PDF:', error);
            alert('Es gab einen Fehler beim Erstellen des vollständigen PDFs. Bitte versuchen Sie es später erneut.');
        } finally {
            setIsFullPdfGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kletterwettkampf Leaderboard</h2>
                <Button 
                    onClick={handleGenerateFullPdf} 
                    disabled={loading === true || !!error || isFullPdfGenerating}
                    variant="secondary"
                >
                    <FileText className="h-4 w-4 mr-2" /> 
                    {isFullPdfGenerating ? 'Generiere vollständiges PDF...' : 'Gesamtergebnisse PDF'}
                </Button>
            </div>

            <Tabs 
                defaultValue="männlich" 
                className="pt-2"
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
        </div>
    )
}