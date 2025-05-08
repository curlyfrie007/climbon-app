"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
// Import the updated hook and type
import { useCreateParticipant, StartclassKKFN } from "@/hooks/useParticipants"
import Cookies from "js-cookie"
import Link from "next/link"
import { ClipboardIcon, CheckIcon } from "lucide-react"
import { Loader2 } from "lucide-react" // Import Loader

// Function to generate a random string for participant secret (remains the same)
const generateSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// Copy to clipboard function (remains the same)
const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
    return true
}

export default function ParticipantRegistrationKKFN2025() {
    const router = useRouter()
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [startclass, setStartclass] = React.useState<StartclassKKFN>("Männlich")
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const [secret, setSecret] = React.useState("")
    const [hasCopied, setHasCopied] = React.useState(false)

    // Hook usage remains the same as it was updated internally
    const { createParticipant, loading, error } = useCreateParticipant()

    // Define event-specific paths and cookie name
    const eventBasePath = "/event/KKFN2025";
    const loginPath = `${eventBasePath}/participant/login`;
    const editorPath = `${eventBasePath}/participant/editor`;
    const cookieName = `participant_session_${eventBasePath.replace(/\//g, '_')}`; // Matches useParticipantAuth

    React.useEffect(() => {
        if (hasCopied) { setTimeout(() => { setHasCopied(false) }, 2000); }
    }, [hasCopied])

    const handleCopyClick = () => {
        copyToClipboard(secret)
        setHasCopied(true)
        toast("Kopiert", { description: "Zugangsschlüssel wurde in die Zwischenablage kopiert." })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Make validation more explicit and provide feedback
        if (!firstName.trim() || !lastName.trim()) {
             toast.error("Fehlende Angaben", {
                 description: "Bitte geben Sie Vor- und Nachnamen ein."
             });
             return; // Stop execution if names are missing
        }

        const generatedSecret = generateSecret()
        const fullName = `${firstName.trim()} ${lastName.trim()}` // Trim names here

        // Call the hook - it now expects StartclassKKFN
        const participant = await createParticipant(fullName, startclass, generatedSecret)

        // The hook now sets its own 'error' state on failure.
        if (participant) { // Success if participant is returned
            // Store using the event-specific cookie name
            Cookies.set(cookieName, JSON.stringify({
                id: participant.id,
                secret: generatedSecret,
                name: participant.name,        // Optional: Store name from response
                startclass: participant.startclass // Optional: Store startclass from response
            }), { expires: 30 });

            setSecret(generatedSecret);
            setIsSubmitted(true);
            toast("Registrierung erfolgreich", { description: `${fullName} wurde erfolgreich registriert.` });
        } else {
            // Error occurred, the hook sets the 'error' state. Display it.
            toast.error("Registrierung fehlgeschlagen", { description: error || "Unbekannter Fehler. Bitte versuchen Sie es erneut." });
            console.error("Registration error state from hook:", error);
        }
    }

    const handleGoToEditor = () => {
        // Use the updated editor path
        router.push(editorPath);
    }

    return (
        <div className="container mx-auto py-10">
            {/* Update Title */}
            <h1 className="px-6 text-2xl font-bold mx-auto max-w-md">KKFN 2025</h1>
            <div className="max-w-md mx-auto">
                {!isSubmitted ? (
                    <Card className="border-0"> {/* Ad ded shadow/border */}
                        <CardHeader>
                            <CardTitle>Teilnehmer Registrierung</CardTitle>
                            <CardDescription>
                                <p>Bitte füllen Sie das Formular aus, um sich für den Wettbewerb zu registrieren.</p>
                                <br />
                                {/* Update Link */}
                                <p>Falls du bereits registriert bist kommst du hier zur <Link href={loginPath} className="text-blue-500 font-semibold hover:underline">Anmeldung</Link></p>
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                {/* First Name and Last Name Inputs with props */}
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Vorname</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Magnus"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        disabled={loading} // Disable input while loading
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nachname</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Midtbø"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        disabled={loading} // Disable input while loading
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startclass">Startklasse</Label>
                                    <Select
                                        value={startclass}
                                        onValueChange={(value) => setStartclass(value as StartclassKKFN)}
                                        disabled={loading} // Disable select while loading
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wählen Sie eine Klasse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Update Options */}
                                            <SelectItem value="Männlich">Männlich</SelectItem>
                                            <SelectItem value="Weiblich">Weiblich</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full mt-4" type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Registrierung läuft...
                                        </>
                                     ) : "Registrieren"}
                                </Button>
                            </CardFooter>
                        </form>
                        {/* Display hook error below the button if it exists */}
                        {error && !loading && (
                             <p className="text-sm text-red-600 text-center mt-2 px-6">{error}</p>
                        )}
                    </Card>
                ) : (
                    // Success Card remains largely the same, uses 'secret' state
                    <Card className="shadow-none border-0"> {/* Added shadow/border */}
                        <CardHeader>
                            <CardTitle>Registrierung erfolgreich!</CardTitle>
                            <CardDescription>
                                Bitte bewahren Sie Ihren persönlichen Zugangsschlüssel sicher auf.
                            </CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            <div className="p-4 border rounded-md bg-green-50 dark:bg-green-900/20">
                                <p className="font-bold mb-2">Ihr Zugangsschlüssel:</p>
                                <div className="flex items-center justify-between bg-background p-2 border rounded">
                                    <p className="text-xl font-mono">{secret}</p>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        onClick={handleCopyClick}
                                     >
                                         {hasCopied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <ClipboardIcon className="h-4 w-4" />}
                                         <span className="sr-only">Kopieren</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p className="mb-2"><strong>WICHTIG:</strong> Dieser Schlüssel wird benötigt, um Ihre Ergebnisse einzutragen oder zu ändern.</p>
                                <p>Bitte notieren Sie sich diesen Schlüssel oder machen Sie einen Screenshot. Sie werden ihn erneut benötigen, wenn Sie sich von einem anderen Gerät anmelden möchten.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {/* Button now calls updated handler */}
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
