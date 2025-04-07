"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useCreateParticipant, StartClassType } from "@/hooks/useParticipants"
import Cookies from "js-cookie"
import Link from "next/link"

// Function to generate a random string for participant secret
const generateSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export default function ParticipantRegistration() {
    const router = useRouter()
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [startclass, setStartclass] = React.useState<StartClassType>("Maennlich")
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const [secret, setSecret] = React.useState("")
    const [participantId, setParticipantId] = React.useState("")

    const { createParticipant, loading, error } = useCreateParticipant()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!firstName.trim() || !lastName.trim()) {
            toast.error("Fehlende Angaben", {
                description: "Bitte geben Sie Vor- und Nachnamen ein."
            })
            return
        }

        // Generate a secure random string for the secret
        const generatedSecret = generateSecret()

        try {
            // Combine first and last name
            const fullName = `${firstName} ${lastName}`.trim()

            // Create the participant
            const participant = await createParticipant(fullName, startclass, generatedSecret)

            if (participant) {
                // Store the participant ID and secret in a cookie (expires in 30 days)
                Cookies.set("participant_session", JSON.stringify({
                    id: participant.id,
                    secret: generatedSecret
                }), { expires: 30 })

                // Store the values for display
                setSecret(generatedSecret)
                setParticipantId(participant.id)
                setIsSubmitted(true)

                toast("Registrierung erfolgreich", {
                    description: `${fullName} wurde erfolgreich registriert.`
                })
            }
        } catch (err) {
            toast.error("Fehler", {
                description: "Die Registrierung konnte nicht abgeschlossen werden."
            })
            console.error("Registration error:", err)
        }
    }

    const handleGoToEditor = () => {
        router.push("/event/RocklandsCup2025/participant/editor")
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="px-6 text-2xl font-bold mx-auto max-w-md">Rocklands Cup 2025</h1>
            <div className="max-w-md mx-auto">
                {!isSubmitted ? (
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Teilnehmer Registrierung</CardTitle>
                            <CardDescription>
                                <p>Bitte füllen Sie das Formular aus, um sich für den Wettbewerb zu registrieren.</p>
                                <br />
                                <p>Falls du bereits registriert bist kommst du hier zur <Link href="/event/RocklandsCup2025/participant/login" className="text-blue-500 font-bold hover:underline">Anmeldung</Link></p>
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Vorname</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Vorname eingeben"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nachname</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Nachname eingeben"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startclass">Startklasse</Label>
                                    <Select
                                        value={startclass}
                                        onValueChange={(value) => setStartclass(value as StartClassType)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wählen Sie eine Klasse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Maennlich">Männlich</SelectItem>
                                            <SelectItem value="Weiblich">Weiblich</SelectItem>
                                            <SelectItem value="Maennlich_Ue40">Männlich Ü40</SelectItem>
                                            <SelectItem value="Weiblich_Ue40">Weiblich Ü40</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full mt-4" type="submit" disabled={loading}>
                                    {loading ? "Registrierung läuft..." : "Registrieren"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Registrierung erfolgreich!</CardTitle>
                            <CardDescription>
                                Bitte bewahren Sie Ihren persönlichen Zugangsschlüssel sicher auf.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-md bg-green-50">
                                <p className="font-bold mb-2">Ihr Zugangsschlüssel:</p>
                                <p className="text-xl font-mono bg-white p-2 border rounded text-center">
                                    {secret}
                                </p>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p className="mb-2"><strong>WICHTIG:</strong> Dieser Schlüssel wird benötigt, um Ihre Ergebnisse einzutragen oder zu ändern.</p>
                                <p>Bitte notieren Sie sich diesen Schlüssel oder machen Sie einen Screenshot. Sie werden ihn erneut benötigen, wenn Sie sich von einem anderen Gerät anmelden möchten.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleGoToEditor}>
                                Zur Ergebniseingabe
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    )
}