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
import Link from "next/link"
import { useParticipantAuth } from "@/hooks/useParticipantAuth"

export default function ParticipantLogin() {
    const router = useRouter()
    const [name, setName] = React.useState("")
    const [secret, setSecret] = React.useState("")

    // Use the custom auth hook
    const {
        login,
        loading,
        error,
        redirectIfLoggedIn
    } = useParticipantAuth()

    // Check if already logged in and redirect
    React.useEffect(() => {
        redirectIfLoggedIn()
    }, [redirectIfLoggedIn])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const success = await login(name, secret)
        if (success) {
            // Redirect to the editor
            router.push("/event/RocklandsCup2025/participant/editor")
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Teilnehmer Anmeldung</CardTitle>
                        <CardDescription>
                            Bitte geben Sie Ihren Namen und Geheimcode ein, um Ihre Ergebnisse zu bearbeiten.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Ihr vollständiger Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="secret">Geheimcode</Label>
                                <Input
                                    id="secret"
                                    type="text"
                                    placeholder="Ihr Geheimcode"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    required
                                />
                            </div>
                            {error && (
                                <div className="text-sm text-red-500 pt-1">
                                    Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? "Anmeldung läuft..." : "Anmelden"}
                            </Button>
                            <div className="text-sm text-center">
                                <p>Noch nicht registriert? <Link href="/participant/register" className="text-blue-600 hover:underline">Jetzt registrieren</Link></p>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}