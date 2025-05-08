"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { useParticipant, useUpdateParticipantResults, Result } from "@/hooks/useParticipants"
import { Separator } from "@/components/ui/separator"

export default function ParticipantEditor() {
    const router = useRouter()
    const [sessionData, setSessionData] = React.useState<{ id: string, secret: string } | null>(null)

    // Get session from cookie
    React.useEffect(() => {
        const session = Cookies.get("participant_session")
        if (session) {
            try {
                const parsedSession = JSON.parse(session)
                setSessionData(parsedSession)
            } catch (error) {
                console.error("Failed to parse session cookie:", error)
                router.push("/event/RocklandsCup2025/participant/login")
            }
        } else {
            router.push("/event/RocklandsCup2025/participant/login")
        }
    }, [router])

    // Use the participant hook directly instead of participant manager
    const {
        participant,
        loading,
        error,
        refetch: refetchParticipant
    } = useParticipant(sessionData?.id || null)

    // Use update results hook
    const {
        updateResults,
        loading: updateLoading,
        error: updateError,
        success: updateSuccess
    } = useUpdateParticipantResults()

    // Error handling for participant fetch
    React.useEffect(() => {
        if (error) {
            toast.error("Fehler", {
                description: "Teilnehmerdaten konnten nicht geladen werden."
            })
        }
    }, [error])

    // Handle route updates
    const handleRouteUpdate = async (routeNumber: number, zone: number, attempts: number) => {
        if (!sessionData) return

        try {
            const updated = await updateResults(
                sessionData.id,
                routeNumber,
                zone,
                attempts,
                sessionData.secret
            )

            if (updated) {
                toast("Ergebnis aktualisiert", {
                    description: `Route ${routeNumber} wurde erfolgreich aktualisiert.`
                })

                // Refresh participant data
                refetchParticipant()
            }
        } catch (error) {
            toast.error("Fehler", {
                description: "Das Ergebnis konnte nicht aktualisiert werden."
            })
        }
    }

    // Handle logout
    const handleLogout = () => {
        Cookies.remove("participant_session")
        toast("Abgemeldet", {
            description: "Sie wurden erfolgreich abgemeldet."
        })
        router.push("/event/RocklandsCup2025/participant/login")
    }

    // If loading, show loading state
    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-center">
                    <p>Lädt...</p>
                </div>
            </div>
        )
    }

    // If no participant data, show error
    if (!participant) {
        return (
            <div className="container mx-auto py-10">

                <Card>
                    <CardHeader>
                        <CardTitle>Fehler</CardTitle>
                        <CardDescription>
                            Keine Teilnehmerdaten gefunden.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => router.push("/participant/login")}>
                            Zur Anmeldung
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-4 ">
            <h1 className="px-6 text-lg font-bold">Rocklands Cup 2025</h1>

            <Card className="mb-6 border-0 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">Hallo, {participant.name}!</CardTitle>
                        <CardDescription>
                            Hier kannst du deine Ergebnisse eintragen und einsehen.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardHeader>
                    <CardTitle>Dein Gesamtergebnis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-md">
                            <p className="text-sm text-slate-500">Abgeschlossene Routen</p>
                            <p className="text-2xl font-bold">{calculateCompletedRoutes(participant.results)}/8</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-md">
                            <p className="text-sm text-slate-500">Gesamtpunktzahl</p>
                            <p className="text-2xl font-bold">{calculateTotalScore(participant.results)}</p>
                        </div>
                    </div>
                </CardContent>

                <CardContent>
                    <Separator />
                </CardContent>

                <CardContent>
                    {/* <p className="mb-4">
                        <strong>Startklasse:</strong> {formatStartClass(participant.startclass)}
                    </p> */}

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(routeNumber => (
                            <RouteCard
                                key={routeNumber}
                                routeNumber={routeNumber}
                                routeData={participant.results[`Route${routeNumber}` as keyof Result]}
                                onUpdate={handleRouteUpdate}
                                isUpdating={updateLoading}
                            />
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch justify-start gap-2">
                    <Button
                        variant="default"
                        onClick={() => router.push("/")}
                        className="w-full md:w-auto"
                    >
                        Zur Hauptseite
                    </Button>
                    <Button variant="outline" className="text-red-500" onClick={handleLogout}>
                        Abmelden
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

// Helper component for each route card
function RouteCard({
    routeNumber,
    routeData,
    onUpdate,
    isUpdating
}: {
    routeNumber: number,
    routeData: { zone: number, attempts: number },
    onUpdate: (routeNumber: number, zone: number, attempts: number) => void,
    isUpdating: boolean
}) {
    const [zone, setZone] = React.useState(routeData.zone)
    const [attempts, setAttempts] = React.useState(routeData.attempts)
    const [hasChanges, setHasChanges] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)

    // Update local state when props change
    React.useEffect(() => {
        setZone(routeData.zone)
        setAttempts(routeData.attempts)
        setHasChanges(false)
        setIsSaving(false)
    }, [routeData])

    // Check for changes
    React.useEffect(() => {
        const changed = zone !== routeData.zone || attempts !== routeData.attempts
        setHasChanges(changed)
    }, [zone, attempts, routeData])

    // Handle zone change
    const handleZoneChange = (value: string) => {
        const newZone = parseInt(value)
        setZone(newZone)
        
        // Automatically set attempts to at least 1 if a zone (10-50) is selected and attempts is 0
        if (newZone >= 10 && attempts === 0) {
            setAttempts(1)
        }
    }

    // Handle attempts change
    const handleAttemptsChange = (newValue: number) => {
        setAttempts(Math.max(0, newValue))
    }

    // Handle save
    const handleSave = () => {
        setIsSaving(true)
        onUpdate(routeNumber, zone, attempts)
        
        // The isSaving state will be reset when routeData props change
        // which happens after a successful update due to refetchParticipant()
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Route {routeNumber}</CardTitle>
                <CardDescription className="text-xs">
                    {calculateRouteScore(zone, attempts) > 0
                        ? `Punkte: ${calculateRouteScore(zone, attempts)}`
                        : "Noch keine Daten"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Zone</label>
                        <Select
                            value={zone.toString()}
                            onValueChange={handleZoneChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Zone wählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Keine Zone erreicht</SelectItem>
                                <SelectItem value="10">Zone 10</SelectItem>
                                <SelectItem value="20">Zone 20</SelectItem>
                                <SelectItem value="30">Zone 30</SelectItem>
                                <SelectItem value="40">Zone 40</SelectItem>
                                <SelectItem value="50">Zone 50 (Top)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Versuche</label>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                onClick={() => handleAttemptsChange(attempts - 1)}
                                disabled={attempts <= 0}
                            >
                                -
                            </Button>
                            <Input
                                type="number"
                                value={attempts}
                                onChange={(e) => handleAttemptsChange(parseInt(e.target.value) || 0)}
                                min="0"
                                className="text-center"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                onClick={() => handleAttemptsChange(attempts + 1)}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
            <div className="px-6 pb-4">
                <Button
                    className="w-full"
                    disabled={!hasChanges || isUpdating}
                    onClick={handleSave}
                >
                    {isSaving ? "Speichern..." : "Speichern"}
                </Button>
            </div>
        </Card>
    )
}

// Helper functions
function formatStartClass(startclass: string) {
    switch (startclass) {
        case "Maennlich": return "Männlich";
        case "Weiblich": return "Weiblich";
        case "Maennlich_Ue40": return "Männlich Ü40";
        case "Weiblich_Ue40": return "Weiblich Ü40";
        default: return startclass;
    }
}

function calculateRouteScore(zone: number, attempts: number) {
    return Math.max(0, zone - attempts);
}

function calculateCompletedRoutes(results: Result) {
    let completed = 0;
    for (let i = 1; i <= 8; i++) {
        const routeKey = `Route${i}` as keyof Result;
        if (results[routeKey].zone > 0) {
            completed++;
        }
    }
    return completed;
}

function calculateTotalScore(results: Result) {
    let totalScore = 0;
    for (let i = 1; i <= 8; i++) {
        const routeKey = `Route${i}` as keyof Result;
        totalScore += Math.max(0, results[routeKey].zone - results[routeKey].attempts);
    }
    return totalScore;
}